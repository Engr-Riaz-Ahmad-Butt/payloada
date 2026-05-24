"use client";

import React, { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, Copy, Download, RefreshCw, Send, Check } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type FieldType = "uuid" | "name" | "email" | "phone" | "price" | "boolean" | "integer" | "status" | "timestamp";

interface SchemaField {
  key: string;
  type: FieldType;
}

const PRESET_TEMPLATES: Record<string, { label: string; fields: SchemaField[] }> = {
  users: {
    label: "User Profiles",
    fields: [
      { key: "id", type: "uuid" },
      { key: "fullName", type: "name" },
      { key: "emailAddress", type: "email" },
      { key: "phoneNumber", type: "phone" },
      { key: "isActive", type: "boolean" },
      { key: "joinedAt", type: "timestamp" },
    ],
  },
  orders: {
    label: "E-commerce Orders",
    fields: [
      { key: "orderId", type: "uuid" },
      { key: "customerName", type: "name" },
      { key: "customerEmail", type: "email" },
      { key: "totalAmount", type: "price" },
      { key: "orderStatus", type: "status" },
      { key: "orderedAt", type: "timestamp" },
    ],
  },
  sensors: {
    label: "IoT Sensor Logs",
    fields: [
      { key: "sensorId", type: "uuid" },
      { key: "metricValue", type: "integer" },
      { key: "connectionStatus", type: "status" },
      { key: "recordedAt", type: "timestamp" },
    ],
  },
};

const NAMES = [
  "Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince", "Ethan Hunt",
  "Fiona Gallagher", "George Clark", "Hannah Abbott", "Ian Malcolm", "Julia Roberts",
  "Kevin Bacon", "Laura Croft", "Michael Scott", "Nancy Drew", "Oscar Wilde"
];

const DOMAINS = ["example.com", "testmail.org", "payloada.dev", "company.net", "services.io"];
const STATUSES = ["pending", "success", "failed", "active", "inactive"];

function generateFakeValue(type: FieldType): string | number | boolean {
  switch (type) {
    case "uuid":
      return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)
      );
    case "name":
      return NAMES[Math.floor(Math.random() * NAMES.length)];
    case "email": {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)].toLowerCase().replace(/\s+/g, ".");
      const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
      return `${name}@${domain}`;
    }
    case "phone":
      return `+1 (${Math.floor(Math.random() * 900) + 100}) 555-${Math.floor(Math.random() * 9000) + 1000}`;
    case "price":
      return parseFloat((Math.random() * 490 + 10).toFixed(2));
    case "boolean":
      return Math.random() > 0.4;
    case "integer":
      return Math.floor(Math.random() * 9900) + 100;
    case "status":
      return STATUSES[Math.floor(Math.random() * STATUSES.length)];
    case "timestamp":
      return new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString();
    default:
      return "";
  }
}

function buildMockRecords(fields: SchemaField[], count: number) {
  return Array.from({ length: count }, () => {
    const item: Record<string, string | number | boolean> = {};
    fields.forEach((field) => {
      if (field.key.trim()) {
        item[field.key.trim()] = generateFakeValue(field.type);
      }
    });
    return item;
  });
}

export function MockWorkspace({
  onSendToEditor,
  onCopy,
}: {
  onSendToEditor: (json: string) => void;
  onCopy: (value: string, message?: string) => Promise<void>;
}) {
  const { monacoTheme } = useTheme();
  const [fields, setFields] = useState<SchemaField[]>(PRESET_TEMPLATES.users.fields);
  const [count, setCount] = useState<number>(10);
  const [output, setOutput] = useState<string>(() =>
    JSON.stringify(buildMockRecords(PRESET_TEMPLATES.users.fields, 10), null, 2),
  );
  const [copied, setCopied] = useState(false);
  const fieldCounterRef = useRef(PRESET_TEMPLATES.users.fields.length);

  const handleGenerate = useCallback(() => {
    if (fields.length === 0) {
      toast.error("Please add at least one field to generate mock data");
      return;
    }

    const records = buildMockRecords(fields, count);

    setOutput(JSON.stringify(records, null, 2));
    toast.success(`Successfully generated ${count} mock records!`);
  }, [fields, count]);


  const loadPreset = (presetKey: keyof typeof PRESET_TEMPLATES) => {
    const preset = PRESET_TEMPLATES[presetKey];
    fieldCounterRef.current = preset.fields.length;
    setFields(preset.fields.map((f) => ({ ...f })));
  };

  const addField = () => {
    fieldCounterRef.current += 1;
    setFields((current) => [...current, { key: `field_${fieldCounterRef.current}`, type: "name" }]);
  };

  const removeField = (index: number) => {
    setFields((current) => current.filter((_, idx) => idx !== index));
  };

  const updateFieldKey = (index: number, key: string) => {
    setFields((current) =>
      current.map((field, idx) => (idx === index ? { ...field, key } : field)),
    );
  };

  const updateFieldType = (index: number, type: FieldType) => {
    setFields((current) =>
      current.map((field, idx) => (idx === index ? { ...field, type } : field)),
    );
  };

  const handleSendToMainEditor = () => {
    onSendToEditor(output);
    toast.success("Loaded generated mock data into Editor!");
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock-data-${count}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded mock data!");
  };

  const triggerCopy = async () => {
    await onCopy(output, "Copied mock data!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid h-full min-h-0 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.95fr)]">
      {/* Left Settings Panel */}
      <div className="flex min-h-0 flex-col border-b-[0.5px] border-ui-border bg-background p-4 sm:p-5 xl:border-b-0 xl:border-r-[0.5px] overflow-y-auto">
        <div className="mb-5">
          <h2 className="text-[16px] font-semibold text-text-primary">Mock Data Generator</h2>
          <p className="mt-1 text-[13px] text-text-secondary leading-[1.6]">
            Configure custom field schemas or pick a preset template to generate highly realistic JSON arrays.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="mb-6">
          <p className="mb-2 text-[11px] font-medium tracking-[0.05em] text-text-secondary uppercase">Preset Templates</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESET_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                onClick={() => loadPreset(key)}
                className="h-8 rounded-[6px] border-[0.5px] border-ui-border bg-surface-elevated px-3.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-copper-accent hover:text-text-primary"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count configuration */}
        <div className="mb-6 flex items-center justify-between rounded-[8px] border-[0.5px] border-ui-border bg-surface-container px-4 py-3">
          <div>
            <p className="text-[13px] font-medium text-text-primary">Records count</p>
            <p className="text-[11px] text-text-secondary">How many rows of JSON objects to generate</p>
          </div>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="h-9 rounded-[6px] border-[0.5px] border-ui-border bg-obsidian-base px-3 text-[13px] font-semibold text-copper-accent outline-none focus-visible:border-copper-accent"
          >
            <option value={1}>1 Record</option>
            <option value={5}>5 Records</option>
            <option value={10}>10 Records</option>
            <option value={20}>20 Records</option>
            <option value={50}>50 Records</option>
            <option value={100}>100 Records</option>
          </select>
        </div>

        {/* Fields Schema Editor */}
        <div className="flex-1 min-h-0">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-medium tracking-[0.05em] text-text-secondary uppercase">Schema Fields</p>
            <button
              onClick={addField}
              className="flex h-7 items-center gap-1.5 rounded-[6px] border-[0.5px] border-copper-accent/30 bg-copper-accent/10 px-2.5 text-[12px] font-semibold text-copper-accent transition-colors hover:bg-copper-accent/20"
            >
              <Plus className="size-3.5" /> Add Field
            </button>
          </div>

          <div className="space-y-2 max-h-[360px] xl:max-h-none overflow-y-auto pr-1">
            {fields.map((field, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-[8px] border-[0.5px] border-ui-border bg-surface-elevated p-2"
              >
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => updateFieldKey(index, e.target.value)}
                  placeholder="field_name"
                  className="h-9 flex-1 min-w-0 rounded-[6px] border-[0.5px] border-ui-border bg-obsidian-base px-3 font-mono text-[12px] text-text-primary outline-none focus-visible:border-copper-accent"
                />

                <select
                  value={field.type}
                  onChange={(e) => updateFieldType(index, e.target.value as FieldType)}
                  className="h-9 w-[110px] sm:w-[130px] rounded-[6px] border-[0.5px] border-ui-border bg-obsidian-base px-2 text-[12px] font-medium text-text-secondary outline-none focus-visible:border-copper-accent"
                >
                  <option value="uuid">UUID v4</option>
                  <option value="name">Full Name</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="price">Price (Float)</option>
                  <option value="integer">Integer</option>
                  <option value="boolean">Boolean</option>
                  <option value="status">Status</option>
                  <option value="timestamp">Timestamp</option>
                </select>

                <button
                  onClick={() => removeField(index)}
                  className="flex h-9 w-9 items-center justify-center rounded-[6px] border-[0.5px] border-ui-border bg-obsidian-base text-text-secondary transition-colors hover:border-red-500/40 hover:text-red-500 dark:hover:text-red-400"
                  title="Remove Field"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="flex h-32 flex-col items-center justify-center rounded-[8px] border-[0.5px] border-dashed border-ui-border text-center">
                <p className="text-[13px] text-text-secondary">No fields in schema.</p>
                <button
                  onClick={addField}
                  className="mt-2 text-[12px] font-semibold text-copper-accent hover:underline"
                >
                  Create one now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Output Preview */}
      <aside className="flex min-h-0 flex-col bg-surface-container">
        <div className="flex flex-wrap items-center justify-between border-b-[0.5px] border-ui-border px-4 py-3 sm:px-5">
          <div>
            <p className="text-sm font-semibold text-text-primary">Preview Output</p>
            <p className="text-[11px] text-text-secondary">Generated Array of Objects</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              className="flex h-8 w-8 items-center justify-center rounded-[6px] border-[0.5px] border-ui-border bg-surface-elevated text-text-secondary transition-colors hover:border-copper-accent hover:text-copper-accent"
              title="Regenerate"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        </div>

        <div className="min-h-[300px] flex-1 bg-obsidian-base relative">
          <MonacoEditor
            height="100%"
            language="json"
            theme={monacoTheme}
            value={output}
            options={{
              readOnly: true,
              automaticLayout: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 22, bottom: 22 },
              fontSize: 14,
              lineHeight: 26,
              tabSize: 2,
              fontFamily: "var(--font-mono)",
            }}
          />
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-3 gap-2 border-t-[0.5px] border-ui-border p-4 bg-surface-container">
          <button
            onClick={triggerCopy}
            disabled={!output}
            className="flex h-10 items-center justify-center gap-2 rounded-[8px] border-[0.5px] border-ui-border bg-surface-elevated text-[13px] font-semibold text-text-primary transition-colors hover:border-ui-border-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? <Check className="size-4 text-[#3DD68C]" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!output}
            className="flex h-10 items-center justify-center gap-2 rounded-[8px] border-[0.5px] border-ui-border bg-surface-elevated text-[13px] font-semibold text-text-primary transition-colors hover:border-ui-border-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="size-4" /> Download
          </button>
          <button
            onClick={handleSendToMainEditor}
            className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-copper-accent text-[13px] font-semibold text-white transition-colors hover:bg-copper-accent/90"
          >
            <Send className="size-4" /> Load Editor
          </button>
        </div>
      </aside>
    </div>
  );
}
