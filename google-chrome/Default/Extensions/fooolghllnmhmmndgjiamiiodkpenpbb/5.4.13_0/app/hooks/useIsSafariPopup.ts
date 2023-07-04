import { useEffect, useState } from 'react';
import { isSafari } from '@common/utils/isSafari';
import { ListenerType, SafariCommands } from '@extension/common/constants';
import { createListener } from '@extension/app/api/createListener';
import { noOp } from '@common/constants/function';
import { IMessage } from '@common/interfaces/messages';

export const useIsSafariPopup = () => {
  const [isPopup, setIsPopup] = useState(false);

  useEffect(() => {
    if (isSafari) {
      const handleMessage = (msg: IMessage) => {
        if (msg?.command === SafariCommands.IsPopUpOpen) {
          setIsPopup(msg.data);
        }
      };
      return createListener(handleMessage, ListenerType.RuntimeMessage);
    }
    return noOp;
  }, []);

  return isPopup;
};
