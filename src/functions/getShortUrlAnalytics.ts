import { APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";

import { badRequest, internalError, okResponse } from "../shared/http/responses";
import { getErrorMessage } from "../shared/utils/getErrorMessage";

import { prisma } from "../database";
import * as z from "zod"



const pathParamsSchema = z.object({
    shortUrlId: z.string().nonempty()
});

const queryParamsSchema = z.object({
    startDate: z.string().nonempty(),
    endDate: z.string().nonempty()
});

type GroupByDate = {
    date: Date;
    total: number;
};

type GroupByDevice = {
    os: string;
    browser: string;
    total: number;
}

type GroupByLocation = {
    country: string;
    city: string;
    total: number;
}

type ReportType = 'daily' | 'hourly';

export async function handler({ pathParameters, requestContext, queryStringParameters }: APIGatewayEvent): Promise<APIGatewayProxyResultV2> {
    try {
        const params = pathParamsSchema.safeParse(pathParameters);
        const queryParams = queryParamsSchema.safeParse(queryStringParameters);

        if(!params.success) {
            return badRequest(params.error.issues);
        }

        if(!queryParams.success) {
            return badRequest(queryParams.error.issues);
        }

        const userId = requestContext.authorizer?.lambda.userId

        const { shortUrlId } = params.data;
        const { startDate, endDate} = queryParams.data;

        const urlIsExists = await prisma.url.findUnique({
            where: {
                id: shortUrlId,
                userId
            },
            select: {
                id: true
            }
        });

        if(!urlIsExists) {
            return badRequest('URL not found');
        }

        const totalClicks = await prisma.click.count({
            where: {
                urlId: urlIsExists.id,
                createdAt: {
                    gte: new Date(`${startDate}T00:00:00`),
                    lte: new Date(`${endDate}T23:59:59`)
                }
            }
        });

        const reportType: ReportType = startDate === endDate ? 'hourly' : 'daily';

        let clicksByDate;

        
        if(reportType === 'hourly') {
            const clicksGroupByHour = await prisma.$queryRaw<GroupByDate[]>`
                SELECT
                    DATE_TRUNC('hour', "createdAt") AS date,
                    COUNT(*) AS total
                FROM "Click"
                WHERE "createdAt" BETWEEN ${new Date(`${startDate}T00:00:00`)} AND ${new Date(`${endDate}T23:59:59`)}
                AND "urlId" = ${shortUrlId}
                GROUP BY date
                ORDER BY date
            `;

            clicksByDate = clicksGroupByHour.map(item => ({
                date: item.date,
                total: Number(item.total)
            }));
            
        }

        if(reportType === 'daily') {
            const clicksGroupByDay = await prisma.$queryRaw<GroupByDate[]>`
                SELECT
                    DATE_TRUNC('day', "createdAt") AS date,
                    COUNT(*) AS total
                FROM "Click"
                WHERE "createdAt" BETWEEN ${new Date(`${startDate}T00:00:00`)} AND ${new Date(`${endDate}T23:59:59`)}
                AND "urlId" = ${shortUrlId}
                GROUP BY date
                ORDER BY date
            `;

            clicksByDate = clicksGroupByDay.map(item => ({
                date: item.date,
                total: Number(item.total)
            }))
        }

        const clicksByDevice = await prisma.$queryRaw<GroupByDevice[]>`
            SELECT
                os,
                browser,
                COUNT(*) AS total
            FROM "Click"
            WHERE "createdAt" BETWEEN ${new Date(`${startDate}T00:00:00`)} AND ${new Date(`${endDate}T23:59:59`)}
            AND "urlId" = ${shortUrlId}
            GROUP BY os, browser
        `;

        const clicksByLocation = await prisma.$queryRaw<GroupByLocation[]>`
            SELECT
                country,
                city,
                COUNT(*) AS total
            FROM "Click"
            WHERE "createdAt" BETWEEN ${new Date(`${startDate}T00:00:00`)} AND ${new Date(`${endDate}T23:59:59`)}
            AND "urlId" = ${shortUrlId}
            GROUP BY country, city
        `;

        return okResponse({
            reportType,
            totalClicks,
            clicksByDate,
            clicksByDevice: clicksByDevice.map((item) => ({
                os: item.os,
                browser: item.browser,
                total: Number(item.total)
            })),
            clicksByLocation: clicksByLocation.map((item) => ({
                country: item.country,
                city: item.city,
                total: Number(item.total)
            }))
        })


    } catch (error) {
        return internalError(getErrorMessage(error));
    }
}