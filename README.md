# MCP Server and Client

This project contains a server and client implementation for the Model Context Protocol (MCP).

## Purpose

I am learning it for personal project/hobby.

## Project Structure

```
package.json
src/
  server.ts
  data/
    users.json
```

### Files

- **`server.ts`**: The main server file.
- **`users.json`**: Contains user data.

## How to Run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

## Development

- To run the server in development mode with file watching:
  ```bash
  npm run dev
  ```

## Data

The `users.json` file contains sample user data in JSON format. Example:

```json
[
  {
    "id": 1,
    "name": "Robbie Test",
    "email": "robbie@example.com",
    "address": "Test Address",
    "phone": "123-456-7890"
  }
]
```
