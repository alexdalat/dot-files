import { FormattedMessage } from 'react-intl';
import { SvgIcon } from '@common/components/SvgIcon';
import { EmailLinks } from '@common/constants/email';
import { RemoteURL } from '@common/constants/remoteURL';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import helpIcon from '@icons/32/help.svg';
import { Button } from '@nordpass/ui';

export const SupportCard = () => (
  <div className="p-4 bg-white rounded shadow-1 flex">
    <SvgIcon
      width={32}
      height={32}
      src={helpIcon}
      className="nordpass-svg color-teal mr-4"
    />
    <div className="flex items-baseline w-full">
      <div className="flex-1 text-left mr-0 mb-2">
        <div className="text-base font-medium text-black my-1">
          <FormattedMessage id="needHelpQuestion" />
        </div>
        <div className="text-small text-grey-darker leading-loose">
          <FormattedMessage id="visitHelpCenter" />
        </div>
      </div>

      <div className="flex flex-1 text-right justify-end">
        <Button
          rank="secondary"
          className="flex mr-1"
          onClick={() => openInNewTab(RemoteURL.NordPassHelp)}
        >
          <FormattedMessage id="helpCenter" />
        </Button>

        <Button
          rank="secondary"
          className="flex"
          onClick={() => openInNewTab(`${EmailLinks.Support}?Subject=Issue%20downloading%20desktop%20app`)}
        >
          <FormattedMessage id="emailUs" />
        </Button>
      </div>
    </div>
  </div>
);
