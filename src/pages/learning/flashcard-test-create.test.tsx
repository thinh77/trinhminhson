import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JapaneseFlashcardTestCreate from './flashcard-test-create';

vi.mock('@/services/vocabulary.service', () => ({
  getVocabularySets: vi.fn(),
  createTestSet: vi.fn(),
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const navigateSpy = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

import { getVocabularySets, createTestSet } from '@/services/vocabulary.service';

const mockGetSets = vi.mocked(getVocabularySets);
const mockCreate = vi.mocked(createTestSet);

const PERSONAL_SETS = [
  {
    id: 1, name: 'Set A', description: '', sort_order: 0, default_face: 0, face_count: 5,
    created_at: '', updated_at: '', card_count: 100, difficult_count: 10,
  },
  {
    id: 2, name: 'Set B', description: '', sort_order: 1, default_face: 0, face_count: 5,
    created_at: '', updated_at: '', card_count: 50, difficult_count: 5,
  },
  {
    id: 3, name: 'Set C', description: '', sort_order: 2, default_face: 0, face_count: 5,
    created_at: '', updated_at: '', card_count: 30, difficult_count: 0,
  },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/learning/test-create']}>
      <Routes>
        <Route path="/learning/test-create" element={<JapaneseFlashcardTestCreate />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('flashcard-test-create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSets.mockResolvedValue(PERSONAL_SETS);
  });

  it('loads personal sets on mount and shows difficult_count next to each', async () => {
    renderPage();
    expect(await screen.findByText('Set A')).toBeInTheDocument();
    expect(screen.getByText('10 khó')).toBeInTheDocument();
    expect(screen.getByText('5 khó')).toBeInTheDocument();
    expect(screen.getByText('0 khó')).toBeInTheDocument();
  });

  it('disables submit when no sets are selected', async () => {
    renderPage();
    await screen.findByText('Set A');

    fireEvent.change(screen.getByPlaceholderText(/Ôn JLPT/), { target: { value: 'My test' } });

    const submit = screen.getByRole('button', { name: /Tạo bài test/ });
    expect(submit).toBeDisabled();
  });

  it('disables submit when only sets with difficult_count=0 are selected', async () => {
    renderPage();
    await screen.findByText('Set C');

    fireEvent.change(screen.getByPlaceholderText(/Ôn JLPT/), { target: { value: 'My test' } });
    fireEvent.click(screen.getByLabelText(/Set C/));

    expect(screen.getByRole('button', { name: /Tạo bài test/ })).toBeDisabled();
  });

  it('live counter shows total difficult words across selected sets', async () => {
    renderPage();
    await screen.findByText('Set A');

    fireEvent.click(screen.getByLabelText(/Set A/));
    expect(await screen.findByText(/Tổng 10 từ khó/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Set B/));
    expect(await screen.findByText(/Tổng 15 từ khó/)).toBeInTheDocument();
  });

  it('submits payload and navigates to study page on success', async () => {
    mockCreate.mockResolvedValue({ setId: 999, cardCount: 10, requestedCount: 10, shortage: false });
    renderPage();
    await screen.findByText('Set A');

    fireEvent.change(screen.getByPlaceholderText(/Ôn JLPT/), { target: { value: 'My test' } });
    fireEvent.click(screen.getByLabelText(/Set A/));
    fireEvent.change(screen.getByLabelText(/Số lượng/), { target: { value: '10' } });

    fireEvent.click(screen.getByRole('button', { name: /Tạo bài test/ }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'My test',
        sourceSetIds: [1],
        wordCount: 10,
      });
    });
    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith('/learning/study/999');
    });
  });

  it('trims leading/trailing whitespace from the name before submit', async () => {
    mockCreate.mockResolvedValue({ setId: 1, cardCount: 1, requestedCount: 1, shortage: false });
    renderPage();
    await screen.findByText('Set A');

    fireEvent.change(screen.getByPlaceholderText(/Ôn JLPT/), { target: { value: '  Padded  ' } });
    fireEvent.click(screen.getByLabelText(/Set A/));
    fireEvent.change(screen.getByLabelText(/Số lượng/), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /Tạo bài test/ }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Padded' })
      );
    });
  });
});
