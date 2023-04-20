import { ServiceCapsModel } from './service-caps.model';
import { GeoServiceProtocolEnum } from './geo-service-protocol.enum';
import { GeoServiceSettingsModel } from './geo-service-settings.model';

export interface GeoServiceModel {
  id: string;
  type: 'geo-service';
  title: string;
  notes?: string | null;
  protocol: GeoServiceProtocolEnum;
  url: string;
  authentication?: Record<string, any> | null;
  capabilities?: Blob; // should not be sent by the API
  serviceCapabilities?: ServiceCapsModel;
  capabilitiesContentType?: string;
  capabilitiesFetched?: string;
  advertisedUrl?: string;
  settings?: GeoServiceSettingsModel;
}