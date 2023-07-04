import { api } from '@extension/app/api';
import cx from 'classnames';
import { useIntl, FormattedMessage } from 'react-intl';
import { ActionButton } from '@common/components/ActionButton/ActionButton';
import { IToastOptions, showToast, ToastEventType } from '@common/components/ToastNotification/ToastNotificationUtils';
import { ItemType } from '@common/constants/vault';
import { noOp } from '@common/constants/function';
import { UserAction } from '@common/constants/userAction';
import { truncate } from '@common/utils/stringUtils';
import { isSupportedImagePreviewFile } from '@common/utils/fileType';
import { SearchParamKeys } from '@common/constants/routes';
import { FeatureFlag } from '@common/constants/featureFlag';
import { ConfirmAction } from '@extension/app/components/ConfirmAction/ConfirmAction';
import { useFileStorage } from '@extension/app/hooks/useFileStorage';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';

import * as downloadIcon from '@icons/24/download.svg';
import * as trashIcon from '@icons/24/trash-black.svg';

import styles from './FileSectionActions.module.scss';

const MAX_FILE_NAME_SYMBOLS = 24;

interface IFileSectionActions {
  fileId: string;
  fileName: string;
  itemId: string;
  itemType: ItemType;
  fileType: string; // MIME Type
}

const getUserActions = (itemType: ItemType) => {
  switch (itemType) {
    case ItemType.Password:
      return {
        delete: UserAction.AttachmentDeletedPasswordExtension,
        deleteTap: UserAction.AttachmentDeletedTapPasswordExtension,
        downloadTap: UserAction.AttachmentDownloadedTapPasswordExtension,
        viewTap: UserAction.AttachmentTapPasswordExtension,
      };
    case ItemType.CreditCard:
      return {
        delete: UserAction.AttachmentDeletedCreditCardExtension,
        deleteTap: UserAction.AttachmentDeletedTapCreditCardExtension,
        downloadTap: UserAction.AttachmentDownloadedTapCreditCardExtension,
        viewTap: UserAction.AttachmentTapCreditCardExtension,
      };
    case ItemType.PersonalInfo:
      return {
        delete: UserAction.AttachmentDeletedPersonalInfoExtension,
        deleteTap: UserAction.AttachmentDeletedTapPersonalInfoExtension,
        downloadTap: UserAction.AttachmentDownloadedTapPersonalInfoExtension,
        viewTap: UserAction.AttachmentTapPersonalInfoExtension,
      };
    case ItemType.Passkey:
      return {
        delete: UserAction.AttachmentDeletedPasskeyExtension,
        deleteTap: UserAction.AttachmentDeletedTapPasskeyExtension,
        downloadTap: UserAction.AttachmentDownloadedTapPasskeyExtension,
        viewTap: UserAction.AttachmentTapPasskeyExtension,
      };
    case ItemType.Note:
      return {
        delete: UserAction.AttachmentDeletedNoteExtension,
        deleteTap: UserAction.AttachmentDeletedTapNoteExtension,
        downloadTap: UserAction.AttachmentDownloadedTapNoteExtension,
        viewTap: UserAction.AttachmentTapNoteExtension,
      };
    default:
      return null;
  }
};

export const FileSectionActions = ({ fileId, fileName, itemId, itemType, fileType }: IFileSectionActions) => {
  const { formatMessage } = useIntl();
  const { deleteFile } = useFileStorage();
  const userActions = getUserActions(itemType);
  const isPreviewAvailable = isSupportedImagePreviewFile(fileType);
  const isImagePreviewEnabled = useExtensionFeature(FeatureFlag.FileStorageImagePreview);

  const handleDelete = async () => {
    const deleteAction = userActions?.delete;

    await deleteFile(fileId).then(() => {
      showToast(ToastEventType.ActionFeedback, {
        bodyText: (
          <FormattedMessage id="deleteFileFeedback" values={{ fileName: truncate(fileName, MAX_FILE_NAME_SYMBOLS) }} />
        ),
      } as IToastOptions);
      if (deleteAction) {
        api.action.save(deleteAction).catch(noOp);
      }
    }).catch(noOp);
  };

  const handleDeleteClick = () => {
    const deleteTapAction = userActions?.deleteTap;

    if (deleteTapAction) {
      api.action.save(deleteTapAction).catch(noOp);
    }
  };

  const handleDownloadClick = () => {
    const downloadTapAction = userActions?.downloadTap;

    if (downloadTapAction) {
      api.action.save(downloadTapAction).catch(noOp);
    }
    api.extension.openDesktopApp({
      route: 'VIEW_ITEM',
      args: [itemId],
    });
  };

  const handleImagePreviewClick = () => {
    const viewTapAction = userActions?.viewTap;

    if (viewTapAction) {
      api.action.save(viewTapAction).catch(noOp);
    }

    api.extension.openDesktopApp({
      route: 'VIEW_ITEM',
      args: [`${itemId}?${SearchParamKeys.PreviewFile}=${fileId}`],
    });
  };

  return (
    <div className={cx(styles['file-section-actions__container'])}>
      {isPreviewAvailable && isImagePreviewEnabled && (
        <ActionButton
          buttonText={<FormattedMessage id="view" />}
          data-testid="attachment-view"
          aria-label={formatMessage({ id: 'view' })}
          onClick={handleImagePreviewClick}
        />
      )}
      <ActionButton
        tooltipText={formatMessage({ id: 'download' })}
        tooltipId={`download-${fileId}`}
        svgIcon={downloadIcon}
        data-testid="download"
        aria-label={formatMessage({ id: 'download' })}
        onClick={handleDownloadClick}
      />
      <ConfirmAction
        button={({ onClick }) => (
          <ActionButton
            tooltipText={formatMessage({ id: 'delete' })}
            tooltipId={`delete-${fileId}`}
            svgIcon={trashIcon}
            iconClassName="icon-fill-red"
            data-testid="delete"
            aria-label={formatMessage({ id: 'delete' })}
            onClick={e => {
              e.stopPropagation();
              onClick();
            }}
          />
        )}
        header={formatMessage({ id: 'deleteFileModalHeader' })}
        content={
          <p className="truncate-2-lines text-ellipsis break-all">
            <FormattedMessage id="deleteFileModalContent" values={{ fileName }} />
          </p>
        }
        action={handleDelete}
        actionText={formatMessage({ id: 'delete' })}
        buttonAction={handleDeleteClick}
      />
    </div>
  );
};
