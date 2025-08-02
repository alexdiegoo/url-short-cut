import { APIGatewayEvent } from 'aws-lambda';

import jwt from 'jsonwebtoken';
import { getErrorMessage } from '../shared/utils/getErrorMessage';

export async function handler(event: APIGatewayEvent) {    
    try {
        const token = event.headers.Authorization || event.headers.authorization;

        if (!token) {
            return {
                isAuthorized: false
            }
        }

        const tokenParts = token.split(' ');

        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return {
                isAuthorized: false
            }
        }

        const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET!);

        if (typeof decoded !== 'object' || !decoded.id || !decoded.email) {
            return {
                isAuthorized: false
            }
        }

        return {
            isAuthorized: true,
            principalId: decoded.id,
            context: {
                email: decoded.email,
                userId: decoded.id,
            }
        };
    } catch (error) {
        console.error('Authorizer error:', getErrorMessage(error));
        return {
            isAuthorized: false,
        };
    }
}