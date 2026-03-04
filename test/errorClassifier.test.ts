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

import assert from "node:assert/strict";
import test from "node:test";
import { classifyRunFailure } from "../src/mat/errorClassifier.js";
import type { RunResult } from "../src/types.js";

function makeRunResult(overrides: Partial<RunResult>): RunResult {
  return {
    command: "java",
    args: [],
    exitCode: 1,
    signal: null,
    timedOut: false,
    stdout: "",
    stderr: "",
    durationMs: 1000,
    ...overrides,
  };
}

test("classifyRunFailure returns MAT_TIMEOUT for timed out process", () => {
  const error = classifyRunFailure(
    makeRunResult({
      timedOut: true,
      durationMs: 12_000,
    }),
    500,
  );

  assert.equal(error.category, "MAT_TIMEOUT");
});

test("classifyRunFailure returns WRITE_PERMISSION_DENIED for permission errors", () => {
  const error = classifyRunFailure(
    makeRunResult({
      stderr: "Permission denied while creating .lock.index",
    }),
    500,
  );

  assert.equal(error.category, "WRITE_PERMISSION_DENIED");
});

test("classifyRunFailure returns INVALID_QUERY for OQL syntax issues", () => {
  const error = classifyRunFailure(
    makeRunResult({
      stderr: "OQL parse error: syntax error near token",
    }),
    500,
  );

  assert.equal(error.category, "INVALID_QUERY");
});

test("classifyRunFailure returns MAT_PARSE_FAILED by default", () => {
  const error = classifyRunFailure(
    makeRunResult({
      stderr: "unexpected failure",
    }),
    500,
  );

  assert.equal(error.category, "MAT_PARSE_FAILED");
});