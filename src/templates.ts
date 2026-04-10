type TemplateMap = Record<string, string>;

export type PackageSelections = {
  axios: boolean;
  zustand: boolean;
  reactHookForm: boolean;
  tanstackQuery: boolean;
};

const DEFAULT_SELECTIONS: PackageSelections = {
  axios: true,
  zustand: true,
  reactHookForm: true,
  tanstackQuery: true,
};

export function projectFiles(projectName: string, selectedPackages?: Partial<PackageSelections>): TemplateMap {
  const selections: PackageSelections = { ...DEFAULT_SELECTIONS, ...selectedPackages };

  return {
    "package.json": appPackageJson(projectName, selections),
    ".gitignore": appGitignore(),
    "tsconfig.json": appTsconfig(),
    "vite.config.ts": appViteConfig(),
    "index.html": appIndexHtml(projectName),
    "README.md": appReadme(projectName, selections),
    "DESIGN.md": appDesign(projectName, selections),
    "CLAUDE.md": appClaude(projectName),
    ".github/copilot-instructions.md": appCopilotInstructions(),
    "skills/frontend-architecture.md": appSkillFrontendArchitecture(),
    "skills/data-fetching.md": appSkillDataFetching(),
    "src/main.tsx": appMainTsx(selections),
    "src/App.tsx": appTsx(projectName, selections),
    "src/styles.css": appCss(),
  };
}

function appPackageJson(projectName: string, selections: PackageSelections): string {
  const dependencies: Record<string, string> = {
    react: "^18.3.1",
    "react-dom": "^18.3.1",
  };

  if (selections.tanstackQuery) {
    dependencies["@tanstack/react-query"] = "^5.76.2";
  }
  if (selections.axios) {
    dependencies.axios = "^1.9.0";
  }
  if (selections.reactHookForm) {
    dependencies["react-hook-form"] = "^7.56.3";
  }
  if (selections.zustand) {
    dependencies.zustand = "^4.5.2";
  }

  return JSON.stringify(
    {
      name: projectName,
      private: true,
      version: "0.1.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc -b && vite build",
        preview: "vite preview",
      },
      dependencies,
      devDependencies: {
        "@types/react": "^18.3.11",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.4",
        typescript: "^5.8.3",
        vite: "^5.4.10",
      },
    },
    null,
    2,
  ).concat("\n");
}

function appGitignore(): string {
  return ["node_modules", "dist", ".DS_Store", "*.log", ".env"].join("\n").concat("\n");
}

function appTsconfig(): string {
  return [
    "{",
    "  \"compilerOptions\": {",
    "    \"target\": \"ES2020\",",
    "    \"module\": \"ESNext\",",
    "    \"lib\": [\"ES2020\", \"DOM\", \"DOM.Iterable\"],",
    "    \"moduleResolution\": \"Bundler\",",
    "    \"jsx\": \"react-jsx\",",
    "    \"strict\": true,",
    "    \"noEmit\": true,",
    "    \"skipLibCheck\": true",
    "  },",
    "  \"include\": [\"src\", \"vite.config.ts\"]",
    "}",
  ].join("\n").concat("\n");
}

function appViteConfig(): string {
  return [
    "import { defineConfig } from 'vite';",
    "import react from '@vitejs/plugin-react';",
    "",
    "export default defineConfig({",
    "  plugins: [react()],",
    "});",
  ].join("\n").concat("\n");
}

function appIndexHtml(projectName: string): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "  <head>",
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `    <title>${projectName}</title>`,
    "  </head>",
    "  <body>",
    '    <div id="root"></div>',
    '    <script type="module" src="/src/main.tsx"></script>',
    "  </body>",
    "</html>",
  ].join("\n").concat("\n");
}

function selectedPackageNames(selections: PackageSelections): string[] {
  const names: string[] = [];
  if (selections.tanstackQuery) {
    names.push("@tanstack/react-query");
  }
  if (selections.axios) {
    names.push("axios");
  }
  if (selections.reactHookForm) {
    names.push("react-hook-form");
  }
  if (selections.zustand) {
    names.push("zustand");
  }
  return names;
}

function appReadme(projectName: string, selections: PackageSelections): string {
  const selected = selectedPackageNames(selections);
  const packageLines = selected.length > 0 ? selected.map((name) => `- ${name}`) : ["- none (React base only)"];

  return [
    `# ${projectName}`,
    "",
    "Scaffolded with coreplate.",
    "",
    "## Included Packages",
    "",
    ...packageLines,
    "",
    "## Scripts",
    "",
    "- npm run dev",
    "- npm run build",
    "- npm run preview",
  ].join("\n").concat("\n");
}

function appDesign(projectName: string, selections: PackageSelections): string {
  const architecture: string[] = ["- UI: React + Vite"];

  if (selections.tanstackQuery) {
    architecture.push("- Remote cache: TanStack Query");
  }
  if (selections.axios) {
    architecture.push("- HTTP client: Axios");
  }
  if (selections.reactHookForm) {
    architecture.push("- Form state: React Hook Form");
  }
  if (selections.zustand) {
    architecture.push("- Client state: Zustand");
  }

  return [
    `# DESIGN - ${projectName}`,
    "",
    "## Architecture",
    "",
    ...architecture,
    "",
    "## Folder Intent",
    "",
    "- src/App.tsx: sample shell and composition point",
    "- skills/: project-specific guidance snippets for humans and AI assistants",
  ].join("\n").concat("\n");
}

function appClaude(projectName: string): string {
  return [
    `# CLAUDE - ${projectName}`,
    "",
    "This file captures implementation preferences for AI assistants.",
    "",
    "## Preferences",
    "",
    "- Prefer feature-oriented folders when app complexity grows.",
    "- Keep HTTP clients in dedicated modules.",
    "- Centralize query keys in one module.",
  ].join("\n").concat("\n");
}

function appCopilotInstructions(): string {
  return [
    "# Copilot Instructions",
    "",
    "- Keep changes small and focused.",
    "- Add tests with behavior changes.",
    "- Prefer strongly typed APIs and avoid any.",
  ].join("\n").concat("\n");
}

function appSkillFrontendArchitecture(): string {
  return [
    "# Skill: Frontend Architecture",
    "",
    "## Goal",
    "",
    "Keep feature boundaries clear and avoid cross-feature imports except through public modules.",
    "",
    "## Checklist",
    "",
    "- Feature owns its API hooks and UI composition",
    "- Shared components stay presentation-focused",
    "- State shape remains serializable",
  ].join("\n").concat("\n");
}

function appSkillDataFetching(): string {
  return [
    "# Skill: Data Fetching",
    "",
    "## Goal",
    "",
    "Use TanStack Query defaults with explicit query keys and Axios instance isolation.",
    "",
    "## Checklist",
    "",
    "- Reusable axios client",
    "- Typed request/response models",
    "- Queries and mutations colocated by feature",
  ].join("\n").concat("\n");
}

function appMainTsx(selections: PackageSelections): string {
  const lines: string[] = [
    "import React from 'react';",
    "import { createRoot } from 'react-dom/client';",
    "import { App } from './App';",
    "import './styles.css';",
    "",
  ];

  if (selections.tanstackQuery) {
    lines.splice(2, 0, "import { QueryClient, QueryClientProvider } from '@tanstack/react-query';");
    lines.push("const queryClient = new QueryClient();", "");
  }

  lines.push("const root = createRoot(document.getElementById('root') as HTMLElement);");
  lines.push("");

  if (selections.tanstackQuery) {
    lines.push(
      "root.render(",
      "  <React.StrictMode>",
      "    <QueryClientProvider client={queryClient}>",
      "      <App />",
      "    </QueryClientProvider>",
      "  </React.StrictMode>,",
      ");",
    );
  } else {
    lines.push(
      "root.render(",
      "  <React.StrictMode>",
      "    <App />",
      "  </React.StrictMode>,",
      ");",
    );
  }

  return lines.join("\n").concat("\n");
}

function appTsx(projectName: string, selections: PackageSelections): string {
  const lines: string[] = [];

  if (selections.axios) {
    lines.push("import axios from 'axios';");
  }
  if (selections.reactHookForm) {
    lines.push("import { useForm } from 'react-hook-form';");
  }
  if (selections.zustand) {
    lines.push("import { create } from 'zustand';");
  }

  if (lines.length > 0) {
    lines.push("");
  }

  if (selections.zustand) {
    lines.push(
      "type CounterStore = {",
      "  count: number;",
      "  increment: () => void;",
      "};",
      "",
      "const useCounterStore = create<CounterStore>((set) => ({",
      "  count: 0,",
      "  increment: () => set((state) => ({ count: state.count + 1 })),",
      "}));",
      "",
    );
  }

  if (selections.reactHookForm) {
    lines.push("type DemoForm = {", "  email: string;", "};", "");
  }

  if (selections.axios) {
    lines.push(
      "const http = axios.create({",
      "  baseURL: 'https://example.com/api',",
      "});",
      "",
    );
  }

  lines.push("export function App() {");

  if (selections.zustand) {
    lines.push("  const { count, increment } = useCounterStore();");
  }
  if (selections.reactHookForm) {
    lines.push("  const { register, handleSubmit } = useForm<DemoForm>();");
  }

  if (selections.reactHookForm && selections.axios) {
    lines.push(
      "",
      "  const onSubmit = handleSubmit(async (values) => {",
      "    console.log('Form values', values);",
      "    await http.get('/health').catch(() => undefined);",
      "  });",
    );
  } else if (selections.reactHookForm) {
    lines.push(
      "",
      "  const onSubmit = handleSubmit((values) => {",
      "    console.log('Form values', values);",
      "  });",
    );
  } else if (selections.axios) {
    lines.push(
      "",
      "  const pingApi = async () => {",
      "    await http.get('/health').catch(() => undefined);",
      "  };",
    );
  }

  const enabledLabels: string[] = [];
  if (selections.tanstackQuery) {
    enabledLabels.push("TanStack Query");
  }
  if (selections.axios) {
    enabledLabels.push("Axios");
  }
  if (selections.reactHookForm) {
    enabledLabels.push("React Hook Form");
  }
  if (selections.zustand) {
    enabledLabels.push("Zustand");
  }
  const stackLabel = enabledLabels.length > 0 ? enabledLabels.join(", ") : "React base";

  lines.push(
    "",
    "  return (",
    "    <main className=\"container\">",
    `      <h1>${projectName}</h1>`,
    `      <p>Starter stack: ${stackLabel}.</p>`,
  );

  if (selections.zustand) {
    lines.push(
      "",
      "      <section className=\"card\">",
      "        <h2>Zustand Demo</h2>",
      "        <p>Count: {count}</p>",
      "        <button onClick={increment}>Increment</button>",
      "      </section>",
    );
  }

  if (selections.reactHookForm) {
    lines.push(
      "",
      "      <section className=\"card\">",
      "        <h2>React Hook Form Demo</h2>",
      "        <form onSubmit={onSubmit}>",
      "          <label htmlFor=\"email\">Email</label>",
      "          <input id=\"email\" type=\"email\" {...register('email', { required: true })} />",
      "          <button type=\"submit\">Submit</button>",
      "        </form>",
      "      </section>",
    );
  }

  if (!selections.reactHookForm && selections.axios) {
    lines.push(
      "",
      "      <section className=\"card\">",
      "        <h2>Axios Demo</h2>",
      "        <p>Quickly verify outgoing HTTP setup.</p>",
      "        <button onClick={() => void pingApi()}>Ping /health</button>",
      "      </section>",
    );
  }

  if (!selections.axios && !selections.zustand && !selections.reactHookForm) {
    lines.push(
      "",
      "      <section className=\"card\">",
      "        <h2>Starter Ready</h2>",
      "        <p>Add your first feature in src/App.tsx.</p>",
      "      </section>",
    );
  }

  lines.push("    </main>", "  );", "}");

  return lines.join("\n").concat("\n");
}

function appCss(): string {
  return [
    ":root {",
    "  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;",
    "  color: #112;",
    "  background: linear-gradient(120deg, #f8fbff 0%, #f4f0ff 100%);",
    "}",
    "",
    "* {",
    "  box-sizing: border-box;",
    "}",
    "",
    "body {",
    "  margin: 0;",
    "}",
    "",
    ".container {",
    "  max-width: 860px;",
    "  margin: 0 auto;",
    "  min-height: 100vh;",
    "  padding: 3rem 1rem;",
    "}",
    "",
    ".card {",
    "  background: #fff;",
    "  border: 1px solid #dde3ef;",
    "  border-radius: 14px;",
    "  padding: 1rem;",
    "  margin-top: 1rem;",
    "}",
    "",
    "input, button {",
    "  font: inherit;",
    "  margin-top: 0.5rem;",
    "}",
    "",
    "button {",
    "  cursor: pointer;",
    "}",
  ].join("\n").concat("\n");
}
