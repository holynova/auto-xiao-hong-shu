require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const sharp = require('sharp');

chromium.use(stealth);

const USER_DATA_DIR = path.join(__dirname, '.browser_data');

const readline = require('readline');
const { Select, Input, Confirm } = require('enquirer');

const STRINGS = {
  zh: {
    toolName: "小红书 Playwright(Node.js) 批量发布工具",
    enterInteractive: "\n💬 进入交互式配置模式...",
    selectMode: "请选择发布模式 (使用方向键选择):",
    selectModeOptions: [
        { name: "single", message: "1: [单帖模式] 文件夹内所有图片发为一个帖子" },
        { name: "bulk", message: "2: [批量分P] 自动将图片分页发成多篇帖子" }
    ],
    currentDir: "\n📂 当前目录: ",
    enterDirPath: "请输入图片文件夹路径 (直接回车呼起选择框, 或输入路径):",
    noFolderSelected: "⚠️ 未选择文件夹，请手动输入路径。",
    nonMacNoPicker: "❌ 非 Mac 环境无法呼起选择框，请输入文件夹路径。",
    pathNotExist: "❌ 路径不存在: ",
    reEnter: "\n请重新输入。",
    imgsPerPost: "每篇帖子包含几张图片? (默认 9):",
    enterTitle: "请输入标题 (留空则读取 meta.json 或文件夹名):",
    enterDesc: "请输入正文描述:",
    enableCollage: "是否开启自动拼图封面模式?",
    taskOverview: "\n📊 任务概览: 共检测到 %d 张图片，将分为 %d 篇帖子发布。",
    selectTimeMode: "\n⏰ 请设置发布时间方式:",
    selectTimeOptions: [
        { name: "immediate", message: "1: 立即发布 (Immediate)" },
        { name: "schedule", message: "2: 定时发布 (Scheduled)" }
    ],
    scheduleSettings: "\n⏰ 定时发布参数配置:",
    enterStartTime: "请输入首篇发布日期时间 (默认 %s):",
    invalidTime: "⚠️ 时间格式非法，使用默认时间。",
    enterInterval: "请输入发布间隔 (支持 2 或 120min 等, 默认 2h):",
    skipNight: "是否跳过凌晨低峰时段 (23:00 - 07:00)?",
    planPreview: "\n📋 发布计划预览:",
    immediate: "立即发布",
    postIndex: "[第 %s 篇]",
    confirmPlan: "\n✅ 确认以上发布计划并开始执行?",
    cancelled: "👋 已取消发布。",
    startTask: "🚀 开始发布任务: %s",
    noImgsFound: "❌ 未找到任何图片文件 (*.png, *.jpg)。跳过。",
    workDir: "📂 工作目录: %s",
    titleLine: "📝 标题: %s",
    imgCount: "🖼️  图片: %d 张",
    generatingCollage: "🎨 正在生成拼图封面 (基于前 %d 张图)...",
    collageGenerated: "✅ 拼图封面已生成: %s",
    collageFailed: "❌ 生成拼图失败: %s",
    startingBrowser: "🚀 启动浏览器 (Headless: %s)...",
    firstRunError: "❌ 这是你第一次运行，或者 Playwright Chromium 内核未找到！",
    initHint: "👉 请先在终端运行以下命令进行环境初始化 (仅需一次)：\n   pnpm exec playwright install chromium\n",
    detectCookies: "🍪 检测到 cookies 环境变量，正在注入...",
    cookiesSuccess: "   Cookies 注入成功",
    cookiesFailed: "❌ Cookies 注入失败: %s",
    openingXHS: "\n🌐 正在打开小红书创作者中心...",
    manualLogin: "\n⚠️  请在浏览器中手动登录小红书...",
    autoContinue: "   登录完成后，脚本会自动继续",
    loginSuccess: "✅ 登录成功！",
    loginTimeout: "❌ 等待登录超时或手动打断！",
    uploadingImgs: "\n📤 正在上传图片...",
    noUploadBtn: "⚠️  未找到图片上传按钮，请手动上传图片\n   图片路径: %s",
    uploadingProgress: "   上传图片 %d/%d...",
    uploadFailed: "   图片 %d 上传失败: %s",
    waitingImgProcess: "   等待图片处理...",
    fillingTitle: "📝 正在填写标题...",
    titleFillFailed: "⚠️  无法自动填写标题，请检查页面结构。",
    fillingDesc: "📝 正在填写正文...",
    fillingSuccess: "✅ 内容填写完成！",
    settingSchedule: "\n⏰ 正在设置定时发布...",
    targetTime: "   目标时间: %s%s",
    twoHoursLater: " (两小时后)",
    scheduleSuccess: "   时间设置成功: %s",
    noDateInput: "   ⚠️ 无法找到日期输入框，请检查页面是否有变化",
    noScheduleTab: "   ⚠️ 未找到定时发布选项卡",
    scheduleError: "   ⚠️ 设置定时发布出错: %s",
    testModeSkip: "\n🛑 当前为测试模式(--test)，跳过真正的发布点击...",
    clickingPublish: "\n🚀 正在自动点击发布...",
    clickingAttempt: "   点击发布按钮 (尝试 %d)...",
    sliderDetected: "⚠️  检测到滑块验证码！尝试自动滑动...",
    notRedirected: "   似乎未跳转，准备重试...",
    noPublishBtn: "❌ 未找到发布按钮，请手动点击",
    waitingSuccess: "   等待发布成功确认...",
    redirectSuccess: "   检测到页面跳转，发布可能成功",
    toastSuccess: "   检测到成功提示",
    publishSuccess: "🎉 发布成功！",
    noSuccessSignal: "⚠️  未检测到明确的发布成功信号: %s",
    saveScreenshot: "   已保存页面截图到: %s",
    manualCheck: "   请手动检查浏览器状态",
    checkingStatus: "\n等待几秒查看状态...",
    publishFailed: "\n❌ 发布失败: %s",
    cookiesSaved: "\n🍪 Cookies 已保存到 %s\n   请复制此文件内容到 GitHub Secrets (Name: COOKIES_JSON)",
    saveCookiesFailed: "   Cookies 保存失败: %s",
    browserClosed: "\n👋 浏览器已关闭",
    unnamedPost: "未命名",
    bulkBatchTitle: "批量发布",
    bulkBatchDesc: "这是自动批量发布的图文",
    bulkModeEnabled: "\n📦 开启文件夹批量分P发布模式",
    targetBulkDir: "📁 目标文件夹: %s",
    imgsPerPostBulk: "🖼️ 每篇帖子图片数: %d",
    unifiedTitleBulk: "📝 统一标题: %s (带序号)",
    noImgsInDir: "❌ 文件夹中没有图片文件: %s",
    batchSummary: "📊 共计 %d 张图片，将分为 %d 篇帖子发布。",
    startingBatchTask: "\n▶️ 开始执行 第 %d/%d 个任务...",
    waitingNextTask: "\n⏳ 等待 %s 秒后执行下一个任务...",
    batchComplete: "\n🎉 批量发布完毕! 总任务: %d, 成功: %s",
    dirNotExist: "❌ 指定的目录不存在: %s",
    missingTitle: "❌ 必须提供 --title 参数或确保目录内有 meta.json。",
    noImgsFoundGeneric: "❌ 未找到文件夹 %s，没有任何图片可发。",
    invalidScheduleStart: "❌ --schedule-start 时间格式不正确，建议使用 'YYYY-MM-DD HH:mm'",
    helpTitle: "📖 小红书 Playwright(Node.js) 自动发布工具 - 帮助",
    helpUsage: "用法:",
    helpCommonOptions: "常用选项:",
    helpOptionInteractive: "进入交互模式 (无参数时的默认行为)",
    helpOptionDir: "指定单个发布文件夹路径 (发一帖)",
    helpOptionBulkDir: "指定批量发帖文件夹路径 (大目录自动按 chunk 分页发多帖)",
    helpOptionChunk: "批量模式下每篇帖子的图片数量 (默认 9)",
    helpOptionTitle: "统一标题 (Bulk 模式下自动带序号)",
    helpOptionDesc: "统一正文内容",
    helpOptionCollage: "开启自动拼图封面模式",
    helpOptionSchedule: "开启定时发布",
    helpOptionScheduleStart: "首篇发布时间 (格式: \"2026-04-05 12:00\")",
    helpOptionScheduleInterval: "发帖间隔小时数 (默认 2)",
    helpOptionSkipNight: "凌晨 (23:00-07:00) 自动回避并顺延",
    helpOptionTest: "测试模式 (填写内容但不点击发布)",
    helpOptionEnglish: "强制使用英语界面 (Force English mode)",
    helpOptionHelp: "显示此帮助信息",
    helpExamples: "示例:",
    noImgFoldersFound: "ℹ️ 在 slides_downloads 下未找到任何 _images 后缀的文件夹。",
    scannedFolders: "📂 扫描到以下图集文件夹 (按最新时间排序)：\n",
    enterFolderIndices: "\n> 请输入要批量发布的文件夹编号 (单选 1，多选 1,3,5，连续多选 1-15): ",
    invalidInput: "⚠️ 输入无效，请重试。",
    tasksSelected: "\n✅ 已选择 %d 个发布任务，将按顺序逐一执行...",
    fatalError: "💥 预料之外的致命错误:",
  },
  en: {
    toolName: "Xiaohongshu Playwright(Node.js) Bulk Publishing Tool",
    enterInteractive: "\n💬 Entering Interactive Configuration Mode...",
    selectMode: "Please select publishing mode (Use arrow keys):",
    selectModeOptions: [
        { name: "single", message: "1: [Single Mode] All images in folder -> 1 Post" },
        { name: "bulk", message: "2: [Bulk Mode] Split folder -> Multiple Posts" }
    ],
    currentDir: "\n📂 Current directory: ",
    enterDirPath: "Enter image folder path (Enter for picker, or type path):",
    noFolderSelected: "⚠️ No folder selected, please input path manually.",
    nonMacNoPicker: "❌ Folder picker is macOS only, please input path manually.",
    pathNotExist: "❌ Path does not exist: ",
    reEnter: "\nPlease re-enter.",
    imgsPerPost: "How many images per post? (default 9):",
    enterTitle: "Enter title (Leave empty to use folder name):",
    enterDesc: "Enter description:",
    enableCollage: "Enable auto-generated collage for cover?",
    taskOverview: "\n📊 Task Overview: %d images detected, will be published in %d posts.",
    selectTimeMode: "\n⏰ Select publishing time:",
    selectTimeOptions: [
        { name: "immediate", message: "1: Immediate Publishing" },
        { name: "schedule", message: "2: Scheduled Publishing" }
    ],
    scheduleSettings: "\n⏰ Scheduled Publishing configuration:",
    enterStartTime: "Enter start time for the first post (default %s):",
    invalidTime: "⚠️ Invalid time format, using default time.",
    enterInterval: "Enter interval (e.g., '2' or '120min', default 2h):",
    skipNight: "Skip late-night hours (23:00 - 07:00)?",
    planPreview: "\n📋 Publishing Plan Preview:",
    immediate: "Immediate Publishing",
    postIndex: "[Post %s]",
    confirmPlan: "\n✅ Confirm the above plan and start executing?",
    cancelled: "👋 Publishing cancelled.",
    startTask: "🚀 Starting task: %s",
    noImgsFound: "❌ No images (*.png, *.jpg) found. Skipping.",
    workDir: "📂 Work Directory: %s",
    titleLine: "📝 Title: %s",
    imgCount: "🖼️  Images: %d",
    generatingCollage: "🎨 Generating collage cover (based on first %d images)...",
    collageGenerated: "✅ Collage cover generated: %s",
    collageFailed: "❌ Failed to generate collage: %s",
    startingBrowser: "🚀 Launching browser (Headless: %s)...",
    firstRunError: "❌ First run or Playwright Chromium not found!",
    initHint: "👉 Please run the following command to initialize the environment (one-time only):\n   pnpm exec playwright install chromium\n",
    detectCookies: "🍪 COOKIES_JSON detected in environment, injecting...",
    cookiesSuccess: "   Cookies injected successfully",
    cookiesFailed: "❌ Cookies injection failed: %s",
    openingXHS: "\n🌐 Opening Xiaohongshu Creator Center...",
    manualLogin: "\n⚠️  Please log in to Xiaohongshu manually in the browser...",
    autoContinue: "   Script will continue automatically after login",
    loginSuccess: "✅ Login successful!",
    loginTimeout: "❌ Login timed out or interrupted!",
    uploadingImgs: "\n📤 Uploading images...",
    noUploadBtn: "⚠️  Upload button not found, please upload manually.\n   Paths: %s",
    uploadingProgress: "   Uploading image %d/%d...",
    uploadFailed: "   Image %d failed: %s",
    waitingImgProcess: "   Waiting for images to process...",
    fillingTitle: "📝 Filling title...",
    titleFillFailed: "⚠️  Failed to fill title automatically, please check page structure.",
    fillingDesc: "📝 Filling description...",
    fillingSuccess: "✅ Content filled successfully!",
    settingSchedule: "\n⏰ Setting scheduled publishing...",
    targetTime: "   Target time: %s%s",
    twoHoursLater: " (Two hours later)",
    scheduleSuccess: "   Time set successfully: %s",
    noDateInput: "   ⚠️ Cannot find date input field, page might have changed",
    noScheduleTab: "   ⚠️ Cannot find scheduled publishing tab",
    scheduleError: "   ⚠️ Error setting schedule: %s",
    testModeSkip: "\n🛑 Test mode (--test), skipping actual publish click...",
    clickingPublish: "\n🚀 Clicking publish automatically...",
    clickingAttempt: "   Clicking publish button (Attempt %d)...",
    sliderDetected: "⚠️  CAPTCHA detected! Attempting automatic slide...",
    notRedirected: "   Not redirected, retrying...",
    noPublishBtn: "❌ Publish button not found, please click manually",
    waitingSuccess: "   Waiting for success confirmation...",
    redirectSuccess: "   Redirect detected, publish might be successful",
    toastSuccess: "   Success toast detected",
    publishSuccess: "🎉 Published successfully!",
    noSuccessSignal: "⚠️  No clear success signal: %s",
    saveScreenshot: "   Screenshot saved to: %s",
    manualCheck: "   Please check browser status manually",
    checkingStatus: "\nWaiting a few seconds to check status...",
    publishFailed: "\n❌ Publishing failed: %s",
    cookiesSaved: "\n🍪 Cookies saved to %s\n   Please copy the content to GitHub Secrets (Name: COOKIES_JSON)",
    saveCookiesFailed: "   Failed to save cookies: %s",
    browserClosed: "\n👋 Browser closed",
    unnamedPost: "Unnamed",
    bulkBatchTitle: "Bulk Publishing",
    bulkBatchDesc: "This is a post generated by the bulk publishing tool",
    bulkModeEnabled: "\n📦 Bulk directory split mode enabled",
    targetBulkDir: "📁 Target folder: %s",
    imgsPerPostBulk: "🖼️ Images per post: %d",
    unifiedTitleBulk: "📝 Unified title: %s (with index)",
    noImgsInDir: "❌ No images found in folder: %s",
    batchSummary: "📊 Found %d images, will be split into %d posts.",
    startingBatchTask: "\n▶️ Starting task %d/%d...",
    waitingNextTask: "\n⏳ Waiting %s seconds for the next task...",
    batchComplete: "\n🎉 Bulk publishing complete! Total: %d, Success: %s",
    dirNotExist: "❌ Directory not exist: %s",
    missingTitle: "❌ Must provide --title or meta.json in the directory.",
    noImgsFoundGeneric: "❌ Folder %s not found, no images to publish.",
    invalidScheduleStart: "❌ --schedule-start format invalid, use 'YYYY-MM-DD HH:mm'",
    helpTitle: "📖 Xiaohongshu Playwright(Node.js) Publishing Tool - Help",
    helpUsage: "Usage:",
    helpCommonOptions: "Common Options:",
    helpOptionInteractive: "Enter interactive mode (default if no args)",
    helpOptionDir: "Single post directory path",
    helpOptionBulkDir: "Bulk post directory path (auto-split by chunk)",
    helpOptionChunk: "Images per post in bulk mode (default 9)",
    helpOptionTitle: "Unified title (with index in bulk mode)",
    helpOptionDesc: "Unified description",
    helpOptionCollage: "Enable auto-collage cover mode",
    helpOptionSchedule: "Enable scheduled publishing",
    helpOptionScheduleStart: "First post schedule time (format: \"2026-04-05 12:00\")",
    helpOptionScheduleInterval: "Interval hours (default 2)",
    helpOptionSkipNight: "Skip night (23:00-07:00) during scheduling",
    helpOptionTest: "Test mode (fill content but don't click publish)",
    helpOptionEnglish: "Force English interface",
    helpOptionHelp: "Display this help message",
    helpExamples: "Examples:",
    noImgFoldersFound: "ℹ️ No folders with '_images' suffix found in slides_downloads.",
    scannedFolders: "📂 Scanned the following image folders (sorted by time):\n",
    enterFolderIndices: "\n> Please enter folder indices to publish (e.g., 1, or 1,3,5, or 1-15): ",
    invalidInput: "⚠️ Invalid input, please try again.",
    tasksSelected: "\n✅ Selected %d tasks, executing sequentially...",
    fatalError: "💥 Unexpected fatal error:",
  }
};

let CURRENT_LANG = 'en';

function t(key, ...params) {
  let str = (STRINGS[CURRENT_LANG] && STRINGS[CURRENT_LANG][key]) || (STRINGS['zh'] && STRINGS['zh'][key]) || key;
  params.forEach(p => {
    str = str.replace(/%[sdPd]/, p);
  });
  return str;
}

function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans); }));
}

async function randomWait(page, min, max) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await page.waitForTimeout(delay);
}

function parseIndices(inputStr, maxLen) {
  const indices = new Set();
  const parts = inputStr.split(/[,\s]+/);
  for (const part of parts) {
    if (!part) continue;
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= maxLen) indices.add(i - 1);
        }
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= maxLen) {
        indices.add(num - 1);
      }
    }
  }
  return Array.from(indices).sort((a, b) => a - b);
}

function calculateNextScheduleTime(baseTime, index, interval, skipNight) {
    if (index === 0) return baseTime;
    
    let t = baseTime;
    for (let i = 0; i < index; i++) {
        t += interval * 60 * 60 * 1000;
        let d = new Date(t);
        let h = d.getHours();
        // If it lands in the night (>= 23 or < 7)
        if (skipNight && (h >= 23 || h < 7)) {
            // Push it to 07:00 of the (current or next) day
            if (h >= 23) {
                d.setDate(d.getDate() + 1);
            }
            d.setHours(7, 0, 0, 0);
            t = d.getTime();
        }
    }
    return t;
}

/**
 * 自动生成拼图封面
 * @param {string[]} imagePaths 原始图片路径
 * @param {string} targetDir 输出目录
 * @returns {Promise<string|null>} 拼图路径
 */
async function generateCollage(imagePaths, targetDir) {
  if (!imagePaths || imagePaths.length === 0) return null;

  try {
    console.log(t('generatingCollage', Math.min(imagePaths.length, 9)));
    
    // 以第一张图为基准尺寸
    const firstImage = sharp(imagePaths[0]);
    const metadata = await firstImage.metadata();
    const w = metadata.width;
    const h = metadata.height;

    const count = imagePaths.length;
    // 数量 <= 4 用 2x2，否则用 3x3
    const gridSize = count <= 4 ? 2 : 3;
    const totalSlots = gridSize * gridSize;

    const composites = [];
    for (let i = 0; i < totalSlots; i++) {
        const imgPath = imagePaths[i % count]; // 如果不够则循环
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;

        // 处理每一张小图：缩放并裁切到基准尺寸
        const buffer = await sharp(imgPath)
            .resize(w, h, { fit: 'cover', position: 'center' })
            .toBuffer();

        composites.push({
            input: buffer,
            top: row * h,
            left: col * w,
        });
    }

    const collageFilename = `collage_${Date.now()}.png`;
    const outputPath = path.join(targetDir, collageFilename);

    await sharp({
        create: {
            width: w * gridSize,
            height: h * gridSize,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
    })
    .composite(composites)
    .toFile(outputPath);

    console.log(t('collageGenerated', outputPath));
    return outputPath;
  } catch (err) {
    console.error(t('collageFailed', err.message));
    return null;
  }
}

async function publishTask(workDirOrImagePaths, title, descText, options = {}) {
  console.log("==================================================");
  console.log(t('startTask', title));
  
  let targetDir;
  let imagePaths = [];

  if (Array.isArray(workDirOrImagePaths)) {
    imagePaths = [...workDirOrImagePaths];
    targetDir = imagePaths.length > 0 ? path.dirname(imagePaths[0]) : process.cwd();
  } else {
    targetDir = workDirOrImagePaths;
    // 收集工作区内的有效图片
    const files = fs.readdirSync(targetDir);
    const imgFiles = files.filter(f => /\.(png|jpe?g)$/i.test(f)).sort((a, b) => {
      const numA = parseInt(a.match(/^\d+/)?.[0]) || 0;
      const numB = parseInt(b.match(/^\d+/)?.[0]) || 0;
      return numA - numB || a.localeCompare(b);
    });

    for (const f of imgFiles) {
      if (imagePaths.length >= 18) break; 
      imagePaths.push(path.resolve(targetDir, f));
    }
  }

  if (imagePaths.length === 0) {
    console.log(t('noImgsFound'));
    return false;
  }

  console.log(t('workDir', targetDir));
  console.log(t('titleLine', title));
  console.log(t('imgCount', imagePaths.length));
  console.log("==================================================");

  if (options.collage) {
    const collagePath = await generateCollage(imagePaths, targetDir);
    if (collagePath) {
      imagePaths = [collagePath, ...imagePaths];
    }
  }

  const isGithubActions = process.env.GITHUB_ACTIONS === "true";
  const headlessMode = isGithubActions;

  console.log(t('startingBrowser', headlessMode));

  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const executablePath = chromium.executablePath();
  if (!fs.existsSync(executablePath)) {
    console.log(t('firstRunError'));
    console.log(t('initHint'));
    return;
  }

  const browserCtx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: headlessMode,
    viewport: { width: 1280, height: 900 },
    locale: "zh-CN",
    args: ["--disable-blink-features=AutomationControlled"]
  });

  const page = browserCtx.pages().length > 0 ? browserCtx.pages()[0] : await browserCtx.newPage();

  const cookiesJson = process.env.COOKIES_JSON;
  if (cookiesJson) {
    try {
      console.log(t('detectCookies'));
      const cookies = JSON.parse(cookiesJson);
      await browserCtx.addCookies(cookies);
      console.log(t('cookiesSuccess'));
    } catch (e) {
      console.log(t('cookiesFailed', e.message));
    }
  }

  try {
    console.log(t('openingXHS'));
    await page.goto("https://creator.xiaohongshu.com/publish/publish?from=menu&target=image", { waitUntil: "networkidle", timeout: 60000 });

    const currentUrl = page.url().toLowerCase();
    const loginTextCount = await page.locator("text=登录").count();

    if (currentUrl.includes("login") || loginTextCount > 0) {
      console.log(t('manualLogin'));
      console.log(t('autoContinue'));

      await randomWait(page, 1500, 3000);
      try {
        await page.waitForURL("**/publish/**", { timeout: 300000 });
        console.log(t('loginSuccess'));
      } catch (err) {
        console.log(t('loginTimeout'));
        throw err;
      }
    }

    await randomWait(page, 1500, 3000);

    console.log(t('uploadingImgs'));

    try {
      const imageTab = page.locator('text=发布图文, text=图文, [class*="image"]').first();
      if ((await imageTab.count()) > 0) {
        await imageTab.click({ force: true });
        await randomWait(page, 800, 1500);
      }
    } catch (e) {
      // Ignored
    }

    const fileInputs = await page.locator('input[type="file"]').all();
    let imageInput = null;

    for (const inp of fileInputs) {
      const accept = (await inp.getAttribute("accept")) || "";
      if (accept.toLowerCase().includes("image") || accept.toLowerCase().includes(".jpg") || accept.toLowerCase().includes(".png") || accept.toLowerCase().includes(".jpeg")) {
        imageInput = inp;
        break;
      }
    }

    if (!imageInput) {
      for (const inp of fileInputs) {
        const accept = (await inp.getAttribute("accept")) || "";
        if (!accept.includes(".mp4") && !accept.includes(".mov")) {
          imageInput = inp;
          break;
        }
      }
    }

    if (!imageInput) {
      console.log(t('noUploadBtn', imagePaths.join(", ")));
    } else {
      for (let i = 0; i < imagePaths.length; i++) {
        try {
          console.log(t('uploadingProgress', i + 1, imagePaths.length));
          await imageInput.setInputFiles(imagePaths[i]);
          await randomWait(page, 1500, 3000);
        } catch (e) {
          console.log(t('uploadFailed', i + 1, e.message));
        }
      }
    }

    console.log(t('waitingImgProcess'));
    await randomWait(page, 4000, 6000);

    console.log(t('fillingTitle'));
    const titleSelectors = [
      '[placeholder*="填写标题会有更多赞哦"]',
      '[placeholder*="填写标题"]',
      'input[placeholder*="标题"]',
      '.c-input_inner',
      'input.titleInput',
      '#title',
      '[class*="title"] input',
      '[data-testid="title"]'
    ];

    let titleFilled = false;
    for (const selector of titleSelectors) {
      const titleInput = page.locator(selector).first();
      try {
        if ((await titleInput.isVisible()) && (await titleInput.isEnabled())) {
          await randomWait(page, 800, 1500);
          // 小红书标题严格限制最长 20 个字
          await titleInput.fill(title.substring(0, 20));
          await randomWait(page, 500, 1000);
          titleFilled = true;
          break;
        }
      } catch (e) {}
    }

    if (!titleFilled) {
      console.log(t('titleFillFailed'));
    }

    console.log(t('fillingDesc'));
    
    // 正文输入框选择器
    const descSelectors = [
      '[placeholder*="输入正文描述，真诚有价值的分享予人温暖"]',
      '[placeholder*="输入正文描述"]',
      '[placeholder*="正文"]',
      '[placeholder*="描述"]',
      '[class*="content"] textarea',
      '[class*="desc"] textarea',
      '#post-textarea',
      '[contenteditable="true"]'
    ];

    for (const selector of descSelectors) {
      const descInput = page.locator(selector).first();
      if ((await descInput.count()) > 0) {
        try {
          await randomWait(page, 800, 1500);
          // 正文最长 1000 个字
          await descInput.fill(descText.substring(0, 1000));
          await randomWait(page, 500, 1000);
          break;
        } catch (e) {}
      }
    }

    console.log(t('fillingSuccess'));

    if (options.schedule || options.scheduleTime) {
      console.log(t('settingSchedule'));
      try {
        let future;
        if (options.scheduleTime) {
          future = new Date(options.scheduleTime);
        } else {
          future = new Date(Date.now() + 2 * 60 * 60 * 1000);
        }
        const yyyy = future.getFullYear();
        const mm = String(future.getMonth() + 1).padStart(2, '0');
        const dd = String(future.getDate()).padStart(2, '0');
        const hh = String(future.getHours()).padStart(2, '0');
        const min = String(future.getMinutes()).padStart(2, '0');
        const timeStr = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
        
        console.log(t('targetTime', timeStr, options.scheduleTime ? '' : t('twoHoursLater')));
        
        const scheduleContainer = page.locator('.custom-switch-card').filter({ hasText: CURRENT_LANG === 'zh' ? /^定时发布$/ : /^Scheduled publishing$/ }).first();
        if (await scheduleContainer.count() > 0) {
            const switchBtn = scheduleContainer.locator('.d-switch').first();
            const isChecked = await scheduleContainer.locator('input[type="checkbox"]').evaluate(n => n.checked).catch(() => false);
            if (!isChecked) {
                await switchBtn.click({ force: true }).catch(() => switchBtn.click());
                await randomWait(page, 1000, 2000);
            }
            
            // 查找时间输入框并尝试 focus
            
            const hasInput = await page.evaluate(() => {
                 const inp = Array.from(document.querySelectorAll('input')).find(i => /^20\d\d-/.test(i.value) || (i.placeholder && (i.placeholder.includes('日期') || i.placeholder.includes('时间') || i.placeholder.includes('请选择'))));
                 if (inp) {
                     inp.focus();
                     return true;
                 }
                 return false;
            });
            
            if (hasInput) {
                await randomWait(page, 500, 1000);
                const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                await page.keyboard.press(isMac ? 'Meta+A' : 'Control+A');
                await randomWait(page, 200, 500);
                // 模拟输入
                await page.keyboard.insertText(timeStr);
                await randomWait(page, 200, 500);
                await page.keyboard.press('Enter');
                
                // 点击空白处收起日历框
                await page.mouse.click(10, 10);
                await randomWait(page, 1000, 2000);
                console.log(t('scheduleSuccess', timeStr));
            } else {
                console.log(t('noDateInput'));
                await page.screenshot({ path: path.join(targetDir, "debug_schedule.png") });
                const dbg = await page.evaluate(() => document.body.innerHTML);
                try { require('fs').writeFileSync(path.join(targetDir, "debug_schedule.html"), dbg); } catch(e){}
            }
        } else {
            console.log(t('noScheduleTab'));
        }
      } catch (e) {
         console.log(t('scheduleError', e.message));
      }
    }

    if (options.test) {
      console.log(t('testModeSkip'));
      await randomWait(page, 4000, 6000);
      return true;
    }

    console.log(t('clickingPublish'));
    const submitBtn = page.locator('button.submit, button:has-text("' + (CURRENT_LANG === 'zh' ? "发布" : "Publish") + '"), .publish-btn').first();

    if ((await submitBtn.count()) > 0) {
      for (let attempt = 0; attempt < 3; attempt++) {
        console.log(t('clickingAttempt', attempt + 1));
        try {
          await submitBtn.click({ timeout: 2000 });
        } catch (e) {
          await submitBtn.click({ force: true, timeout: 2000 });
        }

        await randomWait(page, 1500, 3000);

        const slider = page.locator('.nc_scale, .slider-container, #nc_1_n1z').first();
        if ((await slider.count()) > 0 && await slider.isVisible()) {
          console.log(t('sliderDetected'));
          const sliderHandle = page.locator('#nc_1_n1z, .nc_iconfont.btn_slide').first();
          if ((await sliderHandle.count()) > 0) {
            const box = await sliderHandle.boundingBox();
            if (box) {
              await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
              await page.mouse.down();
              await page.mouse.move(box.x + 500, box.y + box.height / 2, { steps: 20 });
              await page.mouse.up();
              await randomWait(page, 1500, 3000);
            }
          }
        }

        const currentUrlAfterClick = page.url();
        if (currentUrlAfterClick.includes("manage") || currentUrlAfterClick.includes("success")) {
          break;
        }
        if ((await page.locator('text=发布成功').count()) > 0 || (await page.locator('text=已发布').count()) > 0) {
          break;
        }
        if (!(await submitBtn.isVisible())) {
          break;
        }

        console.log(t('notRedirected'));
        await randomWait(page, 1500, 3000);
      }
    } else {
      console.log(t('noPublishBtn'));
    }

    try {
      console.log(t('waitingSuccess'));
      const startTime = Date.now();
      let success = false;
      while (Date.now() - startTime < 15000) {
        const curUrl = page.url();
        if (curUrl.includes("manage") || curUrl.includes("success")) {
          console.log(t('redirectSuccess'));
          success = true;
          break;
        }

        if ((await page.locator('text=' + (CURRENT_LANG === 'zh' ? '发布成功' : 'Published successfully')).count()) > 0 || 
            (await page.locator('text=' + (CURRENT_LANG === 'zh' ? '已发布' : 'Published')).count()) > 0 || 
            (await page.locator('div[class*="success"]').count()) > 0) {
          console.log(t('toastSuccess'));
          success = true;
          break;
        }

        await randomWait(page, 400, 600);
      }

      if (success) {
        console.log(t('publishSuccess'));
      } else {
        throw new Error("Timeout waiting for success signal");
      }
    } catch (err) {
      console.log(t('noSuccessSignal', err.message));
      const screenshotPath = path.join(targetDir, "publish_status_debug.png");
      await page.screenshot({ path: screenshotPath });
      console.log(t('saveScreenshot', screenshotPath));
      console.log(t('manualCheck'));
    }

    if ((await page.locator('text=' + (CURRENT_LANG === 'zh' ? '发布成功' : 'Published successfully')).count()) === 0) {
      console.log(t('checkingStatus'));
      await randomWait(page, 4000, 6000);
    } else {
      await randomWait(page, 2000, 4000);
    }

    return true;

  } catch (err) {
    console.log(t('publishFailed', err.message));
    if (!isGithubActions) {
      await randomWait(page, 4000, 6000);
    }
    return false;
  } finally {
    if (!isGithubActions) {
      try {
        const cookies = await browserCtx.cookies().catch(() => []);
        if (cookies && cookies.length > 0) {
          fs.writeFileSync("xhs_cookies.json", JSON.stringify(cookies, null, 2), "utf8");
          console.log(t('cookiesSaved', path.resolve("xhs_cookies.json")));
        }
      } catch (err) {
        console.log(t('saveCookiesFailed', err.message));
      }
    }

    try {
      if (browserCtx) await browserCtx.close().catch(() => {});
      console.log(t('browserClosed'));
    } catch (e) {}
  }
}

/**
 * 交互式配置模式
 */
async function interactiveMode() {
  const langPrompt = new Select({
    name: 'lang',
    message: 'Language / 语言 (Use arrow keys):',
    choices: [
      { name: 'en', message: '1: English' },
      { name: 'zh', message: '2: 中文' }
    ],
    initial: 0
  });
  CURRENT_LANG = await langPrompt.run();

  console.log(t('enterInteractive'));
  const config = {};

  /**
   * macOS 专用文件夹选择器
   */
  async function chooseFolderMac() {
    if (process.platform !== 'darwin') return null;
    try {
      const prompt = CURRENT_LANG === 'zh' ? "请选择包含图片的文件夹" : "Please select the folder containing images";
      const cmd = `osascript -e 'POSIX path of (choose folder with prompt "${prompt}")'`;
      const result = execSync(cmd).toString().trim();
      return result;
    } catch (e) {
      return null;
    }
  }

  const modePrompt = new Select({
    name: 'mode',
    message: t('selectMode'),
    choices: t('selectModeOptions')
  });
  config.mode = await modePrompt.run();

  let dirPath = "";
  while (!dirPath) {
    const currentDir = process.cwd();
    console.log(t('currentDir') + currentDir);
    
    const dirInput = new Input({
        name: 'dir',
        message: t('enterDirPath')
    });
    const inputPath = await dirInput.run();
    
    if (!inputPath) {
      if (process.platform === 'darwin') {
        const chosen = await chooseFolderMac();
        if (chosen) {
          dirPath = chosen;
        } else {
          console.log(t('noFolderSelected'));
        }
      } else {
        console.log(t('nonMacNoPicker'));
      }
    } else {
      const resolved = path.resolve(currentDir, inputPath);
      if (fs.existsSync(resolved)) {
        dirPath = resolved;
      } else {
        console.log(t('pathNotExist') + resolved + t('reEnter'));
      }
    }
  }
  config.dir = dirPath;

  if (config.mode === "bulk") {
    const chunkInput = new Input({
        name: 'chunk',
        message: t('imgsPerPost'),
        initial: '9'
    });
    config.chunk = parseInt(await chunkInput.run(), 10) || 9;
  }

  const titleInput = new Input({
      name: 'title',
      message: t('enterTitle')
  });
  config.title = await titleInput.run();

  const descInput = new Input({
      name: 'desc',
      message: t('enterDesc')
  });
  config.desc = await descInput.run();

  const collageConfirm = new Confirm({
      name: 'collage',
      message: t('enableCollage'),
      initial: false
  });
  config.collage = await collageConfirm.run();

  // 计算帖子概览
  let totalPosts = 1;
  const absPath = path.resolve(process.cwd(), config.dir);
  const files = fs.readdirSync(absPath);
  const imgFiles = files.filter(f => /\.(png|jpe?g)$/i.test(f));
  if (config.mode === "bulk") {
    totalPosts = Math.ceil(imgFiles.length / config.chunk);
  }

  console.log(t('taskOverview', imgFiles.length, totalPosts));

  // 发布时间设置
  const timeModePrompt = new Select({
      name: 'timeMode',
      message: t('selectTimeMode'),
      choices: t('selectTimeOptions'),
      initial: 1
  });
  const timeMode = await timeModePrompt.run();
  config.schedule = (timeMode === "schedule");

  if (config.schedule) {
    console.log(t('scheduleSettings'));
    const defaultStartTime = new Date(Date.now() + 30 * 60 * 1000);
    const defaultStartTimeStr = `${defaultStartTime.getFullYear()}-${String(defaultStartTime.getMonth() + 1).padStart(2, '0')}-${String(defaultStartTime.getDate()).padStart(2, '0')} ${String(defaultStartTime.getHours()).padStart(2, '0')}:${String(defaultStartTime.getMinutes()).padStart(2, '0')}`;
    
    const startTimeInput = new Input({
        name: 'startTime',
        message: t('enterStartTime', defaultStartTimeStr),
        initial: defaultStartTimeStr
    });
    const startTimeStr = await startTimeInput.run();
    config.scheduleStart = startTimeStr ? new Date(startTimeStr).getTime() : defaultStartTime.getTime();
    if (isNaN(config.scheduleStart)) {
        console.log(t('invalidTime'));
        config.scheduleStart = defaultStartTime.getTime();
    }

    const intervalInput = new Input({
        name: 'interval',
        message: t('enterInterval'),
        initial: '2'
    });
    const intervalStr = await intervalInput.run();
    // 支持解析 '120min' 或数字
    if (intervalStr.toLowerCase().endsWith('min')) {
        config.interval = parseFloat(intervalStr) / 60;
    } else {
        config.interval = parseFloat(intervalStr) || 2;
    }

    const skipNightConfirm = new Confirm({
        name: 'skipNight',
        message: t('skipNight'),
        initial: true
    });
    config.skipNight = await skipNightConfirm.run();
  } else {
    config.scheduleStart = null;
    config.interval = 0;
    config.skipNight = false;
  }

  // 生成预览
  console.log(t('planPreview'));
  console.log("--------------------------------------------------");
  const plan = [];
  for (let i = 0; i < totalPosts; i++) {
      let pTimeStr = t('immediate');
      let pTime = null;
      if (config.schedule) {
          pTime = calculateNextScheduleTime(config.scheduleStart, i, config.interval, config.skipNight);
          pTimeStr = new Date(pTime).toLocaleString(CURRENT_LANG === 'zh' ? 'zh-CN' : 'en-US', { hour12: false });
      }
      const pTitle = config.mode === "bulk" ? `${config.title || t('unnamedPost')} (${i + 1})` : (config.title || t('unnamedPost'));
      console.log(`${t('postIndex', String(i + 1).padStart(2, '0'))} ${pTimeStr} | ${pTitle}`);
      plan.push({ time: pTime, title: pTitle });
  }
  console.log("--------------------------------------------------");

  const confirmPrompt = new Confirm({
      name: 'confirm',
      message: t('confirmPlan'),
      initial: true
  });
  const isConfirmed = await confirmPrompt.run();
  if (!isConfirmed) {
    console.log(t('cancelled'));
    process.exit(0);
  }

  // 构建模拟的 argv 对象
  const simulatedArgv = {
    collage: config.collage,
    schedule: config.schedule,
    'schedule-start': config.scheduleStart ? new Date(config.scheduleStart).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') : null,
    'schedule-interval': config.interval,
    'skip-night': config.skipNight,
    title: config.title,
    desc: config.desc,
  };

  if (config.mode === "bulk") {
    simulatedArgv['bulk-dir'] = config.dir;
    simulatedArgv.chunk = config.chunk;
  } else {
    simulatedArgv.dir = config.dir;
  }

  return simulatedArgv;
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
${t('helpTitle')}
--------------------------------------------------

${t('helpUsage')}
  pnpm start [${t('helpCommonOptions').split(':')[0]}]
  node xhs_publisher.js [${t('helpCommonOptions').split(':')[0]}]

${t('helpCommonOptions')}
  -i, --interactive           ${t('helpOptionInteractive')}
  --dir <path>                ${t('helpOptionDir')}
  --bulk-dir <path>           ${t('helpOptionBulkDir')}
  --chunk <num>               ${t('helpOptionChunk')}
  --title <text>              ${t('helpOptionTitle')}
  --desc <text>               ${t('helpOptionDesc')}
  --collage                   ${t('helpOptionCollage')}
  --schedule                  ${t('helpOptionSchedule')}
  --schedule-start <time>     ${t('helpOptionScheduleStart')}
  --schedule-interval <hr>    ${t('helpOptionScheduleInterval')}
  --skip-night                ${t('helpOptionSkipNight')}
  --test                      ${t('helpOptionTest')}
  --english                   ${t('helpOptionEnglish')}
  -h, --help                  ${t('helpOptionHelp')}

${t('helpExamples')}
  node xhs_publisher.js --bulk-dir ./imgs --chunk 9 --title "Daily OUTFIT"
  node xhs_publisher.js --dir ./my_trip --collage --test
  `);
  process.exit(0);
}

async function runBatch() {
  const args = process.argv.slice(2);
  
  // 默认英语
  CURRENT_LANG = 'en';

  if (args.includes('--english') || args.includes('English')) {
    CURRENT_LANG = 'en';
  }

  console.log("==================================================");
  console.log(t('toolName'));
  console.log("==================================================");

  let argv = {};

  // 检查帮助命令
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
  }

  // 如果没有提供任何命令行参数，默认进入交互模式
  if (args.length === 0) {
    argv = await interactiveMode();
  } else {
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-i' || args[i] === '--interactive') {
        argv = await interactiveMode();
        break; 
      }
      if (args[i].startsWith('--')) {
        const key = args[i].substring(2);
        const val = args[i + 1];
        if (val && !val.startsWith('--')) {
          argv[key] = val;
          i++;
        } else {
          argv[key] = true;
        }
      }
    }
  }

  let scheduleStartTimestamp = null;
  let scheduleIntervalHours = parseFloat(argv['schedule-interval']) || 2;
  const skipNight = !!argv['skip-night'];

  if (argv['schedule-start']) {
      scheduleStartTimestamp = new Date(argv['schedule-start']).getTime();
      if (isNaN(scheduleStartTimestamp)) {
          console.log(t('invalidScheduleStart'));
          return;
      }
  }

  if (argv['bulk-dir']) {
    const bulkDir = path.resolve(process.cwd(), argv['bulk-dir']);
    if (!fs.existsSync(bulkDir)) {
      console.log(t('dirNotExist', bulkDir));
      return;
    }
    const chunk = parseInt(argv.chunk, 10) || 9; // 默认9张图片一篇帖子
    const title = argv.title || t('bulkBatchTitle');
    const desc = argv.desc || t('bulkBatchDesc');

    console.log(t('bulkModeEnabled'));
    console.log(t('targetBulkDir', bulkDir));
    console.log(t('imgsPerPostBulk', chunk));
    console.log(t('unifiedTitleBulk', title));

    const files = fs.readdirSync(bulkDir);
    const imgFiles = files.filter(f => /\.(png|jpe?g)$/i.test(f)).sort((a, b) => {
      const numA = parseInt(a.match(/^\d+/)?.[0]) || 0;
      const numB = parseInt(b.match(/^\d+/)?.[0]) || 0;
      return numA - numB || a.localeCompare(b);
    }).map(f => path.resolve(bulkDir, f));

    if (imgFiles.length === 0) {
      console.log(t('noImgsInDir', bulkDir));
      return;
    }

    const totalPosts = Math.ceil(imgFiles.length / chunk);
    console.log(t('batchSummary', imgFiles.length, totalPosts));

    let successCount = 0;
    for (let i = 0; i < totalPosts; i++) {
      const chunkPaths = imgFiles.slice(i * chunk, (i + 1) * chunk);
      const postTitle = `${title} (${i + 1})`;
      console.log(t('startingBatchTask', i + 1, totalPosts));
      let taskOptions = { schedule: !!argv.schedule, test: !!argv.test, collage: !!argv.collage };
      if (scheduleStartTimestamp) {
        taskOptions.scheduleTime = calculateNextScheduleTime(scheduleStartTimestamp, i, scheduleIntervalHours, skipNight);
        taskOptions.schedule = true;
      }
      const isSuccess = await publishTask(chunkPaths, postTitle, desc, taskOptions);
      if (isSuccess) successCount++;

      if (i < totalPosts - 1) {
        const delayMs = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
        console.log(t('waitingNextTask', (delayMs / 1000).toFixed(1)));
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
    console.log(t('batchComplete', totalPosts, successCount));
    return;
  }

  if (argv.dir) {
    const workDir = path.resolve(process.cwd(), argv.dir);
    if (!fs.existsSync(workDir)) {
      console.log(t('dirNotExist', workDir));
      return;
    }
    let title = argv.title || "";
    let desc = argv.desc || "";

    const metaPath = path.join(workDir, 'meta.json');
    if (!title && fs.existsSync(metaPath)) {
       try {
         const data = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
         title = title || data.title;
         desc = desc || data.content + (data.tags ? "\n\n" + data.tags.join(" ") : "");
       } catch (e) {}
    }

    if (!title) {
      console.log(t('missingTitle'));
      return;
    }

    let taskOptions = { schedule: !!argv.schedule, test: !!argv.test, collage: !!argv.collage };
    if (scheduleStartTimestamp) {
      taskOptions.scheduleTime = scheduleStartTimestamp;
      taskOptions.schedule = true;
    }
    await publishTask(workDir, title, desc, taskOptions);
    return;
  }

  const downloadsDir = path.join(__dirname, 'slides_downloads');
  if (!fs.existsSync(downloadsDir)) {
    console.error(t('noImgsFoundGeneric', downloadsDir));
    process.exit(1);
  }

  const folders = fs.readdirSync(downloadsDir)
    .filter(f => f.endsWith('_images') && fs.statSync(path.join(downloadsDir, f)).isDirectory())
    .map(name => ({
      name,
      time: fs.statSync(path.join(downloadsDir, name)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)
    .map(f => f.name);

  if (folders.length === 0) {
    console.log('ℹ️ 在 slides_downloads 下未找到任何 _images 后缀的文件夹。');
    process.exit(0);
  }

    console.log(t('scannedFolders'));
  folders.forEach((folder, index) => {
    console.log(`  [${index + 1}] ${folder}`);
  });

  let selectedIndices = [];
  while (true) {
    const ans = await askQuestion(t('enterFolderIndices'));
    selectedIndices = parseIndices(ans, folders.length);
    if (selectedIndices.length > 0) {
      break;
    }
    console.log(t('invalidInput'));
  }

  console.log(t('tasksSelected', selectedIndices.length));
  
  let successCount = 0;
  for (let i = 0; i < selectedIndices.length; i++) {
    const idx = selectedIndices[i];
    const folderName = folders[idx];
    const workDir = path.join(downloadsDir, folderName);
    
    const rawTitle = folderName.replace('_images', '');
    const title = rawTitle.substring(0, 20);
    const desc = rawTitle;

    console.log(t('startingBatchTask', i + 1, selectedIndices.length));
    let taskOptions = { schedule: !!argv.schedule, test: !!argv.test, collage: !!argv.collage };
    if (scheduleStartTimestamp) {
      taskOptions.scheduleTime = calculateNextScheduleTime(scheduleStartTimestamp, i, scheduleIntervalHours, skipNight);
      taskOptions.schedule = true;
    }
    const isSuccess = await publishTask(workDir, title, desc, taskOptions);
    if (isSuccess) successCount++;
    
    if (i < selectedIndices.length - 1) {
      const delayMs = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
      console.log(t('waitingNextTask', (delayMs / 1000).toFixed(1)));
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  console.log(t('batchComplete', selectedIndices.length, successCount));
}

runBatch().catch(err => {
  console.error(t('fatalError'), err);
  process.exit(1);
});
