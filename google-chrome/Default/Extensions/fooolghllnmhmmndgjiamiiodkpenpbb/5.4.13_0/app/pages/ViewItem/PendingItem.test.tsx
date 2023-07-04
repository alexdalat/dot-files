import { fireEvent, render, waitFor } from '@testing-library/react';
import { PendingItem, IPendingItem } from '@extension/app/pages/ViewItem/PendingItem';
import { sendMessage } from '@extension/app/api';
import { Action } from '@common/constants/action';
import { IItem } from '@common/interfaces/item';
import { ItemType, ShareStatus } from '@common/constants/vault';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';

describe('PendingItem', () => {
  const pendingItem: IItem = {
    uuid: '123',
    last_used_at: '1234',
    owner: false,
    share_status: ShareStatus.Pending,
    shared: true,
    type: ItemType.Password,
    title: 'item',
  };

  const setup = (propOverrides?: Partial<IPendingItem>) => {
    const props: IPendingItem = {
      pendingItem,
      onClose: jest.fn(),
      ...propOverrides,
    };

    return render(wrapWithProviders(<PendingItem {...props} />));
  };

  it('should call accept when accepting share', async () => {
    const onClose = jest.fn();
    const { findByText } = setup({ onClose });

    expect(await findByText('Accept')).toBeVisible();
    fireEvent.click(await findByText('Accept'));

    await waitFor(() => expect(sendMessage).toHaveBeenCalledWith(
      Action.ShareAccept,
      {
        items: [{
          uuid: pendingItem.uuid,
          always: false,
        }],
      },
    ));
  });

  it('should call onClose when declining share', async () => {
    const onClose = jest.fn();
    const { findByText, findByTestId } = setup({ onClose });
    expect(await findByText('Decline')).toBeVisible();

    fireEvent.click(await findByTestId('decline-button'));
    fireEvent.click(await findByTestId('modal-confirm-action'));

    await waitFor(expect(onClose).toHaveBeenCalled);
  });
});
