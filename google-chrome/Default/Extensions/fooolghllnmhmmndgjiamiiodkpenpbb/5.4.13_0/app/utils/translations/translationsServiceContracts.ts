import { ITranslations } from '@common/utils/Translations';

export interface ITranslationsService extends ITranslations {
  handleLocaleChange: (changes: Record<string, any>) => void;
}
