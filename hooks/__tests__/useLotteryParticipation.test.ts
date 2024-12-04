import { renderHook, act } from '@testing-library/react';
import { useLotteryParticipation } from '../useLotteryParticipation';

describe('useLotteryParticipation', () => {
  const mockContract = {
    doQuery: jest.fn(),
    dryRun: jest.fn(),
    doTx: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockContract.dryRun.mockResolvedValue({ success: true });
    mockContract.doTx.mockResolvedValue(undefined);
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useLotteryParticipation(mockContract));

    expect(result.current.selectedNumbers).toEqual([]);
    expect(result.current.canParticipate).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toBe("");
  });

  it('handles number selection correctly', async () => {
    const { result } = renderHook(() => useLotteryParticipation(mockContract));

    await act(async () => {
      result.current.handleNumberSelect(1);
    });

    expect(result.current.selectedNumbers).toEqual([1]);

    await act(async () => {
      result.current.handleNumberSelect(2);
    });

    expect(result.current.selectedNumbers).toEqual([1, 2]);
  });

  it('prevents selecting more than MAX_SELECTIONS numbers', async () => {
    const { result } = renderHook(() => useLotteryParticipation(mockContract));

    await act(async () => {
      result.current.handleNumberSelect(1);
      result.current.handleNumberSelect(2);
      result.current.handleNumberSelect(3);
      result.current.handleNumberSelect(4);
      result.current.handleNumberSelect(5);
    });

    expect(result.current.selectedNumbers).toHaveLength(4);
  });

  it('handles participation correctly', async () => {
    const { result } = renderHook(() => useLotteryParticipation(mockContract));

    // Select numbers
    await act(async () => {
      result.current.handleNumberSelect(1);
      result.current.handleNumberSelect(2);
      result.current.handleNumberSelect(3);
      result.current.handleNumberSelect(4);
    });

    // Participate
    await act(async () => {
      await result.current.participate();
    });

    expect(mockContract.doTx).toHaveBeenCalledWith("participate", [[1, 2, 3, 4]]);
    expect(result.current.selectedNumbers).toEqual([]);
  });

  it('handles errors during participation', async () => {
    mockContract.doTx.mockRejectedValue(new Error('Transaction failed'));
    const { result } = renderHook(() => useLotteryParticipation(mockContract));

    // Select numbers
    await act(async () => {
      result.current.handleNumberSelect(1);
      result.current.handleNumberSelect(2);
      result.current.handleNumberSelect(3);
      result.current.handleNumberSelect(4);
    });

    // Attempt to participate
    await act(async () => {
      await result.current.participate();
    });

    expect(result.current.errorMessage).toBe("Une erreur est survenue lors de la participation");
  });
}); 