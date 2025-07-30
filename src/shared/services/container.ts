import { IGeoLocationService } from "./GeoLocationService/IGeoLocationService";
import { IInfoGeoLocationService } from "./GeoLocationService/implementations/IpInfoGeoLocationService";

export const geoLocationService: IGeoLocationService = new IInfoGeoLocationService();