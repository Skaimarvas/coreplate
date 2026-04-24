#!/usr/bin/env node
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createProject } from "./generator";
import type { PackageSelections, ProjectRuntime, ProjectStructure, SrcFolderSelections } from "./templates.js";
import { SRC_FOLDER_KEYS, defaultSrcFolders } from "./templates.js";

const DEFAULT_PROJECT_STRUCTURE: ProjectStructure = "component-based";
const DEFAULT_PROJECT_RUNTIME: ProjectRuntime = "web";

type CliOptions = {
  name: string;
  targetDir?: string;
  force: boolean;
  interactive: boolean;
  selectedPackages: Partial<PackageSelections>;
  projectStructure?: ProjectStructure;
  projectRuntime?: ProjectRuntime;
};

function printHelp(): void {
  const helpText = [
    "coreplate - scaffold an opinionated React app",
    "",
    "Usage:",
    "  coreplate <project-name> [--dir <path>] [--force]",
    "  coreplate .                         Scaffold into the current directory",
    "",
    "Options:",
    "  --dir <path>   Target directory. Defaults to ./<project-name>",
    "  --force        Allow writing into a non-empty directory",
    "  --yes          Skip prompts and install all optional packages",
    "  --no-interactive  Skip prompts and use provided flags/defaults",
    "  --runtime <web|expo>",
    "  --expo         Shortcut for --runtime expo",
    "  --structure <component|feature|atomic>",
    "  --no-axios | --no-zustand | --no-react-hook-form | --no-tanstack-query",
    "  --help         Show this help",
  ].join("\n");

  console.log(helpText);
}

function parseArgs(argv: string[]): CliOptions {
  if (argv.length === 0 || argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  const isDot = argv[0] === ".";
  const name = isDot ? path.basename(process.cwd()) : argv[0];
  let targetDir: string | undefined = isDot ? "." : undefined;
  let force = false;
  let interactive = true;
  const selectedPackages: Partial<PackageSelections> = {};
  let projectStructure: ProjectStructure | undefined;
  let projectRuntime: ProjectRuntime | undefined;

  for (let i = 1; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === "--force") {
      force = true;
      continue;
    }

    if (token === "--yes") {
      interactive = false;
      selectedPackages.axios = true;
      selectedPackages.zustand = true;
      selectedPackages.reactHookForm = true;
      selectedPackages.tanstackQuery = true;
      continue;
    }

    if (token === "--no-interactive") {
      interactive = false;
      continue;
    }

    if (token === "--structure") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --structure");
      }
      projectStructure = parseProjectStructure(value);
      i += 1;
      continue;
    }

    if (token === "--runtime") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --runtime");
      }
      projectRuntime = parseProjectRuntime(value);
      i += 1;
      continue;
    }

    if (token === "--expo") {
      projectRuntime = "expo";
      continue;
    }

    if (token === "--axios") {
      selectedPackages.axios = true;
      continue;
    }

    if (token === "--no-axios") {
      selectedPackages.axios = false;
      interactive = false;
      continue;
    }

    if (token === "--zustand") {
      selectedPackages.zustand = true;
      continue;
    }

    if (token === "--no-zustand") {
      selectedPackages.zustand = false;
      interactive = false;
      continue;
    }

    if (token === "--react-hook-form") {
      selectedPackages.reactHookForm = true;
      continue;
    }

    if (token === "--no-react-hook-form") {
      selectedPackages.reactHookForm = false;
      interactive = false;
      continue;
    }

    if (token === "--tanstack-query") {
      selectedPackages.tanstackQuery = true;
      continue;
    }

    if (token === "--no-tanstack-query") {
      selectedPackages.tanstackQuery = false;
      interactive = false;
      continue;
    }

    if (token === "--dir") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --dir");
      }
      targetDir = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown option: ${token}`);
  }

  return { name, targetDir, force, interactive, selectedPackages, projectStructure, projectRuntime };
}

function parseProjectRuntime(raw: string): ProjectRuntime {
  switch (raw.toLowerCase()) {
    case "web":
      return "web";
    case "expo":
    case "react-native":
      return "expo";
    default:
      throw new Error("Invalid --runtime value. Use web|expo");
  }
}

function projectRuntimeLabel(value: ProjectRuntime): string {
  switch (value) {
    case "web":
      return "Web (React + Vite)";
    case "expo":
      return "React Native (Expo)";
  }
}

function parseProjectStructure(raw: string): ProjectStructure {
  switch (raw.toLowerCase()) {
    case "component":
    case "component-based":
      return "component-based";
    case "feature":
    case "feature-based":
      return "feature-based";
    case "atomic":
    case "atomic-based":
      return "atomic-based";
    default:
      throw new Error("Invalid --structure value. Use component|feature|atomic");
  }
}

function projectStructureLabel(value: ProjectStructure): string {
  switch (value) {
    case "component-based":
      return "Component-based";
    case "feature-based":
      return "Feature-based";
    case "atomic-based":
      return "Atomic-based";
  }
}

function packageLabel(key: keyof PackageSelections): string {
  switch (key) {
    case "axios":
      return "Axios";
    case "zustand":
      return "Zustand";
    case "reactHookForm":
      return "React Hook Form";
    case "tanstackQuery":
      return "TanStack Query";
    default:
      return key;
  }
}

async function askYesNo(question: string, defaultYes: boolean): Promise<boolean> {
  const rl = createInterface({ input, output });
  const suffix = defaultYes ? " (Y/n): " : " (y/N): ";
  try {
    const answer = (await rl.question(`${question}${suffix}`)).trim().toLowerCase();
    if (answer.length === 0) {
      return defaultYes;
    }
    if (answer === "y" || answer === "yes") {
      return true;
    }
    if (answer === "n" || answer === "no") {
      return false;
    }
    return defaultYes;
  } finally {
    rl.close();
  }
}

async function askProjectStructure(defaultValue: ProjectStructure): Promise<ProjectStructure> {
  const rl = createInterface({ input, output });
  const prompt = [
    "Choose project structure:",
    "  1) component-based",
    "  2) feature-based",
    "  3) atomic-based",
    `Enter choice [1-3] (default: ${defaultValue}): `,
  ].join("\n");

  try {
    const answer = (await rl.question(prompt)).trim().toLowerCase();
    if (answer.length === 0) {
      return defaultValue;
    }
    if (answer === "1" || answer === "component" || answer === "component-based") {
      return "component-based";
    }
    if (answer === "2" || answer === "feature" || answer === "feature-based") {
      return "feature-based";
    }
    if (answer === "3" || answer === "atomic" || answer === "atomic-based") {
      return "atomic-based";
    }
    return defaultValue;
  } finally {
    rl.close();
  }
}

async function askProjectRuntime(defaultValue: ProjectRuntime): Promise<ProjectRuntime> {
  const rl = createInterface({ input, output });
  const prompt = [
    "Choose project runtime:",
    "  1) web (React + Vite)",
    "  2) expo (React Native)",
    `Enter choice [1-2] (default: ${defaultValue}): `,
  ].join("\n");

  try {
    const answer = (await rl.question(prompt)).trim().toLowerCase();
    if (answer.length === 0) {
      return defaultValue;
    }
    if (answer === "1" || answer === "web") {
      return "web";
    }
    if (answer === "2" || answer === "expo" || answer === "react-native") {
      return "expo";
    }
    return defaultValue;
  } finally {
    rl.close();
  }
}

async function resolvePackageSelections(options: CliOptions): Promise<PackageSelections> {
  const defaults: PackageSelections = {
    axios: true,
    zustand: true,
    reactHookForm: true,
    tanstackQuery: true,
  };

  const result: PackageSelections = { ...defaults, ...options.selectedPackages };
  const isInteractive = options.interactive && process.stdin.isTTY;

  if (!isInteractive) {
    return result;
  }

  const keys: Array<keyof PackageSelections> = [
    "axios",
    "zustand",
    "reactHookForm",
    "tanstackQuery",
  ];

  for (const key of keys) {
    if (key in options.selectedPackages) {
      continue;
    }
    result[key] = await askYesNo(`Install ${packageLabel(key)}?`, true);
  }

  return result;
}

function printSelectionSummary(selections: PackageSelections): void {
  console.log("\nSelected optional packages:");
  console.log(`  Axios: ${selections.axios ? "yes" : "no"}`);
  console.log(`  Zustand: ${selections.zustand ? "yes" : "no"}`);
  console.log(`  React Hook Form: ${selections.reactHookForm ? "yes" : "no"}`);
  console.log(`  TanStack Query: ${selections.tanstackQuery ? "yes" : "no"}`);
}

async function resolveProjectStructure(options: CliOptions): Promise<ProjectStructure> {
  if (options.projectStructure) {
    return options.projectStructure;
  }

  const isInteractive = options.interactive && process.stdin.isTTY;
  if (!isInteractive) {
    return DEFAULT_PROJECT_STRUCTURE;
  }

  return askProjectStructure(DEFAULT_PROJECT_STRUCTURE);
}

async function resolveProjectRuntime(options: CliOptions): Promise<ProjectRuntime> {
  if (options.projectRuntime) {
    return options.projectRuntime;
  }

  const isInteractive = options.interactive && process.stdin.isTTY;
  if (!isInteractive) {
    return DEFAULT_PROJECT_RUNTIME;
  }

  return askProjectRuntime(DEFAULT_PROJECT_RUNTIME);
}

async function askSrcFolders(
  runtime: ProjectRuntime,
  defaults: SrcFolderSelections,
): Promise<SrcFolderSelections> {
  const rl = createInterface({ input, output });
  const routeFolder = runtime === "expo" ? "screens" : "pages";

  const folderLabel = (key: keyof SrcFolderSelections): string =>
    key === "pages" ? routeFolder : key;

  const defaultIndices = SRC_FOLDER_KEYS
    .map((k, i) => (defaults[k] ? String(i + 1) : null))
    .filter(Boolean)
    .join(",");

  const listLines = SRC_FOLDER_KEYS.map((k, i) => `  ${i + 1}) ${folderLabel(k)}`);

  const prompt = [
    "Choose src/ subdirectories to create:",
    ...listLines,
    `Enter choices [1-${SRC_FOLDER_KEYS.length}] comma-separated (default: ${defaultIndices}): `,
  ].join("\n");

  try {
    const answer = (await rl.question(prompt)).trim();
    if (answer.length === 0) {
      return defaults;
    }

    const chosen = new Set(
      answer.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => n >= 1 && n <= SRC_FOLDER_KEYS.length),
    );

    const result: SrcFolderSelections = {
      components: false, hooks: false, utils: false, types: false,
      services: false, store: false, pages: false, layouts: false,
      lib: false, constants: false, context: false, assets: false,
    };
    SRC_FOLDER_KEYS.forEach((key, i) => {
      result[key] = chosen.has(i + 1);
    });
    return result;
  } finally {
    rl.close();
  }
}

async function resolveSrcFolders(
  options: CliOptions,
  projectStructure: ProjectStructure,
  projectRuntime: ProjectRuntime,
): Promise<SrcFolderSelections> {
  const defaults = defaultSrcFolders(projectStructure);

  if (projectStructure === "feature-based") {
    return defaults;
  }

  const isInteractive = options.interactive && process.stdin.isTTY;
  if (!isInteractive) {
    return defaults;
  }

  return askSrcFolders(projectRuntime, defaults);
}

function printSrcFolderSummary(srcFolders: SrcFolderSelections, runtime: ProjectRuntime): void {
  const routeFolder = runtime === "expo" ? "screens" : "pages";
  const active = SRC_FOLDER_KEYS
    .filter((k) => srcFolders[k])
    .map((k) => (k === "pages" ? routeFolder : k));
  console.log(`\nSrc folders: ${active.length > 0 ? active.join(", ") : "none"}`);
}

async function main(): Promise<void> {
  try {
    const options = parseArgs(process.argv.slice(2));
    const selections = await resolvePackageSelections(options);
    const projectRuntime = await resolveProjectRuntime(options);
    const projectStructure = await resolveProjectStructure(options);
    const srcFolders = await resolveSrcFolders(options, projectStructure, projectRuntime);

    console.log("\ncoreplate project setup");
    console.log(`Project name: ${options.name}`);
    console.log(`Project runtime: ${projectRuntimeLabel(projectRuntime)}`);
    console.log(`Project structure: ${projectStructureLabel(projectStructure)}`);
    printSelectionSummary(selections);
    printSrcFolderSummary(srcFolders, projectRuntime);

    const outputPath = await createProject({
      projectName: options.name,
      targetDirectory: options.targetDir,
      force: options.force,
      selectedPackages: selections,
      projectStructure,
      projectRuntime,
      srcFolders,
    });

    console.log(`Project created at ${outputPath}`);
    console.log("Next steps:");
    console.log(`  cd ${outputPath}`);
    console.log("  npm install");
    console.log("  npm run dev");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`coreplate failed: ${message}`);
    process.exit(1);
  }
}

void main();
