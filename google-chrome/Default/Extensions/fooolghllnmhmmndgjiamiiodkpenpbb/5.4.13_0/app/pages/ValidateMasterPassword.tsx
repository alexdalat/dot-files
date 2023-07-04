import { PasswordInput } from '@common/components/PasswordInput/PasswordInput';
import { useAction } from '@common/hooks/useAction/useAction';
import { AuthState } from '@common/store/reducers/authReducer/authConstants';
import { api, sendMessage } from '@extension/app/api';
import { AuthContext } from '@extension/app/context/AuthContext';
import { ExtensionContext } from '@extension/app/context/ExtensionContext';
import { Button, Checkbox, Link } from '@nordpass/ui';
import { FormEvent, memo, useCallback, useContext, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { satisfies } from 'semver';
import { detect } from 'detect-browser';
import { sendMetric } from '@common/utils/sendMetric';
import { Metric, MetricType } from '@common/constants/metrics';
import { useMasterPasswordValidation } from '@extension/app/hooks/useMasterPasswordValidation';
import { useClearInputElementValue } from '@common/hooks/useClearInputElementValue';
import { ContentError } from '@common/utils/ContentError';
import { ContentErrorCode } from '@common/constants/errorCode';
import { useRememberMeSwitch } from '@common/hooks/usePersistentUserSession/useRememberMeSwitch';
import { ExtensionAction } from '@common/constants/action';
import { AccountSwitchButton } from './components/AccountSwitchButton/AccountSwitchButton';
import { closePopup } from '../utils/closePopup';
import { ConfirmActionModal } from '../components/ConfirmAction/ConfirmActionModal';

const browser = detect();
const isSupportedSafariVersion = !browser?.version || satisfies(browser.version, '>=15.6.0');
const isAutoFocusSupported =
  process.env.IS_AUTOFOCUS_FULLY_SUPPORTED || !process.env.SAFARI || isSupportedSafariVersion; // safari 15.5 has performance issues with autoFocus attribute

export const ValidateMasterPassword = memo(() => {
  const { formatMessage } = useIntl();
  const { isPopup } = useContext(ExtensionContext);
  const { authState, email } = useContext(AuthContext);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { isValidating, errorMessage, setValidationError, setIsValidating } = useMasterPasswordValidation();
  const {
    isFeatureEnabled: isPersistentUserSessionFeatureEnabled,
    shouldRememberMe,
    rememberMeClickHandler,
    confirmChoiceHandler,
    shouldAskConfirmation,
    onConfirmationClose,
  } = useRememberMeSwitch(api);

  const getPasswordInputValue = useClearInputElementValue('password');

  const onClickForgot = async () => {
    await api.extension.openDesktopApp({ route: 'MASTER_RECOVERY' });

    if (isPopup) {
      closePopup({ legacySafariPopupClose: api.extension.closePopup });
    } else {
      api.extension.closeTab();
    }
  };

  const onSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMetric(api, Metric.MasterPasswordValidate, MetricType.Intent);
    const inputValue = getPasswordInputValue();
    setIsPasswordVisible(false);
    setIsValidating(true);
    setValidationError(null);
    await api.masterPassword.validate(email, inputValue);
    if (shouldRememberMe) {
      await sendMessage(ExtensionAction.EnablePersistentUserSession, {
        masterPassword: inputValue,
        isValidated: true,
      });
    }
  }, [email, getPasswordInputValue, setIsValidating, setValidationError, shouldRememberMe]);

  const { action: handleSubmit } = useAction(onSubmit, {
    onError: (error: ContentError) => {
      if (error.info?.code === ContentErrorCode.IncorrectMP) {
        sendMetric(api, Metric.MasterPasswordValidate, MetricType.Success);
      } else {
        sendMetric(api, Metric.MasterPasswordValidate, MetricType.Error);
      }
    },
  });

  if (!email && authState !== AuthState.MasterValidate) {
    return null;
  }

  return (
    <form className="flex flex-col h-full" autoComplete="off" onSubmit={handleSubmit}>
      <h3 className="text-h3 leading-normal tracking-tight color-primary font-bold mb-4">
        <FormattedMessage id="enterMasterPassword" />
      </h3>

      <div className="mb-5 flex justify-center">
        <AccountSwitchButton email={email} disabled={isValidating} />
      </div>

      <PasswordInput
        id="password"
        isPasswordVisible={isPasswordVisible}
        setIsPasswordVisible={setIsPasswordVisible}
        label={formatMessage({ id: 'masterPassword' })}
        autoFocus={isAutoFocusSupported}
        disabled={isValidating}
        error={errorMessage}
        onChange={() => {
          if (errorMessage) {
            setValidationError(null);
          }
        }}
      />

      <Button
        type="submit"
        rank="primary"
        className="w-full mt-2"
        disabled={isValidating}
        isLoading={isValidating}
      >
        <FormattedMessage id="unlockNordPass" />
      </Button>

      {isPersistentUserSessionFeatureEnabled && (
      <>
        <Checkbox
          checked={shouldRememberMe}
          label={formatMessage({ id: 'keepExtensionUnlocked' })}
          className="mx-auto pt-8 color-primary"
          disabled={isValidating}
          onChange={rememberMeClickHandler}
        />
        <ConfirmActionModal
          isDestructiveConfirmation={false}
          header={<FormattedMessage id="neverAutoLock" />}
          content={
            <>
              <FormattedMessage id="PUSWarningPart1" />
              <br />
              <br />
              <FormattedMessage id="PUSWarningPart2" />
            </>
          }
          action={confirmChoiceHandler}
          actionText={<FormattedMessage id="confirm" />}
          isOpen={shouldAskConfirmation}
          onClose={onConfirmationClose}
        />
      </>
      )}

      <p className="text-small leading-normal mt-auto">
        <Link rank="primary" onClick={onClickForgot}>
          <FormattedMessage id="forgotMasterPasswordQuestion" />
        </Link>
      </p>
    </form>
  );
});
