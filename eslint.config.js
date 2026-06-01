import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const moduleBoundaryMessage =
  "Cross-module import blocked — use @/lib/routes, @/lib/brand, or @/components/ui. See docs/MODULAR_ARCHITECTURE.md.";

const eslintConfig = [
  {
    ignores: ["node_modules/**", ".next/**", "dist/**", "src/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["components/marketing/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/onboarding/*", "@/lib/didit", "@/lib/didit/*", "@/lib/pdf/*", "@/lib/contracts/*"],
              message: moduleBoundaryMessage,
            },
            {
              group: ["@/components/onboarding/*", "@/components/contracts/*"],
              message: moduleBoundaryMessage,
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/onboarding/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/marketing/*"],
              message: moduleBoundaryMessage,
            },
            {
              group: ["@/lib/pdf/*"],
              message: "Import signing helpers via @/lib/contracts or page-level server code.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["lib/clerk/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/onboarding/*", "@/lib/didit", "@/lib/didit/*", "@/lib/pdf/*", "@/lib/contracts/*"],
              message: "Clerk module must not depend on onboarding or verification domains.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
