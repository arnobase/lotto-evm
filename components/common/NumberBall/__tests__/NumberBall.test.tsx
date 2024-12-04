import { render, fireEvent, screen } from '@testing-library/react';
import NumberBall from '../index';

describe('NumberBall', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders with correct number', () => {
    render(<NumberBall number={42} selected={false} onClick={mockOnClick} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('handles click events', () => {
    render(<NumberBall number={42} selected={false} onClick={mockOnClick} />);
    fireEvent.click(screen.getByText('42'));
    expect(mockOnClick).toHaveBeenCalledWith(42);
  });

  it('applies selected styles when selected', () => {
    const { container } = render(
      <NumberBall number={42} selected={true} onClick={mockOnClick} />
    );
    expect(container.firstChild).toHaveClass('bg-gradient-to-br');
    expect(container.firstChild).toHaveClass('from-purple-500');
  });

  it('applies correct size classes', () => {
    const { rerender, container } = render(
      <NumberBall number={42} selected={false} onClick={mockOnClick} size="sm" />
    );
    expect(container.firstChild).toHaveClass('w-8');

    rerender(
      <NumberBall number={42} selected={false} onClick={mockOnClick} size="lg" />
    );
    expect(container.firstChild).toHaveClass('w-16');
  });
}); 