import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import { wrapWithIntl } from '@tests/extension/utils/wrapWithIntl';
import {
  Rating,
  MIN_REGISTRATION_DAYS_DIFF,
  MIN_VAULT_ITEMS,
  SHOW_AGAIN_AFTER_DAYS_IF_CLOSED,
} from '@extension/app/components/Banners/Rating/Rating';
import { Storage } from '@extension/common/constants';
import { AuthContext } from '@extension/app/context/AuthContext';
import { ISubscriptionData } from '@common/utils/parseSubscriptionData/parseSubscriptionData';
import { AuthState } from '@common/store/reducers/authReducer/authConstants';
import { StorageApi } from '@extension/browser/storageApi';
import { Browser } from '@common/constants';
import { renderWithInitEffects } from '@tests/utils/renderWithInitEffects';
import { getBrowser } from '@common/utils/getBrowser';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import { DAY } from '@common/constants/time';
import { api } from '@extension/app/api';
import { RemoteURL } from '@common/constants/remoteURL';
import { UserAction } from '@common/constants/userAction';

const closeIconTestId = 'close-icon';
const userUuid = 'random-123';
const rateUs = 'Rate Us';
const isShownStorageKey = `${Storage.IsExtensionRatingShown}-${userUuid}` as Storage;
const extensionRatingSeenDate = `${Storage.ExtensionRatingSeenDate}-${userUuid}` as Storage;
const isExtensionRated = `${Storage.IsExtensionRated}-${userUuid}` as Storage;

interface IMockProps {
  vaultSize: number;
  registrationDate: string;
  browser: Browser;
  userUuid: string | null;
  isShown: boolean;
  seenDate: number;
  isRated: boolean;
}

const now = new Date('2021-10-14');
const beforeMinRegistrationDay = new Date(now.getTime() - MIN_REGISTRATION_DAYS_DIFF * DAY).toString();
const mockProps = (props: Partial<IMockProps>) => ({
  vaultSize: MIN_VAULT_ITEMS,
  registrationDate: beforeMinRegistrationDay,
  userUuid,
  ...props,
});

const setup = (props = mockProps({ browser: Browser.Chrome })) => {
  jest.spyOn(api.extension, 'getUserUuid').mockResolvedValue(props.userUuid || userUuid);
  StorageApi.get = jest.fn().mockResolvedValue({
    [isShownStorageKey]: props.isShown,
    [extensionRatingSeenDate]: props.seenDate,
    [isExtensionRated]: props.isRated,
  });

  if (props.browser) {
    (getBrowser as jest.Mock).mockReturnValue(props.browser);
  }

  return renderWithInitEffects(wrapWithIntl(
    <AuthContext.Provider
      value={{
        authState: AuthState.Authenticated,
        subscriptionData: { registrationDate: props.registrationDate } as ISubscriptionData,
        email: 'test@test.com',
      }}
    >
      <Rating vaultSize={props.vaultSize} />
    </AuthContext.Provider>,
  ));
};

jest.mock('@extension/common/utils/openInNewTab');
jest.mock('@common/utils/getBrowser');
jest.spyOn(api.extension, 'getUserUuid').mockResolvedValue(userUuid);
jest.spyOn(api.action, 'save');

MockDate.set(now);

const propsWhenVisible = {
  isShown: false,
  isRated: false,
  userUuid,
  browser: Browser.Chrome,
  registrationDate: beforeMinRegistrationDay.toString(),
  vaultSize: MIN_VAULT_ITEMS,
};

describe('Rating', () => {
  beforeEach(jest.clearAllMocks);

  it.each([
    ['user uuid is null', { userUuid: null }],
    [`registration is older than ${MIN_REGISTRATION_DAYS_DIFF}`, {
      registrationDate: new Date(Date.now() - MIN_REGISTRATION_DAYS_DIFF * DAY).toString(),
    }],
    [`has vault items less than ${MIN_VAULT_ITEMS}`, { vaultSize: MIN_VAULT_ITEMS - 1 }],
    ['browser is not Chrome', { browser: Browser.Safari }],
    ['is already rated', { isRated: true }],
  ])('should not be visible, when %s', async (_description: string, props: Partial<IMockProps>) => {
    const { queryByText } = await setup(mockProps({ ...propsWhenVisible, ...props }));
    expect(queryByText(rateUs)).toBeNull();
  });

  describe('when it is visible', () => {
    const props = mockProps(propsWhenVisible);

    it('on render', async () => {
      await setup(props);

      await waitFor(() => {
        expect(StorageApi.set).toHaveBeenCalledWith({
          [isShownStorageKey]: true,
          [extensionRatingSeenDate]: now.getTime(),
        });

        expect(api.action.save).toHaveBeenCalledWith(UserAction.ExtensionRatingShown);
      });
    });

    it('on rate us', async () => {
      const { findByText, queryByText } = await setup(props);

      await userEvent.click(await findByText(rateUs));

      expect(openInNewTab).toHaveBeenCalledWith(RemoteURL.ChromeReviewStore);
      expect(StorageApi.set).toHaveBeenCalledWith({ [isExtensionRated]: true });
      expect(queryByText(rateUs)).toBeNull();
      expect(api.action.save).toHaveBeenCalledWith(UserAction.ExtensionRatingRateClick);
    });

    it('on close', async () => {
      const { findByTestId, queryByTestId } = await setup(props);

      await userEvent.click(await findByTestId(closeIconTestId));

      expect(queryByTestId(closeIconTestId)).toBeNull();
      expect(api.action.save).toHaveBeenCalledWith(UserAction.ExtensionRatingCloseClick);
    });
  });

  describe('when it was shown', () => {
    it(`passed more time than ${SHOW_AGAIN_AFTER_DAYS_IF_CLOSED} days and it was rated already`, async () => {
      const { queryByText } = await setup(mockProps({
        ...propsWhenVisible,
        isShown: true,
        seenDate: now.getTime() - SHOW_AGAIN_AFTER_DAYS_IF_CLOSED * DAY,
        isRated: true,
      }));

      await waitFor(() => {
        expect(StorageApi.set).not.toHaveBeenCalled();
      });

      expect(queryByText(rateUs)).toBeNull();
    });

    it(`passed more time than ${SHOW_AGAIN_AFTER_DAYS_IF_CLOSED} days`, async () => {
      const { findByText } = await setup(mockProps({
        ...propsWhenVisible,
        isShown: true,
        seenDate: now.getTime() - SHOW_AGAIN_AFTER_DAYS_IF_CLOSED * DAY,
      }));

      await waitFor(() => {
        expect(StorageApi.set).toHaveBeenCalledWith({ [extensionRatingSeenDate]: now.getTime() });
      });

      expect(await findByText(rateUs)).toBeVisible();
      expect(api.action.save).toHaveBeenCalledWith(UserAction.ExtensionRatingShown);
    });

    it(`passed less time than ${SHOW_AGAIN_AFTER_DAYS_IF_CLOSED} days`, async () => {
      const { queryByText } = await setup(mockProps({
        ...propsWhenVisible,
        isShown: true,
        seenDate: now.getTime() - SHOW_AGAIN_AFTER_DAYS_IF_CLOSED * DAY + DAY,
      }));

      await waitFor(() => {
        expect(StorageApi.set).not.toHaveBeenCalled();
        expect(queryByText(rateUs)).toBeNull();
      });
    });
  });
});
