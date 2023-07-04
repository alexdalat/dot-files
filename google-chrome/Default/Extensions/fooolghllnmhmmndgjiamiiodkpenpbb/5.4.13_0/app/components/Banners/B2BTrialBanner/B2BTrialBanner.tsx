import { useIntl } from 'react-intl';
import { Banner } from '@nordpass/ui';
import * as PremiumWhiteIcon from '@icons/premium-white.svg';
import { Environment } from '@common/constants/environment';
import { UserAction } from '@common/constants/userAction';
import { getB2BCheckoutUrl } from '@common/utils/getB2BCheckoutUrl';
import { useEnvironment } from '@extension/app/hooks/useEnvironment';
import { api } from '@extension/app/api';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import { SvgIcon } from '@common/components/SvgIcon';

export const B2BTrialBanner = () => {
  const { formatMessage } = useIntl();
  const environment = useEnvironment();

  const handleClick = () => {
    const checkoutUrl = getB2BCheckoutUrl(environment === Environment.Staging);
    openInNewTab(checkoutUrl);
    api.action.save(UserAction.B2BUpsellBannerClickedExtension);
  };

  return (
    <Banner
      isVisible
      icon={<SvgIcon src={PremiumWhiteIcon} width={20} height={20} />}
      header={formatMessage({ id: 'b2bTrialBannerHeader' })}
      message={formatMessage({ id: 'b2bTrialBannerMessage' })}
      variation="compact"
      className="bg-gradient--velvet rounded-2 cursor-pointer"
      isClosable={false}
      onClick={handleClick}
    />
  );
};
