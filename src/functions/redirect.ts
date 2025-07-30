import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

import { prisma } from '../database';
import * as z from 'zod';

import {
    internalError,
    badRequest,
    redirectResponse
} from '../shared/http/responses';
import { getErrorMessage } from '../shared/utils/getErrorMessage';

const redirectSchema = z.string().nonempty();

export async function handler({ pathParameters }: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
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

        return redirectResponse(url.originalUrl);
    } catch (error) {
        return internalError(getErrorMessage(error));
    }
}