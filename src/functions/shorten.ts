import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

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
    userId: z.string().min(1),
});

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    try {
        if (!event.body) {
            return badRequest('Request body is required');
        }

        const parsedBody = ShortenRequestSchema.safeParse(JSON.parse(event.body));
        if (!parsedBody.success) {
            return badRequest(parsedBody.error.issues);
        }

        const shorten = await prisma.url.create({
            data: {
                id: nanoid(10),
                originalUrl: parsedBody.data.url,
                userId: parsedBody.data.userId,
            }
        });

        return createdResponse({
            id: shorten.id,
            shortUrl: `${process.env.SHORT_URL_BASE}/${shorten.id}`,
            originalUrl: shorten.originalUrl,
        });
    } catch (error) {
        return internalError(getErrorMessage(error));
    }
}