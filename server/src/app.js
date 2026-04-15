import express from "express";
import { ApolloServer } from "apollo-server-express";
import { permissions } from "./graphql/permissions.js";
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "./graphql/schema/index.js";
import resolvers from "./graphql/resolvers/index.js";
import { context } from "./graphql/context.js";


const executeSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
});
const schemaWithMiddleware = applyMiddleware(executeSchema, permissions);


export const createApp = async () => {
    const app = express();

    const server = new ApolloServer({
        schema: schemaWithMiddleware,
        context,
    });

    await server.start();
    server.applyMiddleware({ app });

    return app;
};