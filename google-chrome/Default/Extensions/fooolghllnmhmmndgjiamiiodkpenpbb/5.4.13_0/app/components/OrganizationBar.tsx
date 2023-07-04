import { memo, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Link } from '@nordpass/ui';
import { SvgIcon } from '@common/components/SvgIcon';
import { Storage } from '@extension/common/constants';
import { StorageApi } from '@extension/browser/storageApi';
import clearIcon from '@icons/16/clear.svg';
import { useOrganizationContext } from '@extension/app/context/OrganizationContext';
import { api } from '@extension/app/api';
import organisationJoinIcon from '@icons/32/organisation-join.svg';

export const OrganizationBar = memo(() => {
  const { formatMessage } = useIntl();
  const { invitations, organizationData } = useOrganizationContext();
  const [show, setShow] = useState(false);
  const hasInvitation = invitations?.length && !organizationData?.organization;

  useEffect(() => {
    (async () => {
      const { showOrganizationBar } = await StorageApi.get({ [Storage.showOrganizationBar]: true });

      setShow(showOrganizationBar);
    })();
  }, []);

  if (!hasInvitation || !show) {
    return null;
  }

  const close = () => {
    StorageApi.set({ [Storage.showOrganizationBar]: false });
    setShow(false);
  };

  const openOrgInvite = async () => {
    await api.extension.openDesktopApp({ route: 'ORGANIZATION_INVITE' });
  };

  return (
    <div className="alert-fade-in bg-purple-lightest p-4 mx-4 mb-4 rounded-8px">
      <div className="flex">
        <img
          className="mr-4 rounded-full h-48px w-48px"
          src={organisationJoinIcon}
          alt="organization"
        />
        <div className="ml-1">
          <div className="text-base text-black leading-tight">{formatMessage({ id: 'pendingInvite' })}</div>
          <p className="text-micro leading-normal text-grey-darker mt-1">
            {formatMessage({ id: 'organizationBannerText' })}
          </p>
        </div>
        <Link className="ml-4" onClick={close}>
          <SvgIcon
            className="color-grey"
            width={20}
            height={20}
            src={clearIcon}
          />
        </Link>
      </div>
      <Button
        className="w-full mt-4"
        rank="primary"
        onClick={openOrgInvite}
      >
        {formatMessage({ id: 'joinNow' })}
      </Button>
    </div>
  );
});
