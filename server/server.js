const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "testdb",
  password: "user123$",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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

const app = express();

app.listen(4000, () => {
  console.log(`App running at 4000`);
});
