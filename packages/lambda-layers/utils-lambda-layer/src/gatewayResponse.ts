import * as awsLambda from "aws-lambda";

interface createGatewayResponseProps {
  statusCode: number;
  body: string;
}

const createGatewayResponse = ({
  statusCode,
  body,
}: createGatewayResponseProps): awsLambda.APIGatewayProxyResult => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
  };

  return {
    statusCode,
    body,
    headers,
  };
};

export const createSuccessJsonResponse = (
  body: string
): awsLambda.APIGatewayProxyResult => {
  return createGatewayResponse({ statusCode: 200, body });
};

export const createErrorJsonResponse = (
  body: string
): awsLambda.APIGatewayProxyResult => {
  return createGatewayResponse({ statusCode: 500, body });
};
