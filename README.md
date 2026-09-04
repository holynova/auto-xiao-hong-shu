# 🚀 Auto XHS Publisher (小红书自动发布工具)

项目介绍页：[auto-xiao-hong-shu.xiaosang.cc](https://auto-xiao-hong-shu.xiaosang.cc/)。云端页面仅发布静态文档；浏览器自动化与登录态仍在本地执行。

[English](#english) | [中文](#chinese)

---

<a name="english"></a>
## English

A **Playwright**-based creator assistant for Xiaohongshu (Little Red Book). It supports single post publishing, bulk splitting of large directories, scheduled task management, and automatic collage cover generation.

### ✨ Key Features

- 🤖 **Full Automation**: Automatically uploads images, fills in titles and descriptions, and clicks publish.
- 📦 **Two Publishing Modes**:
  - **Single Mode**: Publishes all images in a folder as one post.
  - **Bulk Mode**: Automatically splits a folder with many images into multiple posts based on a set count (e.g., every 9 images).
- ⏰ **Smart Scheduling System**:
  - Set the start time for the first post and the interval between subsequent posts.
  - **Night Mode Avoidance**: Configurable to stop publishing during low-traffic hours (23:00 - 07:00) and resume the next morning.
- 🎨 **Auto Collage Cover**: Built-in `sharp` library to automatically grab the first few images and generate an attractive nine-grid collage as the cover.
- 🕵️ **Anti-Detection**: Built-in Stealth mode and simulated human-like slider CAPTCHA trajectories.
- 🍪 **Cookie Persistence**: Automatically saves cookies after the first manual login for future password-less automation.

### 🛠️ Installation

1. **Prerequisites**: Ensure Node.js (v16+ recommended) is installed.
2. **Clone and Install Dependencies**:
   ```bash
   pnpm install
   ```
3. **Initialize Browser Kernel**:
   ```bash
   pnpm exec playwright install chromium
   ```

### 🚀 Usage Guide

#### 1. Interactive Mode (Recommended)
Simply run the script and follow the prompts. Perfect for beginners:
```bash
pnpm start
```

#### 2. Command Line Arguments
For advanced users or automation:
```bash
# Bulk split publishing
node xhs_publisher.js --bulk-dir ./my_images --chunk 9 --title "Daily Share" --schedule-start "2026-04-05 12:00"

# Enable collage mode and run a publishing test
node xhs_publisher.js --dir ./travel_log --collage --test
```

### 📖 CLI Arguments Detail

| Argument | Description |
| :--- | :--- |
| `-i, --interactive` | Enter interactive configuration mode (default). |
| `--dir <path>` | Path to a single post folder. |
| `--bulk-dir <path>` | Path to a bulk folder (auto-split). |
| `--chunk <num>` | Number of images per post in bulk mode (default 9). |
| `--title <text>` | Post title. |
| `--desc <text>` | Post description. |
| `--collage` | Enable automatic collage cover generation. |
| `--schedule` | Enable scheduled publishing. |
| `--schedule-start <time>` | Start time for the first post (YYYY-MM-DD HH:mm). |
| `--schedule-interval <hr>` | Interval between posts in hours (default 2). |
| `--skip-night` | Skip publishing during low-traffic hours (23:00-07:00). |
| `--test` | Test mode: Fills content but skips the final publish button. |
| `--english` | Force English interface. |
| `-h, --help` | Display help information. |

### 📄 Notes

- **First Run**: A browser window will open; please manually scan the QR code to log in. Cookies will be saved locally for subsequent runs.
- **CAPTCHA**: If a slider CAPTCHA is triggered, the script will attempt to simulate manual sliding. If it fails, please handle it manually in the console.
- **Disclaimer**: This tool is for educational and research purposes only. Please comply with Xiaohongshu's platform agreements and control your publishing frequency reasonably.

---

<a name="chinese"></a>
## 中文

一款基于 **Playwright** 开发的小红书创作者助手。支持单帖发布、大目录自动拆分批量发布、定时任务管理以及自动拼图封面生成。

### ✨ 核心特性

- 🤖 **全自动流程**：自动上传图片、填写标题、正文，并支持自动点击发布。
- 📦 **两种发布模式**：
  - **Single Mode**: 一个文件夹内的所有图片发布为一个帖子。
  - **Bulk Mode**: 将包含大量图片的文件夹按设定数量（如每 9 张）自动拆分为多篇帖子。
- ⏰ **智能定时系统**：
  - 支持设置首篇发布时间及发布间隔。
  - **深夜自动避让**：可配置在凌晨 (23:00 - 07:00) 自动停止发布，并顺延至次日早晨。
- 🎨 **自动拼图封面**：内置 `sharp` 库，可自动抓取前几张图片生成精美的九宫格拼图作为封面。
- 🕵️ **反检测增强**：内置 Stealth 模式和真实人类滑动验证码轨迹模拟。
- 🍪 **Cookie 持久化**：首次手动登录后自动保存 Cookie，后续实现全自动免密发布。

### 🛠️ 安装步骤

1. **环境依赖**：确保已安装 Node.js (推荐 v16+)。
2. **克隆并安装依赖**：
   ```bash
   pnpm install
   ```
3. **初始化浏览器内核**：
   ```bash
   pnpm exec playwright install chromium
   ```

### 🚀 使用指南

#### 1. 交互模式 (推荐)
直接运行脚本，按照提示输入即可，非常适合新手：
```bash
pnpm start
```

#### 2. 命令行参数模式
适合进阶用户或脚本自动化调用：
```bash
# 批量拆分发布
node xhs_publisher.js --bulk-dir ./my_images --chunk 9 --title "每日分享" --schedule-start "2026-04-05 12:00"

# 开启拼图模式并进行发布测试
node xhs_publisher.js --dir ./travel_log --collage --test
```

### 📖 命令行参数详解

| 参数名 | 说明 |
| :--- | :--- |
| `-i, --interactive` | 进入交互式配置模式（默认）。 |
| `--dir <path>` | 指定单个帖子文件夹路径。 |
| `--bulk-dir <path>` | 指定批量文件夹路径（自动拆分）。 |
| `--chunk <num>` | 批量模式下每篇帖子的图片数量（默认 9）。 |
| `--title <text>` | 帖子标题。 |
| `--desc <text>` | 帖子正文描述。 |
| `--collage` | 开启自动生成拼图封面。 |
| `--schedule` | 开启定时发布。 |
| `--schedule-start <time>` | 首篇发布时间格式 (YYYY-MM-DD HH:mm)。 |
| `--schedule-interval <hr>` | 发布间隔小时数 (默认 2)。 |
| `--skip-night` | 是否避开发布低峰期 (23:00-07:00)。 |
| `--test` | 测试模式：自动填写内容但不点击最终发布按钮。 |
| `--english` | 强制使用英语界面。 |
| `-h, --help` | 显示帮助信息。 |

### 📄 注意事项

- **首次运行**：会自动打开浏览器窗口，请手动扫描小红书二维码登录。登录成功后，Cookie 将保存在本地，下次运行无需手动登录。
- **验证码**：如果触发滑块验证码，脚本会尝试模拟人工滑动。如果自动滑动失败，请在控制台中手动操作。
- **免责声明**：本工具仅供学习和研究使用，请遵守小红书平台相关协议，合理控制发布频率。
