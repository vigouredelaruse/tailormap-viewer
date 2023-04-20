import { render, screen } from '@testing-library/angular';
import { GroupdetailsFormComponent } from './groupdetails-form.component';
import { of } from 'rxjs';
import { SharedModule } from '@tailormap-viewer/shared';
import { MatListModule } from '@angular/material/list';
import { TAILORMAP_ADMIN_API_V1_SERVICE } from '@tailormap-admin/admin-api';


const setup = async () => {
  const mockApiService = {
    getGroups$: jest.fn(() => of(null)),
  };

  await render(GroupdetailsFormComponent, {
    imports: [ SharedModule, MatListModule ],
    providers: [
      { provide: TAILORMAP_ADMIN_API_V1_SERVICE, useValue: mockApiService },
    ],
  });
  return { mockApiService };
};
describe('GroupdetailsFormComponent', () => {

  test('should render', async () => {
    await setup();
    expect(screen.getByText('Group Details'));
  });

});