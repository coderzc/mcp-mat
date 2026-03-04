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
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadConfig } from "../src/config.js";

test("loadConfig parses defaults", () => {
  const allowed = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-mat-allow-"));
  const config = loadConfig({
    MAT_ALLOWED_ROOTS: allowed,
  });

  assert.equal(config.allowedRoots.length, 1);
  assert.equal(config.defaultXmxMb, 4096);
  assert.equal(config.defaultTimeoutSec, 1800);
  assert.equal(config.oqlMaxBytes, 16 * 1024);
  assert.equal(config.resultPreviewLines, 20);
});

test("loadConfig rejects missing MAT_ALLOWED_ROOTS", () => {
  assert.throws(() => loadConfig({}), /required/i);
});

test("loadConfig rejects non-directory allowed roots", () => {
  const filePath = path.join(os.tmpdir(), `mcp-mat-file-${Date.now()}`);
  fs.writeFileSync(filePath, "x");

  assert.throws(
    () =>
      loadConfig({
        MAT_ALLOWED_ROOTS: filePath,
      }),
    /MAT_ALLOWED_ROOTS must be a directory/i,
  );
});