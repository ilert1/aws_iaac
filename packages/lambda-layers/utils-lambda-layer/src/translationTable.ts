import * as dynamoDb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ITranslateDbObject } from "@sff/shared-types";

interface TranslationTableProps {
	tableName: string;
	partitionKey: string;
	sortKey: string;
}

export class TranslationTable {
	tableName: string;
	partitionKey: string;
	sortKey: string;
	dynamoDbClient: dynamoDb.DynamoDBClient;

	constructor({ tableName, partitionKey, sortKey }: TranslationTableProps) {
		this.partitionKey = partitionKey;
		this.tableName = tableName;
		this.sortKey = sortKey;
		this.dynamoDbClient = new dynamoDb.DynamoDBClient({});
	}

	async insert(data: ITranslateDbObject) {
		const tableInsertCmd: dynamoDb.PutItemCommandInput = {
			TableName: this.tableName,
			Item: marshall(data),
		};

		await this.dynamoDbClient.send(new dynamoDb.PutItemCommand(tableInsertCmd));
	}

	async delete(username: string, requestId: string) {
		const deleteCmd: dynamoDb.DeleteItemCommandInput = {
			TableName: this.tableName,
			Key: {
				[this.partitionKey]: { S: username },
				[this.sortKey]: { S: requestId },
			},
		};

		await this.dynamoDbClient.send(new dynamoDb.DeleteItemCommand(deleteCmd));
		return this.query(username);
	}

	async query(username: string) {
		const queryCmd: dynamoDb.QueryCommandInput = {
			TableName: this.tableName,
			KeyConditionExpression: "#PARTITION_KEY = :username",
			ExpressionAttributeNames: {
				"#PARTITION_KEY": "username",
			},
			ExpressionAttributeValues: {
				":username": { S: username },
			},
			ScanIndexForward: true,
		};

		const { Items } = await this.dynamoDbClient.send(
			new dynamoDb.QueryCommand(queryCmd),
		);

		if (!Items) {
			return [];
		}

		return Items.map((item) => unmarshall(item) as ITranslateDbObject);
	}

	async getAll() {
		const tableScanCmd: dynamoDb.ScanCommandInput = {
			TableName: this.tableName,
		};

		const { Items } = await this.dynamoDbClient.send(
			new dynamoDb.ScanCommand(tableScanCmd),
		);

		if (!Items) {
			return [];
		}

		return Items.map((item) => unmarshall(item) as ITranslateDbObject);
	}
}
