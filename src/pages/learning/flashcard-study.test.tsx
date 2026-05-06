import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { JapaneseFlashcardStudy } from './flashcard-study';

vi.mock('@/services/vocabulary.service', () => ({
  getVocabularySet: vi.fn(),
  markFlashcardLearned: vi.fn(),
  incrementFlashcardDifficulty: vi.fn(),
  resetVocabularySet: vi.fn(),
  cloneVocabularySet: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ isAuthenticated: true, loading: false })),
}));

import {
  getVocabularySet,
  markFlashcardLearned,
  incrementFlashcardDifficulty,
  resetVocabularySet,
} from '@/services/vocabulary.service';

const mockGetSet = vi.mocked(getVocabularySet);
const mockMarkLearned = vi.mocked(markFlashcardLearned);
const mockIncrementDifficulty = vi.mocked(incrementFlashcardDifficulty);
const mockResetSet = vi.mocked(resetVocabularySet);

function renderStudy(setId = '1') {
  return render(
    <MemoryRouter initialEntries={[`/learning/study/${setId}`]}>
      <Routes>
        <Route path="/learning/study/:setId" element={<JapaneseFlashcardStudy />} />
      </Routes>
    </MemoryRouter>
  );
}

const SAMPLE_SET = {
  id: 1,
  name: 'Test Set',
  description: '',
  sort_order: 0,
  default_face: 0,
  face_count: 2,
  created_at: '',
  updated_at: '',
  card_count: 2,
  is_owner: true,
  flashcards: [
    { id: 10, set_id: 1, face1: 'a', face2: 'A', learned: 0, created_at: '' },
    { id: 11, set_id: 1, face1: 'b', face2: 'B', learned: 0, created_at: '' },
  ],
  totalCount: 2,
  learnedCount: 0,
};

describe('flashcard-study — Chưa thuộc increments difficulty', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSet.mockResolvedValue({ ...SAMPLE_SET, flashcards: [...SAMPLE_SET.flashcards] });
    mockIncrementDifficulty.mockResolvedValue({ difficulty_score: 2 });
    mockMarkLearned.mockResolvedValue({ message: 'ok', learned: true });
  });

  it('calls incrementFlashcardDifficulty with the current card id when "Chưa thuộc" is clicked', async () => {
    renderStudy();
    await screen.findByText('a');

    fireEvent.click(screen.getByTitle(/Chưa thuộc/));

    await waitFor(() => {
      expect(mockIncrementDifficulty).toHaveBeenCalledWith(10);
    });
    expect(mockMarkLearned).not.toHaveBeenCalled();
  });

  it('does NOT call incrementFlashcardDifficulty when "Đã thuộc" is clicked', async () => {
    renderStudy();
    await screen.findByText('a');

    fireEvent.click(screen.getByTitle(/Đã thuộc/));

    await waitFor(() => {
      expect(mockMarkLearned).toHaveBeenCalledWith(10, true);
    });
    expect(mockIncrementDifficulty).not.toHaveBeenCalled();
  });
});

describe('flashcard-study — reset dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSet.mockResolvedValue({ ...SAMPLE_SET, flashcards: [...SAMPLE_SET.flashcards] });
    mockResetSet.mockResolvedValue({ message: 'ok', count: 2 });
  });

  it('does not show a difficulty-reset checkbox (difficulty is shared and never reset)', async () => {
    renderStudy();
    await screen.findByText('a');

    fireEvent.click(screen.getByText('Học lại tất cả'));

    await screen.findByText('Xác nhận');
    expect(screen.queryByLabelText(/Đặt lại điểm độ khó/)).not.toBeInTheDocument();
  });

  it('calls resetVocabularySet with only the set id when confirming', async () => {
    renderStudy();
    await screen.findByText('a');

    fireEvent.click(screen.getByText('Học lại tất cả'));
    fireEvent.click(await screen.findByText('Xác nhận'));

    await waitFor(() => {
      expect(mockResetSet).toHaveBeenCalledWith('1');
    });
  });
});
