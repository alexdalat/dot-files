import { act, render } from '@testing-library/react';
import * as createListener from '@extension/app/api/createListener';
import { ListenerType, Storage } from '@extension/common/constants';
import { StorageApi } from '@extension/browser/storageApi';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { ApproveExtension } from '@extension/app/components/ApproveExtension/ApproveExtension';

jest.mock('@extension/app/api/createListener');

describe('ApproveExtension', () => {
  const listeners = new Set<(data: Record<string, any>) => void>();
  const triggerNotification = (data: Record<string, any>) => listeners.forEach(handler => handler(data));

  jest.spyOn(createListener, 'createListener').mockImplementation((handler, _listenerType) => {
    listeners.add(handler);
    return () => listeners.delete(handler);
  });

  const setup = () => render(wrapWithProviders(<ApproveExtension />));

  beforeEach(() => {
    listeners.clear();
  });

  describe('handleApproveCodeChange', () => {
    it('should update approve code on storage value change', async () => {
      StorageApi.get = jest.fn().mockResolvedValue({ [Storage.ApproveCode]: '1234' });

      const { findByTestId } = setup();
      const approveCode = await findByTestId('approve-code');

      expect(approveCode.textContent).toStrictEqual('1234');

      act(() => triggerNotification({
        id: 1,
        type: ListenerType.StorageChange,
        approveCode: {
          newValue: '5678',
        },
      }));

      expect(approveCode.textContent).toStrictEqual('5678');
    });
  });
});
