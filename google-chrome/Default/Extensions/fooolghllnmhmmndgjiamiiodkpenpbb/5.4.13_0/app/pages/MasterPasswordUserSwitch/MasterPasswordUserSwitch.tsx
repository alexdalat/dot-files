import { useNavigate } from 'react-router-dom';
import { Avatar } from '@extension/app/components/Avatar/Avatar';
import { Back } from '@common/components/Back';
import { noOp } from '@common/constants/function';
import { Size } from '@common/constants/size';
import { useAction } from '@common/hooks/useAction/useAction';
import { useQuery } from '@common/hooks/useQuery/useQuery';
import { api } from '@extension/app/api';
import { AuthContext } from '@extension/app/context/AuthContext';
import { useAvatar } from '@extension/app/hooks/useAvatar';
import { ROUTES } from '@extension/common/constants/routes';
import { Button, Loader } from '@nordpass/ui';
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tooltip } from '@common/components/Tooltip/Tooltip';
import { sendMetric } from '@common/utils/sendMetric';
import { Metric, MetricType } from '@common/constants/metrics';
import { AccountSwitch } from '../Profile/components/AccountSwitch/AccountSwitch';

export const UserSwitch = memo(() => {
  const { email } = useContext(AuthContext);
  const [currentUserUuid, setCurrentUserUuid] = useState<string>();
  const avatar = useAvatar();
  const navigate = useNavigate();

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

  useEffect(() => {
    setCurrentUserUuid(userAccounts.find(acc => acc.email === email)?.uuid);
  }, [userAccounts, email]);

  const handleLogout = async () => {
    sendMetric(api, Metric.Logout, MetricType.Intent);
    if (!currentUserUuid) {
      return;
    }

    try {
      const { uuid: nextUuid } = await api.extension.getNextAccountUUID();
      if (nextUuid) {
        await api.extension.switchAccount(nextUuid);
      }
    } catch { /* intentional ignore */ } finally {
      await api.account.accountLogout(currentUserUuid, userAccounts.length < 2).catch(noOp);
      refetchAccount();
    }
  };

  const handleRemove = async () => {
    sendMetric(api, Metric.Logout, MetricType.Intent);
    if (!currentUserUuid) {
      return;
    }

    try {
      await api.account.accountLogout(currentUserUuid, true);
    } catch { /* ignore error */ } finally {
      refetchAccount();
    }
  };

  const { isLoading: isLoggingOut, action: logoutCurrent } = useAction(handleLogout);
  const { isLoading: isRemovingCurrent, action: removeCurrent } = useAction(handleRemove);

  return (
    <div className="flex flex-1 flex-col mt-14 overflow-y-hidden">
      <Back onClick={() => navigate(ROUTES.VALIDATE_MASTER)} />
      <div className="px-8">
        <Avatar
          avatar={avatar}
          email={email}
          size={Size.ExtraLarge}
          className="inline-block"
        />

        <Tooltip showOnHover id="email">
          {email}
        </Tooltip>
        <p data-tip-email className="mt-3 color-primary truncate">{email}</p>

        <span className="pt-4 pb-6">
          <Button
            rank="secondary"
            className="w-full mt-3"
            disabled={isRemovingCurrent}
            onClick={removeCurrent}
          >
            <FormattedMessage id="remove" />
          </Button>

          <Button
            rank="danger"
            className="w-full mt-3"
            disabled={isLoggingOut}
            onClick={logoutCurrent}
          >
            <FormattedMessage id="logOut" />

          </Button>
        </span>
      </div>

      <div className="border-t border-primary-accent-1 divider mt-6 mb-4" />

      {isLoading ?
        (<div className="flex justify-center"><Loader variant="brand" size="large" /></div>) :
        (<AccountSwitch accounts={otherAccounts} refetch={refetchAccount} error={errorMessage} />)
      }

    </div>
  );
});
