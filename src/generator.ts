import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { projectFiles } from "./templates.js";
import type { PackageSelections, ProjectRuntime, ProjectStructure } from "./templates.js";

export type CreateProjectOptions = {
  projectName: string;
  targetDirectory?: string;
  force?: boolean;
  selectedPackages?: PackageSelections;
  projectStructure?: ProjectStructure;
  projectRuntime?: ProjectRuntime;
};

export async function createProject(options: CreateProjectOptions): Promise<string> {
  const force = options.force ?? false;

  if (!options.projectName || !/^[a-z0-9-]+$/i.test(options.projectName)) {
    throw new Error("projectName must be provided and use only letters, numbers, and dashes");
  }

  const outputPath = path.resolve(options.targetDirectory ?? options.projectName);
  await mkdir(outputPath, { recursive: true });

  if (!force) {
    const existing = await readdir(outputPath);
    if (existing.length > 0) {
      throw new Error(`Target directory is not empty: ${outputPath}. Use --force to continue.`);
    }
  }

  const files = projectFiles(
    options.projectName,
    options.selectedPackages,
    options.projectStructure,
    options.projectRuntime,
  );
  const entries = Object.entries(files) as Array<[string, string]>;

  await Promise.all(
    entries.map(async ([relativeFilePath, content]) => {
      const absolutePath = path.join(outputPath, relativeFilePath);
      await mkdir(path.dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, content, "utf8");
    }),
  );

  return outputPath;
}
