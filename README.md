This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Hero Image Pool Management

This application uses a pre-cached pool of 5 hero images to improve performance and reduce DALL-E API costs. The images rotate automatically for each page load.

### Commands

```bash
# Check current hero image pool status
npm run hero:status

# Initialize hero image pool (first time setup)
npm run hero:init

# Refresh all hero images (generates new set)
npm run hero:refresh
```

### Setup

1. Ensure your `.env.local` file has the required OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

2. Initialize the hero image pool:
   ```bash
   npm run hero:init
   ```

### How It Works

- **Pool Size**: 5 pre-generated hero images
- **Cache Duration**: 30 days (Redis + Supabase)
- **Rotation**: Sequential rotation through all images
- **Auto-refresh**: Images older than 30 days are refreshed automatically
- **Fallback**: Falls back to static image if generation fails

The hero images are cached in both Redis (fast access) and Supabase (persistent storage) for optimal performance.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
