import { Notification } from '@common/constants/notification';
import { Size } from '@common/constants/size';
import { useQuery } from '@common/hooks/useQuery/useQuery';
import { INotification } from '@common/interfaces/messages';
import { getPlanName } from '@common/utils/getPlanName/getPlanName';
import { api } from '@extension/app/api';
import { createListener } from '@extension/app/api/createListener';
import { lockApp } from '@extension/app/api/authApi';
import { Avatar } from '@extension/app/components/Avatar/Avatar';
import { useAuthContext } from '@extension/app/context/AuthContext';
import { useOrganizationContext } from '@extension/app/context/OrganizationContext';
import { useAvatar } from '@extension/app/hooks/useAvatar';
import { PageHeader } from '@extension/app/pages/components/PageHeader/PageHeader';
import { AccountSwitch } from '@extension/app/pages/Profile/components/AccountSwitch/AccountSwitch';
import { ListenerType } from '@extension/common/constants';
import { Button, Loader } from '@nordpass/ui';
import cx from 'classnames';
import { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tooltip } from '@common/components/Tooltip/Tooltip';
import { sendMetric } from '@common/utils/sendMetric';
import { Metric, MetricType } from '@common/constants/metrics';
import styles from './Profile.module.scss';

export const Profile = () => {
  const { subscriptionData } = useAuthContext();
  const { organizationData } = useOrganizationContext();
  const { data: email = '' } = useQuery(api.extension.getUserEmail);
  const {
    data: userAccounts = [],
    refetch: refetchAccount,
    errorMessage,
    isLoading,
  } = useQuery(api.account.getAccountList);

  const otherAccounts = useMemo(
    () => userAccounts.filter(acc => acc.email !== email),
    [userAccounts, email],
  );

  const avatar = useAvatar();

  const handleLock = async () => {
    lockApp();
  };

  const handleLogout = () => {
    sendMetric(api, Metric.Logout, MetricType.Intent);
    api.extension.logoutAll();
  };

  useEffect(() => {
    const handleAccountListChanges = (msg: INotification) => {
      if (msg.type === Notification.AccountListChanged) {
        refetchAccount();
      }
    };

    return createListener(handleAccountListChanges, ListenerType.RuntimeMessage);
  }, [refetchAccount]);

  return (
    <>
      <PageHeader />
      <div className="flex flex-col">
        <div className="flex flex-col items-center mx-4">
          <Avatar
            avatar={avatar}
            email={email}
            size={Size.ExtraLarge}
            className="mb-3"
          />
          <Tooltip showOnHover id="account-email">
            {email}
          </Tooltip>
          <span data-tip-account-email className="font-bold text-center color-primary mb-1 truncate w-full">{email}</span>
          <span className="color-grey-dark text-micro mb-4">
            {getPlanName({
              isPremium: subscriptionData?.isPremium,
              organizationTier: organizationData?.organization?.tier,
              organizationType: organizationData?.organization?.type,
              isTrial: subscriptionData?.isTrial,
            })}
          </span>
          <Button
            rank="secondary"
            className="mb-3 w-full"
            onClick={handleLock}
          >
            <FormattedMessage id="lockApp" />
          </Button>
          <Button
            rank="danger"
            className={cx(styles['profile__logout-button'], 'mb-6 w-full capitalize')}
            disabled={isLoading}
            onClick={handleLogout}
          >
            {userAccounts.length > 1 ?
              <FormattedMessage id="logOutAll" /> :
              <FormattedMessage id="logOut" />
            }
          </Button>
        </div>

        <div className="h-px bg-primary-accent-18 mb-4" />

        {isLoading ?
          (<div className="flex justify-center"><Loader variant="brand" size="large" /></div>) :
          (<AccountSwitch accounts={otherAccounts} refetch={refetchAccount} error={errorMessage} />)
        }

      </div>
    </>
  );
};
