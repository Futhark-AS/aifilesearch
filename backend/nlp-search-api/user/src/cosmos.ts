import { CosmosClient, ErrorResponse, ItemResponse } from "@azure/cosmos";
import { log } from "console";

type CosmosResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorResponse };

export class CosmosWrapper {
  private container: any;

  constructor({
    cosmosEndpoint,
    cosmosKey,
    dbName,
    containerName,
  }: {
    cosmosEndpoint: string;
    cosmosKey: string;
    dbName: string;
    containerName: string;
  }) {
    const client = new CosmosClient({
      endpoint: cosmosEndpoint,
      key: cosmosKey,
    });
    const db = client.database(dbName);
    this.container = db.container(containerName);
  }

  // Returns null if not found
  async readById(id: string): Promise<CosmosResponse<any | null>> {
    try {
      const response = await this.container.item(id, id).read();
      if(response.statusCode == 404) {
        return { success: true, data: null };
      }

      return { success: true, data: response.resource }
    } catch (error) {
      return { success: false, error }
    }
  }

  async updateById(id: string, body: any): Promise<CosmosResponse<any>> {
    try {
      const response = await this.container.item(id, id).replace(body);
      return { success: true, data: response.resource };
    } catch (error) {
      return { success: false, error };
    }
  }

  async insert(body: any): Promise<CosmosResponse<any>> {
    try {
      const response = await this.container.items.create(body);
      return { success: true, data: response.resource };
    } catch (error) {
      return { success: false, error };
    }
  }

  async deleteById(id: string): Promise<CosmosResponse<any>> {
    try {
      const response = await this.container.item(id, id).delete();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error };
    }
  }
}