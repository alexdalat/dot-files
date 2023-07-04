import { render } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { StorageApi } from '@extension/browser/storageApi';
import { AppTheme } from '@common/constants/appTheme';
import { Storage } from '@extension/common/constants';
import { Profile } from './Profile';

const setup = () => render(wrapWithProviders(<Profile />));
const email = 'test@test.com';

jest.mock('~/api/ExtensionAPI', () => ({
  ExtensionAPI: jest.fn().mockReturnValue({ getUserEmail: () => email }),
}));

describe('Profile', () => {
  beforeAll(() => {
    StorageApi.get = jest.fn().mockResolvedValue({ [Storage.AppTheme]: AppTheme.Light });
  });

  it('should display current users email', async () => {
    const { findByText } = setup();

    expect(await findByText(email)).toBeVisible();
  });

  it('should display current users plan', async () => {
    const { findByText } = setup();

    expect(await findByText('Free Plan')).toBeVisible();
  });

  it('should display lock button', async () => {
    const { findByText } = setup();

    expect(await findByText('Lock app')).toBeVisible();
  });

  it('should display logout button', async () => {
    const { findByText } = setup();

    expect(await findByText('Log out')).toBeVisible();
  });
});
