# Mosu's CV

Personal CV for Patiphan Chaiyakhun (Mosu), a Computer Science student interested in networking and DevOps. The site introduces Mosu, highlights GitHub projects and activity, and provides contact links.

## Run locally

Install dependencies with Node.js and npm, then start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Customize the site

- Edit `app/profile.ts` for the name, introduction, contact details, GitHub username, featured repository summaries, and experience. Empty optional fields are hidden from the page.
- Edit `app/page.tsx` for the page content and `app/globals.css` for the design.
- Replace the images in `public/` to change the avatar and illustrations.
- Edit `app/layout.tsx` for the page title and description.

### Add a certificate

On macOS, run this command with the path to a PDF:

```bash
npm run add:certificate -- "/path/to/new-certificate.pdf"
```

Enter its title, issuer, and date when prompted. The command copies the PDF, makes a preview image from its first page, and adds a new Polaroid card automatically. You can also pass those three values after the PDF path to skip the prompts. Certificate details are stored in `app/certificates.json`.

The project list requests repository details from the GitHub API in the browser. Its curated summaries and links remain visible if that request fails. The contribution calendar uses `app/api/contributions/route.ts` to fetch public GitHub activity; its response is cached for one hour. If the calendar is unavailable or incomplete, the page links to the GitHub profile instead of showing misleading activity. Live details need network access to GitHub.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run add:certificate -- "/path/to/file.pdf"` | Add a certificate and preview |

Built with Next.js, React, TypeScript, and CSS.
