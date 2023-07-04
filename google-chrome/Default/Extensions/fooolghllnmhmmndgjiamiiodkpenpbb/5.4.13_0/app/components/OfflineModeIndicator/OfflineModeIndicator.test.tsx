import { fireEvent, render, waitFor } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { sendMessage } from '@extension/app/api';
import { Action } from '@common/constants/action';
import { useOnlineStatus } from '@extension/app/hooks/useOnlineStatus';
import { OfflineModeIndicator } from './OfflineModeIndicator';

jest.mock('@extension/app/hooks/useOnlineStatus');

interface IOnlineStatus {
  isOnline: boolean | null;
  isBackOnline: boolean;
}

const mockOnlineStatus = (onlineStatus: IOnlineStatus) => {
  (useOnlineStatus as jest.Mock).mockReturnValue(onlineStatus);
};

const setup = (isBusiness = false) => render(wrapWithProviders(<OfflineModeIndicator isBusiness={isBusiness} />));

describe('<OfflineModeIndicator />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when isOnline is null', () => {
    it('should not display indicator', async () => {
      mockOnlineStatus({ isOnline: null, isBackOnline: false });
      const { queryByTestId } = setup();

      await waitFor(() => {
        expect(queryByTestId('offline-indicator')).toBeNull();
      });
    });
  });

  describe('when in offline mode', () => {
    it('should show offline indicator, text, icon & Refresh link', async () => {
      mockOnlineStatus({ isOnline: false, isBackOnline: false });
      const { findByTestId, findByText } = setup();

      expect(await findByTestId('offline-indicator')).toBeVisible();
      expect(await findByTestId('offline-icon')).toBeVisible();
      expect(await findByText("You're offline.")).toBeVisible();
      expect(await findByText('Refresh')).toBeVisible();
    });

    it('should not show offline indicator if user is business user', async () => {
      mockOnlineStatus({ isOnline: true, isBackOnline: false });

      const { queryByTestId } = setup(true);

      await waitFor(() => {
        expect(queryByTestId('offline-indicator')).toBeNull();
      });
    });

    it('should send message with Action.OnlineStatusCheck on refresh button click', async () => {
      mockOnlineStatus({ isOnline: false, isBackOnline: false });
      const { findByTestId } = setup();

      fireEvent.click(await findByTestId('refresh-button'));

      expect(sendMessage).toBeCalledWith(Action.OnlineStatusCheck);
    });
  });

  describe('when in online mode', () => {
    it('should show online indicator, text & icon if user is back online', async () => {
      mockOnlineStatus({ isOnline: true, isBackOnline: true });
      const { getByTestId, findByText } = setup();

      expect(getByTestId('offline-indicator')).toBeVisible();
      expect(getByTestId('online-icon')).toBeVisible();
      expect(await findByText('You\'re back online')).toBeVisible();
    });
  });

  it('should not show online indicator if user is not back online', async () => {
    mockOnlineStatus({ isOnline: true, isBackOnline: false });

    const { queryByTestId } = setup();

    await waitFor(() => {
      expect(queryByTestId('offline-indicator')).toBeNull();
    });
  });
});
