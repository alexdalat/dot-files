import { CampaignUrl } from '@common/constants/campaignUrl';
import { UserAction } from '@common/constants/userAction';
import { api } from '@extension/app/api';
import { useIntl } from 'react-intl';
import { SvgIcon } from '@common/components/SvgIcon';
import * as CrownIcon from '@icons/48/crown-white.svg';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import { upgradeToPremiumExtension } from '@extension/app/utils/upgradeToPremiumExtension';

export const PremiumBanner = () => {
  const { formatMessage } = useIntl();
  const handleClick = () => {
    upgradeToPremiumExtension(CampaignUrl.CurrentSaleExtension, openInNewTab, logMessage, 'PremiumBannerExtension:handleClick');
    api.action.save(UserAction.PremiumBannerExtension);
  };

  return (
    <a
      role="button"
      className="block overflow-hidden rounded-2 w-343px bg-gradient--velvet"
      tabIndex={0}
      onClick={handleClick}
    >
      <div className="flex justify-center items-center mt-4 mb-6px">
        <span className="font-bold color-white text-base mr-1">{formatMessage({ id: 'premiumBannerTitle' })}</span>
        <SvgIcon
          className="nordpass-svg color-white"
          src={CrownIcon}
          width={24}
          height={24}
        />
        <span className="font-bold color-white text-base ml-1">{formatMessage({ id: 'premium' })}</span>
      </div>
      <div className="flex justify-center items-center mb-4">
        <span className="color-white text-micro">{formatMessage({ id: 'premiumBannerSubtitle' })}</span>
      </div>
    </a>
  );
};
