# JSONLens

JSONLens is a privacy-first JSON debugging workspace built with Next.js, TypeScript, and Tailwind CSS. The product is being structured around a production-ready frontend architecture before feature implementation scales up.

## Current direction

The app is being organized for the MVP defined in the product specification:

- JSON editor
- Formatter and minifier
- Validator with friendly errors
- Tree viewer with JSONPath support
- Search, file import, and download
- Stats, theme support, and privacy-first messaging

## Project structure

```text
src/
  app/                 Next.js App Router entry points
  components/ui/       Shared UI primitives
  constants/           App metadata and static configuration
  features/            Product-facing feature modules
  hooks/               Reusable client hooks
  lib/                 Domain utilities and helpers
  store/               Shared Zustand stores
  types/               Shared TypeScript types
  workers/             Background workers for heavy JSON tasks
```

## Scripts

```bash
npm run dev
npm run lint
npm run type-check
```

## Notes

- Keep product logic inside `src/features` or focused `src/lib` modules.
- Keep `src/components/ui` limited to reusable presentation primitives.
- Prefer adding new domain types in `src/types` before spreading inline types across components.
- Use background workers for expensive parsing or transformation tasks once large JSON support is implemented.
