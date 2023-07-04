import { Notification } from '@common/constants/notification';
import { useQuery } from '@common/hooks/useQuery/useQuery';
import { INotification } from '@common/interfaces/messages';
import { api } from '@extension/app/api';
import { createListener } from '@extension/app/api/createListener';
import { ListenerType } from '@extension/common/constants';
import { useEffect } from 'react';

export const useAvatar = () => {
  const { data: avatar = null, refetch: refetchAvatar } = useQuery(api.extension.getUserAvatar);

  useEffect(() => {
    const handleAvatarChange = (msg: INotification) => {
      if (msg.type === Notification.AvatarChanged) {
        refetchAvatar();
      }
    };

    return createListener(handleAvatarChange, ListenerType.RuntimeMessage);
  }, [refetchAvatar]);

  return avatar;
};
