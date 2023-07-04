import { SvgIcon } from '@common/components/SvgIcon';
import { Size } from '@common/constants/size';
import { IItem } from '@common/interfaces/item';
import { api } from '@extension/app/api';
import { Avatar } from '@extension/app/components/Avatar/Avatar';
import { useSharedContacts } from '@extension/app/hooks/useSharedContacts';
import chevronRight from '@icons/24/chevron-right.svg';
import { AvatarGroup, Button, GroupAvatar, Link, OwnersAvatar } from '@nordpass/ui';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useIsItemInSharedFolder } from './useIsItemInSharedFolder';

import './SharedWith.scss';

const MAX_CONTACT_ICONS_TO_SHOW = 4;
const DEFAULT_AVATAR_PROPS = {
  className: 'mr-2 email-icon',
  size: Size.ExtraSmall,
};

export interface ISharedUser {
  avatar: string | null;
  email: string;
  owner: boolean;
  is_owners?: boolean;
}

interface ISharedWithProps {
  item: IItem;
}

export const SharedWith = ({ item }: ISharedWithProps) => {
  const { sharedUsers, sharedGroups } = useSharedContacts(item);
  const sharedContacts = useMemo(() => ([...sharedUsers, ...sharedGroups]), [sharedUsers, sharedGroups]);
  const contactIcons = useMemo(
    () => sharedContacts
      .slice(0, MAX_CONTACT_ICONS_TO_SHOW)
      .map((sharedContact, index) => {
        if (index < sharedUsers.length) {
          const user = sharedContact as ISharedUser;

          if (user.is_owners) {
            return <OwnersAvatar key={index} {...DEFAULT_AVATAR_PROPS} />;
          }

          return (
            <Avatar
              key={index}
              avatar={user.avatar}
              email={user.email}
              {...DEFAULT_AVATAR_PROPS}
            />
          );
        }

        const group = sharedContact as IItem;

        return (
          <GroupAvatar
            key={group.title}
            title={group.title}
            uuid={group.uuid}
            {...DEFAULT_AVATAR_PROPS}
          />
        );
      }).reverse(),
    [sharedContacts, sharedUsers],
  );

  const isInSharedFolder = useIsItemInSharedFolder(item);

  if (isInSharedFolder || !sharedContacts.length) {
    return null;
  }

  return (
    <>
      <span className="text-micro text-grey-dark my-2 color-primary-accent-1">
        <FormattedMessage id="sharedWith" />
      </span>
      <Link
        className="shared-with flex text-nano mb-2"
        iconPosition="right"
        onClick={() => api.extension.openDesktopApp({
          route: 'SHARE_ITEM',
          args: [item.uuid],
        })}
      >
        <AvatarGroup>
          {contactIcons}
        </AvatarGroup>
        <Button
          className="h-24px w-24px"
          rank="secondary"
          size="small"
          data-testid="avatar-plus-icon"
        >
          <SvgIcon
            className="nordpass-svg color-primary-accent-6"
            width={24}
            height={24}
            src={chevronRight}
          />
        </Button>
      </Link>
    </>
  );
};
