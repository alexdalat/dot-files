import { Countdown } from '@common/components/Countdown/Countdown';
import { CampaignUrl } from '@common/constants/campaignUrl';
import { CURRENT_SALE_DISCOUNT_PERCENTAGE, CURRENT_SALE_RIBBON_FEATURE_FLAG } from '@common/constants/sale';
import { Size } from '@common/constants/size';
import { UserAction } from '@common/constants/userAction';
import { api } from '@extension/app/api';
import { useExtensionFeatureDates } from '@extension/app/utils/getIsFeatureEnabled';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import cx from 'classnames';
import { useIntl } from 'react-intl';

import { upgradeToPremiumExtension } from '@extension/app/utils/upgradeToPremiumExtension';
import styles from './SaleBanner.module.scss';

export const SaleBanner = () => {
  const { formatMessage } = useIntl();
  const featureDates = useExtensionFeatureDates(CURRENT_SALE_RIBBON_FEATURE_FLAG);

  if (!featureDates) {
    return null;
  }

  const handleClick = () => {
    upgradeToPremiumExtension(CampaignUrl.CurrentSaleExtension, openInNewTab, logMessage, 'PremiumSaleBannerExtension:handleClick');
    api.action.save(UserAction.PremiumSaleBannerExtension);
  };

  return (
    <a
      role="button"
      className={cx('block overflow-hidden rounded-2 w-343px', styles.banner)}
      tabIndex={0}
      onClick={handleClick}
    >
      <div className={cx('flex justify-center items-center transition-all duration-250 ease-in-out color-dmd-4', styles.banner__header)}>
        <span className="text-micro font-bold">{formatMessage({ id: 'getPremiumOff' }, { percent: CURRENT_SALE_DISCOUNT_PERCENTAGE })}</span>
      </div>
      <div className={cx('flex justify-center items-center transition-all duration-250 ease-in-out', styles.banner__body)}>
        <Countdown
          endDateTime={featureDates.endDate}
          size={Size.Medium}
          labelsColorClassName="color-dmd-2"
          numbersColorClassName="color-dmd-4"
        />
      </div>
    </a>
  );
};
