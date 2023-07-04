import { ItemType } from '@common/constants/vault';
import { UserAction } from '@common/constants/userAction';
import { api } from '@extension/app/api';
import { FileSectionActions } from '@extension/app/pages/ViewItem/components/FileSection/FileSectionActions';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { wrapWithIntl } from '@tests/utils/wrapWithIntl';

describe('<FileSectionActions/>', () => {
  const deleteButtonId = 'delete';
  const downloadButtonId = 'download';
  const confirmModalId = 'modal-confirm-action';

  const setup = ({ itemType = ItemType.Password }) => render(wrapWithIntl(
    <FileSectionActions
      fileId="fileId"
      itemId="itemId"
      fileName="fileName"
      itemType={itemType}
      fileType="test"
    />,
  ));

  it.each([
    [ItemType.Password, UserAction.AttachmentDownloadedTapPasswordExtension],
    [ItemType.CreditCard, UserAction.AttachmentDownloadedTapCreditCardExtension],
    [ItemType.PersonalInfo, UserAction.AttachmentDownloadedTapPersonalInfoExtension],
    [ItemType.Note, UserAction.AttachmentDownloadedTapNoteExtension],
    [ItemType.Passkey, UserAction.AttachmentDownloadedTapPasskeyExtension],
    [ItemType.Folder, null],
  ])('should handle download file user action for %s item type on button click', async (itemType, userAction) => {
    jest.spyOn(api.action, 'save');

    const { getByTestId } = setup({ itemType });
    const downloadButton = getByTestId(downloadButtonId);

    await userEvent.click(downloadButton);

    if (userAction) {
      expect(api.action.save).toHaveBeenCalledWith(userAction);
    } else {
      expect(api.action.save).not.toHaveBeenCalledWith(userAction);
    }
  });

  it('should open desktop app on download click', async () => {
    jest.spyOn(api.extension, 'openDesktopApp');

    const { findByTestId } = setup({});
    const downloadButton = await findByTestId('download');

    await userEvent.click(downloadButton);

    await waitFor(() => {
      expect(api.extension.openDesktopApp).toHaveBeenCalledWith({
        route: 'VIEW_ITEM',
        args: ['itemId'],
      });
    });
  });

  it.each([
    [ItemType.Password, UserAction.AttachmentDeletedTapPasswordExtension],
    [ItemType.CreditCard, UserAction.AttachmentDeletedTapCreditCardExtension],
    [ItemType.PersonalInfo, UserAction.AttachmentDeletedTapPersonalInfoExtension],
    [ItemType.Passkey, UserAction.AttachmentDeletedTapPasskeyExtension],
    [ItemType.Note, UserAction.AttachmentDeletedTapNoteExtension],
    [ItemType.Folder, null],
  ])('should handle delete file user action for %s item type on button click', async (itemType, userAction) => {
    jest.spyOn(api.action, 'save');

    const { getByTestId } = setup({ itemType });
    const deleteButton = getByTestId(deleteButtonId);

    await userEvent.click(deleteButton);

    if (userAction) {
      expect(api.action.save).toHaveBeenCalledWith(userAction);
    } else {
      expect(api.action.save).not.toHaveBeenCalledWith(userAction);
    }
  });

  it.each([
    [ItemType.Password, UserAction.AttachmentDeletedPasswordExtension],
    [ItemType.CreditCard, UserAction.AttachmentDeletedCreditCardExtension],
    [ItemType.PersonalInfo, UserAction.AttachmentDeletedPersonalInfoExtension],
    [ItemType.Passkey, UserAction.AttachmentDeletedPasskeyExtension],
    [ItemType.Note, UserAction.AttachmentDeletedNoteExtension],
    [ItemType.Folder, null],
  ])('should handle user action for %s item type after successful deletion', async (itemType, userAction) => {
    jest.spyOn(api.item, 'deleteFile');
    jest.spyOn(api.action, 'save');

    const { findByTestId } = setup({ itemType });

    const deleteButton = await findByTestId(deleteButtonId);

    await userEvent.click(deleteButton);

    const confirmDeleteAction = await findByTestId(confirmModalId);

    await userEvent.click(confirmDeleteAction);

    if (userAction) {
      expect(api.action.save).toHaveBeenCalledWith(userAction);
    } else {
      expect(api.action.save).not.toHaveBeenCalledWith(userAction);
    }
  });

  it('should handle delete click', async () => {
    jest.spyOn(api.item, 'deleteFile');

    const { findByTestId } = setup({});
    const deleteButton = await findByTestId('delete');

    await userEvent.click(deleteButton);

    const confirmDeleteAction = await findByTestId(confirmModalId);

    await userEvent.click(confirmDeleteAction);

    await waitFor(() => {
      expect(api.item.deleteFile).toHaveBeenCalledWith('fileId');
    });
  });
});
