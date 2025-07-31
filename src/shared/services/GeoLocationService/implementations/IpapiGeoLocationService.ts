import { IGeoLocationService } from "../IGeoLocationService";
import { GeoLocation } from "../models/GeoLocation";

export class IpapiGeoLocationService implements IGeoLocationService {
    async getGeoLocation(ip: string): Promise<GeoLocation> {
        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Failed to fetch geolocation. Status: ${response.status}, Body: ${errorBody}`);
                throw new Error(`Failed to fetch geolocation for IP: ${ip}`);
            }
            const data = await response.json();
            return {
                city: data.city || '',
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