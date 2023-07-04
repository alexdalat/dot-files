import { createMemoryHistory } from 'history';
import { act, render, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { items } from '@tests/extension/data/vault';
import { ROUTES } from '@extension/common/constants/routes';
import { Storage } from '@extension/common/constants';
import { SortingType, SortingDirection, VaultType } from '@common/constants/vault';
import { StorageApi } from '@extension/browser/storageApi';
import * as api from '@extension/app/api';
import * as createListener from '@extension/app/api/createListener';
import { Action } from '@common/constants/action';
import { Notification } from '@common/constants/notification';
import { INoteItem, IPasswordItem } from '@common/contracts/contracts';
import { LIST_ITEM_INDEX_OFFSET } from '@extension/app/components/VaultList/VaultList';
import { Vault } from './Vault';

jest.mock('@extension/app/api/createListener');

async function renderList(route = ROUTES.VAULT) {
  jest.spyOn(api, 'sendMessage').mockImplementation(async type => {
    if (type === Action.ItemSearch) return Promise.resolve({ items });
    return Promise.resolve({ items: [] });
  });
  const history = createMemoryHistory({ initialEntries: [route] });
  const result = render(wrapWithProviders(
    <Routes>
      <Route path="/vault/*" element={<Vault />} />
    </Routes>,
    { history },
  ));
  await result.findByRole('list');
  return result;
}

const listeners = new Set<(data: Record<string, any>) => void>();
const triggerNotification = (data: Record<string, any>) => listeners.forEach(handler => handler(data));
jest.spyOn(createListener, 'createListener').mockImplementation((handler, _listenerType) => {
  listeners.add(handler);
  return () => listeners.delete(handler);
});

describe('Vault', () => {
  beforeEach(() => {
    jest.resetModules();
    StorageApi.get = jest.fn().mockResolvedValue({
      [Storage.VaultSorting]: { type: SortingType.Recent, direction: SortingDirection.Asc },
    });
    listeners.clear();
  });

  it('should render error', async () => {
    jest.spyOn(api, 'sendMessage').mockRejectedValue(Error('test'));
    const { findByText } = render(wrapWithProviders(<Vault />));

    const errorText = 'An undefined error occurred. If it persists, please contact support.';
    const errorTextNode = await findByText(errorText);

    expect(errorTextNode).toBeTruthy();
  });

  it('should render empty vault list', async () => {
    jest.spyOn(api, 'sendMessage').mockResolvedValue({ items: [] });
    const { findByText } = render(wrapWithProviders(<Vault />));

    const header = await findByText('Let’s get started');

    expect(header).toBeTruthy();
  });

  it('should render vault list', async () => {
    const { queryAllByRole } = await renderList();

    await waitFor(() => {
      const listItems = queryAllByRole('listitem').slice(LIST_ITEM_INDEX_OFFSET);
      expect(listItems).toHaveLength(3);
      listItems.forEach((item, index) => {
        expect(item.textContent).toContain(items[index].title);
      });
      const passwordItem = (items[0] as IPasswordItem);
      const noteItem = (items[1] as INoteItem);
      expect(listItems[0].textContent).toContain(passwordItem.username);
      expect(listItems[1].textContent).not.toContain(noteItem.secret);
    });
  });

  describe('filtered list', () => {
    it('should render passwords list', async () => {
      const { queryAllByRole } = await renderList(ROUTES.VAULT_TYPE(VaultType.Password));

      await waitFor(() => {
        const listItems = queryAllByRole('listitem').slice(LIST_ITEM_INDEX_OFFSET);
        expect(listItems).toHaveLength(1);
        expect(listItems[0].textContent).toContain(items[0].title);
      });
    });

    it('should render notes list', async () => {
      const { queryAllByRole } = await renderList(ROUTES.VAULT_TYPE(VaultType.Note));

      await waitFor(() => {
        const listItems = queryAllByRole('listitem').slice(LIST_ITEM_INDEX_OFFSET);
        expect(listItems).toHaveLength(1);
        expect(listItems[0].textContent).toContain(items[1].title);
      });
    });

    it('should render cards list', async () => {
      const { queryAllByRole } = await renderList(ROUTES.VAULT_TYPE(VaultType.CreditCard));

      await waitFor(() => {
        const listItems = queryAllByRole('listitem').slice(LIST_ITEM_INDEX_OFFSET);
        expect(listItems).toHaveLength(1);
        expect(listItems[0].textContent).toContain(items[2].title);
      });
    });

    it('should render shared list', async () => {
      const { queryAllByRole } = await renderList(ROUTES.VAULT_TYPE(VaultType.Shared));

      await waitFor(() => {
        const listItems = queryAllByRole('listitem').slice(LIST_ITEM_INDEX_OFFSET);
        expect(listItems).toHaveLength(1);
        expect(listItems[0].textContent).toContain(items[0].title);
      });
    });

    it('should render folder items', async () => {
      const { queryAllByRole } = await renderList(ROUTES.VIEW_FOLDER(items[3].uuid));

      await waitFor(() => {
        const listItems = queryAllByRole('listitem').slice(LIST_ITEM_INDEX_OFFSET);
        expect(listItems).toHaveLength(1);
        expect(listItems[0].textContent).toContain(items[0].title);
      });
    });

    it('should render search list', async () => {
      const { queryAllByRole } = await renderList(`${ROUTES.VAULT}?query=note`);

      await waitFor(() => {
        const listItems = queryAllByRole('listitem').slice(LIST_ITEM_INDEX_OFFSET);
        expect(listItems).toHaveLength(2);
        expect(listItems[0].textContent).toContain(items[0].title);
        expect(listItems[1].textContent).toContain(items[1].title);
      });
    });
  });

  it('should sort list by name A-Z', async () => {
    StorageApi.get = jest.fn().mockResolvedValue({
      [Storage.VaultSorting]: { type: SortingType.Alpha, direction: SortingDirection.Asc },
    });
    const { queryAllByRole } = await renderList();

    await waitFor(() => {
      const listItems = queryAllByRole('listitem').slice(LIST_ITEM_INDEX_OFFSET);
      expect(listItems[0].textContent).toContain(items[2].title);
      expect(listItems[1].textContent).toContain(items[1].title);
      expect(listItems[2].textContent).toContain(items[0].title);
    });
  });

  it('should sort list by name Z-A', async () => {
    StorageApi.get = jest.fn().mockResolvedValue({ [Storage.VaultSorting]: { type: 'alpha', direction: 'desc' } });
    const { queryAllByRole } = await renderList();

    await waitFor(() => {
      const listItems = queryAllByRole('listitem').slice(LIST_ITEM_INDEX_OFFSET);
      expect(listItems[0].textContent).toContain(items[0].title);
      expect(listItems[1].textContent).toContain(items[1].title);
      expect(listItems[2].textContent).toContain(items[2].title);
    });
  });

  it('should update list after receiving vault/change', async () => {
    const { queryAllByRole } = await renderList();

    act(() => triggerNotification({
      id: 0,
      type: Notification.VaultChange,
      deleted_items: [],
      items: [{ ...items[0], title: 'changed-title' }],
    }));

    await waitFor(() => {
      const listItems = queryAllByRole('listitem').slice(LIST_ITEM_INDEX_OFFSET);
      expect(listItems[0].textContent).not.toContain(items[0].title);
      expect(listItems[0].textContent).toContain('changed-title');
      expect(listItems[1].textContent).toContain(items[1].title);
      expect(listItems[2].textContent).toContain(items[2].title);
    });
  });

  it('should remove item from list after receiving vault/change', async () => {
    const { queryAllByRole } = await renderList();

    act(() => triggerNotification({
      id: 0,
      type: Notification.VaultChange,
      deleted_items: [{ uuid: items[1].uuid, type: items[1].type }],
      items: [],
    }));

    await waitFor(() => {
      const listItems = queryAllByRole('listitem').slice(LIST_ITEM_INDEX_OFFSET);
      expect(listItems).toHaveLength(2);
      expect(listItems[0].textContent).toContain(items[0].title);
      expect(listItems[1].textContent).toContain(items[2].title);
    });
  });
});
