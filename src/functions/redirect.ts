import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

import { prisma } from '../database';
import * as z from 'zod';
import { UAParser } from 'ua-parser-js';

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

        const userAgent = requestContext.http.userAgent || '';
        const { browser, os } = UAParser(userAgent);

        await prisma.click.create({
            data: {
                urlId: url.id,
                country: geolocation.country,
                postalCode: geolocation.postalCode,
                city: geolocation.city,
                latitude: geolocation.latitude,
                longitude: geolocation.longitude,
                userAgent,
                browser: browser.name,
                os: os.name
            }
        });


        return redirectResponse(url.originalUrl);
    } catch (error) {
        return internalError(getErrorMessage(error));
    }
}