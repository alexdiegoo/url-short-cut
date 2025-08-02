import { APIGatewayEvent, APIGatewayProxyResultV2 } from 'aws-lambda';

import { nanoid } from 'nanoid';
import { prisma } from '../database';

import * as z from 'zod';

import {
    createdResponse, 
    badRequest, 
    internalError 
} from '../shared/http/responses';
import { getErrorMessage } from '../shared/utils/getErrorMessage';

const ShortenRequestSchema = z.object({
    url: z.url().nonempty(),
});

export async function handler({ body, requestContext }: APIGatewayEvent): Promise<APIGatewayProxyResultV2> {
    try {
        if (!body) {
            return badRequest('Request body is required');
        }

        const parsedBody = ShortenRequestSchema.safeParse(JSON.parse(body));
        if (!parsedBody.success) {
            return badRequest(parsedBody.error.issues);
        }

        const shorten = await prisma.url.create({
            data: {
                id: nanoid(10),
                originalUrl: parsedBody.data.url,
                userId: requestContext.authorizer?.lambda.userId
            }
        });

        return createdResponse({
            id: shorten.id,
            originalUrl: shorten.originalUrl,
        });
    } catch (error) {
        return internalError(getErrorMessage(error));
    }
}