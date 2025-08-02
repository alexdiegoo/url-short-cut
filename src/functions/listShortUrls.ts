import { APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";

import { prisma } from "../database"
import { internalError, okResponse } from "../shared/http/responses";
import { getErrorMessage } from "../shared/utils/getErrorMessage";

export async function handler({ requestContext }: APIGatewayEvent): Promise<APIGatewayProxyResultV2> {
  try {
    const userId = requestContext.authorizer?.lambda.userId;

    const urls = await prisma.url.findMany({
      where: { userId },
      select: {
        id: true,
        originalUrl: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc'
      }
    });

    return okResponse(urls);
  } catch (error) {
    return internalError(getErrorMessage(error));
  }
}