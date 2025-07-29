import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

import { prisma } from "../database";

interface CreateUserRequest {
    username: string;
    email: string;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "User data is required" }),
                headers: {
                    "Content-Type": "application/json",
                },
            };
        }

        const body = JSON.parse(event.body) as CreateUserRequest;

        if (!body.username || !body.email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Username and email are required" }),
                headers: {
                    "Content-Type": "application/json",
                },
            };
        }

        const user = await prisma.user.create({
            data: {
                name: body.username,
                email: body.email,
            },
        });

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "User created successfully",
                data: user
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }
    } catch(error) {
        console.error("Error creating user:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    }
}