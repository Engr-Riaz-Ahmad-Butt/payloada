import type { Metadata } from "next";

import { ToolPage } from "@/components/tool-page";
import { LiveJsonWorkspace } from "@/features/workspace/components/live-json-workspace";
import type {
  ConverterTab,
  InspectorView,
  WorkspaceView,
} from "@/features/workspace/components/workspace/core/types";

type ToolPageConfig = {
  slug: string;
  metadataTitle: string;
  metadataDescription: string;
  title: string;
  subtitle: string;
  description: readonly string[];
  faqs: ReadonlyArray<{ q: string; a: string }>;
  useCases?: readonly string[];
  examples?: ReadonlyArray<{ title: string; input: string; outcome: string }>;
  relatedTools?: ReadonlyArray<{ href: string; label: string; description: string }>;
  workspaceView: WorkspaceView;
  inspectorView?: InspectorView;
  converterTab?: ConverterTab;
};

export function createToolMetadata(config: ToolPageConfig): Metadata {
  return {
    title: config.metadataTitle,
    description: config.metadataDescription,
    alternates: {
      canonical: `/${config.slug}`,
    },
    openGraph: {
      title: config.metadataTitle,
      description: config.metadataDescription,
      url: `https://payloada.dev/${config.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.metadataTitle,
      description: config.metadataDescription,
    },
  };
}

export function renderToolPage(config: ToolPageConfig) {
  return (
    <ToolPage
      title={config.title}
      subtitle={config.subtitle}
      description={config.description}
      faqs={config.faqs}
      useCases={config.useCases}
      examples={config.examples}
      relatedTools={config.relatedTools}
    >
      <LiveJsonWorkspace
        initialWorkspaceView={config.workspaceView}
        initialInspectorView={config.inspectorView}
        initialConverterTab={config.converterTab}
      />
    </ToolPage>
  );
}

const sharedFaqs = {
  privacy: {
    q: "Does Payloada upload my JSON?",
    a: "The main workspace is local-first. Formatting, diffing, decoding, validation, and most converters stay in the browser unless you explicitly use AI or sharing features.",
  },
};

const sharedRelatedTools = {
  formatter: {
    href: "/json-formatter",
    label: "JSON formatter",
    description: "Beautify raw payloads before validating, diffing, or exporting them.",
  },
  validator: {
    href: "/json-validator",
    label: "JSON validator",
    description: "Catch syntax errors and line-level parse failures before continuing the workflow.",
  },
  jwt: {
    href: "/jwt-decoder",
    label: "JWT decoder",
    description: "Inspect token headers, claims, expiry, and signature state in one place.",
  },
  diff: {
    href: "/json-diff",
    label: "JSON diff",
    description: "Compare original and modified payloads side by side with semantic summaries.",
  },
  typescript: {
    href: "/json-to-typescript",
    label: "JSON to TypeScript",
    description: "Turn a validated payload into clean TypeScript interfaces without leaving the workspace.",
  },
  zod: {
    href: "/zod-schema-generator",
    label: "JSON to Zod",
    description: "Generate runtime-safe Zod schemas from the same JSON example.",
  },
} as const;

export const TOOL_PAGES = {
  formatter: {
    slug: "json-formatter",
    metadataTitle: "JSON Formatter & Beautifier Online - Free | Payloada",
    metadataDescription:
      "Format and beautify JSON instantly with a privacy-first editor, real validation, and readable output.",
    title: "JSON formatter and beautifier",
    subtitle: "Paste raw JSON and turn it into clean, readable output in one focused workspace.",
    description: [
      "A good JSON formatter does more than add whitespace. It helps developers spot shape problems, understand nested payloads, and move between minified API output and readable structure without losing context. Payloada keeps formatting inside a real workspace, so after beautifying the payload you can keep validating, searching, converting, or exporting it in the same place.",
      "Unlike lightweight formatter-only sites, Payloada also shows parser errors, document stats, tree inspection, graph view, JSONPath, and developer-oriented follow-up actions. That makes it useful when you are debugging responses, preparing examples for documentation, or cleaning payloads before converting them into TypeScript or schema output.",
    ],
    useCases: [
      "Beautify minified API responses before sharing them in tickets, docs, or Slack threads.",
      "Reformat example payloads so frontend and backend teams can inspect nested objects quickly.",
      "Clean JSON copied from logs or browser devtools before converting it into TypeScript, Zod, or CSV output.",
      "Move from formatting into tree view, JSONPath, or diff without pasting the same payload again.",
    ],
    examples: [
      {
        title: "Minified API response",
        input: '{"status":"ok","data":{"users":[{"id":1,"name":"Ava"}]}}',
        outcome:
          "Readable indentation, visible nesting, and a better starting point for validation or debugging.",
      },
      {
        title: "Log payload cleanup",
        input: '{"event":"checkout","meta":{"region":"us","items":3}}',
        outcome:
          "A cleaner payload you can review in tree view or copy into an issue without losing structure.",
      },
      {
        title: "Prepare for code generation",
        input: '{"user_id":42,"email":"dev@example.com","active":true}',
        outcome:
          "Formatted JSON that is easier to trust before generating TypeScript interfaces or schemas.",
      },
    ],
    faqs: [
      {
        q: "What does a JSON formatter do?",
        a: "It converts dense or minified JSON into readable output with consistent indentation and spacing.",
      },
      {
        q: "Can Payloada format invalid JSON?",
        a: "It can show the exact parse error and help repair common issues, but invalid JSON must still be fixed before true formatting.",
      },
      sharedFaqs.privacy,
      {
        q: "Does it support large payloads?",
        a: "Yes. Large JSON is parsed with a worker-backed flow so the UI stays responsive.",
      },
    ],
    relatedTools: [
      sharedRelatedTools.validator,
      sharedRelatedTools.diff,
      sharedRelatedTools.typescript,
    ],
    workspaceView: "editor" as WorkspaceView,
    inspectorView: "formatted" as InspectorView,
  },
  validator: {
    slug: "json-validator",
    metadataTitle: "JSON Validator Online - Free | Payloada",
    metadataDescription:
      "Validate JSON instantly, find exact syntax errors, and inspect structure in a privacy-first workspace.",
    title: "JSON validator",
    subtitle:
      "Check syntax, spot structural problems, and move directly into fixes without leaving the workspace.",
    description: [
      "JSON validation is most useful when the tool tells you exactly what is wrong and what to do next. Payloada highlights parse failures, points to line and column positions, and keeps the payload available for repair, formatting, inspection, or AI-assisted explanation after validation. That makes it practical for debugging real API responses instead of only checking whether a document is technically valid.",
      "The validator view also benefits from the rest of the workspace: stats, tree exploration, sensitive-field detection, JSONPath, and converters. Instead of pasting the same payload into multiple disconnected tools, you can validate once and continue the rest of the workflow from there.",
    ],
    useCases: [
      "Check pasted API responses before sending them to teammates or using them as test fixtures.",
      "Find exact line and column failures in malformed JSON copied from logs, webhooks, or docs.",
      "Validate payloads before generating TypeScript, Zod, Prisma, or CSV output.",
      "Repair common mistakes like trailing commas without losing the rest of your workflow context.",
    ],
    examples: [
      {
        title: "Trailing comma error",
        input: '{"name":"Ava","roles":["admin",],}',
        outcome:
          "A clear parse error with the broken line and column so you can fix the JSON immediately.",
      },
      {
        title: "Broken quote in logs",
        input: '{"status":"ok","message":"User "signed in""}',
        outcome:
          "Fast feedback that explains why the JSON is invalid instead of silently failing.",
      },
      {
        title: "Pre-conversion validation",
        input: '{"id":1,"email":"dev@example.com","active":true}',
        outcome:
          "Confidence that the payload is valid before turning it into code or schema output.",
      },
    ],
    faqs: [
      {
        q: "How does Payloada show invalid JSON?",
        a: "It reports the parser error and the matching line and column so you can correct the payload quickly.",
      },
      {
        q: "Can it help fix broken JSON?",
        a: "Yes. Payloada includes repair assistance for common mistakes like trailing commas and lightly malformed input.",
      },
      sharedFaqs.privacy,
      {
        q: "Does validation work for pasted API responses?",
        a: "Yes. It is designed for real developer payloads, including large nested responses.",
      },
    ],
    relatedTools: [
      sharedRelatedTools.formatter,
      sharedRelatedTools.diff,
      sharedRelatedTools.typescript,
    ],
    workspaceView: "editor" as WorkspaceView,
    inspectorView: "status" as InspectorView,
  },
  jwt: {
    slug: "jwt-decoder",
    metadataTitle: "JWT Decoder & Verifier Online - Free | Payloada",
    metadataDescription:
      "Decode JWT tokens, inspect claims, and verify HS256 signatures in a cleaner developer workspace.",
    title: "JWT decoder and verifier",
    subtitle:
      "Inspect headers, payloads, expiry claims, and signature state in one purpose-built panel.",
    description: [
      "JWT decoding is most useful when the token is presented in a way that is easy to trust. Payloada separates header, payload, signature, and claims clearly, shows expiry information, and brings signature state to the top of the decoded panel instead of hiding it in a small status chip. That makes it easier to see whether a token is valid, expired, unverified, or potentially unsafe.",
      "Because JWT debugging often happens in the middle of API work, the decoder lives inside the same product as formatting, diffing, validation, and converters. Teams can inspect a token, return to the editor, and continue working on related JSON payloads without switching tools.",
    ],
    useCases: [
      "Decode access tokens during authentication debugging without sending them to a third-party service.",
      "Check expiry claims before investigating why a session or API request failed.",
      "Verify HS256 signatures locally when you have the matching shared secret.",
      "Inspect custom claims while staying in the same workspace as the rest of your JSON debugging flow.",
    ],
    examples: [
      {
        title: "Check token expiry",
        input: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        outcome:
          "A readable header and payload view with issued and expiry state surfaced clearly.",
      },
      {
        title: "Verify a shared-secret token",
        input: "HS256 token + secret",
        outcome:
          "An explicit verified or invalid signature banner instead of a subtle status chip.",
      },
      {
        title: "Inspect custom claims",
        input: '{"sub":"42","role":"admin","org":"acme"}',
        outcome:
          "Standard claims stand out from custom claims, making the token easier to review.",
      },
    ],
    faqs: [
      {
        q: "Can Payloada verify JWT signatures?",
        a: "Yes. The decoder supports HS256 verification when you provide the matching secret.",
      },
      {
        q: "Does it show token expiry clearly?",
        a: "Yes. Issued and expiry data are surfaced separately, including expired and no-expiry states.",
      },
      sharedFaqs.privacy,
      {
        q: "Is the JWT sent to a server?",
        a: "No. JWT decoding and verification happen locally in the workspace.",
      },
    ],
    relatedTools: [
      sharedRelatedTools.validator,
      sharedRelatedTools.formatter,
      sharedRelatedTools.diff,
    ],
    workspaceView: "jwt" as WorkspaceView,
  },
  diff: {
    slug: "json-diff",
    metadataTitle: "JSON Diff Tool - Compare Two JSON Files | Payloada",
    metadataDescription:
      "Compare two JSON payloads side by side with summary cards, readable changes, and export actions.",
    title: "JSON diff tool",
    subtitle:
      "Compare original and modified JSON side by side with summaries that are easier to act on.",
    description: [
      "A JSON diff is only helpful when the changes are easy to understand. Payloada keeps the raw side-by-side comparison but also adds semantic summary cards for additions, removals, value changes, and type changes. That gives developers both the detailed code-level view and the higher-level explanation they need when reviewing API regressions or schema drift.",
      "The diff workspace is especially useful for expected-versus-actual QA checks, backend response debugging, and contract review between environments. Because it is part of the wider Payloada workspace, you can move from diffing into conversion, validation, or export without rebuilding context in another tool.",
    ],
    faqs: [
      {
        q: "Can I compare two API responses side by side?",
        a: "Yes. Payloada's diff view shows original and modified JSON in two independent panes.",
      },
      {
        q: "Does it highlight type changes?",
        a: "Yes. Type changes are separated from simple value changes and shown in the summary.",
      },
      sharedFaqs.privacy,
      {
        q: "Can I export the diff summary?",
        a: "Yes. The diff workspace includes copy and download actions for generated reports.",
      },
    ],
    workspaceView: "diff" as WorkspaceView,
  },
  typescript: {
    slug: "json-to-typescript",
    metadataTitle: "JSON to TypeScript Interface Generator | Payloada",
    metadataDescription:
      "Generate TypeScript interfaces from JSON with readable output and converter-focused workflow.",
    title: "JSON to TypeScript",
    subtitle:
      "Turn example JSON payloads into TypeScript interfaces without leaving the workspace.",
    description: [
      "Type generation is one of the most practical JSON workflows for frontend and full-stack teams. Payloada converts parsed JSON into TypeScript interfaces directly inside the converter workspace, so you can format, validate, and inspect the payload before generating code. That reduces the risk of turning malformed data or inconsistent keys into bad type definitions.",
      "The generator also lives next to Zod, Schema, Prisma, Mongoose, Go, Python, and other outputs, which makes it easier to compare different representations of the same JSON structure. Instead of bouncing between tools, you can keep the payload in one place and switch outputs as needed.",
    ],
    faqs: [
      {
        q: "Does it quote invalid property names?",
        a: "Yes. Keys that are not safe TypeScript identifiers are quoted correctly in the generated output.",
      },
      {
        q: "Can I validate JSON before generating types?",
        a: "Yes. The editor workspace and converter workspace are part of the same flow.",
      },
      sharedFaqs.privacy,
      {
        q: "Can I copy the generated interfaces directly?",
        a: "Yes. The converter output panel includes copy and download actions.",
      },
    ],
    workspaceView: "converters" as WorkspaceView,
    converterTab: "TypeScript" as ConverterTab,
  },
  zod: {
    slug: "zod-schema-generator",
    metadataTitle: "JSON to Zod Schema Generator | Payloada",
    metadataDescription:
      "Generate Zod schemas from JSON with a converter workspace built for modern TypeScript apps.",
    title: "JSON to Zod schema",
    subtitle:
      "Create runtime-safe validation code from JSON examples in the same workflow as your editor.",
    description: [
      "Zod generation is useful when a sample payload needs to become both a type and a runtime contract. Payloada converts JSON into readable Zod schema output and keeps that process attached to the same editor, validator, and converter workflow developers already use for the payload itself. That makes it easier to inspect edge cases before trusting the generated schema.",
      "Because the converter workspace supports multiple output targets, Zod can also be compared directly with TypeScript interfaces, JSON Schema, Prisma, and Mongoose output. This is helpful when teams want one JSON example to feed several implementation layers without manually rewriting the same structure multiple times.",
    ],
    faqs: [
      {
        q: "Why use JSON to Zod conversion?",
        a: "It helps turn example payloads into runtime-safe validation code for modern TypeScript applications.",
      },
      {
        q: "Is the Zod output editable or copyable?",
        a: "Yes. You can copy, download, and refine the generated schema from the output panel.",
      },
      sharedFaqs.privacy,
      {
        q: "Can I switch from Zod to TypeScript quickly?",
        a: "Yes. The converter workspace lets you switch outputs without leaving the page.",
      },
    ],
    workspaceView: "converters" as WorkspaceView,
    converterTab: "Zod" as ConverterTab,
  },
  graph: {
    slug: "json-graph-visualizer",
    metadataTitle: "JSON Graph Visualizer - Visual JSON Explorer | Payloada",
    metadataDescription:
      "Visualize JSON as an interactive node graph with layout controls inside a developer-focused workspace.",
    title: "JSON graph visualizer",
    subtitle:
      "Explore nested JSON visually as a connected graph without leaving the main editor flow.",
    description: [
      "Some JSON structures are easier to understand as a graph than as raw text. Payloada's graph view turns nested objects and arrays into interactive connected nodes, which helps developers trace relationships, spot repeated shapes, and understand deeply nested payloads faster than line-by-line reading alone.",
      "The graph visualizer is especially useful for large API responses, config objects, and data exploration tasks where the structure matters as much as the values. Since it lives inside the same workspace as the editor, tree view, JSONPath, diff, and converters, it supports visual exploration without breaking the broader workflow.",
    ],
    faqs: [
      {
        q: "When is graph view better than tree view?",
        a: "Graph view is helpful for large or deeply nested payloads where visual structure is easier to follow than indented text.",
      },
      {
        q: "Can I change the layout direction?",
        a: "Yes. Payloada's graph view includes layout direction controls.",
      },
      sharedFaqs.privacy,
      {
        q: "Does graph view use the same JSON as the editor?",
        a: "Yes. It visualizes the parsed editor payload directly.",
      },
    ],
    workspaceView: "editor" as WorkspaceView,
    inspectorView: "graph" as InspectorView,
  },
  csv: {
    slug: "json-to-csv",
    metadataTitle: "JSON to CSV Converter Online - Free | Payloada",
    metadataDescription:
      "Convert arrays of JSON objects into CSV with clear feedback and a converter-focused workflow.",
    title: "JSON to CSV",
    subtitle:
      "Turn arrays of objects into CSV output with better feedback than generic text converters.",
    description: [
      "CSV conversion is one of the most common ways to move JSON into spreadsheets, exports, or lightweight reporting tools. Payloada keeps this workflow inside the main converter workspace and gives explicit feedback when the input is not shaped correctly for CSV output. That makes it easier to understand whether the issue is the converter or the source data.",
      "The CSV view works especially well for arrays of objects and is useful for exporting API lists, analytics payloads, and test fixtures. Developers can validate and inspect the JSON first, then switch to CSV output without pasting the same document into another tool.",
    ],
    faqs: [
      {
        q: "What kind of JSON works best for CSV conversion?",
        a: "Arrays of plain objects work best because each object becomes a row and keys become columns.",
      },
      {
        q: "What happens if I pass a single object?",
        a: "Payloada now shows a clear message explaining that CSV expects an array of objects.",
      },
      sharedFaqs.privacy,
      {
        q: "Can I download the CSV result?",
        a: "Yes. The converter workspace includes download and copy actions.",
      },
    ],
    workspaceView: "converters" as WorkspaceView,
    converterTab: "CSV" as ConverterTab,
  },
  schema: {
    slug: "json-schema-generator",
    metadataTitle: "JSON Schema Generator (Draft-07) | Payloada",
    metadataDescription:
      "Generate JSON Schema from example payloads with readable output and converter-focused tooling.",
    title: "JSON Schema generator",
    subtitle:
      "Generate Draft-style schema output from example JSON in a converter workspace built for developers.",
    description: [
      "JSON Schema is useful when a payload needs to become a contract, validation layer, or portable schema definition. Payloada generates schema output directly from the parsed JSON and keeps that process close to the original editor, validator, and converter workflow. That helps teams inspect the source structure before trusting the generated contract.",
      "The schema generator is most useful when paired with the rest of the product: you can validate the input, inspect it in the tree or graph, compare versions with diff, and then export the schema. Keeping all of that in one place reduces context switching and makes the output easier to trust.",
    ],
    faqs: [
      {
        q: "What does the schema generator produce?",
        a: "It generates JSON Schema-style output based on the structure and primitive types in your payload.",
      },
      {
        q: "Can I compare schema generation with TypeScript output?",
        a: "Yes. The converter workspace lets you switch between schema, TypeScript, Zod, and other outputs.",
      },
      sharedFaqs.privacy,
      {
        q: "Is the generated schema editable?",
        a: "Yes. You can copy or download it and refine it in your own codebase.",
      },
    ],
    workspaceView: "converters" as WorkspaceView,
    converterTab: "Schema" as ConverterTab,
  },
  mock: {
    slug: "mock-json-generator",
    metadataTitle: "Mock JSON Generator - Generate Fake JSON Data | Payloada",
    metadataDescription:
      "Generate realistic mock JSON from a sample object and send it back into the editor instantly.",
    title: "Mock JSON generator",
    subtitle:
      "Turn a sample object into realistic test data for demos, fixtures, and development workflows.",
    description: [
      "Mock data generation is most useful when it starts from a shape you already trust. Payloada uses the current editor payload as the template, then generates realistic records for common fields like names, email addresses, IDs, status values, dates, and booleans. That makes it easy to build fixtures for tests, demos, and local development without inventing the structure from scratch.",
      "Because the generator is part of the same workspace, the output can be sent directly back to the editor for further validation, conversion, graph exploration, or export. It is a practical way to move from a single example payload to a reusable development dataset inside one product.",
    ],
    faqs: [
      {
        q: "How does Payloada decide what values to generate?",
        a: "It uses field-name patterns and the original value types to generate realistic mock records.",
      },
      {
        q: "Can I control how many records are generated?",
        a: "Yes. The mock generator lets you choose the output count before generating records.",
      },
      sharedFaqs.privacy,
      {
        q: "Can I send the generated data back into the editor?",
        a: "Yes. The mock workspace includes a send-to-editor flow.",
      },
    ],
    workspaceView: "mock" as WorkspaceView,
  },
} as const;
