import { Button } from '@nordpass/ui';
import { FormattedMessage } from 'react-intl';
import premiumIcon from '@icons/72/premium.svg';
import { CampaignUrl } from '@common/constants/campaignUrl';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { upgradeToPremiumExtension } from '@extension/app/utils/upgradeToPremiumExtension';

export const UpgradeToShare = () => {
  const handleClick = () => {
    upgradeToPremiumExtension(CampaignUrl.UpgradeButton, openInNewTab, logMessage, 'UpgradeToShare:handleClick');
  };

  return (
    <div className="p-9 pt-20 text-center text-grey-dark max-w-650px">
      <div className="flex justify-center items-center mb-3">
        <img src={premiumIcon} alt="premium" />
      </div>
      <span className="color-primary my-4 text-lead font-bold">
        <FormattedMessage id="upgradeToShareTitle" />
      </span>

      <span className="mb-4 px-2 -letter-spacing-014px color-primary-accent-1 text-small inline-block">
        <FormattedMessage id="upgradeToShareText" />
      </span>

      <Button
        rank="primary"
        className="mb-2 w-full"
        onClick={handleClick}
      >
        <FormattedMessage id="getPremium" />
      </Button>
    </div>
  );
};
