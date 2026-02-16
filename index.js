// --------------------------------------------------
// carolines-mcp  –  A simple MCP timer server
// --------------------------------------------------
// This server exposes two tools over stdio:
//   1. start_timer  – begins tracking time for a named task
//   2. stop_timer   – stops tracking and returns elapsed seconds
//
// Timer data is persisted to ~/mcp-data/timers.json so it
// survives across calls.
// --------------------------------------------------

const fs = require("fs");
const path = require("path");
const os = require("os");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

// --- Path to the timers JSON file ---
const DATA_DIR = path.join(os.homedir(), "mcp-data");
const TIMERS_FILE = path.join(DATA_DIR, "timers.json");

// --- Helper: read the timers file (returns {} if it doesn't exist yet) ---
function readTimers() {
  try {
    const raw = fs.readFileSync(TIMERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    // File doesn't exist or is invalid – start fresh
    return {};
  }
}

// --- Helper: write the timers object back to disk ---
function writeTimers(timers) {
  // Create ~/mcp-data/ if it doesn't exist
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(TIMERS_FILE, JSON.stringify(timers, null, 2));
}

// --- Create the MCP server ---
const server = new McpServer({
  name: "carolines-mcp",
  version: "1.0.0",
});

// --------------------------------------------------
// Tool 1: start_timer
// --------------------------------------------------
// Saves the current timestamp under the given task name.
// If a timer for that task already exists it gets overwritten.
server.tool(
  "start_timer",
  "Start a timer for a named task. Saves the start time to disk.",
  { task: z.string().describe("Name of the task to time") },
  async ({ task }) => {
    const timers = readTimers();
    const now = new Date().toISOString();

    timers[task] = { startedAt: now };
    writeTimers(timers);

    return {
      content: [
        {
          type: "text",
          text: `Timer started for "${task}" at ${now}.`,
        },
      ],
    };
  }
);

// --------------------------------------------------
// Tool 2: stop_timer
// --------------------------------------------------
// Reads the stored start time, calculates elapsed seconds,
// removes the task from the JSON file, and returns the result.
server.tool(
  "stop_timer",
  "Stop a running timer and return the elapsed time in seconds.",
  { task: z.string().describe("Name of the task to stop timing") },
  async ({ task }) => {
    const timers = readTimers();

    // Check that a timer exists for this task
    if (!timers[task]) {
      return {
        content: [
          {
            type: "text",
            text: `No running timer found for "${task}".`,
          },
        ],
        isError: true,
      };
    }

    const startedAt = timers[task].startedAt;
    const stoppedAt = new Date().toISOString();
    const elapsedSeconds = Math.round(
      (new Date(stoppedAt) - new Date(startedAt)) / 1000
    );

    // Remove the task from the file
    delete timers[task];
    writeTimers(timers);

    // Return the timing result as structured JSON text
    const result = { task, startedAt, stoppedAt, elapsedSeconds };
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);

// --- Start the server using stdio transport ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server is now listening on stdin/stdout
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
