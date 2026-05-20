# Flashy Cardy Course

Aplicación web de flashcards: crear mazos, estudiar y seguir el progreso. Construida con Next.js 16, React 19, Clerk y shadcn/ui.

## Documentación

- **[Arquitectura](./docs/ARCHITECTURE.md)** — stack, estructura del repo, autenticación, UI, proxy y guía para replicar el proyecto desde cero.
- [Índice de docs](./docs/README.md)

## Getting Started

Copy environment variables and configure Clerk:

```bash
cp .env.example .env.local
# Edit .env.local with your Clerk keys from https://dashboard.clerk.com
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Poppins](https://fonts.google.com/specimen/Poppins) as the sole font family.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
