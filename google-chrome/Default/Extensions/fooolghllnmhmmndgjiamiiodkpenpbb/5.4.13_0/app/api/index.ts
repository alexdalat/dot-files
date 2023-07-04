import { BrowserApi } from '@extension/browser/browserApi';
import { IMessage } from '@common/interfaces/messages';
import { TLogMessage } from '@common/services/loggingFactory/contracts';
import { getApiMethods, TBackendApi } from '@common/utils/getApiMethods';
import { ExtensionAPI } from '~/api/ExtensionAPI';

export const sendMessage = (type: IMessage['type'], data: any = {}) => BrowserApi.sendMessage({ type, ...data });

// TODO add error logging (currently none of API's use it);
const logMessage: TLogMessage = (_error: string) => { /* To be implemented */ };

interface IExtensionBackendApi extends TBackendApi {
  extension: ExtensionAPI;
}

export const api: IExtensionBackendApi = {
  ...getApiMethods(sendMessage, logMessage),
  extension: new ExtensionAPI(sendMessage, logMessage),
};
