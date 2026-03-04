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

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { MatMcpError } from "../types.js";

export interface LauncherOptions {
  matLauncher?: string;
  matHome?: string;
}

export function resolveMatLauncher(options: LauncherOptions): string {
  if (options.matLauncher) {
    const absolute = path.resolve(options.matLauncher);
    try {
      return fs.realpathSync(absolute);
    } catch {
      throw new MatMcpError({
        category: "MAT_NOT_FOUND",
        message: `MAT launcher not found: ${absolute}`,
        hint: "Set MAT_LAUNCHER to a valid org.eclipse.equinox.launcher_*.jar path.",
      });
    }
  }

  if (!options.matHome) {
    throw new MatMcpError({
      category: "MAT_NOT_FOUND",
      message: "MAT launcher is not configured.",
      hint: "Set MAT_LAUNCHER or MAT_HOME before starting the server.",
    });
  }

  const pluginDir = path.join(path.resolve(options.matHome), "plugins");
  if (!fs.existsSync(pluginDir) || !fs.statSync(pluginDir).isDirectory()) {
    throw new MatMcpError({
      category: "MAT_NOT_FOUND",
      message: `MAT plugins directory missing: ${pluginDir}`,
      hint: "Verify MAT_HOME points to the Eclipse MAT installation root.",
    });
  }

  const launcherCandidate = fs
    .readdirSync(pluginDir)
    .filter((name) => /^org\.eclipse\.equinox\.launcher_.*\.jar$/.test(name))
    .sort()
    .at(-1);

  if (!launcherCandidate) {
    throw new MatMcpError({
      category: "MAT_NOT_FOUND",
      message: `No launcher jar found in: ${pluginDir}`,
      hint: "Install Eclipse MAT or configure MAT_LAUNCHER explicitly.",
    });
  }

  return path.join(pluginDir, launcherCandidate);
}

export function detectJavaVersion(javaPath: string): string {
  const result = spawnSync(javaPath, ["-version"], {
    encoding: "utf8",
    timeout: 10_000,
  });

  if (result.error) {
    throw new MatMcpError({
      category: "MAT_NOT_FOUND",
      message: `Failed to run Java: ${result.error.message}`,
      hint: "Set JAVA_PATH to a valid java executable.",
    });
  }

  if (result.status !== 0) {
    throw new MatMcpError({
      category: "MAT_NOT_FOUND",
      message: "Java runtime is unavailable.",
      hint: "Install Java and ensure JAVA_PATH points to the java binary.",
      stdoutTail: result.stdout ?? "",
      stderrTail: result.stderr ?? "",
      exitCode: result.status,
    });
  }

  const versionLine = `${result.stderr ?? ""}\n${result.stdout ?? ""}`
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return versionLine ?? "unknown";
}