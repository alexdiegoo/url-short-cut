import { APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";

import { internalError, badRequest, deleteResponse } from "../shared/http/responses";
import { getErrorMessage } from "../shared/utils/getErrorMessage";

import { prisma } from "../database";
export async function handler({ pathParameters, requestContext }: APIGatewayEvent): Promise<APIGatewayProxyResultV2> {
    try {
        const shortUrlId = pathParameters?.shortUrlId;
        const userId = requestContext.authorizer?.lambda.userId;

        if(!shortUrlId) {
            return badRequest('Short URL ID is required');
        }

        const url = await prisma.url.findUnique({
            where: { id: shortUrlId, userId }
        })

        if (!url) {
            return badRequest('Short URL not found');
        }

        await prisma.url.delete({
            where: { id: shortUrlId, userId }
        });

        return deleteResponse();
    } catch (error) {
        return internalError(getErrorMessage(error));
    }

}