import { ActionButton } from '@common/components/ActionButton/ActionButton';
import { Menu } from '@common/components/Menu/Menu';
import { useMenuState } from '@common/components/Menu/useMenuState';
import { ViewItemActionButton } from '@common/components/ViewItemActionButton/ViewItemActionButton';
import { Size } from '@common/constants/size';
import { IItem } from '@common/interfaces/item';
import { getIsPersonalInfo } from '@common/utils/itemTypeGuards';
import { CommonContextMenu } from '@extension/app/components/VaultList/ItemMenu/components/CommonContextMenu';
import { PersonalInfoContextMenu } from '@extension/app/components/VaultList/ItemMenu/components/PersonalInfoContextMenu';

import * as moreIcon from '@icons/24/more.svg';
import { useIntl } from 'react-intl';

interface IMoreItemViewActions {
  item: IItem;
  size?: Size.Small | Size.Large;
}

export const MoreItemViewActions = ({ item, size = Size.Large }: IMoreItemViewActions) => {
  const { isOpen, close, toggleOpen } = useMenuState();
  const { formatMessage } = useIntl();

  return (
    <Menu
      isOpen={isOpen}
      button={size === Size.Small ? (
        <ActionButton
          id="view-item-more-button"
          className="ml-auto"
          svgIcon={moreIcon}
          onClick={toggleOpen}
        />
      ) :
        (
          <ViewItemActionButton
            id="view-item-more-button"
            svgIcon={moreIcon}
            label={formatMessage({ id: 'more' })}
            onClick={toggleOpen}
          />
        )
      }
      onClose={close}
    >
      {getIsPersonalInfo(item) ? (
        <PersonalInfoContextMenu
          isEditHidden
          isShareHidden
          isAttachHidden
          item={item}
        />
      ) : (
        <CommonContextMenu
          isEditHidden
          isShareHidden
          isAttachHidden
          item={item}
        />
      )}
    </Menu>
  );
};
