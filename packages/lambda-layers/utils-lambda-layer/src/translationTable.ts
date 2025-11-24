import * as dynamoDb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ITranslateDbObject } from "@sff/shared-types";

interface TranslationTableProps {
  tableName: string;
  partitionKey: string;
}

export class TranslationTable {
  tableName: string;
  partitionKey: string;
  dynamoDbClient: dynamoDb.DynamoDBClient;

  constructor({ tableName, partitionKey }: TranslationTableProps) {
    this.partitionKey = partitionKey;
    this.tableName = tableName;
    this.dynamoDbClient = new dynamoDb.DynamoDBClient({});
  }

  async insert(data: ITranslateDbObject) {
    const tableInsertCmd: dynamoDb.PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall(data),
    };

    await this.dynamoDbClient.send(new dynamoDb.PutItemCommand(tableInsertCmd));
  }

  async getAll() {
    const tableScanCmd: dynamoDb.ScanCommandInput = {
      TableName: this.tableName,
    };

    const { Items } = await this.dynamoDbClient.send(
      new dynamoDb.ScanCommand(tableScanCmd)
    );

    if (!Items) {
      return [];
    }

    return Items.map((item) => unmarshall(item) as ITranslateDbObject);
  }
}
