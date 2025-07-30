import { GeoLocation } from "./models/GeoLocation";

export interface IGeoLocationService {
    getGeoLocation(ip: string): Promise<GeoLocation>;
}