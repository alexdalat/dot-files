import { memo } from 'react';
import { FormattedMessage } from 'react-intl';
import { duplicatePersonalInfo } from '@extension/app/api/VaultApi';
import { IPersonalInfoItem } from '@common/contracts/contracts';
import { MenuItem } from '@common/components/Menu/MenuItem';
import { Tooltip } from '@common/components/Tooltip/Tooltip';
import { getIfItemHasFiles } from '@common/utils/getIfItemHasFiles';
import { CommonContextMenu } from './CommonContextMenu';

interface IPersonalInfoItemContextMenu {
  item: IPersonalInfoItem;
  isShareHidden?: boolean;
  isEditHidden?: boolean;
  isAttachHidden?: boolean;
}

export const PersonalInfoContextMenu = memo(({
  item,
  isEditHidden,
  isShareHidden,
  isAttachHidden,
}: IPersonalInfoItemContextMenu) => {
  const config = [
    {
      isActive: true,
      component: () => (
        <MenuItem
          data-tip-cant-duplicate
          key="duplicate"
          isDisabled={getIfItemHasFiles(item)}
          onClick={() => duplicatePersonalInfo(item)}
        >
          {getIfItemHasFiles(item) && (
            <Tooltip showOnHover id="cant-duplicate">
              <FormattedMessage id="cantDuplicateWithAttachments" />
            </Tooltip>
          )}
          <FormattedMessage id="duplicate" />
        </MenuItem>
      ),
    },
  ];

  return (
    <CommonContextMenu
      item={item}
      isEditHidden={isEditHidden}
      isShareHidden={isShareHidden}
      isAttachHidden={isAttachHidden}
      additionalActionsConfig={config}
    />
  );
});
