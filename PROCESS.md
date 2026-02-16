What I Built: For this assignment, I built a simple MCP server that adds timer functionality to Claude Code. I chose the Project Timer idea because it required two tools (start_timer and stop_timer) and did not rely on external APIs. The server stores timer data in a JSON file (~/mcp-data/timers.json) so that timing persists between calls. I focused on keeping the implementation simple and readable.

How Claude Code Helped: Claude Code generated the initial package.json and index.js files based on a structured prompt. It correctly implemented stdio transport and structured tool definitions. When setting up the environment, I used Claude to verify the MCP handshake and confirm the server responded properly. Claude also helped ensure file creation logic handled missing directories.

Debugging Journey: The biggest challenge was environment configuration. I initially had issues with the claude command not being recognized due to shell and PATH inconsistencies between bash and zsh. After updating the PATH and verifying the shell configuration, the CLI worked correctly. Another issue was that the MCP server did not appear inside Claude until I restarted the Claude session.

How MCP Works: MCP allows Claude Code to connect to external tools over stdio. When Claude starts, it reads the local configuration file and launches the server. The server exposes tools with defined schemas, and Claude sends structured JSON requests. The server processes the request and returns structured responses.

What I’d Do Differently: If I rebuilt this project, I would add better error handling and possibly support multiple concurrent timers per task category.
