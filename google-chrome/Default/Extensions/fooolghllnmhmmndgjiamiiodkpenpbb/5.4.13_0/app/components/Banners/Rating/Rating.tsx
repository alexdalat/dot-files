import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '@nordpass/ui';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import { Storage } from '@extension/common/constants';
import * as ClearIcon from '@icons/clear.svg';
import * as StarCommentIcon from '@icons/star-comment.svg';
import { SvgIcon } from '@common/components/SvgIcon';
import { StorageApi } from '@extension/browser/storageApi';
import { useAuthContext } from '@extension/app/context/AuthContext';
import { getTimeDiff, parseDate } from '@common/utils/date';
import { Browser } from '@common/constants';
import { useQuery } from '@common/hooks/useQuery/useQuery';
import { api } from '@extension/app/api';
import { getBrowser } from '@common/utils/getBrowser';
import { useAppTheme } from '@extension/app/hooks/useAppTheme';
import { RemoteURL } from '@common/constants/remoteURL';
import { noOp } from '@common/constants/function';
import { UserAction } from '@common/constants/userAction';

export const MIN_REGISTRATION_DAYS_DIFF = 21; // 3 weeks
export const SHOW_AGAIN_AFTER_DAYS_IF_CLOSED = 90; // 3 months
export const MIN_VAULT_ITEMS = 5;

const getRegistrationDaysDiff = (registrationDate?: string) => (
  registrationDate ? getTimeDiff(parseDate(registrationDate).getTime(), Date.now()).days : -1
);

interface IRating {
  vaultSize: number;
}

export const Rating = ({ vaultSize }: IRating) => {
  const [isVisible, setIsVisible] = useState(false);
  const { data: userUuid } = useQuery(api.extension.getUserUuid);
  const { subscriptionData } = useAuthContext();
  const { isDarkTheme } = useAppTheme();
  const registrationDiff = useMemo(() => (
    getRegistrationDaysDiff(subscriptionData.registrationDate)
  ), [subscriptionData]);
  const isShownStorageKey = `${Storage.IsExtensionRatingShown}-${userUuid}` as Storage;
  const extensionRatingSeenDate = `${Storage.ExtensionRatingSeenDate}-${userUuid}` as Storage;
  const isExtensionRated = `${Storage.IsExtensionRated}-${userUuid}` as Storage;

  useEffect(() => {
    (async () => {
      const { [isExtensionRated]: isRated } = await StorageApi.get({ [isExtensionRated]: false });
      if (
        isRated ||
        !userUuid ||
        registrationDiff < MIN_REGISTRATION_DAYS_DIFF ||
        vaultSize < MIN_VAULT_ITEMS ||
        getBrowser() !== Browser.Chrome
      ) {
        return;
      }

      const { [isShownStorageKey]: isShown } = await StorageApi.get({ [isShownStorageKey]: false });

      if (!isShown) {
        setIsVisible(true);
        api.action.save(UserAction.ExtensionRatingShown).catch(noOp);
        await StorageApi.set({
          [isShownStorageKey]: true,
          [extensionRatingSeenDate]: Date.now(),
        });
      } else {
        const {
          [extensionRatingSeenDate]: lastSeenDate,
        } = await StorageApi.get({ [extensionRatingSeenDate]: null });

        if (
          lastSeenDate &&
          getTimeDiff(Date.now(), new Date(lastSeenDate).getTime()).days >= SHOW_AGAIN_AFTER_DAYS_IF_CLOSED
        ) {
          api.action.save(UserAction.ExtensionRatingShown).catch(noOp);
          await StorageApi.set({ [extensionRatingSeenDate]: Date.now() });
          setIsVisible(true);
        }
      }
    })();
  }, [
    extensionRatingSeenDate,
    isExtensionRated,
    isShownStorageKey,
    registrationDiff,
    subscriptionData.registrationDate,
    userUuid,
    vaultSize,
  ]);

  const onHide = () => {
    setIsVisible(false);
    api.action.save(UserAction.ExtensionRatingCloseClick).catch(noOp);
  };

  const onRate = async () => {
    setIsVisible(false);
    api.action.save(UserAction.ExtensionRatingRateClick).catch(noOp);
    await StorageApi.set({ [isExtensionRated]: true });
    openInNewTab(RemoteURL.ChromeReviewStore);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <div
          role="presentation"
          className="absolute right-0 top-0 mr-7 mt-3 cursor-pointer"
          data-testid="close-icon"
          onClick={onHide}
        >
          <SvgIcon
            className="nordpass-svg color-primary-accent-9 hover:color-primary-accent-13"
            src={ClearIcon}
            width={16}
            height={16}
          />
        </div>
      </div>

      <div
        className="p-4 bg-primary-accent-18 m-4 mt-0 rounded-2 align-center justify-center text-left flex-1"
      >
        <div className="flex flex-row">
          <div className="row px-4">
            <div>
              <SvgIcon
                className="mr-4"
                src={StarCommentIcon}
                width={34}
                height={34}
              />
            </div>
            <div className="flex-1">
              <p className="font-bolder color-primary"> <FormattedMessage id="enjoyingNordPass" /></p>
              <p className="text-micro color-dmd-1 font-medium"> <FormattedMessage id="commentToRateExtension" /></p>
            </div>
          </div>
        </div>

        <Button
          className="mt-3 w-full border-none"
          rank={isDarkTheme ? 'secondary' : 'primary-variant'}
          onClick={onRate}
        >
          <FormattedMessage id="rateUs" />
        </Button>
      </div>
    </>
  );
};
