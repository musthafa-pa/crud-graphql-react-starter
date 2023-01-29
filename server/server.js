const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const { createServer } = require("http");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { expressMiddleware } = require("@apollo/server/express4");
const { PubSub } = require("graphql-subscriptions");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "testdb",
  password: "user123$",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const pubsub = new PubSub();

async function query(query) {
  const result = await pool.query(query);
  return result[0];
}

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Course {
    id: ID!
    title: String
    description: String
    price: Int
    total_students: Int
    published: Boolean
    createdAt: String
    updatedAt: String
  }
  type Query {
    hello: String
    getCourses: [Course]
    getCourseById(id: ID!): Course
  }
  type Mutation {
    createCourses(
      title: String
      description: String
      price: Int
      total_students: Int
      published: Boolean
      createdAt: String
      updatedAt: String
    ): Course
    deleteCourses(id: ID!): String!
  }
  type Subscription {
    courseCreated: [Course]
    courseDeleted: [Course]
  }
`;

async function getCourse(id) {
  if (id) {
    let prod = await query(`SELECT * FROM courses WHERE id =${id}`);
    return prod;
  } else {
    let prod = await query(`SELECT * FROM courses`);
    return prod;
  }
}

async function createCourse(args) {
  try {
    let insertQuery = `INSERT INTO courses(title, description, price, total_students, published, createdAt, updatedAt) VALUES("${args.title}", "${args.description}", ${args.price}, ${args.total_students}, ${args.published}, "${args.createdAt}", "${args.updatedAt}")`;
    let result = await query(insertQuery);
    let inserted = await getCourse(result.insertId);
    return inserted[0];
  } catch (error) {
    return new Error("Failed to create!" + error);
  }
}

async function deleteCourse(id) {
  try {
    let deleteQuery = `DELETE FROM courses WHERE id=${id}`;
    let result = await query(deleteQuery);
    console.log(result);
    return result;
  } catch (error) {
    throw Error("Failed to delete!" + error);
  }
}

const app = express();
app.use(cors());
const httpServer = createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => "Welcome to graphql!",
    getCourses: async () => {
      let products = await getCourse();
      return products;
    },
    async getCourseById(parent, args, contextValue, info) {
      let prod = await getCourse(args.id);
      return prod[0];
    },
  },
  Mutation: {
    createCourses: async (parent, args, contextValue, info) => {
      console.log(args);
      let value = await createCourse(args);
      return value;
    },
    deleteCourses: async (parent, args, contextValue, info) => {
      let result = await deleteCourse(args.id);
      return result.affectedRows === 1 ? `Deleted` : `Delete Failed`;
    },
  },
};

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

server.start().then((res) => {
  server.applyMiddleware({ app, path: "/" });
  app.use("/graphql", cors(), bodyParser.json(), expressMiddleware(server));
  const PORT = 4000;
  // Now that our HTTP server is fully set up, we can listen to it.
  httpServer.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}/graphql`);
  });
});
