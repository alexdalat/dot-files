/* eslint-disable @typescript-eslint/naming-convention */

import styles from '@extension/app/pages/ViewItem/components/ItemTypeView/ItemTypeView.module.scss';
import { useHandleVaultChange } from '@extension/app/pages/ViewItem/hooks/useHandleVaultChange';
import cx from 'classnames';
import { useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { createCopyAction } from '@extension/app/pages/ViewItem/utils/createAction';
import { ViewField } from '@extension/app/pages/ViewItem/components/ViewField/ViewField';
import { getItemSecretChanges, getSecret } from '@extension/app/api/VaultApi';
import { INoteItem } from '@common/contracts/contracts';
import { useRefState } from '@common/hooks/useRefState';
import { ViewCustomFields } from '@extension/app/pages/ViewItem/components/ViewCustomFIelds/ViewCustomFields';
import { FeatureFlag } from '@common/constants/featureFlag';
import { VaultType } from '@common/constants/vault';
import { ViewItemSelectableValue } from './viewItemSelectableValue';

interface IViewNote {
  item: INoteItem;
}

export const ViewNote = ({ item }: IViewNote) => {
  const { formatMessage } = useIntl();
  const [note, setNote] = useRefState<string>();

  const { folder_name, uuid, custom_fields = [] } = item;

  const noteActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-note',
    value: note,
    actionText: <FormattedMessage id="secureNoteCopied" />,
  })], [note, uuid]);

  const getNote = useCallback(async () => {
    setNote(await getSecret(uuid));
  }, [setNote, uuid]);

  useEffect(() => {
    getNote();
  }, [getNote]);

  const onVaultChange = async () => setNote(await getItemSecretChanges(uuid));
  useHandleVaultChange(item, uuid, onVaultChange);

  return (
    <div className={cx(styles['item-type-view'], 'bg-primary-accent-8 rounded-2')}>
      {note && (
        <ViewField
          displayInvisibleAction
          label={formatMessage({ id: 'secureNote' })}
          value={<ViewItemSelectableValue className="whitespace-pre-wrap break-word w-full" value={note} />}
          actions={noteActions}
        />
      )}

      <ViewCustomFields
        uuid={uuid}
        fields={custom_fields}
        featureFlag={FeatureFlag.SecureNoteCustomFields}
        vaultType={VaultType.Note}
      />

      {folder_name && (
        <ViewField
          label={formatMessage({ id: 'folder' })}
          value={<ViewItemSelectableValue className="whitespace-pre-wrap break-word w-full" value={folder_name} />}
        />
      )}
    </div>
  );
};
