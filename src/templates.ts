type TemplateMap = Record<string, string>;

export type PackageSelections = {
  axios: boolean;
  zustand: boolean;
  reactHookForm: boolean;
  tanstackQuery: boolean;
};

export type ProjectStructure = "component-based" | "feature-based" | "atomic-based";
export type ProjectRuntime = "web" | "expo";

export type SrcFolderSelections = {
  components: boolean;
  hooks: boolean;
  utils: boolean;
  types: boolean;
  services: boolean;
  store: boolean;
  pages: boolean;
  layouts: boolean;
  lib: boolean;
  constants: boolean;
  context: boolean;
  assets: boolean;
};

export const SRC_FOLDER_KEYS: ReadonlyArray<keyof SrcFolderSelections> = [
  "components", "hooks", "utils", "types", "services",
  "store", "pages", "layouts", "lib", "constants", "context", "assets",
];

export function defaultSrcFolders(structure: ProjectStructure): SrcFolderSelections {
  if (structure === "atomic-based") {
    return {
      components: true, hooks: true, utils: true, types: true,
      services: true, store: true, pages: true, layouts: false,
      lib: false, constants: false, context: false, assets: false,
    };
  }
  if (structure === "feature-based") {
    return {
      components: false, hooks: false, utils: false, types: false,
      services: false, store: false, pages: true, layouts: false,
      lib: false, constants: false, context: false, assets: false,
    };
  }
  return {
    components: true, hooks: true, utils: true, types: true,
    services: true, store: true, pages: true, layouts: true,
    lib: false, constants: false, context: false, assets: false,
  };
}

const DEFAULT_SELECTIONS: PackageSelections = {
  axios: true,
  zustand: true,
  reactHookForm: true,
  tanstackQuery: true,
};

const DEFAULT_PROJECT_STRUCTURE: ProjectStructure = "component-based";
const DEFAULT_PROJECT_RUNTIME: ProjectRuntime = "web";

export function projectFiles(
  projectName: string,
  selectedPackages?: Partial<PackageSelections>,
  projectStructure?: ProjectStructure,
  projectRuntime?: ProjectRuntime,
  srcFolders?: Partial<SrcFolderSelections>,
  useSrc?: boolean,
): TemplateMap {
  const selections: PackageSelections = { ...DEFAULT_SELECTIONS, ...selectedPackages };
  const resolvedStructure = projectStructure ?? DEFAULT_PROJECT_STRUCTURE;
  const resolvedRuntime = projectRuntime ?? DEFAULT_PROJECT_RUNTIME;

  const runtimeFiles: TemplateMap = resolvedRuntime === "expo"
    ? {
        "package.json": expoPackageJson(projectName, selections),
        "app.json": expoAppJson(projectName),
        "babel.config.js": expoBabelConfig(),
        "tsconfig.json": expoTsconfig(),
        "App.tsx": expoAppTsx(projectName, selections),
        "src/screens/HomeScreen.tsx": expoHomeScreen(projectName, selections),
      }
    : {
        "package.json": appPackageJson(projectName, selections),
        "tsconfig.json": appTsconfig(),
        "vite.config.ts": appViteConfig(),
        "index.html": appIndexHtml(projectName),
        "src/main.tsx": appMainTsx(selections),
        "src/App.tsx": appTsx(projectName, selections),
        "src/styles.css": appCss(),
      };

  return {
    ...runtimeFiles,
    ...(selections.axios ? { "src/services/api.ts": axiosApiTs(resolvedRuntime) } : {}),
    ".gitignore": appGitignore(),
    "README.md": appReadme(projectName, selections, resolvedStructure, resolvedRuntime),
    "DESIGN.md": appDesign(projectName, selections, resolvedStructure, resolvedRuntime),
    "CLAUDE.md": appClaude(projectName),
    ".github/copilot-instructions.md": appCopilotInstructions(),
    "skills/frontend-architecture.md": appSkillFrontendArchitecture(),
    "skills/data-fetching.md": appSkillDataFetching(),
    ...structureDraftFiles(resolvedStructure, resolvedRuntime, {
      ...defaultSrcFolders(resolvedStructure),
      ...srcFolders,
    }, useSrc ?? true),
  };
}

function structureDraftFiles(
  projectStructure: ProjectStructure,
  runtime: ProjectRuntime,
  srcFolders: SrcFolderSelections,
  useSrc: boolean,
): TemplateMap {
  const base = useSrc ? "src/" : "";
  const routeFolder = runtime === "expo" ? "screens" : "pages";
  const files: TemplateMap = {};

  if (projectStructure === "feature-based") {
    if (srcFolders.pages) files[`${base}${routeFolder}/.gitkeep`] = "";
    files[`${base}features/auth/components/.gitkeep`] = "";
    files[`${base}features/auth/hooks/.gitkeep`] = "";
    files[`${base}features/auth/services/.gitkeep`] = "";
    files[`${base}features/dashboard/components/.gitkeep`] = "";
    files[`${base}features/dashboard/hooks/.gitkeep`] = "";
    files[`${base}shared/components/.gitkeep`] = "";
    files[`${base}shared/hooks/.gitkeep`] = "";
    files[`${base}shared/lib/.gitkeep`] = "";
    files[`${base}shared/types/.gitkeep`] = "";
    return files;
  }

  if (projectStructure === "atomic-based") {
    if (srcFolders.components) {
      files[`${base}components/atoms/.gitkeep`] = "";
      files[`${base}components/molecules/.gitkeep`] = "";
      files[`${base}components/organisms/.gitkeep`] = "";
      files[`${base}components/templates/.gitkeep`] = "";
    }
    if (srcFolders.pages) files[`${base}${routeFolder}/.gitkeep`] = "";
    files[`${base}features/.gitkeep`] = "";
  } else {
    if (srcFolders.components) files[`${base}components/.gitkeep`] = "";
    if (srcFolders.pages) files[`${base}${routeFolder}/.gitkeep`] = "";
    if (srcFolders.layouts) files[`${base}layouts/.gitkeep`] = "";
  }

  if (srcFolders.hooks) files[`${base}hooks/.gitkeep`] = "";
  if (srcFolders.services) files[`${base}services/.gitkeep`] = "";
  if (srcFolders.store) files[`${base}store/.gitkeep`] = "";
  if (srcFolders.types) files[`${base}types/.gitkeep`] = "";
  if (srcFolders.utils) files[`${base}utils/.gitkeep`] = "";
  if (srcFolders.lib) files[`${base}lib/.gitkeep`] = "";
  if (srcFolders.constants) files[`${base}constants/.gitkeep`] = "";
  if (srcFolders.context) files[`${base}context/.gitkeep`] = "";
  if (srcFolders.assets) files[`${base}assets/.gitkeep`] = "";

  return files;
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

function expoPackageJson(projectName: string, selections: PackageSelections): string {
  const dependencies: Record<string, string> = {
    expo: "^51.0.39",
    react: "18.2.0",
    "react-native": "0.74.5",
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
      main: "node_modules/expo/AppEntry.js",
      scripts: {
        dev: "expo start",
        android: "expo run:android",
        ios: "expo run:ios",
        web: "expo start --web",
      },
      dependencies,
      devDependencies: {
        "@types/react": "^18.3.11",
        typescript: "^5.8.3",
      },
    },
    null,
    2,
  ).concat("\n");
}

function expoAppJson(projectName: string): string {
  return JSON.stringify(
    {
      expo: {
        name: projectName,
        slug: projectName,
        version: "1.0.0",
        orientation: "portrait",
        userInterfaceStyle: "automatic",
      },
    },
    null,
    2,
  ).concat("\n");
}

function expoBabelConfig(): string {
  return [
    "module.exports = function (api) {",
    "  api.cache(true);",
    "  return {",
    "    presets: ['babel-preset-expo'],",
    "  };",
    "};",
  ].join("\n").concat("\n");
}

function expoTsconfig(): string {
  return [
    "{",
    "  \"extends\": \"expo/tsconfig.base\",",
    "  \"compilerOptions\": {",
    "    \"strict\": true",
    "  }",
    "}",
  ].join("\n").concat("\n");
}

function axiosApiTs(runtime: ProjectRuntime): string {
  const baseUrl =
    runtime === "expo"
      ? "'https://example.com/api'"
      : "import.meta.env.VITE_API_BASE_URL ?? 'https://example.com/api'";

  return [
    "import axios from 'axios';",
    "",
    "export const api = axios.create({",
    `  baseURL: ${baseUrl},`,
    "  headers: {",
    "    'Content-Type': 'application/json',",
    "  },",
    "});",
  ].join("\n").concat("\n");
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

function appReadme(
  projectName: string,
  selections: PackageSelections,
  projectStructure: ProjectStructure,
  runtime: ProjectRuntime,
): string {
  const selected = selectedPackageNames(selections);
  const packageLines = selected.length > 0 ? selected.map((name) => `- ${name}`) : ["- none (React base only)"];
  const routeFolder = runtime === "expo" ? "screens" : "pages";
  const scripts =
    runtime === "expo"
      ? ["- npm run dev", "- npm run android", "- npm run ios", "- npm run web"]
      : ["- npm run dev", "- npm run build", "- npm run preview"];

  return [
    `# ${projectName}`,
    "",
    "Scaffolded with coreplate.",
    "",
    "## Runtime",
    "",
    `- ${runtime === "expo" ? "React Native (Expo)" : "Web (React + Vite)"}`,
    "",
    `## Project Structure`,
    "",
    `- ${projectStructure}`,
    `- Route-oriented folder: src/${routeFolder}`,
    "",
    "## Included Packages",
    "",
    ...packageLines,
    "",
    "## Scripts",
    "",
    ...scripts,
  ].join("\n").concat("\n");
}

function appDesign(
  projectName: string,
  selections: PackageSelections,
  projectStructure: ProjectStructure,
  runtime: ProjectRuntime,
): string {
  const architecture: string[] = [
    runtime === "expo" ? "- UI: React Native + Expo" : "- UI: React + Vite",
  ];

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
    "## Project Structure",
    "",
    `- Runtime: ${runtime}`,
    `- Mode: ${projectStructure}`,
    ...projectStructureNotes(projectStructure),
    "",
    "## Folder Intent",
    "",
    "- src/App.tsx: sample shell and composition point",
    "- skills/: project-specific guidance snippets for humans and AI assistants",
  ].join("\n").concat("\n");
}

function projectStructureNotes(projectStructure: ProjectStructure): string[] {
  if (projectStructure === "component-based") {
    return [
      "- Group code by UI role (components, pages, hooks, services)",
      "- Suitable for smaller or medium apps with shared UI focus",
    ];
  }

  if (projectStructure === "atomic-based") {
    return [
      "- Build UI from atoms -> molecules -> organisms -> templates",
      "- Use pages for route-level composition",
    ];
  }

  return [
    "- Group code by feature domain first, then by technical role",
    "- Shared code lives under src/shared",
  ];
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

function expoAppTsx(projectName: string, selections: PackageSelections): string {
  const imports = [
    "import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';",
    "import { HomeScreen } from './src/screens/HomeScreen';",
  ];

  const wrappers: string[] = [];
  if (selections.tanstackQuery) {
    imports.unshift("import { QueryClient, QueryClientProvider } from '@tanstack/react-query';");
    wrappers.push("const queryClient = new QueryClient();", "");
  }

  const lines: string[] = [...imports, "", ...wrappers, "export default function App() {", "  return ("];

  if (selections.tanstackQuery) {
    lines.push(
      "    <QueryClientProvider client={queryClient}>",
      "      <SafeAreaView style={styles.container}>",
      "        <StatusBar />",
      `        <HomeScreen title=${JSON.stringify(projectName)} />`,
      "      </SafeAreaView>",
      "    </QueryClientProvider>",
    );
  } else {
    lines.push(
      "    <SafeAreaView style={styles.container}>",
      "      <StatusBar />",
      `      <HomeScreen title=${JSON.stringify(projectName)} />`,
      "    </SafeAreaView>",
    );
  }

  lines.push(
    "  );",
    "}",
    "",
    "const styles = StyleSheet.create({",
    "  container: {",
    "    flex: 1,",
    "    backgroundColor: '#f8fbff',",
    "  },",
    "});",
  );

  return lines.join("\n").concat("\n");
}

function expoHomeScreen(projectName: string, selections: PackageSelections): string {
  const lines: string[] = [
    "import { useState } from 'react';",
    "import { Button, StyleSheet, Text, TextInput, View } from 'react-native';",
  ];

  if (selections.axios) {
    lines.push("import { api } from '../services/api';");
  }
  if (selections.reactHookForm) {
    lines.push("import { Controller, useForm } from 'react-hook-form';");
  }
  if (selections.zustand) {
    lines.push("import { create } from 'zustand';");
  }

  lines.push("", "type Props = {", "  title: string;", "};", "");

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

  lines.push("export function HomeScreen({ title }: Props) {");

  if (selections.zustand) {
    lines.push("  const { count, increment } = useCounterStore();");
  } else {
    lines.push("  const [count, setCount] = useState(0);");
  }

  if (selections.reactHookForm) {
    lines.push("  const { control, handleSubmit } = useForm<DemoForm>({ defaultValues: { email: '' } });");
  }

  if (selections.reactHookForm && selections.axios) {
    lines.push(
      "",
      "  const onSubmit = handleSubmit(async (values) => {",
      "    console.log('Form values', values);",
      "    await api.get('/health').catch(() => undefined);",
      "  });",
    );
  } else if (selections.reactHookForm) {
    lines.push(
      "",
      "  const onSubmit = handleSubmit((values) => {",
      "    console.log('Form values', values);",
      "  });",
    );
  }

  lines.push("", "  return (", "    <View style={styles.container}>", "      <Text style={styles.title}>{title}</Text>");

  if (selections.zustand) {
    lines.push(
      "      <Text style={styles.text}>Count: {count}</Text>",
      "      <Button title=\"Increment\" onPress={increment} />",
    );
  } else {
    lines.push(
      "      <Text style={styles.text}>Count: {count}</Text>",
      "      <Button title=\"Increment\" onPress={() => setCount((value) => value + 1)} />",
    );
  }

  if (selections.reactHookForm) {
    lines.push(
      "      <Text style={styles.sectionTitle}>Form Demo</Text>",
      "      <Controller",
      "        control={control}",
      "        name=\"email\"",
      "        rules={{ required: true }}",
      "        render={({ field: { onChange, value } }) => (",
      "          <TextInput",
      "            placeholder=\"Email\"",
      "            value={value}",
      "            onChangeText={onChange}",
      "            style={styles.input}",
      "            autoCapitalize=\"none\"",
      "          />",
      "        )}",
      "      />",
      "      <Button title=\"Submit\" onPress={() => void onSubmit()} />",
    );
  }

  lines.push("    </View>", "  );", "}", "", "const styles = StyleSheet.create({");
  lines.push(
    "  container: {",
    "    flex: 1,",
    "    padding: 16,",
    "    gap: 12,",
    "  },",
    "  title: {",
    "    fontSize: 28,",
    "    fontWeight: '700',",
    "  },",
    "  text: {",
    "    fontSize: 16,",
    "  },",
    "  sectionTitle: {",
    "    marginTop: 10,",
    "    fontSize: 18,",
    "    fontWeight: '600',",
    "  },",
    "  input: {",
    "    borderWidth: 1,",
    "    borderColor: '#ccd4e0',",
    "    borderRadius: 8,",
    "    paddingHorizontal: 12,",
    "    paddingVertical: 10,",
    "  },",
    "});",
  );

  return lines.join("\n").concat("\n");
}

function appTsx(projectName: string, selections: PackageSelections): string {
  const lines: string[] = [];

  if (selections.axios) {
    lines.push("import { api } from './services/api';");
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
      "    await api.get('/health').catch(() => undefined);",
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
      "    await api.get('/health').catch(() => undefined);",
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
