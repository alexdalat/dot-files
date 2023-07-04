import { screen } from '@testing-library/react';
import { renderWithInitEffects } from '@tests/utils/renderWithInitEffects';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { OrganizationUserRole } from '@common/constants/organization';
import { AdminPanelLink } from './AdminPanelLink';

const openAdminPanelLinkText = 'Open Admin Panel';

let organizationUserRole: OrganizationUserRole | undefined;

jest.mock('@extension/app/context/OrganizationContext', () => ({
  useOrganizationContext: () => ({
    organizationData: organizationUserRole ? { organization_user: { role: organizationUserRole } } : null,
  }),
}));

const setup = (role?: OrganizationUserRole) => {
  organizationUserRole = role;
  return renderWithInitEffects(wrapWithProviders(<AdminPanelLink />));
};

describe('AdminPanelLink', () => {
  it('should not render link if user is not business user', async () => {
    await setup();
    expect(screen.queryByText(openAdminPanelLinkText)).toBeNull();
  });

  it('should not render link if user is business user but has user role', async () => {
    await setup(OrganizationUserRole.User);
    expect(screen.queryByText(openAdminPanelLinkText)).toBeNull();
  });

  it.each([
    OrganizationUserRole.Owner,
    OrganizationUserRole.Admin,
  ])('should render link if user is business user and has %s role', async role => {
    await setup(role);
    expect(screen.getByText(openAdminPanelLinkText)).toBeInTheDocument();
  });
});
