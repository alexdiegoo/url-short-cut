import { IGeoLocationService } from "../IGeoLocationService";
import { GeoLocation } from "../models/GeoLocation";

export class IInfoGeoLocationService implements IGeoLocationService {
    async getGeoLocation(ip: string): Promise<GeoLocation> {
        try {
            const response = await fetch(`https://ipinfo.io/${ip}/json/`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${process.env.IPINFO_API_KEY}` 
                }
            });
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Failed to fetch geolocation. Status: ${response.status}, Body: ${errorBody}`);
                throw new Error(`Failed to fetch geolocation for IP: ${ip}`);
            }
            const data = await response.json();
            return {
                city: data.city || '',
                country: data.country || '',
                latitude: data.loc.split(',')[0] || '',
                longitude: data.loc.split(',')[1] || '',
                timezone: data.timezone || '',
                postalCode: data.postal || '',
            };
        } catch(error) {
            console.error('Error fetching geolocation:', error);
            throw new Error('Failed to fetch geolocation');
        }
    }
}