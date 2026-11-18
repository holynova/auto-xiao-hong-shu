<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="Auto XHS Publisher — 小红书自动发布工具：图片文件夹 → 九宫格封面 → 定时排期 → 发布">
</p>

<p align="center">
  <a href="https://xiaosang.cc/auto-xiao-hong-shu/">▶ 项目介绍页 Project Page</a>
  ·
  <a href="https://github.com/holynova/auto-xiao-hong-shu">GitHub 仓库</a>
</p>

小红书创作者助手（Playwright 驱动）：把一文件夹图片发成帖子——单帖，或按每 9 张自动拆成多篇；支持定时排期（首篇时间 + 间隔，跳过 23:00–07:00 低峰时段）；sharp 自动拼九宫格封面；首次扫码登录后 Cookie 存本地，后续免密发布；`--test` 模式只填内容不点发布。

A Xiaohongshu creator assistant driven by Playwright: turn a folder of images into posts — one post, or auto-split into many (9 images each by default). Schedule them (start time + interval, skipping the 23:00–07:00 low-traffic window), auto-generate a 3×3 collage cover with sharp, and publish hands-free after a one-time QR-code login (cookies persist locally). `--test` fills everything without clicking publish.

## 功能 / Features

- **两种发布模式**：单帖（文件夹内所有图片发为一篇）；批量分 P（按 `--chunk` 数量自动拆成多篇，默认 9 张/篇）。
- **智能定时**：设首篇时间与间隔（默认 2 小时）；可跳过 23:00–07:00 凌晨低峰，顺延到次日早晨；发布前预览完整计划，确认后才执行。
- **自动拼图封面**：用 sharp 抓前几张图拼九宫格做封面。
- **反检测**：Stealth 插件 + 拟人滑块验证码轨迹；触发滑块时自动尝试滑动，失败可手动处理。
- **Cookie 持久化**：首次手动扫码登录后，浏览器数据存本地（`.browser_data`），后续免密；也支持 `COOKIES_JSON` 环境变量注入。
- **交互式向导**：`pnpm start` 按提示一步步配（中英双语界面，`--english` 强制英文；Mac 上可呼起文件夹选择框）。
- **标题与正文来源**：命令行 `--title` / `--desc`，或目录内 `meta.json`（`title`、`content`、`tags` 字段），留空则用文件夹名做标题。
- **测试模式**：`--test` 走完上传与填写，跳过真正的发布点击；发布失败自动保存页面截图便于排查。

## 安装 / Install

Node.js 16+，pnpm：

```bash
pnpm install
pnpm exec playwright install chromium   # 仅需一次，初始化浏览器内核
```

## 使用 / Usage

交互模式（推荐）：

```bash
pnpm start
```

命令行模式：

```bash
# 批量拆分 + 定时
node xhs_publisher.js --bulk-dir ./my_images --chunk 9 --title "每日分享" --schedule-start "2026-04-05 12:00"

# 拼图封面 + 测试模式（不真发）
node xhs_publisher.js --dir ./travel_log --collage --test
```

| 参数 | 说明 |
|---|---|
| `-i, --interactive` | 交互式配置模式（默认） |
| `--dir <路径>` | 单帖文件夹 |
| `--bulk-dir <路径>` | 批量文件夹（自动拆分） |
| `--chunk <数量>` | 批量模式每篇图片数（默认 9） |
| `--title <文本>` | 帖子标题 |
| `--desc <文本>` | 帖子正文 |
| `--collage` | 开启自动拼图封面 |
| `--schedule` | 开启定时发布 |
| `--schedule-start <时间>` | 首篇发布时间（`YYYY-MM-DD HH:mm`） |
| `--schedule-interval <小时>` | 发布间隔（默认 2） |
| `--skip-night` | 跳过 23:00–07:00 低峰时段 |
| `--test` | 测试模式：填写内容，不点发布 |
| `--english` | 强制英文界面 |
| `-h, --help` | 显示帮助 |

## 技术 / Tech

- 单文件脚本 `xhs_publisher.js`（约 48KB），依赖：`playwright` + `playwright-extra` + `puppeteer-extra-plugin-stealth`（浏览器自动化与反检测）、`sharp`（拼图）、`enquirer`（交互式提问）、`dotenv`（环境变量）。
- 登录态：Playwright 持久化上下文（`.browser_data`）；GitHub Actions 环境下自动 headless。

```
xhs_publisher.js   全部逻辑：参数解析 / 交互向导 / 拼图 / 发布 / 定时
package.json       pnpm start 即 node xhs_publisher.js
```

## English

**Auto XHS Publisher** is a Playwright-driven assistant for posting to Xiaohongshu (Little Red Book) from the command line.

- **Two modes**: single post (whole folder → one post) or bulk split (auto-chunked, 9 images per post by default).
- **Smart scheduling**: set the first post's time and an interval (default 2h); optionally skip the 23:00–07:00 low-traffic window. A full plan preview is shown for confirmation before anything runs.
- **Collage cover**: sharp stitches the first images into a 3×3 grid cover.
- **Anti-detection**: Stealth plugin plus human-like slider-CAPTCHA trajectories; falls back to manual handling if auto-slide fails.
- **Login once**: QR-code login on first run, cookies persist locally (`.browser_data`); or inject via the `COOKIES_JSON` env var.
- **Titles & copy**: from `--title` / `--desc` flags, or a `meta.json` in the folder (`title`, `content`, `tags`); falls back to the folder name.
- **Test mode**: `--test` uploads and fills everything but never clicks publish; failures save a page screenshot for debugging.
- **Install**: Node.js 16+, `pnpm install`, then `pnpm exec playwright install chromium` (once). Run `pnpm start` for the interactive wizard (bilingual, `--english` forces English).

## 免责声明 / Disclaimer

本工具仅供学习与研究使用，请遵守小红书平台相关协议，合理控制发布频率。For educational and research purposes only; please follow Xiaohongshu's platform terms and keep posting frequency reasonable.
