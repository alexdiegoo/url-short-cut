import { IGeoLocationService } from "../IGeoLocationService";
import { GeoLocation } from "../models/GeoLocation";

export class IpapiGeoLocationService implements IGeoLocationService {
    async getGeoLocation(ip: string): Promise<GeoLocation> {
        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            if (!response.ok) {
                throw new Error(`Failed to fetch geolocation for IP: ${ip}`);
            }
            const data = await response.json();
            return {
                city: data.city || '',
                regionCode: data.region_code || '',
                country: data.country_name || '',
                latitude: data.latitude || '',
                longitude: data.longitude || '',
                timezone: data.timezone || '',
                postalCode: data.postal || '',
            };
        } catch(error) {
            console.error('Error fetching geolocation:', error);
            throw new Error('Failed to fetch geolocation');
        }
    }
}