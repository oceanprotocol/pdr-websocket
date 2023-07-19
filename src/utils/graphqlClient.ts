import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloError,
  ApolloQueryResult,
} from "@apollo/client/core";
import { DocumentNode } from "graphql";
import { currentConfig } from "./appconstants";
import fetch from "cross-fetch";

export type GraphQLResponse<T = any> = {
  data?: T;
  errors?: Array<{
    message: string;
  }>;
};

class GraphqlClient {
  private client: ApolloClient<any>;

  constructor(uri: string) {
    this.client = new ApolloClient({
      link: new HttpLink({ uri, fetch }),
      cache: new InMemoryCache(),
    });
  }

  async query<T = any>(
    query: DocumentNode,
    variables: { [name: string]: any } = {}
  ): Promise<ApolloQueryResult<T>> {
    try {
      const result = await this.client.query<T>({ query, variables });
      return result;
    } catch (error) {
      if (error instanceof ApolloError) {
        throw new Error(`GraphQL error ${error}`);
      }
      throw error;
    }
  }

  async queryWithRetry<T = any>(
    query: DocumentNode,
    variables: { [name: string]: any } = {},
    interval: number = 1000
  ): Promise<ApolloQueryResult<T>> {
    while (true) {
      try {
        const result = await this.query(query, variables);
        return result;
      } catch (error) {
        console.log(error)
        if (error.message.includes("ECONNREFUSED")) {
          console.log("Connection refused, retrying...");
          await new Promise((resolve) => setTimeout(resolve, interval));
        } else {
          throw error;
        }
      }
    }
  }
}

const graphqlClientInstance = new GraphqlClient(currentConfig.subgraph);

export { graphqlClientInstance, GraphqlClient };
