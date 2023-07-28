import * as EditActions from './edit.actions';
import { Action, createReducer, on } from '@ngrx/store';
import { EditState, initialEditState } from './edit.state';
import { LoadingStateEnum } from '@tailormap-viewer/shared';
import { FeatureInfoFeatureModel } from '../../feature-info/models/feature-info-feature.model';
import { FeatureInfoColumnMetadataModel } from '../../feature-info/models/feature-info-column-metadata.model';

const onSetIsActive = (
  state: EditState,
  payload: ReturnType<typeof EditActions.setEditActive>,
): EditState => ({
  ...state,
  isActive: payload.active,
  dialogVisible: false,
  selectedFeature: null,
});

const onSetSelectedLayer = (
  state: EditState,
  payload: ReturnType<typeof EditActions.setSelectedEditLayer>,
): EditState => ({
  ...state,
  selectedLayer: payload.layer,
});

const onLoadFeatureInfo = (
  state: EditState,
  payload: ReturnType<typeof EditActions.loadEditFeatures>,
): EditState => ({
  ...state,
  mapCoordinates: payload.coordinates,
  loadStatus: LoadingStateEnum.LOADING,
  features: [],
});

const onLoadEditFeaturesSuccess = (
  state: EditState,
  payload: ReturnType<typeof EditActions.loadEditFeaturesSuccess>,
): EditState => {
  const features = payload.featureInfo.reduce<FeatureInfoFeatureModel[]>((allFeatures, featureInfoModel) => allFeatures.concat(featureInfoModel.features), []);
  const selectedFeature = features.length === 0 ? features[0].__fid : null;
  return {
    ...state,
    features,
    columnMetadata: payload.featureInfo.reduce<FeatureInfoColumnMetadataModel[]>((allMetadata, featureInfoModel) => allMetadata.concat(featureInfoModel.columnMetadata), []),
    loadStatus: LoadingStateEnum.LOADED,
    selectedFeature,
    dialogVisible: true,
    dialogCollapsed: false,
  };
};

const onLoadEditFeaturesFailed = (
  state: EditState,
  payload: ReturnType<typeof EditActions.loadEditFeaturesFailed>,
): EditState => ({
  ...state,
  errorMessage: payload.errorMessage,
  features: [],
  selectedFeature: null,
  loadStatus: LoadingStateEnum.FAILED,
});

const onSetSelectedEditFeature = (
  state: EditState,
  payload: ReturnType<typeof EditActions.setSelectedEditFeature>,
): EditState => ({
  ...state,
  selectedFeature: payload.fid,
});

const onShowEditDialog = (state: EditState): EditState => ({
  ...state,
  dialogVisible: true,
});

const onHideEditDialog = (state: EditState): EditState => ({
  ...state,
  dialogVisible: false,
  dialogCollapsed: false,
});

const onExpandCollapseEditDialog = (state: EditState): EditState => ({
  ...state,
  dialogCollapsed: !state.dialogCollapsed,
});

const onUpdateEditFeature = (
  state: EditState,
  payload: ReturnType<typeof EditActions.updateEditFeature>,
): EditState => {
  const featureIdx = state.features.findIndex(f => f.__fid === payload.feature.__fid && f.layerId === payload.layerId);
  if (featureIdx === -1) {
    return state;
  }
  return {
    ...state,
    features: [
      ...state.features.slice(0, featureIdx),
      { ...payload.feature, layerId: payload.layerId },
      ...state.features.slice(featureIdx + 1),
    ],
  };
};

const editReducerImpl = createReducer<EditState>(
  initialEditState,
  on(EditActions.setEditActive, onSetIsActive),
  on(EditActions.setSelectedEditLayer, onSetSelectedLayer),
  on(EditActions.loadEditFeatures, onLoadFeatureInfo),
  on(EditActions.loadEditFeaturesSuccess, onLoadEditFeaturesSuccess),
  on(EditActions.loadEditFeaturesFailed, onLoadEditFeaturesFailed),
  on(EditActions.setSelectedEditFeature, onSetSelectedEditFeature),
  on(EditActions.showEditDialog, onShowEditDialog),
  on(EditActions.hideEditDialog, onHideEditDialog),
  on(EditActions.expandCollapseEditDialog, onExpandCollapseEditDialog),
  on(EditActions.updateEditFeature, onUpdateEditFeature),
);
export const editReducer = (state: EditState | undefined, action: Action) => editReducerImpl(state, action);
