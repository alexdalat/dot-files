import { createListenerFactory } from '@common/utils/createListenerFactory';
import { BrowserApi } from '@extension/browser/browserApi';

export const createListener = createListenerFactory(BrowserApi);
