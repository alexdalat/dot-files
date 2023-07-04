import { ReactNode, useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import enLocale from '@extension/assets/lang/compiled/en.json';
import deLocale from '@extension/assets/lang/compiled/de.json';
import frLocale from '@extension/assets/lang/compiled/fr.json';
import itLocale from '@extension/assets/lang/compiled/it.json';
import esLocale from '@extension/assets/lang/compiled/es.json';
import ltLocale from '@extension/assets/lang/compiled/lt.json';
import { createListener } from '@extension/app/api/createListener';
import { StorageApi } from '@extension/browser/storageApi';
import { ListenerType, Storage } from '@extension/common/constants';
import { Locale } from '@common/constants/locale';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { LogLevel } from '@common/services/loggingFactory/contracts';

const loadLocaleData = async (locale: Locale) => {
  switch (locale) {
    case Locale.German:
      return deLocale;
    case Locale.French:
      return frLocale;
    case Locale.Italian:
      return itLocale;
    case Locale.Spanish:
      return esLocale;
    case Locale.Lithuanian:
      return ltLocale;
    default:
      return enLocale;
  }
};

export const TranslationsProvider = ({ children }: { children?: ReactNode }) => {
  const [locale, setLocale] = useState(Locale.English);
  const [messages, setMessages] = useState<Record<string, any>>(enLocale);

  useEffect(() => {
    if (locale === Locale.English) {
      setMessages(enLocale);
      return;
    }

    (async () => setMessages({
      ...enLocale,
      ...(await loadLocaleData(locale)),
    }))();
  }, [locale]);

  useEffect(() => {
    (async () => {
      const initLocale = await StorageApi.get({ [Storage.AppLanguage]: null });
      if (initLocale[Storage.AppLanguage]) {
        setLocale(initLocale[Storage.AppLanguage]);
      }
    })();
  }, []);

  useEffect(() => {
    const handleAppLanguageChange = (changes: Record<string, any>) => {
      if (changes[Storage.AppLanguage]) {
        const language = changes[Storage.AppLanguage].newValue;
        setLocale(language);
      }
    };
    return createListener(handleAppLanguageChange, ListenerType.StorageChange);
  }, []);

  const onError = (error: Error) => {
    logMessage(LogLevel.Error, 'TranslationsProvider: ', error);
  };

  return (
    <IntlProvider
      locale={locale}
      defaultLocale={Locale.English}
      messages={messages}
      onError={onError}
    >
      {children}
    </IntlProvider>
  );
};
