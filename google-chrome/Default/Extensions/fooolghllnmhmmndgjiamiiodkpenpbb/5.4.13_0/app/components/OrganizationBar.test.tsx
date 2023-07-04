import { OrganizationInviteStatus, OrganizationInviteType } from '@common/constants/organization';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { api } from '@extension/app/api';
import { StorageApi } from '@extension/browser/storageApi';
import { Storage } from '@extension/common/constants';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { OrganizationBar } from './OrganizationBar';

jest.mock('@extension/app/context/OrganizationContext', () => ({
  useOrganizationContext: () => ({
    invitations: [{
      organization: 'Test Organization',
      organization_uuid: 'd4a0b97b-2fe9-461e-9d65-62d7d8f4a290',
      type: OrganizationInviteType.Request,
      OrganizationInviteStatus: OrganizationInviteStatus.Pending,
    }],
  }),
}));

const storageGetSpy = jest.spyOn(StorageApi, 'get');

describe('OrganizationBar', () => {
  beforeEach(jest.clearAllMocks);

  it('should redirect to desktop organization invite on button click', async () => {
    jest.spyOn(api.extension, 'openDesktopApp');
    storageGetSpy.mockResolvedValue({
      [Storage.showOrganizationBar]: true,
      [Storage.Features]: [],
    });

    render(wrapWithProviders(<OrganizationBar />));

    await waitFor(async () => {
      const button = await screen.findByText('Join Now');
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(api.extension.openDesktopApp).toHaveBeenCalledWith({
        route: 'ORGANIZATION_INVITE',
      });
    });
  });
});
