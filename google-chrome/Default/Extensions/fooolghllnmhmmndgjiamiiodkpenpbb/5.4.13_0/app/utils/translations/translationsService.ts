import { TranslationsService } from '@extension/app/utils/translations/translationsServiceClass';
import { StorageApi } from '@extension/browser/storageApi';
import { createListener } from '@extension/app/api/createListener';

export const translationsService = new TranslationsService(StorageApi, createListener);
