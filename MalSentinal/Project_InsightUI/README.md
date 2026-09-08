# MalSentinal Presentation

An interactive presentation for **MalSentinal**, a graph-based Android malware
detection and family-classification project.

The presentation includes the project motivation, dataset overview, system
architecture, research approach, model results, and an interactive live demo.

## Author

**Lakshya Singh Kushwah**

## Live Presentation

The deployed presentation is available at:

<https://laksh-tech.github.io/MalSentinal/>

## Run Locally

From this directory:

```sh
bun install
bun run dev
```

Open the local URL shown in the terminal.

You can also use npm if Bun is not installed:

```sh
npm install
npm run dev
```

## Build

```sh
bun run build
```

## Deploy to GitHub Pages

Deployment is handled by the repository workflow at
`.github/workflows/deploy-pages.yml`. A push to the `main` branch builds the
static presentation and publishes it to GitHub Pages.

In the repository settings, configure **Settings -> Pages -> Source** as
**GitHub Actions**. After the workflow completes, the site is available at the
live presentation URL above.

## Built With

- React
- TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS
