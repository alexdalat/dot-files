import { render } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { PasswordGenerator } from './PasswordGenerator';

const randomPassword = 'a'.repeat(60);

jest.mock('@nordpass/password-generator', () => ({ generatePassword: () => randomPassword, estimateStrength: () => 1 }));
jest.mock('@extension/app/context/PasswordPolicyContext', () => ({ usePasswordPolicy: () => ({ isLoading: false, isEnabled: false }) }));

describe('PasswordGenerator', () => {
  it('should show generated password', async () => {
    const { findByTestId } = render(wrapWithProviders(<PasswordGenerator />));
    const generatedPasswordElement = await findByTestId('generatedPassword');
    expect(generatedPasswordElement.textContent).toBe(randomPassword);
  });
});
