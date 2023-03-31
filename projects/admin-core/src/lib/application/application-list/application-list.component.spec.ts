import { render, screen } from '@testing-library/angular';
import { ApplicationListComponent } from './application-list.component';
import { getApplication } from '@tailormap-admin/admin-api';
import { LoadingStateEnum, SharedModule } from '@tailormap-viewer/shared';
import { MatListModule } from '@angular/material/list';
import { getMockStore } from '@ngrx/store/testing';
import { ApplicationState, applicationStateKey, initialApplicationState } from '../state/application.state';
import { Store } from '@ngrx/store';
import { loadApplications } from '../state/application.actions';
import userEvent from '@testing-library/user-event';

const setup = async (
  loadStatus: LoadingStateEnum = LoadingStateEnum.INITIAL,
  listFilter = '',
  errorMessage?: string,
) => {
  const appModels = [
    getApplication({ title: 'Amazing application' }),
    getApplication({ id: '2', name: 'app2', title: 'Something different' }),
  ];
  const applicationState: ApplicationState = {
    ...initialApplicationState,
    applicationsLoadStatus: loadStatus,
    applications: loadStatus === LoadingStateEnum.LOADED ? appModels : [],
    applicationListFilter: listFilter,
    applicationsLoadError: errorMessage,
  };
  const mockStore = getMockStore({
    initialState: { [applicationStateKey]: applicationState },
  });
  mockStore.dispatch = jest.fn();
  await render(ApplicationListComponent, {
    imports: [ SharedModule, MatListModule ],
    providers: [
      { provide: Store, useValue: mockStore },
    ],
  });
  return { mockStore, appModels };
};

describe('ApplicationListComponent', () => {

  test('should render', async () => {
    const { mockStore } = await setup();
    expect(await screen.findByText('Applications')).toBeInTheDocument();
    expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
    expect(mockStore.dispatch).toHaveBeenCalledWith(loadApplications());
  });

  test('should render spinner', async () => {
    const { mockStore } = await setup(LoadingStateEnum.LOADING);
    expect(await screen.findByText('Applications')).toBeInTheDocument();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  test('should render list of applications', async () => {
    await setup(LoadingStateEnum.LOADED);
    expect(await screen.findByText('Amazing application')).toBeInTheDocument();
    expect(await screen.findByText('Something different')).toBeInTheDocument();
  });

  test('should render filtered list of applications', async () => {
    await setup(LoadingStateEnum.LOADED, 'something');
    expect(await screen.queryByText('Amazing application')).not.toBeInTheDocument();
    expect(await screen.findByText('Something different')).toBeInTheDocument();
  });

  test('should render error message & retry loading', async () => {
    const { mockStore } = await setup(LoadingStateEnum.FAILED, '', 'Something went wrong');
    expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(await screen.findByText('Retry')).toBeInTheDocument();
    await userEvent.click(await screen.findByText('Retry'));
    expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
    expect(mockStore.dispatch).toHaveBeenCalledWith(loadApplications());
  });

});
