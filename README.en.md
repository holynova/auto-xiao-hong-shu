<p align="right"><a href="README.md">中文</a></p>

<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="Auto XHS Publisher — an auto-posting tool for Xiaohongshu: image folder → 3×3 collage cover → scheduled queue → publish">
</p>

<p align="center">
  <a href="https://xiaosang.cc/auto-xiao-hong-shu/">▶ Project Page</a>
  ·
  <a href="https://github.com/holynova/auto-xiao-hong-shu">GitHub Repository</a>
</p>

A Xiaohongshu creator assistant driven by Playwright: turn a folder of images into posts — one post, or auto-split into many (9 images each by default). Schedule them (start time + interval, skipping the 23:00–07:00 low-traffic window), auto-generate a 3×3 collage cover with sharp, and publish hands-free after a one-time QR-code login (cookies persist locally). `--test` fills everything without clicking publish.

## Features

- **Two publishing modes**: single post (all images in a folder → one post); bulk split (auto-chunked by `--chunk`, 9 images per post by default).
- **Smart scheduling**: set the first post's time and an interval (default 2h); optionally skip the 23:00–07:00 low-traffic window, rolling over to the next morning. A full plan preview is shown for confirmation before anything runs.
- **Collage cover**: sharp stitches the first images into a 3×3 grid cover.
- **Anti-detection**: Stealth plugin plus human-like slider-CAPTCHA trajectories; falls back to manual handling if auto-slide fails.
- **Cookie persistence**: QR-code login on first run, browser data persists locally (`.browser_data`), so later runs need no login; or inject via the `COOKIES_JSON` env var.
- **Interactive wizard**: `pnpm start` walks through the setup step by step (bilingual interface, `--english` forces English; on Mac it can open a folder picker).
- **Titles & copy**: from `--title` / `--desc` flags, or a `meta.json` in the folder (`title`, `content`, `tags` fields); falls back to the folder name.
- **Test mode**: `--test` uploads and fills everything but never clicks publish; failures save a page screenshot for debugging.

## Install

Node.js 16+, pnpm:

```bash
pnpm install
pnpm exec playwright install chromium   # once only, initializes the browser engine
```

## Usage

Interactive mode (recommended):

```bash
pnpm start
```

Command-line mode:

```bash
# Bulk split + scheduling
node xhs_publisher.js --bulk-dir ./my_images --chunk 9 --title "每日分享" --schedule-start "2026-04-05 12:00"

# Collage cover + test mode (no real publish)
node xhs_publisher.js --dir ./travel_log --collage --test
```

| Flag | Description |
|---|---|
| `-i, --interactive` | Interactive setup mode (default) |
| `--dir <path>` | Single-post folder |
| `--bulk-dir <path>` | Bulk folder (auto-split) |
| `--chunk <number>` | Images per post in bulk mode (default 9) |
| `--title <text>` | Post title |
| `--desc <text>` | Post body |
| `--collage` | Enable auto collage cover |
| `--schedule` | Enable scheduled publishing |
| `--schedule-start <time>` | First post time (`YYYY-MM-DD HH:mm`) |
| `--schedule-interval <hours>` | Interval between posts (default 2) |
| `--skip-night` | Skip the 23:00–07:00 low-traffic window |
| `--test` | Test mode: fill content, never click publish |
| `--english` | Force the English interface |
| `-h, --help` | Show help |

## Tech

- A single-file script `xhs_publisher.js` (about 48KB). Dependencies: `playwright` + `playwright-extra` + `puppeteer-extra-plugin-stealth` (browser automation and anti-detection), `sharp` (collages), `enquirer` (interactive prompts), `dotenv` (environment variables).
- Login state: a Playwright persistent context (`.browser_data`); runs headless automatically in GitHub Actions.

```
xhs_publisher.js   All logic: argument parsing / interactive wizard / collage / publishing / scheduling
package.json       pnpm start runs node xhs_publisher.js
```

## Disclaimer

For educational and research purposes only; please follow Xiaohongshu's platform terms and keep posting frequency reasonable.
