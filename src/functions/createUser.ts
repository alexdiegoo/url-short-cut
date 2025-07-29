import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

import { prisma } from "../database";
import * as z from "zod";

import {
    createdResponse, 
    badRequest, 
    internalError 
} from '../shared/http/responses';
import { getErrorMessage } from '../shared/utils/getErrorMessage';

const createUserSchema = z.object({
    username: z.string().min(8).max(20),
    email: z.email(),
})

type CreateUserRequest = z.infer<typeof createUserSchema>

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    try {
        if (!event.body) {
            return badRequest('Request body is required');
        }

        const body = JSON.parse(event.body) as CreateUserRequest;
        const parsedBody = createUserSchema.safeParse(body);

        if (!parsedBody.success) {
            return badRequest(parsedBody.error.issues)
        }

        const userAlreadyExists = await prisma.user.findUnique({
            where: {
                email: body.email,
            }
        });

        if (userAlreadyExists) {
            return badRequest('User with this email already exists');
        }

        const user = await prisma.user.create({
            data: {
                name: body.username,
                email: body.email,
            },
        });

        return createdResponse({
            id: user.id,
            username: user.name,
            email: user.email,
        });
    } catch(error) {
        return internalError(getErrorMessage(error));
    }
}