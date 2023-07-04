import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Image } from '@nord/ui';
import { useAppTheme } from '@extension/app/hooks/useAppTheme';
import { SECOND } from '@common/constants/time';
import likeDarkIcon from '@icons/40/like-dark.svg';
import likeLightIcon from '@icons/40/like-light.svg';
import { api } from '@extension/app/api';

interface ISuccess {
  isEnjoying: boolean;
}

export const Success = ({ isEnjoying }: ISuccess) => {
  const { isDarkTheme } = useAppTheme();

  useEffect(() => {
    setTimeout(api.extension.closeReportProblemDialog, 3 * SECOND);
  }, []);

  return (
    <div
      role="presentation"
      className="flex bg-primary color-primary-accent-6 px-6 py-3"
      onClick={api.extension.closeReportProblemDialog}
    >
      <div className="pr-3 flex">
        <span className="rounded-full item-image-32px flex self-center">
          <Image noLazy src={isDarkTheme ? likeDarkIcon : likeLightIcon} />
        </span>
      </div>
      <div className="w-full text-small self-center">
        <p className="font-bold">
          {isEnjoying ?
            <FormattedMessage id="thanksForYourFeedback" /> :
            <FormattedMessage id="thanksForReportingAnIssue" />
          }
        </p>
        <p>
          {isEnjoying ?
            <FormattedMessage id="weHopeYouContinueToEnjoyUsingNordPass" /> :
            <FormattedMessage id="weWillStartLookingIntoItRightAway" />
          }
        </p>
      </div>
    </div>
  );
};
