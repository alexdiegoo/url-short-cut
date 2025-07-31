import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

import { internalError, badRequest, deleteResponse } from "../shared/http/responses";
import { getErrorMessage } from "../shared/utils/getErrorMessage";

import { prisma } from "../database";
export async function handler({ pathParameters }: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    try {
        const shortUrlId = pathParameters?.shortUrlId;

        if(!shortUrlId) {
            return badRequest('Short URL ID is required');
        }

        const url = await prisma.url.findUnique({
            where: { id: shortUrlId }
        })

        if (!url) {
            return badRequest('Short URL not found');
        }

        await prisma.url.delete({
            where: { id: shortUrlId }
        });

        return deleteResponse();
    } catch (error) {
        return internalError(getErrorMessage(error));
    }

}