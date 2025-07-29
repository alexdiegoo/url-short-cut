import { APIGatewayProxyResultV2 } from "aws-lambda";

export function badRequest(messages: any[] | string): APIGatewayProxyResultV2 {
    if (typeof messages === 'string') {
        messages = [messages];
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ error: true, messages }),
        headers: {
            'Content-Type': 'application/json',
        },
    };
}

export function internalError(messages: any[] | string): APIGatewayProxyResultV2 {
     if (typeof messages === 'string') {
        messages = [messages || 'Internal server error'];
    }
    
    return {
        statusCode: 500,
        body: JSON.stringify({ error: true, messages }),
        headers: {
            'Content-Type': 'application/json',
        },
    };
}

export function createdResponse(data: any): APIGatewayProxyResultV2 {
    return {
        statusCode: 201,
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    };
}