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
import { buildGenericCommand, buildOqlCommand, buildParseReportCommand, formatOqlForMatCommand } from "../src/mat/commandBuilder.js";

const base = {
  javaPath: "java",
  launcherPath: "/mat/launcher.jar",
  heapPath: "/heaps/a.hprof",
  configDir: "/tmp/mat-config",
  dataDir: "/tmp/mat-workspace",
  xmxMb: 4096,
  timeoutSec: 600,
};

test("buildParseReportCommand includes options and report id", () => {
  const cmd = buildParseReportCommand(base, "org.eclipse.mat.api:suspects", {
    format: "txt",
    limit: 100,
  });

  assert.equal(cmd.command, "java");
  assert.equal(cmd.timeoutSec, 600);
  assert.equal(cmd.args.at(-1), "org.eclipse.mat.api:suspects");
  assert.ok(cmd.args.includes("-format=txt"));
  assert.ok(cmd.args.includes("-limit=100"));
});

test("buildOqlCommand encodes command and output flags", () => {
  const cmd = buildOqlCommand(base, {
    oql: "select * from java.lang.String",
    format: "txt",
    unzip: true,
    limit: 10,
  });

  assert.equal(cmd.args.at(-1), "org.eclipse.mat.api:query");
  assert.ok(cmd.args.includes("-format=txt"));
  assert.ok(cmd.args.includes("-unzip"));
  assert.ok(cmd.args.includes("-limit=10"));
  assert.ok(cmd.args.includes('-command=oql "select * from java.lang.String"'));
});

test("formatOqlForMatCommand escapes nested quotes", () => {
  const formatted = formatOqlForMatCommand('SELECT p FROM INSTANCEOF "com.example.MyClass" p');
  assert.equal(formatted, '"SELECT p FROM INSTANCEOF \\"com.example.MyClass\\" p"');
});

test("buildGenericCommand with command name only", () => {
  const cmd = buildGenericCommand(base, {
    commandName: "histogram",
    format: "txt",
    unzip: true,
  });

  assert.equal(cmd.command, "java");
  assert.equal(cmd.args.at(-1), "org.eclipse.mat.api:query");
  assert.ok(cmd.args.includes("-command=histogram"));
  assert.ok(cmd.args.includes("-format=txt"));
  assert.ok(cmd.args.includes("-unzip"));
});

test("buildGenericCommand with command args", () => {
  const cmd = buildGenericCommand(base, {
    commandName: "path2gc",
    commandArgs: "0x12345678",
    format: "html",
    unzip: false,
    limit: 50,
  });

  assert.equal(cmd.args.at(-1), "org.eclipse.mat.api:query");
  assert.ok(cmd.args.includes("-command=path2gc 0x12345678"));
  assert.ok(cmd.args.includes("-format=html"));
  assert.ok(cmd.args.includes("-limit=50"));
  assert.ok(!cmd.args.includes("-unzip"));
});

test("buildGenericCommand omits limit when not provided", () => {
  const cmd = buildGenericCommand(base, {
    commandName: "thread_overview",
    format: "csv",
    unzip: true,
  });

  assert.ok(!cmd.args.some((a) => a.startsWith("-limit=")));
});