---
name: rednote-profile-branding
description: Designs a Xiaohongshu/RedNote profile avatar and homepage background that read as a real creator rather than a bot or company account, renders candidates locally and previews them at the sizes the app actually shows (56px list rows, 32px comments). Use when the user asks to 设计小红书头像, 换头像, 主页背景, 头像太像机器人, or wants a cartoon/mascot avatar.
when_to_use: |
  - 新号要做头像 / 主页背景，或觉得现在的头像「太 AI」「像机器人」「像公司号」
  - 用户说「设计头像」「卡通头像」「吉祥物」「主页背景」
  - Do NOT use for: 笔记配图（rednote-fullscreen-note）
argument-hint: 账号名、领域，以及想要的感觉（可爱 / 专业 / 搞笑）
---

# 小红书头像与主页背景

## 先懂规律

在小红书搜一个领域词，切到「用户」tab，看头像：

- **纯字标 / logo 头像几乎都是公司号**（品牌、工具官方号）。个人号用字标，会被当成机构号或机器人，降低点进来的意愿。
- **粉丝多的个人博主多用真人照。**
- **不露脸的个人号，常用一个有表情的卡通吉祥物**（动物、拟人小物件），一眼看出「后面是个人」。

动手前用同样的方法看一遍用户所在领域的头像，避开同类号已经用了的形象（比如对标账号用了猫，就不要再用猫）。

## 步骤

1. **调研。** 搜领域关键词，看「用户」tab 前 20 个头像和几个对标号的主页，记下：真人 / 卡通 / 字标的比例、常见的颜色、已被占用的形象。
2. **起稿 3–4 款。** 从 `assets/avatar-starter.html` 开始，它自带三款：吐舌头的柴犬（亲切）、眼镜猫头鹰（知识类）、头顶橘子的卡皮巴拉（轻松类）。
   - 改颜色和道具，或照着复制一个 `ART` 条目画新形象。
   - 规则：
     - 清晰的深色描边 + 浅色或纯色底：小尺寸也认得出。
     - 主体放在中间 80% 的圆里：圆形裁切后不缺东西。
     - 一个形象 + 最多一个道具，道具和领域相关（如做健身的号配哑铃、做读书的号配一本书）。
     - 最多一两个字，不要整行文字。
   - 可以和账号名玩个梗，让人记住。
3. **导出和预览。**
   ```bash
   node scripts/export.mjs --name "账号名" --id 小红书号 --out avatar-export
   ```
   - 得到每款 1080×1080 的 PNG 和 `preview.png`。
   - 预览里有大中小三种圆形尺寸，还模拟了搜索列表（56px）和评论区（32px）：头像大多数时候是在这两个尺寸被看到的。
   - 用自己的页面时，加 `--page path/to/your.html`（同样的 `?a=avatarX` / `?a=preview` 约定）。
4. **自查，再给用户挑。**
   - 32px 下还能看出是什么，脸和眼睛清楚。
   - 和对标号不撞。
   - 不像 AI 生成的立体渲染图，不像 logo。
   - 有不像的地方先改再给用户看。例如卡皮巴拉脸画长了、口鼻颜色太浅，会像牛。
5. **定稿。** 只导出用户选的那款作为正式图，**由用户自己在 App 里上传**（「我」→ 编辑资料 → 头像）。

## 主页背景

- 小红书主页会把背景大半盖住、整体压暗，只有右侧一条露出来。
- 所以背景不放字，用纯色或很淡的图形，和头像同一套配色。重点元素放在右侧那一条。
- 建议尺寸 2000×1600，同样由用户自己上传。

## 注意

- **头像 7 天内只能改 3 次。** 一定先在本地出预览、定稿，再让用户上传；不要在账号上反复试。
- 不用名人、品牌 logo、动漫角色或别人的原创形象，会有侵权风险。
- 不用 AI 生成的写实人像冒充真人。
