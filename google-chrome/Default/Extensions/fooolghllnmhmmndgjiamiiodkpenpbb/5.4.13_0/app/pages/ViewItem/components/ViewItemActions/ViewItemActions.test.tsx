import { IntlProvider } from 'react-intl';
import { ItemType } from '@common/constants/vault';
import { PremiumUpgradeModalSourceType } from '@common/constants/premiumUpgradeModalSource';
import { UserAction } from '@common/constants/userAction';
import { IItem } from '@common/interfaces/item';
import { AuthState } from '@common/store/reducers/authReducer/authConstants';
import { api } from '@extension/app/api';
import { AuthContext } from '@extension/app/context/AuthContext';
import * as getIsFeatureEnabled from '@extension/app/utils/getIsFeatureEnabled';
import defaultLocale from '@extension/assets/lang/compiled/en.json';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { ViewItemActions, IViewItemActions } from './ViewItemActions';

jest.mock('@extension/app/utils/getIsFeatureEnabled');

interface ISetupViewItemActions {
  viewItemsActionButtonsProps?: Partial<IViewItemActions>;
  isTrash?: boolean;
  isPremium?: boolean;
}

describe('ViewItemActions', () => {
  beforeEach(() => {
    jest.spyOn(getIsFeatureEnabled, 'useExtensionFeature').mockReturnValue(true);
  });

  const attachButtonId = 'attach';
  const shareButtonId = 'share';

  const item: IItem = {
    uuid: '123',
    last_used_at: '1234',
    owner: false,
    type: ItemType.Password,
    title: 'item',
  };

  const setup = ({ isTrash = false, isPremium = true, viewItemsActionButtonsProps }: ISetupViewItemActions) => (
    render(wrapWithProviders(
      <AuthContext.Provider value={{
        subscriptionData: {
          isPremium,
          isBusiness: false,
          expirationDate: null,
          isTrial: false,
          isTrialAvailable: false,
        },
        authState: AuthState.Authenticated,
        email: 'test@test.com',
      }}
      >
        <IntlProvider locale="en" defaultLocale="en" messages={defaultLocale}>
          <ViewItemActions item={item} isTrash={isTrash} {...viewItemsActionButtonsProps} />
        </IntlProvider>
      </AuthContext.Provider>,
    ))
  );

  it('should render Trash options for items in Trash', async () => {
    const { findByTestId } = setup({ isTrash: true });
    expect(await findByTestId('view_item_delete_permanently')).toBeVisible();
    expect(await findByTestId('view_item_restore_button')).toBeVisible();
  });

  it('should render item options for items NOT in Trash', async () => {
    const { findByTestId } = setup({});
    expect(await findByTestId(attachButtonId)).toBeVisible();
    expect(await findByTestId(shareButtonId)).toBeVisible();
  });

  describe('Attach button', () => {
    it.each([
      [ItemType.Password, UserAction.AttachmentTapPasswordExtension],
      [ItemType.CreditCard, UserAction.AttachmentTapCreditCardExtension],
      [ItemType.PersonalInfo, UserAction.AttachmentTapPersonalInfoExtension],
      [ItemType.Note, UserAction.AttachmentTapNoteExtension],
      [ItemType.Passkey, UserAction.AttachmentTapPasskeyExtension],
      [ItemType.Folder, null],
    ])('should handle user action for %s item type on button click', async (itemType, userAction) => {
      jest.spyOn(api.action, 'save');

      const { getByTestId } = setup({ viewItemsActionButtonsProps: { item: { type: itemType } as IItem } });
      const attachButton = getByTestId(attachButtonId);

      fireEvent.click(attachButton);

      await waitFor(() => {
        if (userAction) {
          expect(api.action.save).toHaveBeenCalledWith(userAction);
        } else {
          expect(api.action.save).not.toHaveBeenCalledWith(userAction);
        }
      });
    });

    it('should open item details when Premium user clicks Attach', async () => {
      jest.spyOn(api.extension, 'openDesktopApp');
      const { findByTestId } = setup({});
      const attachButton = await findByTestId(attachButtonId);

      fireEvent.click(attachButton);

      expect(api.extension.openDesktopApp).toHaveBeenCalledWith({ route: 'VIEW_ITEM', args: ['123'] });
    });

    it('should open Premium Modal when Free user clicks Attach', async () => {
      jest.spyOn(api.extension, 'openDesktopApp');
      const { findByTestId } = setup({ isPremium: false });
      const attachButton = await findByTestId(attachButtonId);

      fireEvent.click(attachButton);

      expect(api.extension.openDesktopApp).toHaveBeenCalledWith(
        { premiumUpgradeModalSource: PremiumUpgradeModalSourceType.FileStorage },
      );
    });
  });

  describe('Share button', () => {
    it('should open Share Modal when Premium user clicks Share', async () => {
      jest.spyOn(api.extension, 'openDesktopApp');
      const { findByTestId } = setup({});
      const shareButton = await findByTestId(shareButtonId);

      fireEvent.click(shareButton);

      expect(api.extension.openDesktopApp).toHaveBeenCalledWith({ route: 'SHARE_ITEM', args: ['123'] });
    });

    it('should open Premium Modal when Free user clicks Share', async () => {
      jest.spyOn(api.extension, 'openDesktopApp');
      const { findByTestId } = setup({ isPremium: false });
      const shareButton = await findByTestId(shareButtonId);

      fireEvent.click(shareButton);

      expect(api.extension.openDesktopApp).toHaveBeenCalledWith(
        { premiumUpgradeModalSource: PremiumUpgradeModalSourceType.Share },
      );
    });
  });
});
