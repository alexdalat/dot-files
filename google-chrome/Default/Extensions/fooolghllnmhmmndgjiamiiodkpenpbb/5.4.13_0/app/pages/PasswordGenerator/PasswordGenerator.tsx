import { Checkbox, SVG } from '@nord/ui';
import { estimateStrength, generatePassword } from '@nordpass/password-generator';
import cx from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import isEqual from 'fast-deep-equal';
import { api, sendMessage } from '@extension/app/api';
import { usePasswordPolicy } from '@extension/app/context/PasswordPolicyContext';
import { PageHeader } from '@extension/app/pages/components/PageHeader/PageHeader';
import { StorageApi } from '@extension/browser/storageApi';
import { Storage } from '@extension/common/constants';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { ActionButton } from '@common/components/ActionButton/ActionButton';
import { FullscreenLoader } from '@common/components/FullScreenLoader/FullscreenLoader';
import { OpenDirection } from '@common/components/Tooltip/constants/openDirection';
import { Tooltip } from '@common/components/Tooltip/Tooltip';
import { Action } from '@common/constants/action';
import { noOp } from '@common/constants/function';
import { DEFAULT_PASSWORD_LENGTH } from '@common/constants/passwordGenerator';
import { UserAction } from '@common/constants/userAction';
import { IPasswordPolicy } from '@common/contracts/password';
import { HistoryProvider, IHistoryEntry } from '@common/contracts/passwordGeneratorContracts';
import { useLoaderLogging } from '@common/hooks/useLoaderLogging/useLoaderLogging';
import { LogLevel } from '@common/services/loggingFactory/contracts';
import { getBrowser } from '@common/utils/getBrowser';
import { getStylizedPassword } from '@common/utils/getStylizedPassword';
import { getFullUrl } from '@common/utils/parseUrl/parseUrl';
import { isDefined } from '@common/utils/valueUtils';
import { withCopyPermissions } from '@common/utils/withPermissions';

import passwordModerateIcon from '@icons/16/moderate-password.svg';
import passwordStrongIcon from '@icons/16/strong-password.svg';
import passwordWeakIcon from '@icons/16/weak-password.svg';
import chevronDownIcon from '@icons/24/chevron-down.svg';
import generateIcon from '@icons/24/generate.svg';

import './PasswordGenerator.scss';
import { Button, Slider } from '@nordpass/ui';

const MIN_LENGTH = 8;
const MAX_LENGTH = 60;

const passwordStrength = [
  { image: passwordWeakIcon, color: 'red', message: <FormattedMessage id="passwordStrengthWeak" /> },
  { image: passwordModerateIcon, color: 'orange', message: <FormattedMessage id="passwordStrengthModerate" /> },
  { image: passwordStrongIcon, color: 'green', message: <FormattedMessage id="passwordStrengthStrong" /> },
];

type TPolicy = { id: string; label: JSX.Element };

const DEFAULT_CHECKBOX_LIST = [
  { id: 'useUpper', label: <FormattedMessage id="passwordGeneratorCheckbox1" /> },
  { id: 'useLower', label: <FormattedMessage id="passwordGeneratorCheckbox2" /> },
  { id: 'useNumbers', label: <FormattedMessage id="passwordGeneratorCheckbox3" /> },
  { id: 'useSymbols', label: <FormattedMessage id="passwordGeneratorCheckbox4" /> },
  { id: 'useAmbiguous', label: <FormattedMessage id="passwordGeneratorCheckbox5" /> },
];

const defaultOptions = {
  length: DEFAULT_PASSWORD_LENGTH,
  useLower: true,
  useUpper: true,
  useNumbers: true,
  useSymbols: true,
  useAmbiguous: true,
};

const isEnabledPolicy = (policy: boolean | TPolicy): policy is TPolicy => Boolean(policy);

interface IPasswordGenerator {
  isAutofill?: boolean;
  fillAndClose?: (text: string) => void;
}

const mapPolicy = (options: typeof defaultOptions, policy: IPasswordPolicy) => {
  if (!policy) {
    return options;
  }

  return {
    length: policy.min_length > options.length ? policy.min_length : options.length,
    useUpper: policy.at_least_one_capital_letter_required || options.useUpper,
    useLower: true,
    useNumbers: policy.at_least_one_digit_required || options.useNumbers,
    useSymbols: policy.at_least_one_symbol_required || options.useSymbols,
    useAmbiguous: true,
  };
};

export const PasswordGenerator = ({ isAutofill = false, fillAndClose }: IPasswordGenerator) => {
  const [passwordOptions, setPasswordOptions] = useState<typeof defaultOptions | null>(null);
  const [isPasswordChanging, setPasswordChanging] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [sliderVal, setSliderVal] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const { formatMessage } = useIntl();
  const { errorMessage, isLoading, policy, isEnabled } = usePasswordPolicy();
  const [minLength, setMinLength] = useState(MIN_LENGTH);
  const [checkboxList, setCheckboxList] = useState(DEFAULT_CHECKBOX_LIST);

  useLoaderLogging(isLoading, logMessage, 'PasswordGenerator');

  const hasOptions = useMemo(() => (
    !isEnabled || !(
      policy?.at_least_one_capital_letter_required &&
      policy.at_least_one_digit_required &&
      policy.at_least_one_symbol_required &&
      MAX_LENGTH === minLength
    )
  ), [isEnabled, policy, minLength]);

  useEffect(() => {
    (async () => {
      const result = await StorageApi.get({
        [Storage.PasswordOptions]: defaultOptions,
      });

      let options = defaultOptions;

      if (result[Storage.PasswordOptions]) {
        options = {
          length: result[Storage.PasswordOptions].length,
          useUpper: result[Storage.PasswordOptions].useUpper,
          useLower: result[Storage.PasswordOptions].useLower,
          useNumbers: result[Storage.PasswordOptions].useNumbers,
          useSymbols: result[Storage.PasswordOptions].useSymbols,
          useAmbiguous: result[Storage.PasswordOptions].useAmbiguous,
        };
      }

      if (policy && isEnabled) {
        setMinLength(policy.min_length);
        options = mapPolicy(options, policy);

        setCheckboxList([
          !policy?.at_least_one_capital_letter_required && {
            id: 'useUpper',
            label: <FormattedMessage id="passwordGeneratorCheckbox1" />,
          },
          !policy?.at_least_one_digit_required && {
            id: 'useNumbers',
            label: <FormattedMessage id="passwordGeneratorCheckbox3" />,
          },
          !policy?.at_least_one_symbol_required && {
            id: 'useSymbols',
            label: <FormattedMessage id="passwordGeneratorCheckbox4" />,
          },
        ].filter(isEnabledPolicy));
      }

      const pass = generatePassword(options);
      setSliderVal(options.length);
      setPasswordOptions(prev => isEqual(prev, options) ? prev : options);
      setPassword(pass);
      setScore(estimateStrength(pass) - 1);
    })();
  }, [policy, isEnabled]);

  const changeDelayedPassword = (options: typeof defaultOptions) => {
    setPasswordChanging(true);
    setTimeout(() => {
      const pass = generatePassword(options);
      setPassword(pass);
      setScore(estimateStrength(pass) - 1);
      setPasswordChanging(false);
    }, 200);
  };

  const setAndSaveOptions = (options: typeof defaultOptions) => {
    const updatedOptions = (isEnabled && policy) ? mapPolicy(options, policy) : options;
    setPasswordOptions(updatedOptions);
    changeDelayedPassword(updatedOptions);
    StorageApi.set({ [Storage.PasswordOptions]: updatedOptions });
  };

  const handleOptionChange = (id: keyof typeof defaultOptions, checked: boolean) => {
    const options = {
      ...passwordOptions,
      [id]: checked,
    };

    const active = [
      options.useUpper,
      options.useLower,
      options.useNumbers,
      options.useSymbols,
    ].filter(Boolean).length;

    if (active < 1) {
      return;
    }

    setAndSaveOptions(options);
  };

  const getHistoryEntry = async () => {
    const mainParams: IHistoryEntry = { password, date: Date.now(), provider: HistoryProvider.Extension };
    const entryWithBrowserExtension: IHistoryEntry = {
      ...mainParams,
      browser: getBrowser(),
    };
    if (isAutofill) {
      const tabUrl = await api.extension.getTabUrl();

      const domain = tabUrl ? getFullUrl(logMessage, tabUrl) : '';
      const entryWithUrl: IHistoryEntry = { ...mainParams, provider: domain };
      return tabUrl ? entryWithUrl : entryWithBrowserExtension;
    }

    return entryWithBrowserExtension;
  };

  const saveGeneratedPassword = async () => {
    api.action.save(UserAction.TapExtensionPasswordGeneratorUsePassword).catch(noOp);
    const historyEntry = await getHistoryEntry();
    sendMessage(Action.AddPasswordGeneratorHistoryEntry, { historyEntry })
      .catch(error => logMessage(LogLevel.Error, 'AddPasswordGeneratorHistoryEntry:', error));
  };

  const onCopyButtonClick = () => {
    withCopyPermissions(async () => {
      await saveGeneratedPassword();
      api.extension.copyToClipboard(password);
    }, logMessage, 'copyGeneratedValue');
  };

  const onAutofillButtonClick = async () => {
    await saveGeneratedPassword();
    fillAndClose?.(password); // fillAndClose closes the dialog, thus interrupting all the pending js. To avoid interruption - calling it last
  };

  if (errorMessage) {
    return (
      <div className="h-full flex justify-center items-center text-center p-4">
        <FormattedMessage id="undefinedError" />
      </div>
    );
  }

  if (isLoading) {
    return <FullscreenLoader className={isAutofill ? 'h-270px' : ''} />;
  }

  if (!passwordOptions || !password) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1 bg-primary">
      {!isAutofill && <PageHeader title={<FormattedMessage id="passwordGenerator" />} />}
      <div className="p-4 bg-grey-lightest border-t border-b border-primary bg-primary-accent-1">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col mr-2">
            <span
              className={cx(
                'password-generator__password font-roboto-mono break-all mb-2 w-full text-lead font-700 line-h-26px',
                isPasswordChanging ? 'page-slide-out' : 'page-slide-in',
              )}
              data-testid="generatedPassword"
            >
              {getStylizedPassword(password)}
            </span>
            {isDefined(score) && passwordStrength[score] && (
              <div
                key={passwordStrength[score].color}
                className={`text-${passwordStrength[score].color} font-medium`}
              >
                <SVG
                  width={16}
                  height={16}
                  src={passwordStrength[score].image}
                  className="mr-1"
                />
                {passwordStrength[score].message}
              </div>
            )}
          </div>

          <ActionButton
            tooltipText={formatMessage({ id: 'generateNew' })}
            tooltipId="generate-password"
            className="ease-out duration-250 flex-shrink-0 ml-4"
            svgIcon={generateIcon}
            onClick={() => {
              api.action.save(UserAction.TapExtensionPasswordGeneratorRefresh).catch(noOp);
              changeDelayedPassword(passwordOptions);
            }}
          />
        </div>
      </div>
      <div className="flex-1 px-4">
        <Tooltip id="copy" showDuration={1000} direction={OpenDirection.Bottom}>
          <FormattedMessage id="copiedTooltip" />
        </Tooltip>
        <Button
          id="autofill-button"
          rank="primary"
          className="w-full my-4"
          {...isAutofill ? {} : { 'data-tip-copy': true }}
          onClick={isAutofill ? onAutofillButtonClick : onCopyButtonClick}
        >
          {isAutofill ? <FormattedMessage id="usePassword" /> : <FormattedMessage id="copyPassword" />}
        </Button>

        {(!isAutofill || showOptions) && (
          <div className="px-3">
            {MAX_LENGTH !== minLength && (
              <>
                <span className="text-micro mb-1 color-primary-accent-6">
                  <FormattedMessage id="length" />
                </span>

                <div className="mb-4 w-full">
                  <Slider
                    min={minLength}
                    max={MAX_LENGTH}
                    value={sliderVal || 0}
                    onChange={value => {
                      setSliderVal(value as number);
                      setAndSaveOptions({ ...passwordOptions, length: value as number });
                    }}
                  />
                </div>
              </>
            )}

            {checkboxList.map(item => (
              <div key={item.id} className="mb-3">
                <Checkbox
                  id={item.id}
                  checked={passwordOptions[item.id as keyof typeof defaultOptions] as boolean}
                  label={{ children: item.label }}
                  color="teal"
                  className="text-micro font-medium color-primary-accent-6 items-center"
                  onChange={e => handleOptionChange(
                    (e.target as HTMLInputElement).id as keyof typeof defaultOptions,
                    (e.target as HTMLInputElement).checked,
                  )}
                />
              </div>
            ))}
          </div>
        )}

        {isAutofill && hasOptions && (
          <p
            className="text-small leading-normal flex justify-center font-medium color-primary cursor-pointer items-center mb-5"
            onClick={() => setShowOptions(!showOptions)}
          >
            {!showOptions ? <FormattedMessage id="showOptions" /> : <FormattedMessage id="hideOptions" />}
            <SVG
              noLazy
              width={24}
              height={24}
              src={chevronDownIcon}
              className={cx('cursor-pointer flex-shrink-0', showOptions && 'rotate-180')}
            />
          </p>
        )}
      </div>
    </div>
  );
};
