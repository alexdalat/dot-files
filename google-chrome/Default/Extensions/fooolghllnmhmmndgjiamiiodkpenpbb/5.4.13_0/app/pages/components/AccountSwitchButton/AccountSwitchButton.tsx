import { Avatar } from '@extension/app/components/Avatar/Avatar';
import { memo } from 'react';
import { SvgIcon } from '@common/components/SvgIcon';
import { Size } from '@common/constants/size';
import { useAvatar } from '@extension/app/hooks/useAvatar';
import { history } from '@extension/app/utils/history';
import { ROUTES } from '@extension/common/constants/routes';
import CaretIcon from '@icons/caret.svg';
import { Tooltip } from '@common/components/Tooltip/Tooltip';

interface IAccountSwitch {
  email: string;
  disabled: boolean;
}

export const AccountSwitchButton = memo(({ email, disabled }: IAccountSwitch) => {
  const avatar = useAvatar();

  return (
    <div className="max-w-full">
      <button
        type="button"
        disabled={disabled}
        className="flex flex-1 flex-row items-center rounded-20px pl-1 pr-2 border border-primary-accent-13 max-w-full"
        data-testid="validate-mp_user_switch_button"
        onClick={() => history.push(ROUTES.MP_SWITCH_ACCOUNT)}
      >
        <div
          data-tip-profile
          data-testid="header-menu-profile-icon"
          className="relative inline-flex justify-center"
        >
          <Avatar
            avatar={avatar}
            email={email}
            size={Size.ExtraSmall}
          />
        </div>
        <span className="flex flex-1 px-1 pt-5px pb-7px line-h-20px truncate">
          <Tooltip showOnHover id="email">
            {email}
          </Tooltip>
          <p data-tip-email className="text-small font-medium color-primary truncate">{email}</p>
        </span>
        <SvgIcon
          src={CaretIcon}
          className="nordpass-svg icon-color-primary-accent-3"
          width={20}
          height={20}
        />
      </button>
    </div>
  );
});
