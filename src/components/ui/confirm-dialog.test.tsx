import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('does NOT render checkbox when extraCheckbox is not provided (backward compat)', () => {
    render(
      <ConfirmDialog
        isOpen
        title="Title"
        message="Msg"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders checkbox with label when extraCheckbox is provided', () => {
    render(
      <ConfirmDialog
        isOpen
        title="Title"
        message="Msg"
        extraCheckbox={{ label: 'Reset difficulty too', defaultChecked: false }}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Reset difficulty too')).toBeInTheDocument();
  });

  it('passes the checkbox value to onConfirm (unchecked)', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="T"
        message="M"
        confirmText="OK"
        extraCheckbox={{ label: 'Extra', defaultChecked: false }}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    fireEvent.click(screen.getByText('OK'));
    expect(onConfirm).toHaveBeenCalledWith(false);
  });

  it('passes true when the user checks the checkbox before confirming', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="T"
        message="M"
        confirmText="OK"
        extraCheckbox={{ label: 'Extra', defaultChecked: false }}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('OK'));
    expect(onConfirm).toHaveBeenCalledWith(true);
  });

  it('respects defaultChecked=true', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="T"
        message="M"
        confirmText="OK"
        extraCheckbox={{ label: 'Extra', defaultChecked: true }}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
    fireEvent.click(screen.getByText('OK'));
    expect(onConfirm).toHaveBeenCalledWith(true);
  });
});
