import { ItemType } from '@common/constants/vault';
import { FileStatus, IItemFile } from '@common/interfaces/item';
import { render } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { ViewFiles } from './ViewFiles';

describe('<ViewFiles/>', () => {
  const itemId = '89a3e67b-dc94-444b-8fed-172f11e3558b';
  const file: IItemFile = {
    file_uuid: 'b1ad52ce-ec7b-498f-8679-f7708781608c',
    user_uuid: '89a3e67b-dc94-444b-8fed-172f11e3558b',
    item_uuid: itemId,
    created_at: '2022-08-30 15:00:00',
    updated_at: '2022-08-30 15:00:00',
    metadata: {
      name: 'file.png',
      type: 'image/png',
      size_in_bytes: 13631488,
      parts_count: 1,
      created_at: '2022-08-30 15:00:00',
      updated_at: '2022-08-30 15:00:00',
    },
    status: FileStatus.Uploaded,
  };

  const setup = (files: Array<IItemFile>) => render(wrapWithProviders(
    <ViewFiles files={files} itemId="testId" itemType={ItemType.Password} />,
  ));

  it('should display attached files', async () => {
    const { findByText } = setup([file]);

    expect(await findByText('Attached Files'));
    expect(await findByText('file.png'));
    expect(await findByText('13.0 MB'));
  });

  it('should NOT render if the item does not contain files', async () => {
    const { queryByText } = setup([]);

    expect(await queryByText('Attached Files')).toBeNull();
  });
});
