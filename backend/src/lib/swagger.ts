// For swagger-jsdoc, we specifically import the default export.
import swaggerJsdoc from "swagger-jsdoc";
// For swagger-ui-express, the star import is correct.
import * as swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Alpha Platform Research Agent API",
      version: "1.0.0",
      description: "API for triggering and monitoring research agents.",
    },
    servers: [{ url: "http://localhost:4000" }],
    // Define reusable schemas for your API docs. This is a best practice.
    components: {
      schemas: {
        Company: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            domain: { type: "string" },
          },
        },
        PersonWithCompany: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            fullName: { type: "string" },
            email: { type: "string", format: "email" },
            title: { type: "string" },
            company: {
              $ref: "#/components/schemas/Company", // Reference the Company schema
            },
          },
        },
      },
    },
  },
  // Path to the files containing OpenAPI definitions
  apis: ["./src/routes/*.ts"],
};

// Now this call will work correctly.
const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec);
