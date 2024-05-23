import { render, screen } from '@testing-library/angular';
import { NavigationComponent } from './navigation.component';
import { SharedModule } from '@tailormap-viewer/shared';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { TAILORMAP_SECURITY_API_V1_SERVICE } from '@tailormap-viewer/api';
import { of } from 'rxjs';
import { APP_BASE_HREF } from '@angular/common';
import { AuthenticatedUserTestHelper } from '../../../test-helpers/authenticated-user-test.helper';

const setup = async (isAuthenticated: boolean, nonAdminUser?: boolean) => {
  const api = { getUser$: jest.fn(() => of({})) };
  await render(NavigationComponent, {
    imports: [ SharedModule, MatIconTestingModule ],
    providers: [
      { provide: TAILORMAP_SECURITY_API_V1_SERVICE, useValue: api },
      { provide: APP_BASE_HREF, useValue: '' },
      AuthenticatedUserTestHelper.provideAuthenticatedUserService(
        isAuthenticated,
        isAuthenticated ? (nonAdminUser ? ['user'] : ['admin']) : [],
        isAuthenticated ? (nonAdminUser ? 'regular-user' : 'admin-user') : undefined,
      ),
    ],
  });
  return { api };
};

describe('NavigationComponent', () => {

  test('should render', async () => {
    const { api } = await setup(false);
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(await screen.queryByText('Catalog')).not.toBeInTheDocument();
  });

  test('should render with logged in user', async () => {
    await setup(true);
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(await screen.queryByText('Catalog')).toBeInTheDocument();
    expect(await screen.queryByText('admin-user')).toBeInTheDocument();
  });

  test('should render with logged in non-admin user', async () => {
    await setup(true, true);
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(await screen.queryByText('Catalog')).not.toBeInTheDocument();
    expect(await screen.queryByText('regular-user')).toBeInTheDocument();
  });

});
