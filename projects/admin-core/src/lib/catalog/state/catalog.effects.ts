import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import * as CatalogActions from './catalog.actions';
import { map, catchError, of, filter, switchMap, tap } from 'rxjs';
import {
  ApiResponseHelper, TailormapAdminApiV1Service,
} from '@tailormap-admin/admin-api';
import { Store } from '@ngrx/store';
import {
  selectCatalogLoadStatus, selectFeatureSourceLoadStatus, selectFeatureSources, selectGeoServices, selectGeoServicesLoadStatus,
} from './catalog.selectors';
import { LoadingStateEnum } from '@tailormap-viewer/shared';

@Injectable()
export class CatalogEffects {

  public loadCatalog$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CatalogActions.loadCatalog),
      concatLatestFrom(() => this.store$.select(selectCatalogLoadStatus)),
      filter(([ _action, loadStatus ]) => loadStatus !== LoadingStateEnum.LOADED && loadStatus !== LoadingStateEnum.LOADING),
      tap(() => this.store$.dispatch(CatalogActions.loadCatalogStart())),
      switchMap(([_action]) => {
        return this.adminApiService.getCatalog$()
          .pipe(
            catchError(() => {
              return of({ error: $localize `Error while loading catalog` });
            }),
            map(response => {
              if (ApiResponseHelper.isErrorResponse(response)) {
                return CatalogActions.loadCatalogFailed({ error: response.error });
              }
              return CatalogActions.loadCatalogSuccess({ nodes: response });
            }),
          );
      }),
    );
  });

  public loadFeatureSources$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CatalogActions.loadFeatureSources),
      concatLatestFrom(() => [ this.store$.select(selectFeatureSourceLoadStatus), this.store$.select(selectFeatureSources) ]),
      filter(([ _action, loadStatus ]) => loadStatus !== LoadingStateEnum.LOADED && loadStatus !== LoadingStateEnum.LOADING),
      tap(() => this.store$.dispatch(CatalogActions.loadFeatureSourcesStart())),
      switchMap(([ _action, _loadStatus, currentFeatureSources ]) => {
        return this.adminApiService.getAllFeatureSources$({ excludingIds: currentFeatureSources.map(f => f.id) })
          .pipe(
            catchError(() => {
              return of({ error: $localize `Error while loading feature sources` });
            }),
            map(response => {
              if (ApiResponseHelper.isErrorResponse(response)) {
                return CatalogActions.loadFeatureSourcesFailed({ error: response.error });
              }
              return CatalogActions.loadFeatureSourcesSuccess({ featureSources: response });
            }),
          );
      }),
    );
  });

  public loadGeoServices$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CatalogActions.loadAllGeoServices),
      concatLatestFrom(() => [ this.store$.select(selectGeoServicesLoadStatus), this.store$.select(selectGeoServices) ]),
      filter(([ _action, loadStatus ]) => loadStatus !== LoadingStateEnum.LOADED && loadStatus !== LoadingStateEnum.LOADING),
      tap(() => this.store$.dispatch(CatalogActions.loadAllGeoServicesStart())),
      switchMap(([ _action, _loadStatus, geoServices ]) => {
        return this.adminApiService.getAllGeoServices$({ excludingIds: geoServices.map(s => s.id) })
          .pipe(
            catchError(() => {
              return of({ error: $localize `Error while loading geo services` });
            }),
            map(response => {
              if (ApiResponseHelper.isErrorResponse(response)) {
                return CatalogActions.loadAllGeoServicesFailed({ error: response.error });
              }
              return CatalogActions.loadAllGeoServicesSuccess({ services: response });
            }),
          );
      }),
    );
  });

  constructor(
    private actions$: Actions,
    private store$: Store,
    private adminApiService: TailormapAdminApiV1Service,
  ) {}

}
