import { Translations } from '@common/utils/Translations';
import { Locale } from '@common/constants/locale';
import { ICreateListener } from '@common/utils/createListenerFactory';
import { ListenerType, Storage } from '@extension/common/constants';
import enLocale from '@extension/assets/lang/compiled/en.json';
import deLocale from '@extension/assets/lang/compiled/de.json';
import frLocale from '@extension/assets/lang/compiled/fr.json';
import itLocale from '@extension/assets/lang/compiled/it.json';
import esLocale from '@extension/assets/lang/compiled/es.json';
import ltLocale from '@extension/assets/lang/compiled/lt.json';
import { IStorageApi } from '@extension/browser/storageApiContracts';
import { isSafari } from '@common/utils/isSafari';
import { updateContextMenu } from '@common/services/contextMenu';
import { ITranslationsService } from '@extension/app/utils/translations/translationsServiceContracts';

export class TranslationsService extends Translations implements ITranslationsService {
  private isLanguageInitialized = false;

  public constructor(private storageApi: IStorageApi, private createListener: ICreateListener) {
    const locales = {
      [Locale.English]: enLocale,
      [Locale.German]: deLocale,
      [Locale.French]: frLocale,
      [Locale.Italian]: itLocale,
      [Locale.Spanish]: esLocale,
      [Locale.Lithuanian]: ltLocale,
    };

    super(locales);

    this.storageApi.get({ [Storage.AppLanguage]: null }).then(result => {
      const language = result?.appLanguage;
      if (!this.isLanguageInitialized && language) {
        super.createIntl(language);
      }
    });

    this.handleLocaleChange = this.handleLocaleChange.bind(this);
    this.createListener(this.handleLocaleChange, ListenerType.StorageChange);
  }

  public handleLocaleChange(changes: Record<string, any>) {
    if (changes[Storage.AppLanguage]) {
      const locale = changes[Storage.AppLanguage].newValue;
      super.createIntl(locale);

      if (!isSafari) {
        updateContextMenu(this);
      }
      this.isLanguageInitialized = true;
    }
  }
}
