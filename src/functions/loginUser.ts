import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

import { badRequest, createdResponse, internalError } from "../shared/http/responses";
import { getErrorMessage } from "../shared/utils/getErrorMessage";

import { prisma } from "../database";
import * as z from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const loginUserSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(50),
});

export async function handler({ body }: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    try {
        if (!body) {
            return internalError('Request body is required');
        }

        const parsedBody = loginUserSchema.safeParse(JSON.parse(body));

        if (!parsedBody.success) {
            return badRequest(parsedBody.error.issues);
        }

        const user = await prisma.user.findUnique({
            where: {
                email: parsedBody.data.email,
            },
        });

        if (!user) {
            return badRequest('User or password is incorrect');
        }

        const isPasswordValid = await bcrypt.compare(parsedBody.data.password, user.password);

        if (!isPasswordValid) {
            return badRequest('Invalid password');
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        )

        return createdResponse({
            token
        });
    } catch(error) {
        return internalError(getErrorMessage(error));
    }
}