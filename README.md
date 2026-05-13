# Nebula Flux - Premium Next.js Application

A high-end, visually stunning web application built with Next.js and Tailwind CSS, featuring modern design principles like glassmorphism, vibrant gradients, and dynamic animations.

## Technical Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Fonts**: Outfit (Headings), Inter (Body)

## Branch Strategy
We follow a structured branching model to ensure stability and smooth development:

- **`main`**: The production-ready branch. Only stable, tested code is merged here.
- **`dev`**: The primary integration branch. All feature branches are merged here for testing before moving to `main`.
- **`feature/*`**: Individual feature branches. Created from `dev` and merged back into `dev` upon completion.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Workflow
1. Create a new feature branch from `dev`: `git checkout -b feature/your-feature-name`
2. Implement your changes.
3. Push and create a Pull Request to `dev`.
4. Once merged and verified, `dev` will be merged into `main` for release.

---
Built with ❤️ by [Riaz Ahmad Butt](mailto:engr.riazahmadbutt@gmail.com)
