import { IItem } from '@common/interfaces/item';
import { api } from '@extension/app/api';
import { VaultContext, IVaultContext } from '@extension/app/context/VaultContext';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { wrapWithIntl } from '@tests/extension/utils/wrapWithIntl';
import { renderWithInitEffects } from '@tests/utils/renderWithInitEffects';
import { DeleteSharedFolderModal } from './DeleteSharedFolderModal';

describe('DeleteSharedFolderModal', () => {
  const folderId = '123';

  const defaultVault: Partial<IVaultContext> = {
    isLoading: false,
  };

  const setup = (vaultItems: Array<IItem>) => renderWithInitEffects(wrapWithIntl(
    <VaultContext.Provider value={{ ...defaultVault, vaultItems } as IVaultContext}>
      <DeleteSharedFolderModal
        folderId={folderId}
        button={props => <span role="button" {...props}>test</span>}
      />
    </VaultContext.Provider>,
  ));

  jest.spyOn(api.item, 'delete');

  beforeEach(jest.clearAllMocks);

  it('should call delete on modal button delete click', async () => {
    await setup([{ folder_id: folderId } as IItem]);

    await userEvent.click(screen.getByRole('button', { name: /test/i }));

    await userEvent.click(screen.getByText('Delete'));

    expect(api.item.delete).toHaveBeenCalled();
  });
});
