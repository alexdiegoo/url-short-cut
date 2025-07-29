import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { nanoid } from 'nanoid';
import { prisma } from '../database'

interface ShortenRequest {
    url: string;
    userId: string;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'URL is required' }),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        }

        const body = JSON.parse(event.body) as ShortenRequest;

        if (!body.url || !body.userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'URL or userId is required' }),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        }

        const shorten = await prisma.url.create({
            data: {
                id: nanoid(10),
                originalUrl: body.url,
                userId: body.userId,
            }
        });

        return {
            statusCode: 201,
            body: JSON.stringify({ 
                shortUrl: `${process.env.SHORT_URL_BASE}/${shorten.id}`,
                originalUrl: shorten.originalUrl,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }
    } catch (error) {
        console.error('Error shortening URL:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
            headers: {
                'Content-Type': 'application/json',
            },
        }
    }
}