import prettier from 'eslint-plugin-prettier';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      "node_modules/**/*",
      "lib/**/*",
      "src_old/**/*"
    ]
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'prettier': prettier
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: process.cwd(),
        sourceType: "module"
      }
    },
    rules: {
      "no-console": "warn",
      "prettier/prettier": "error",
      ...eslintConfigPrettier.rules
    }
  },

  // --- Engine independence (see .claude/skills/engine-audit) ---
  // The engine core depends only inward: other src/engine/** files, src/utils/**, and zod
  // (schemas only). It must never import an outer layer (gamemaster/cli/persistence) nor reach
  // for the outside world (LLM/UI SDKs, I/O). These are the mechanical §1 checks, hard-enforced
  // here so a boundary breach fails the pre-commit gate instead of waiting for a manual audit.
  // Note: import-based only — determinism checks (Math.random, Date.now, console) stay in the audit.
  ...(() => {
    const forbidOuterAndImpure = {
      patterns: [
        {
          group: ["**/gamemaster", "**/gamemaster/**", "**/cli", "**/cli/**", "**/persistence", "**/persistence/**"],
          message: "The engine must not depend on outer layers (gamemaster/cli/persistence). See CLAUDE.md 'clear boundaries: UI ↔ persistence ↔ engine'.",
        },
        {
          group: ["ollama", "blessed", "fs", "fs/*", "node:fs", "node:fs/*", "readline", "node:readline", "child_process", "node:child_process", "net", "node:net", "http", "node:http"],
          message: "The engine is pure and deterministic — no LLM/UI/I/O dependencies. Those belong in the gamemaster/cli layers. See CLAUDE.md 'Determinism'.",
        },
      ],
    };
    return [
      {
        // action/** owns Zod schemas; tests may build fake-action fixtures with Zod. Ban only the outer/impure set.
        files: ["src/engine/action/**/*.{ts,tsx}", "src/engine/**/*.test.{ts,tsx}"],
        rules: { "no-restricted-imports": ["error", forbidOuterAndImpure] },
      },
      {
        // All other engine source: additionally, Zod must go through utils/schema (Schema), never directly.
        files: ["src/engine/**/*.{ts,tsx}"],
        ignores: ["src/engine/action/**/*.{ts,tsx}", "src/engine/**/*.test.{ts,tsx}"],
        rules: {
          "no-restricted-imports": ["error", {
            ...forbidOuterAndImpure,
            paths: [{ name: "zod", message: "Only src/engine/action/** may import zod directly; elsewhere reach schemas through utils/schema (Schema)." }],
          }],
        },
      },
    ];
  })(),

  // The LLM layer depends on the engine (via the ToolCallDispatcher seam) and on its own LLM SDK,
  // but not on the UI/persistence layers, and it must reach engine schemas through Schema, not Zod.
  {
    files: ["src/gamemaster/**/*.{ts,tsx}"],
    ignores: ["src/gamemaster/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["**/cli", "**/cli/**", "**/persistence", "**/persistence/**"],
          message: "The gamemaster layer must not depend on the cli/persistence layers.",
        }],
        paths: [{ name: "zod", message: "The LLM layer must reach schemas through Schema/toJsonSchema, never zod directly." }],
      }],
    },
  },
];
