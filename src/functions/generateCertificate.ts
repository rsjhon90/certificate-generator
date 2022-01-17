import chromium from "chrome-aws-lambda";
import path from "path";
import handlebars from "handlebars";
import fs from "fs";
import dayjs from "dayjs";
import { S3 } from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";
import * as Sentry from '@sentry/serverless';

import 'dotenv/config';

import { document } from "../utils/dynamodbClient";

interface ICreateCertificate {
  id: string;
  name: string;
  grade: string;
}

interface ITemplate {
  id: string;
  name: string;
  grade: string;
  date: string;
  medal: string;
}

const compile = async function (data: ITemplate) {
  const filePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "certificate.hbs"
  );

  const html = fs.readFileSync(filePath, "utf-8");

  return handlebars.compile(html)(data);
};

Sentry.AWSLambda.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
});

export const handle: APIGatewayProxyHandler = Sentry.AWSLambda.wrapHandler(
  async (event) => {
    const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;
  
    try {
      const response = await document.query({
        TableName: "users_certificates",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": id,
        },
      }).promise();
  
      const userAlreadyExists = response.Items[0];
    
      if (!userAlreadyExists) {
        await document.put({
          TableName: "users_certificates",
          Item: {
            id,
            name,
            grade,
          },
        }).promise();
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
  
    const medalPath = path.join(process.cwd(), "src", "templates", "selo.png");
  
    const medal = fs.readFileSync(medalPath, "base64");
  
    const data: ITemplate = {
      date: dayjs().format("DD/MM/YYYY"),
      grade,
      name,
      id,
      medal,
    };

    const content = await compile(data);
  
    const browser = await chromium.puppeteer.launch({
      headless: true,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
    });
  
    const page = await browser.newPage();
  
    await page.setContent(content);
  
    const pdf = await page.pdf({
      format: "a4",
      landscape: true,
      path: process.env.IS_OFFLINE ? "certificate.pdf" : null,
      printBackground: true,
      preferCSSPageSize: true,
    });
  
    await browser.close();

    const s3 = new S3();
  
    await s3.putObject({
      Bucket: process.env.AWS_BUCKET,
      Key: `${id}.pdf`,
      ACL: "public-read",
      Body: pdf,
      ContentType: "application/pdf",
    }).promise();
  
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Certificate created!",
        url: `${process.env.AWS_BUCKET_URL}/${id}.pdf`,
      }),
      headers: {
        "Content-type": "application/json",
      },
    };
  }  
);