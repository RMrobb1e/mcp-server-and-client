import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import fs from "node:fs/promises";

const server = new McpServer({
  name: "Test",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  },
});

server.resource(
  "users",
  "users://all",
  {
    description: "All users in the system",
    title: "Users",
    mimeType: "application/json",
  },
  async (uri) => {
    const users = await import("./data/users.json", {
      with: { type: "json" },
      assert: { type: "json" },
    }).then((d) => d.default);

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(users, null, 2),
          mimeType: "application/json",
        },
      ],
    };
  },
);

server.resource(
  "user-details",
  new ResourceTemplate("users://{userId}/profile", {
    list: undefined,
  }),
  {
    description: "Get a user's profile by ID",
    title: "User Details",
    mimeType: "application/json",
  },
  async (uri, { userId }) => {
    const users = await import("./data/users.json", {
      with: { type: "json" },
      assert: { type: "json" },
    }).then((d) => d.default);

    const user = users.find((u) => u.id === parseInt(userId as string));

    if (!user) {
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({ error: "User not found" }, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    }

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(user, null, 2),
          mimeType: "application/json",
        },
      ],
    };
  },
);

server.tool(
  "create-user",
  "Create a new user in the database",
  {
    name: z.string(),
    email: z.string().email(),
    address: z.string(),
    phone: z.string(),
  },
  {
    title: "Create User",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const id = await createUser(params);

      return {
        content: [
          {
            type: "text",
            text: `User created with ID: ${id}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to save user ${
              error instanceof Error ? error.message : "unknown error"
            }`,
          },
        ],
      };
    }
  },
);

server.prompt(
  "generate-fake-user",
  "Generate a fake user profile",
  {
    name: z.string(),
  },
  ({ name }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a fake user profile for ${name}. The profile should include a name, email, address, and phone number.`,
          },
        },
      ],
    };
  },
);

async function createUser(user: {
  name: string;
  email: string;
  address: string;
  phone: string;
}): Promise<number> {
  const users = await import("./data/users.json", {
    with: { type: "json" },
    assert: { type: "json" },
  }).then((d) => d.default);

  const id = users.length + 1;

  users.push({ id, ...user });
  await fs.writeFile("./src/data/users.json", JSON.stringify(users, null, 2));

  return id;
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
