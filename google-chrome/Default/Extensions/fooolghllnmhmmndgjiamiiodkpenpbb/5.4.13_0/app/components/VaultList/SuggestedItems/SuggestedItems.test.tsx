import { render, waitFor } from '@testing-library/react';
import { ItemType } from '@common/constants/vault';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { ExtensionProvider } from '@extension/app/context/ExtensionContext';
import { SuggestedItems } from './SuggestedItems';

jest.mock('@extension/app/context/ExtensionContext');

const mockItems = [
  {
    uuid: 'uuid1',
    title: 'facebook',
    last_used_at: '2021-08-17',
    secret_version: '2021-08-17',
    type: ItemType.Password,
    owner: true,
    url: 'www.facebook.com',
    secret: '1',
  },
  {
    uuid: 'uuid2',
    title: 'tesla1',
    last_used_at: '2021-08-17',
    secret_version: '2021-08-17',
    type: ItemType.Password,
    owner: true,
    url: 'www.tesla.com',
    secret: '1',
  },
  {
    uuid: 'uuid3',
    title: 'dribbble',
    last_used_at: '2021-08-17',
    secret_version: '2021-08-17',
    type: ItemType.Password,
    owner: true,
    url: 'https://www.dribbble.com',
    secret: '1',
  },
  {
    uuid: 'uuid4',
    title: 'tesla2',
    last_used_at: '2021-08-17',
    secret_version: '2021-08-17',
    type: ItemType.Password,
    owner: true,
    url: 'https://www.tesla.com',
    secret: '1',
  },
  {
    uuid: 'uuid5',
    title: 'apple',
    last_used_at: '2021-08-17',
    secret_version: '2021-08-17',
    type: ItemType.Password,
    owner: true,
    url: 'https://www.apple.com',
    secret: '1',
  },
];

describe('SuggestedItems component', () => {
  const setup = (domain: string | null) => {
    // eslint-disable-next-line no-underscore-dangle
    (ExtensionProvider as any).__mockExtensionContextValue({ domain });

    return render(wrapWithProviders(<SuggestedItems items={mockItems} />));
  };

  it.each([
    [null],
    [''],
    ['testas.lt'],
  ])('should not be visible if any of vault items urls doesnt include current domain or domain doesnt exist at all', async domain => {
    const { container } = setup(domain);
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  it.each([
    ['facebook.com', ['facebook']],
    ['apple.com', ['apple']],
    ['dribbble.com', ['dribbble']],
    ['tesla.com', ['tesla1', 'tesla2']],
  ])('should show item or items if their url includes domain', async (domain: string, titles: Array<string>) => {
    const { findAllByRole } = setup(domain);
    const listItems = await findAllByRole('listitem');
    await waitFor(() => {
      expect(listItems.length).toBe(titles.length);
      listItems.forEach((item, index) => {
        expect(item.textContent).toContain(titles[index]);
      });
    });
  });
});
