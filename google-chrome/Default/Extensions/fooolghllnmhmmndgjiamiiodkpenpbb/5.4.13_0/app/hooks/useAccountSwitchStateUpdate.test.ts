import { showToast, ToastEventType } from '@common/components/ToastNotification/ToastNotificationUtils';
import { StorageApi } from '@extension/browser/storageApi';
import { Notification } from '@common/constants/notification';
import { Storage } from '@extension/common/constants';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { api } from '@extension/app/api';
import * as createListener from '@extension/app/api/createListener';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AuthState } from '@common/store/reducers/authReducer/authConstants';
import { ReactNode } from 'react';
import { useAccountSwitchStateUpdate } from './useAccountSwitchStateUpdate';

jest.mock('@extension/app/api/createListener');
jest.mock('@common/components/ToastNotification/ToastNotificationUtils');

describe('useAccountSwitchStateUpdate', () => {
  jest.spyOn(api.extension, 'getUserEmail').mockResolvedValue('email@mail.com');

  const listeners = new Set<(data: Record<string, any>) => void>();
  const triggerNotification = (data: Record<string, any>) => listeners.forEach(handler => handler(data));

  jest.spyOn(createListener, 'createListener').mockImplementation((handler, _listenerType) => {
    listeners.add(handler);
    return () => listeners.delete(handler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    listeners.clear();
  });

  const setup = () => renderHook(
    () => useAccountSwitchStateUpdate(jest.fn()),
    { wrapper: ({ children }: { children?: ReactNode }) => wrapWithProviders(children) },
  );

  it('should call show account changed toast with user email', async () => {
    StorageApi.get = jest.fn().mockResolvedValue({ [Storage.AuthState]: AuthState.Authenticated });

    setup();
    expect(showToast).not.toHaveBeenCalled();

    act(() => triggerNotification({
      id: 0,
      type: Notification.AccountChanged,
    }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        ToastEventType.ActionFeedback,
        { bodyText: 'Switched account to email@mail.com' },
      );
    });
  });
});
