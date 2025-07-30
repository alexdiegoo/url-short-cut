import { IGeoLocationService } from "./GeoLocationService/IGeoLocationService";
import { IpapiGeoLocationService } from "./GeoLocationService/implementations/IpapiGeoLocationService";

export const geoLocationService: IGeoLocationService = new IpapiGeoLocationService();