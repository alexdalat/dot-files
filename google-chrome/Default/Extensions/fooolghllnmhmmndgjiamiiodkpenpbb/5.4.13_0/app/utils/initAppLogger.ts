import { listenForErrors } from '@common/services/listenForErrors';
import { logMessage } from '@extension/common/utils/log/logMessage';

export const initAppLogger = () => listenForErrors(logMessage);
