import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import * as UpdateIcon from '@icons/standalone-release.svg';
import * as LaunchIcon from '@icons/launch-gray-dark.svg';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import { api } from '@extension/app/api';
import { UserAction } from '@common/constants/userAction';
import { RemoteURL } from '@common/constants/remoteURL';
import { SvgIcon } from '@common/components/SvgIcon';
import styles from './StandaloneBanner.module.scss';

interface IStandaloneBanner {
  disable: () => void;
  handleSeen: () => void;
}

export const StandaloneBanner = ({ disable, handleSeen }: IStandaloneBanner) => {
  const handleClick = () => {
    api.action.save(UserAction.ExtensionStalloneBannerClicked);
    openInNewTab(RemoteURL.StandaloneUpdate);
    disable();
  };

  useEffect(() => {
    handleSeen();
  }, [handleSeen]);

  return (
    <button
      className={cx(styles['standalone-banner'], 'flex flex-row items-center w-343px p-4 rounded-2 mx-4 mb-4')}
      type="button"
      onClick={handleClick}
    >
      <SvgIcon
        src={UpdateIcon}
        width={32}
        height={32}
        className="color-primary-accent-6"
      />
      <div className="max-w-228px mr-4 ml-3">
        <h5 className={cx(styles['standalone-banner__title'], 'font-medium text-sm leading-5 -letter-spacing-001px text-left')}>
          <FormattedMessage id="standaloneBannerTitle" />
        </h5>
        <p className={cx(styles['standalone-banner__subtitle'], 'font-medium text-sm leading-5 -letter-spacing-001px text-left')}>
          <FormattedMessage id="standaloneBannerSubtitle" />
        </p>
      </div>
      <SvgIcon
        src={LaunchIcon}
        height={24}
        width={24}
        className={styles['standalone-banner__launch']}
      />
    </button>
  );
};
