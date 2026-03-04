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
import { normalizeOqlInput, MAT_OQL_SPEC } from "../src/mat/oqlSpec.js";
import { MatMcpError } from "../src/types.js";

test("normalizeOqlInput strips outer double quotes", () => {
  const normalized = normalizeOqlInput('"SELECT p FROM INSTANCEOF com.example.Topic p"');
  assert.equal(normalized, "SELECT p FROM INSTANCEOF com.example.Topic p");
});

test("normalizeOqlInput strips outer single quotes", () => {
  const normalized = normalizeOqlInput("'SELECT p.topic FROM OBJECTS 0x123 p'");
  assert.equal(normalized, "SELECT p.topic FROM OBJECTS 0x123 p");
});

test("normalizeOqlInput rejects empty query", () => {
  assert.throws(
    () => normalizeOqlInput('   ""   '),
    (error: unknown) => error instanceof MatMcpError && error.category === "INVALID_QUERY",
  );
});

test("MAT_OQL_SPEC exposes parser mode guidance", () => {
  assert.ok(MAT_OQL_SPEC.parser_mode.includes("parse-application"));
  assert.ok(MAT_OQL_SPEC.supported_patterns.length >= 3);
});