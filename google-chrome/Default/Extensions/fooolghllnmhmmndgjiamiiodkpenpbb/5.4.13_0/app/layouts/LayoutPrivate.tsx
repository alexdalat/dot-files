import { useContext, useState, ReactNode } from 'react';
import cx from 'classnames';
import { useMatch } from 'react-router-dom';
import { ROUTES } from '@extension/common/constants/routes';
import { OrganizationBar } from '@extension/app/components/OrganizationBar';
import { AddMenu } from '@extension/app/components/AddMenu/AddMenu';
import { ExtensionContext } from '@extension/app/context/ExtensionContext';
import { PendingSharesProvider } from '@extension/app/context/PendingSharesContext/PendingSharesContext';
import { VaultProvider } from '@extension/app/context/VaultContext';
import { OfflineModeIndicator } from '@extension/app/components/OfflineModeIndicator/OfflineModeIndicator';
import { Header } from '@extension/app/components/Header/Header';
import { useIsScrolled } from '@extension/app/hooks/useIsScrolled';
import { useOnlineStatus } from '@extension/app/hooks/useOnlineStatus';
import { Sidebar } from '@extension/app/components/Sidebar/Sidebar';
import { AlertBar } from '@common/components/AlertBar/AlertBar';
import { ItemActionModalsHandler } from '@extension/app/components/ItemActionModalsHandler';
import { VaultItemModalsProvider } from '@extension/app/context/VaultItemModalsContext/VaultItemModalsProvider';
import { OfflineModeOverlay } from '@extension/app/components/OfflineModeOverlay/OfflineModeOverlay';
import { useToastVisibility } from '@extension/app/hooks/useToastVisibility';
import { useUserStatus } from '@extension/app/hooks/useUserStatus';

interface ILayoutPrivate {
  hideHeader?: boolean;
  children?: ReactNode;
}

export const LayoutPrivate = ({ children, hideHeader }: ILayoutPrivate) => {
  const [onScroll, isScrolled] = useIsScrolled();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isPopup } = useContext(ExtensionContext) ?? {};

  const isInVaultList = !!useMatch(ROUTES.VAULT);
  const isInItemDetails = !!useMatch('/vault/:id');
  const isInTrashList = !!useMatch(ROUTES.TRASH);
  const isInTrashItemDetails = !!useMatch('/trash/:id');

  const isHeaderHidden = isInItemDetails || isInTrashItemDetails || hideHeader;
  const isToastVisible = useToastVisibility();
  const isOrganizationBannerVisible = isInVaultList || isInTrashList;
  const { isBusiness } = useUserStatus();
  const { isOnline } = useOnlineStatus();

  if (isOnline === null) {
    return null;
  }

  const content = (() => {
    if (!isOnline && isBusiness) {
      return <OfflineModeOverlay />;
    }

    return (
      <>
        <ItemActionModalsHandler />
        <AlertBar />
        <div className="overflow-hidden flex flex-1 flex-col bg-primary">
          {!isHeaderHidden && <Header isContentScrolled={isScrolled} onMenuOpen={() => setIsMenuOpen(true)} />}
          <Sidebar isMenuOpen={isMenuOpen} onMenuClose={() => setIsMenuOpen(false)} />
          <div className="flex flex-col flex-1 relative overflow-hidden">
            <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto" onScroll={onScroll}>
              {isOrganizationBannerVisible && <OrganizationBar />}
              {children}
            </div>
            {isInVaultList && (
              <div className={cx(
                'fixed bottom-0 right-0 p-4',
                isToastVisible && 'mb-14',
              )}
              >
                <AddMenu />
              </div>
            )}
          </div>
        </div>
      </>
    );
  })();

  return (
    <PendingSharesProvider>
      <VaultProvider>
        <VaultItemModalsProvider>
          <div
            className={cx(
              'overflow-hidden h-screen flex flex-col text-grey-darkest leading-normal text-small font-medium',
              isPopup && 'is-popup',
            )}
          >
            <OfflineModeIndicator isBusiness={isBusiness} />
            {content}
          </div>
        </VaultItemModalsProvider>
      </VaultProvider>
    </PendingSharesProvider>
  );
};
