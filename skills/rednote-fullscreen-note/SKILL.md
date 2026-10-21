---
name: rednote-fullscreen-note
description: Turns a list of items (news, tools, open-source projects, tips) into full-screen 9.6:16 Xiaohongshu/RedNote image pages (1300×2160, 300ppi) in a bold list-card style, rendered locally with headless Chrome. Use when the user asks for 小红书全屏图, 全框笔记, 榜单图, 图文笔记出图, or wants to turn a digest or ranking into note images.
when_to_use: |
  - 用户要把一组条目做成小红书图片（每页 3–5 条的榜单 / 清单）
  - 用户说「出图」「做榜单图」「全屏笔记」「全框图」
  - Do NOT use for: 写配文（用 rednote-caption-writer）、发布笔记（用 rednote-publish）、头像和主页背景（用 rednote-profile-branding）
argument-hint: 数据 JSON 的路径，或者要做成图的原始素材
---

# 小红书全屏榜单图

把素材整理成 `data.json`，用 `scripts/render.mjs` 渲染成 1300×2160 的 PNG。这个比例（9.6:16）在小红书 App 里几乎铺满整屏，同样宽度下比常见的 3:4 高出约 25%，一页能放下 5 条。全屏显示要走「写长文」发布，见 rednote-publish。一页一个主题、3–5 张卡片，第 1 页兼作封面。

## 环境

- Node.js 22+（用内置 WebSocket，不需要 `npm install`）
- 本机 Chrome 或 Chromium（找不到时用环境变量 `CHROME` 指定路径）
- 联网：字体从 Google Fonts 下载（fonts.googleapis.com / fonts.gstatic.com）。除此之外不访问网络。

## 步骤

1. **整理数据。** 以 `assets/example-data.json` 为模板写 `data.json`，字段见 `references/data-schema.md`。每页：
   - `title` + `hl`：大标题，`hl` 是用强调色高亮的那一段（如「新手用 AI 写文案的 」+「5 个技巧」）。
   - `items`：每条 `t` 名称、`tag` 2–4 字标签、`d` 一句说明（支持 `**加粗**`）、`s` 来源或补充、`v` 右侧大数字、`l` 数字说明。
   - 名称 `t` 尽量短，能单行放下；一条名称过长会拖小整页字号。
2. **核对内容。** 按 `references/content-rules.md` 过一遍：数字与原文一致、单一来源要注明、不写引流和变现内容。
3. **渲染。**
   ```bash
   node scripts/render.mjs path/to/data.json            # 输出到 data.json 旁边的 export/
   node scripts/render.mjs path/to/data.json --out 目录  # 先出到别处预览
   ```
   同名 PNG 会被覆盖。每页打印一行「系数 / 余量」。
4. **看系数。**
   - 系数是自动字号（0.8–1.3）。第 1 页低于约 0.95，通常是某条名称太长：缩短 `t` 再渲染。
   - 打印「放不下！」时退出码为 2：删减 `d` 或减少条目。
5. **逐张看图。** 查三件事：内容溢出、最后一行只剩一两个字、名称被缩得过小。有问题改 `data.json` 重跑，不要手改图。
6. 把 PNG 路径交给用户或下一步（发布用 rednote-publish）。

## 版式规则

- 默认是杂志风：
  - 左上角是栏目名和页码，下面是左对齐的衬线大标题，`hl` 那段加荧光笔底纹。
  - 条目放在一张白色大卡片里，用细线分行：左边是圆形序号，中间是名称、描边标签、说明和来源，右边是浅色数值块。
- 每页一个强调色：`accent` 取 `red` / `purple` / `blue` / `green`，页面底色会跟着换成对应的浅色。
- 换配色用 `theme` / `accents` 覆盖（见 data-schema）。强调色在白卡上的对比度要保持 ≥ 4.5:1。
- 断行只靠收紧字距和缩小标题（最多缩 10%），不收窄文本框：收窄会拆词，还会让各卡片的列错位。剩下的单字成行，改文案解决。
- 最后一页的 `next` 写收尾语（如「完 · 明天见」），其余页写「左滑看 xx →」。

## 不要做

- 不要在图里放二维码、微信号、外链或价格，小红书会限流甚至删帖。
- 不要为了塞更多内容把字号压到系数 0.8 以下：手机上看不清，收藏率反而下降。
