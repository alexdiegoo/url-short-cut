import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

import { prisma } from '../database';
import * as z from 'zod';

import {
    internalError,
    badRequest,
    redirectResponse
} from '../shared/http/responses';
import { getErrorMessage } from '../shared/utils/getErrorMessage';

import { geoLocationService } from '../shared/services/container';

const redirectSchema = z.string().nonempty();

export async function handler({ pathParameters, requestContext }: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    try {
        const shortUrlId = redirectSchema.safeParse(pathParameters?.shortUrlId);

        if(!shortUrlId.success) {
            return badRequest('Short URL not found');
        }

        const url = await prisma.url.findUnique({
            where: { id: shortUrlId.data }
        });

        if (!url) {
            return badRequest('Short URL not found');
        }

        const ip = requestContext.http.sourceIp;
        const geolocation = await geoLocationService.getGeoLocation(ip);

        await prisma.click.create({
            data: {
                urlId: url.id,
                country: geolocation.country,
                regionCode: geolocation.regionCode,
                postalCode: geolocation.postalCode,
                city: geolocation.city,
                latitude: geolocation.latitude,
                longitude: geolocation.longitude,
                userAgent: requestContext.http.userAgent || '',
                timezone: geolocation.timezone,
            }
        });


        return redirectResponse(url.originalUrl);
    } catch (error) {
        return internalError(getErrorMessage(error));
    }
}