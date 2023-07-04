import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Image } from '@nord/ui';
import { useAppTheme } from '@extension/app/hooks/useAppTheme';
import { SECOND } from '@common/constants/time';
import enabledDarkIcon from '@icons/40/enabled-dark.svg';
import enabledLightIcon from '@icons/40/enabled-light.svg';
import { api } from '@extension/app/api';
import { FormType } from '@nordpass/form-classifier';
import { TChangeFormBehaviourType } from '@common/constants';

const getTranslationsByChangedTo = (changedTo: TChangeFormBehaviourType) => {
  switch (changedTo) {
    case FormType.Identity:
      return <FormattedMessage id="weWillSuggestAPersonalInfoFromNowOn" />;
    case FormType.Register:
      return <FormattedMessage id="weWillSuggestARegistrationFormFromNowOn" />;
    case FormType.CreditCard:
      return <FormattedMessage id="weWillSuggestACreditCardFromNowOn" />;
    case FormType.Login:
      return <FormattedMessage id="weWillSuggestAPasswordFromNowOn" />;
    case 'default':
      return <FormattedMessage id="weHaveResetThisFieldToDefault" />;
    default:
      return changedTo;
  }
};

interface IBody {
  changedTo: TChangeFormBehaviourType;
}

export const Body = ({ changedTo }: IBody) => {
  const { isDarkTheme } = useAppTheme();

  useEffect(() => {
    setTimeout(api.extension.closeChangeFormBehaviourDialog, 3 * SECOND);
  }, []);

  return (
    <div
      role="presentation"
      className="flex bg-primary color-primary-accent-6 px-6 py-3"
      onClick={api.extension.closeChangeFormBehaviourDialog}
    >
      <div className="pr-3 flex">
        <span className="rounded-full item-image-32px flex self-center">
          <Image noLazy src={isDarkTheme ? enabledDarkIcon : enabledLightIcon} />
        </span>
      </div>
      <div className="w-full text-small self-center">
        <p className="font-bold">
          {getTranslationsByChangedTo(changedTo)}
        </p>
        <p>
          <FormattedMessage id="youCanUpdateThisSettingAgainAtAnyTime" />
        </p>
      </div>
    </div>
  );
};
