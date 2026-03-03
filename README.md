# mcp-mat

Headless MCP server for Eclipse MAT using direct `java -jar org.eclipse.equinox.launcher_*.jar` execution.

## Features

- `mat_healthcheck`
- `mat_parse_report`
- `mat_oql_query`
- `mat_index_status`
- `mat_oql_spec`

## OQL mode notes

- This server normalizes client OQL input and wraps it for MAT parse-app command mode.
- You can send OQL with or without outer quotes.
- For class ranking and top consumers, prefer `mat_parse_report` with `org.eclipse.mat.api:overview` and parse `Class_Histogram*.txt`.
- For object inspection, use simple field-level OQL patterns (`INSTANCEOF`, `OBJECTS 0x...`).

## Environment

Required:

- `MAT_ALLOWED_ROOTS`: comma-separated absolute directories where heap files are allowed.

Optional:

- `MAT_HOME`
- `MAT_LAUNCHER`
- `JAVA_PATH` (default `java`)
- `MAT_XMX_MB` (default `4096`)
- `MAT_TIMEOUT_SEC` (default `1800`)
- `MAT_CONFIG_DIR` (default `/tmp/mat-config`)
- `MAT_DATA_DIR` (default `/tmp/mat-workspace`)
- `MAT_DEBUG` (default `false`)
- `MAT_DEBUG_LOG_DIR` (default `/tmp/mcp-mat-logs`)
- `MAT_PRIVACY_MODE` (default `false`)
- `MAT_OQL_MAX_BYTES` (default `16384`)
- `MAT_RESULT_PREVIEW_LINES` (default `20`)
- `MAT_STDIO_TAIL_CHARS` (default `4000`)

## Run

```bash
npm install
npm run build
MAT_ALLOWED_ROOTS=/absolute/heap/dir MAT_HOME=/path/to/mat node dist/src/server.js
```

## Test

```bash
npm test
```

## Install In Codex

Build first:

```bash
cd /Users/lipenghui/Github/mcp-mat
npm install
npm run build
```

Add MCP server to Codex:

```bash
codex mcp add \
  --env MAT_ALLOWED_ROOTS=/ABS/PATH/TO/HEAP_DUMPS \
  --env MAT_HOME=/Applications/MemoryAnalyzer.app/Contents/Eclipse \
  mat \
  node /Users/lipenghui/Github/mcp-mat/dist/src/server.js
```

Verify:

```bash
codex mcp list
codex mcp get mat --json
```

If you need to update the entry:

```bash
codex mcp remove mat
# then run codex mcp add ... again
```

Equivalent `~/.codex/config.toml` entry:

```toml
[mcp_servers.mat]
command = "node"
args = ["/Users/lipenghui/Github/mcp-mat/dist/src/server.js"]

[mcp_servers.mat.env]
MAT_ALLOWED_ROOTS = "/ABS/PATH/TO/HEAP_DUMPS"
MAT_HOME = "/Applications/MemoryAnalyzer.app/Contents/Eclipse"
```
