// Copyright 2025 Penghui Li
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ZodError } from "zod";
import { MatMcpError, type ToolResponse } from "../types.js";
import { MatService } from "../mat/service.js";
import { runMatHealthcheck } from "./matHealthcheck.js";
import { runMatIndexStatus } from "./matIndexStatus.js";
import { runMatOqlQuery } from "./matOqlQuery.js";
import { runMatOqlSpec } from "./matOqlSpec.js";
import { runMatParseReport } from "./matParseReport.js";
import { runMatRunCommand } from "./matRunCommand.js";

export async function executeTool(name: string, args: unknown, service: MatService): Promise<ToolResponse> {
  try {
    switch (name) {
      case "mat_healthcheck": {
        return await runMatHealthcheck(service, args);
      }
      case "mat_parse_report": {
        return await runMatParseReport(service, args);
      }
      case "mat_oql_query": {
        return await runMatOqlQuery(service, args);
      }
      case "mat_index_status": {
        return runMatIndexStatus(service, args);
      }
      case "mat_run_command": {
        return await runMatRunCommand(service, args);
      }
      case "mat_oql_spec": {
        return runMatOqlSpec(service, args);
      }
      default:
        return new MatMcpError({
          category: "MAT_PARSE_FAILED",
          message: `Unknown tool: ${name}`,
          hint: "Use one of: mat_healthcheck, mat_parse_report, mat_oql_query, mat_run_command, mat_index_status, mat_oql_spec.",
        }).toResponse();
    }
  } catch (error) {
    if (error instanceof MatMcpError) {
      return error.toResponse();
    }

    if (error instanceof ZodError) {
      return new MatMcpError({
        category: "MAT_PARSE_FAILED",
        message: `Invalid input: ${error.issues.map((issue) => issue.message).join("; ")}`,
        hint: "Check tool input schema and required fields.",
      }).toResponse();
    }

    return new MatMcpError({
      category: "MAT_PARSE_FAILED",
      message: error instanceof Error ? error.message : String(error),
      hint: "Unexpected error while processing tool input.",
    }).toResponse();
  }
}