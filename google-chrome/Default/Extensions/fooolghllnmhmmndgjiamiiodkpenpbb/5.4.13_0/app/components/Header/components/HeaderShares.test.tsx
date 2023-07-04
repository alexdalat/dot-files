import { VaultType } from '@common/constants/vault';
import { IItem } from '@common/interfaces/item';
import { VaultContext, IVaultContext } from '@extension/app/context/VaultContext';
import * as useSearchParam from '@common/hooks/useSearchParam';
import { screen } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { renderWithInitEffects } from '@tests/utils/renderWithInitEffects';
import { HeaderShares } from './HeaderShares';

jest.mock('@common/hooks/useSearchParam');
jest.mock('@extension/app/pages/ViewItem/components/SharedWith/SharedWith', () => ({
  SharedWith: () => <div>Shared with</div>,
}));

describe('HeaderShares', () => {
  const folderUuid = '123';

  const defaultVaultValue: Partial<IVaultContext> = {
    vaultFolders: [{ uuid: folderUuid }] as Array<IItem>,
    error: null,
    isLoading: false,
  };

  const setup = () => renderWithInitEffects(wrapWithProviders(
    <VaultContext.Provider value={defaultVaultValue as IVaultContext}>
      <HeaderShares />
    </VaultContext.Provider>,
  ));

  beforeEach(jest.clearAllMocks);

  it('should show nothing if vault type is not shared folder', async () => {
    jest.spyOn(useSearchParam, 'useSearchParam').mockReturnValue(VaultType.Folder);

    await setup();

    expect(screen.queryByText('Shared with')).toBeNull();
  });

  it('should show nothing if folder does not exist', async () => {
    jest.spyOn(useSearchParam, 'useSearchParam')
      .mockReturnValueOnce(VaultType.SharedFolder)
      .mockReturnValueOnce('999');

    await setup();

    expect(screen.queryByText('Shared with')).toBeNull();
  });

  it('should show shared with if inside existing shared folder', async () => {
    jest.spyOn(useSearchParam, 'useSearchParam')
      .mockReturnValueOnce(VaultType.SharedFolder)
      .mockReturnValueOnce(folderUuid);

    await setup();

    expect(screen.getByText('Shared with')).toBeVisible();
  });
});
