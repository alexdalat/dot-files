import { TSendMessage } from '@common/contracts/contracts';
import { getApiMethods } from '@common/utils/getApiMethods';
import { ExtensionAPI } from '~/api/ExtensionAPI';

export const sendMessage = jest.fn(() => new Promise<undefined>(resolve => resolve(undefined))) as TSendMessage;
const logMessage = jest.fn();

export const api = {
  ...getApiMethods(sendMessage, logMessage),
  extension: new ExtensionAPI(sendMessage, logMessage),
};
