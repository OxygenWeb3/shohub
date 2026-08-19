# Shelby Spotlight

Build a clean, modern web app called "Shelby Showcase."

The purpose of the app is to let builders in the Shelby ecosystem easily share what they're building while demonstrating Shelby's decentralized hot storage.

The design should be minimal, fast, and mobile-friendly, with a white background, subtle blue accents, rounded cards, and plenty of spacing.

Core Features (Keep it Simple)

Home Page

Display a grid of builder projects.

Each project card contains:

 Project name

 Short description (maximum 120 characters)

 Builder name

 Category (AI, DePIN, Gaming, Infrastructure, Storage, Other)

 Cover image

 Number of likes ❤️

Include a search bar at the top.

Include category filters.

Submit Project Page

A very simple form containing:

 Project name

 Builder name

 Project description

 Category dropdown

 GitHub URL

 Demo URL

 Upload one cover image

 Upload optional demo video or PDF

When media is uploaded, display a message:

"Your project assets are stored on Shelby."

Project Details

Clicking a project opens a clean page showing:

Large cover image

Project description

Builder

GitHub button

Demo button

Media section

Users should be able to view the uploaded image, video or PDF instantly.

Likes

Visitors can click ❤️ to like a project.

No comments.

No authentication.

No profiles.

Keep it lightweight.

Storage Concept

All uploaded media (images, videos and PDFs) should be stored using Shelby storage.

The application should clearly communicate that Shelby powers media storage and retrieval.

Whenever media loads successfully, show a small badge:

⚡ Served via Shelby

UI Style

Use large rounded cards.

Simple navigation.

No dark mode.

No animations except subtle hover effects.

Use modern typography.

Lots of whitespace.

Fast loading.

Tech Stack

React

Next.js

Tailwind CSS

Supabase for database

Prepare the storage layer so it can connect to Shelby storage.

Keep the code modular and easy to extend later.

Nice Extras (Only if Easy)

Display the total number of projects on the homepage.

Display "Newest Projects."

Allow sorting by:

 Newest

 Most Liked

Nothing more.

Overall Goal

This app should feel like Product Hunt for Shelby builders, but much simpler. It should showcase projects while highlighting Shelby's strength as a decentralized hot storage layer. The MVP should be achievable in a few days using Lovable's free tier.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://shohub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8e4d629c-bfde-48d9-bb21-00834fda98f3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
