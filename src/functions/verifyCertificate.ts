import { APIGatewayProxyHandler } from "aws-lambda";
import * as Sentry from '@sentry/serverless';

import 'dotenv/config';

import { document } from "../utils/dynamodbClient";

Sentry.AWSLambda.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
});

export const handle: APIGatewayProxyHandler = Sentry.AWSLambda.wrapHandler(
  async (event) => {
    const { id } = event.pathParameters;

    try {
      const response = await document.query({
        TableName: "users_certificates",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": id,
        },
      }).promise();
  
      const userCertificate = response.Items[0];
    
      if (userCertificate) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Certificate is valid.",
            name: userCertificate.name,
            url: `${process.env.AWS_BUCKET_URL}/${id}.pdf`,
          }),
          headers: {
            "Content-type": "application/json",
          },
        };
      }
    } catch (err) {
      console.error(err)

      return {
        statusCode: 400,
        body: JSON.stringify({
          message: err.message,
        }),
        headers: {
          "Content-type": "application/json",
        },
      };
    }
  
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Certificate is not valid.",
      }),
      headers: {
        "Content-type": "application/json",
      },
    };
  }
)