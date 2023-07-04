import { Size } from '@common/constants/size';
import * as createListener from '@extension/app/api/createListener';
import { Avatar, IAvatarProps } from '@extension/app/components/Avatar/Avatar';
import * as getIsFeatureEnabled from '@extension/app/utils/getIsFeatureEnabled';
import { act, fireEvent, render } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { Notification } from '@common/constants/notification';

jest.mock('@extension/app/api/createListener');
jest.mock('@extension/app/utils/getIsFeatureEnabled');

describe('<Avatar/>', () => {
  const avatarId = 'profile-avatar__image';
  const avatarAltText = 'User Profile Avatar';
  const avatar = 'avatar';

  const listeners = new Set<(data: Record<string, any>) => void>();
  const triggerNotification = (data: any) => listeners.forEach(handler => handler(data));
  jest.spyOn(createListener, 'createListener').mockImplementation((handler, _listenerType) => {
    listeners.add(handler);
    return () => listeners.delete(handler);
  });

  beforeEach(() => {
    listeners.clear();
  });

  const setup = (avatar: IAvatarProps['avatar']) => render(wrapWithProviders(<Avatar avatar={avatar} email="test@test.com" size={Size.Medium} />));

  it('should show image when avatar is present and feature toggle is on', async () => {
    jest.spyOn(getIsFeatureEnabled, 'useExtensionFeature').mockReturnValue(true);

    const { findByTestId } = setup(avatar);
    const avatarImg = await findByTestId(avatarId);

    expect(avatarImg).toBeVisible();
  });

  it('should show initials if avatar is not present', async () => {
    const { findByText } = setup(null);

    const initials = await findByText('te');
    expect(initials).toBeVisible();
  });

  it('should show initials if feature toggle is off', async () => {
    jest.spyOn(getIsFeatureEnabled, 'useExtensionFeature').mockReturnValue(false);
    const { findByText } = setup(avatar);

    const initials = await findByText('te');
    expect(initials).toBeVisible();
  });

  it('should show initials when image failed to load', async () => {
    jest.spyOn(getIsFeatureEnabled, 'useExtensionFeature').mockReturnValue(true);

    const { findByText, findByAltText } = setup(avatar);

    fireEvent.error(await findByAltText(avatarAltText));

    const initials = await findByText('te');
    expect(initials).toBeVisible();
  });

  it('should show image when user is back online', async () => {
    jest.spyOn(getIsFeatureEnabled, 'useExtensionFeature').mockReturnValue(true);

    const { findByText, findByTestId, findByAltText } = setup(avatar);

    fireEvent.error(await findByAltText(avatarAltText));

    const initials = await findByText('te');
    expect(initials).toBeVisible();

    act(() => triggerNotification({
      id: 0,
      type: Notification.OnlineStatusChange,
      status: true,
    }));

    const avatarImg = await findByTestId(avatarId);
    expect(avatarImg).toBeVisible();
  });
});
