# Æ-HUMAN Web App

This repository contains the code for the **Æ‑HUMAN** web application.  The project is built with [Next.js](https://nextjs.org/) and uses Markdown files to manage articles in the Academy section.  It is designed to be deployed to [Vercel](https://vercel.com/) but can run locally during development.

## Getting started

1.  Install dependencies:

```bash
npm install
```

2.  Run the development server:

```bash
npm run dev
```

3.  Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

## Project structure

- **pages/** – Contains the application pages used by Next.js.
- **components/** – Reusable React components.
- **data/articles/** – Markdown files for Academy articles.  Each file represents a single article.  The first line should be a title followed by a blank line and the body content.  To add or edit an article, simply create or edit a `.md` file in this directory.  Article slugs are derived from the filename (without the `.md` extension).
- **public/images/** – Static assets such as the hero background.
- **styles/** – Global and component‑specific CSS modules.

## Deployment

The project is ready for deployment on Vercel.  After committing the code to a GitHub repository, connect the repository to Vercel and follow their instructions to deploy.  Vercel will install dependencies and build the project automatically.

## Adding articles

To add a new article to the Academy:

1.  Create a new Markdown file in `data/articles/` with a filename such as `my-new-article.md`.  The file should look like this:

   ```
   My new article title

   The body of the article goes here.  You can use **Markdown** syntax for headings, lists, links, etc.
   ```

2.  Commit and push the file to your repository.  Vercel will redeploy automatically, and the new article will appear in the Academy section.

## License

This project is provided as an example and starting point for the Æ‑HUMAN brand.  You may use and modify it freely for your own purposes.