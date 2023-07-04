import * as createListener from '@extension/app/api/createListener';
import { StorageApi } from '@extension/browser/storageApi';
import { Storage } from '@extension/common/constants';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useOnlineStatus } from './useOnlineStatus';

jest.mock('@extension/app/api/createListener');

const mockOnlineStatus = () => {
  let changeOnlineStatus: (changes: Record<string, any>) => void = jest.fn();
  jest.spyOn(createListener, 'createListener').mockImplementation((handler, _listenerType) => {
    changeOnlineStatus = handler;
    return jest.fn();
  });

  return (newValue: boolean) => changeOnlineStatus({ [Storage.OnlineStatus]: { newValue } });
};

describe('useOnlineStatus', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should set isOnline to null when online status is unknown', () => {
    StorageApi.get = jest.fn().mockResolvedValue(jest.fn());
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBeNull();
  });

  it('should set isOnline based on response from StorageApi', async () => {
    StorageApi.get = jest.fn().mockResolvedValue({ [Storage.OnlineStatus]: true });

    const { result } = renderHook(() => useOnlineStatus());

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });
  });

  it('should update isOnline and isBackOnline on online status change', async () => {
    jest.useFakeTimers();

    const changeOnlineStatus = mockOnlineStatus();
    const { result } = renderHook(() => useOnlineStatus());

    act(() => changeOnlineStatus(false));

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isBackOnline).toBe(false);

    act(() => changeOnlineStatus(true));

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isBackOnline).toBe(true);

    act(() => void jest.advanceTimersByTime(3000));

    expect(result.current.isBackOnline).toBe(false);
  });
});
