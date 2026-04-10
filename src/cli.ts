#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createProject } from "./generator";
import type { PackageSelections } from "./templates.js";

type CliOptions = {
  name: string;
  targetDir?: string;
  force: boolean;
  interactive: boolean;
  selectedPackages: Partial<PackageSelections>;
};

function printHelp(): void {
  const helpText = [
    "coreplate - scaffold an opinionated React app",
    "",
    "Usage:",
    "  coreplate <project-name> [--dir <path>] [--force]",
    "",
    "Options:",
    "  --dir <path>   Target directory. Defaults to ./<project-name>",
    "  --force        Allow writing into a non-empty directory",
    "  --yes          Skip prompts and install all optional packages",
    "  --no-interactive  Skip prompts and use provided flags/defaults",
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

  const name = argv[0];
  let targetDir: string | undefined;
  let force = false;
  let interactive = true;
  const selectedPackages: Partial<PackageSelections> = {};

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

  return { name, targetDir, force, interactive, selectedPackages };
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

async function main(): Promise<void> {
  try {
    const options = parseArgs(process.argv.slice(2));
    const selections = await resolvePackageSelections(options);

    console.log("\ncoreplate project setup");
    console.log(`Project name: ${options.name}`);
    printSelectionSummary(selections);

    const outputPath = await createProject({
      projectName: options.name,
      targetDirectory: options.targetDir,
      force: options.force,
      selectedPackages: selections,
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
