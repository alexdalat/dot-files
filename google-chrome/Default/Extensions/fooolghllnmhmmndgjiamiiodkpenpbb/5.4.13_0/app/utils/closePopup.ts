import { noOp } from '@common/constants/function';
import { isSafari } from '@common/utils/isSafari';
import { isStandaloneExtension } from '@common/utils/platformEnv';

interface ICloseParams {
  windowRef?: Window;
  legacySafariPopupClose?: () => Promise<void>;
}

export const closePopup = async ({ windowRef, legacySafariPopupClose }: ICloseParams = {}) => {
  if (isSafari && !isStandaloneExtension) {
    legacySafariPopupClose?.().catch(noOp);
  } else if (windowRef) {
    windowRef.close();
  } else {
    globalThis.close();
  }
};
