import { useEffect } from 'react';
import { createListener } from '@extension/app/api/createListener';
import { INotification } from '@common/interfaces/messages';
import { Notification } from '@common/constants/notification';
import { closePopup } from '@extension/app/utils/closePopup';
import { ListenerType } from '@extension/common/constants';

export const useOpenedExtensionTabListener = () => {
  useEffect(() => createListener((msg: INotification) => {
    if (msg.type === Notification.ExtensionTabOpened) {
      closePopup();
    }
  }, ListenerType.RuntimeMessage), []);
};
