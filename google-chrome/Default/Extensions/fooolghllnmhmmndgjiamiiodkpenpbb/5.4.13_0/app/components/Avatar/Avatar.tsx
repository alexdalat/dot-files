import { ProfileAvatar } from '@common/components/ProfileAvatar/ProfileAvatar';
import { FeatureFlag } from '@common/constants/featureFlag';
import { Notification } from '@common/constants/notification';
import { Size } from '@common/constants/size';
import { useIsMountedRef } from '@common/hooks/useIsMountedRef';
import { INotification } from '@common/interfaces/messages';
import { createListener } from '@extension/app/api/createListener';
import { useEnvironment } from '@extension/app/hooks/useEnvironment';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import { ListenerType } from '@extension/common/constants';
import { useEffect, useState } from 'react';

export interface IAvatarProps {
  avatar?: string | null;
  email: string | undefined;
  size: Size;
  className?: string;
}

export const Avatar = ({ avatar, email, size, className }: IAvatarProps) => {
  const [shouldShowInitials, setShouldShowInitials] = useState(false);

  const isAvatarEnabled = useExtensionFeature(FeatureFlag.UserAvatar);
  const environment = useEnvironment();
  const isMountedRef = useIsMountedRef();

  useEffect(() => {
    const handleNotification = (msg: INotification) => {
      if (msg.type === Notification.OnlineStatusChange && msg.status === true && isMountedRef.current) {
        setShouldShowInitials(false);
      }
    };

    return createListener(handleNotification, ListenerType.RuntimeMessage);
  }, [isMountedRef]);

  return (
    <ProfileAvatar
      avatar={avatar}
      email={email}
      size={size}
      className={className}
      environment={environment}
      isAvatarEnabled={isAvatarEnabled}
      shouldShowInitials={shouldShowInitials}
      setShouldShowInitials={setShouldShowInitials}
    />
  );
};
