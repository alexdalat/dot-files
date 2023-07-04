import { createContext, useMemo, useContext, useCallback, useEffect, ReactNode } from 'react';
import { api } from '@extension/app/api';
import { useQuery } from '@common/hooks/useQuery/useQuery';
import { IPasswordPolicy } from '@common/contracts/password';
import { checkPasswordComplexity } from '@nordpass/password-generator';
import { createListener } from '@extension/app/api/createListener';
import { Notification } from '@common/constants/notification';
import { INotification } from '@common/interfaces/messages';
import { ListenerType } from '@extension/common/constants';

interface IPasswordPolicyContext {
  isLoading: boolean;
  errorMessage?: string;
  isEnabled: boolean;
  policy?: IPasswordPolicy;
  checkWithPolicy: (password: string) => { isPolicyMet: boolean };
}

const PasswordPolicyContext = createContext({
  isLoading: true,
} as IPasswordPolicyContext);

export const usePasswordPolicy = () => useContext(PasswordPolicyContext);

const checkIfPolicyExists = (
  policy?: IPasswordPolicy,
  enabled?: boolean,
): policy is IPasswordPolicy => !!enabled && !!policy;

export const PasswordPolicyContextProvider = ({ children }: { children?: ReactNode }) => {
  const {
    data,
    errorMessage,
    isLoading,
    setData,
  } = useQuery(api.password.getPasswordPolicy);

  const policy = data?.password_policy;

  const isEnabled = checkIfPolicyExists(policy, data?.enabled);

  const checkWithPolicy = useCallback((password: string) => {
    if (!isEnabled) {
      return { isPolicyMet: true };
    }

    const {
      hasUppercase,
      hasSymbols,
      hasDigits,
    } = checkPasswordComplexity(password);

    const isLengthMet = policy.min_length <= password.length;
    const isUppercaseMet = policy.at_least_one_capital_letter_required ? hasUppercase : true;
    const isSymbolsMet = policy.at_least_one_symbol_required ? hasSymbols : true;
    const isDigitsMet = policy.at_least_one_digit_required ? hasDigits : true;

    return { isPolicyMet: isLengthMet && isUppercaseMet && isSymbolsMet && isDigitsMet };
  }, [isEnabled, policy]);

  useEffect(() => {
    const handleChange = (msg: INotification) => {
      if (msg.type === Notification.PasswordPolicyChange) {
        setData({
          enabled: msg.enabled,
          password_policy: msg as unknown as IPasswordPolicy,
        });
      }
    };

    return createListener(handleChange, ListenerType.RuntimeMessage);
  }, [setData]);

  const value: IPasswordPolicyContext = useMemo(() => ({
    isLoading,
    errorMessage,
    isEnabled,
    policy,
    checkWithPolicy,
  }), [isLoading, errorMessage, isEnabled, policy, checkWithPolicy]);

  return (
    <PasswordPolicyContext.Provider value={value}>
      {children}
    </PasswordPolicyContext.Provider>
  );
};
