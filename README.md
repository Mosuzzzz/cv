# Mosu's portfolio

Personal portfolio for Patiphan Chiyakhun (Mosu), a Computer Science student interested in networking and DevOps. The site introduces Mosu, highlights GitHub projects and activity, and provides contact links.

## Run locally

Install dependencies with Node.js and npm, then start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Customize the site

- Edit `app/profile.ts` for the name, introduction, contact details, GitHub username, featured repository names, and experience. Empty optional fields are hidden from the page.
- Edit `app/page.tsx` for the page content and `app/globals.css` for the design.
- Replace the images in `public/` to change the avatar and illustrations.
- Edit `app/layout.tsx` for the page title and description.

The project list requests repository details from the GitHub API in the browser. If the request fails, featured repository names still link to GitHub. The contribution calendar uses `app/api/contributions/route.ts` to fetch public GitHub activity; its response is cached for one hour. These features need network access to GitHub.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

Built with Next.js, React, TypeScript, and CSS.
