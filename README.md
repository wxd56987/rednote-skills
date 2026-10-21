<div align="center">

# rednote-skills

**让 AI 帮你运营小红书**：出图、写配文、发布、日常互动、设计头像，一句话交给 Claude Code / Codex / Cursor。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![skills.sh](https://skills.sh/b/wxd56987/rednote-skills)](https://skills.sh/wxd56987/rednote-skills)
[![SKILL.md](https://img.shields.io/badge/standard-SKILL.md-141414.svg)](https://www.agensi.io/learn/skill-md-format-reference)

简体中文 · [English](README.en.md)

<img src="docs/hero.png" alt="rednote-fullscreen-note 生成的三页全屏榜单图" width="100%">

<sub>用 <code>rednote-fullscreen-note</code> 一条命令渲染的 3 页（示例数据，见 <code>assets/example-data.json</code>）</sub>

</div>

## 能做什么

装好之后，直接对 agent 说：

| 你说 | 用到的 skill | 结果 |
|---|---|---|
| 「把这 5 条新闻做成小红书榜单图」 | `rednote-fullscreen-note` | 3 页 1300×2160 全屏图，字号自动适配，300ppi |
| 「给这组图写配文」 | `rednote-caption-writer` | 标题 + 正文 + 10 个以内话题，自动过平台合规 |
| 「发到小红书，先仅自己可见」 | `rednote-publish` | 走「写长文」全屏发布，挑同名里浏览量最大的话题 |
| 「今天做一下小红书互动」 | `rednote-growth-ops` | 浏览、点赞、关注同类 ≤5 个，评论草稿给你确认 |
| 「帮我设计一个卡通头像」 | `rednote-profile-branding` | 3 款吉祥物头像，按列表 / 评论区的实际尺寸预览 |

## 安装

**Claude Code（插件）**

```
/plugin marketplace add wxd56987/rednote-skills
/plugin install rednote-skills@rednote-skills
```

5 个 skill 会一起装上，以 `/rednote-skills:rednote-publish` 这样的名字调用；直接用自然语言说需求也会自动触发。

**任意 agent（skills.sh）**

```bash
npx skills add wxd56987/rednote-skills
```

支持 Claude Code、Codex、Cursor、Gemini CLI、Copilot 等，加 `-s rednote-publish` 只装其中一个。

**手动**

```bash
git clone https://github.com/wxd56987/rednote-skills.git
cp -R rednote-skills/skills/rednote-* ~/.claude/skills/
```

## 五个 skill

| Skill | 说明 | 需要 |
|---|---|---|
| [`rednote-fullscreen-note`](skills/rednote-fullscreen-note/SKILL.md) | 条目 → 9.6:16 全屏榜单图。在 App 里几乎铺满整屏，一页放 5 条。杂志风：浅色底、左对齐衬线大标题、白卡分行，每页一个强调色，配色可换。 | Node 22+、Chrome |
| [`rednote-caption-writer`](skills/rednote-caption-writer/SKILL.md) | 标题公式、正文与图一一对应、结尾三件套（收藏 / 提问 / 关注）、话题组合、合规自查 | — |
| [`rednote-publish`](skills/rednote-publish/SKILL.md) | 在创作平台用「写长文」发布（「上传图文」会把竖图塞进 3:4 留白）。自动删模板图、精确选话题，默认仅自己可见，也能给已发布的笔记换图。 | 能上传本地文件的浏览器自动化工具（如 Claude in Chrome） |
| [`rednote-growth-ops`](skills/rednote-growth-ops/SKILL.md) | 新号日常互动，按真人节奏：关注 ≤5、评论 2–3 条（原文先确认），记日志，并总结同类爆款规律 | 浏览器自动化工具 |
| [`rednote-profile-branding`](skills/rednote-profile-branding/SKILL.md) | 字标头像像公司号，换成有表情的卡通吉祥物。自带柴犬 / 猫头鹰 / 卡皮巴拉起稿，按 56px、32px 实际尺寸预览。 | Node 22+、Chrome |

一篇笔记的流程：

```
素材 ─▶ fullscreen-note（data.json → PNG）─▶ caption-writer（caption.md）─▶ publish（仅自己可见 → 你在 App 验收后改公开）
每天：growth-ops            一次性：profile-branding
```

<details>
<summary>头像起稿预览</summary>

<img src="docs/avatars.png" alt="三款卡通头像在不同尺寸下的预览" width="100%">

</details>

## 这些规则从哪来

都是在真实账号上踩出来的：

- 「上传图文」会把 9.6:16 的图塞进 3:4 框里留白，「写长文」才能全屏。
- 话题最多 10 个；输入 `#ai` 后，下拉第一项往往不是 #ai 本身。
- 头像 7 天只能改 3 次。
- 网页版和创作平台的登录不通用。
- 新号一天关注太多、评论太水，会被当成营销号限流。

细节都写在各 skill 的 `references/` 里。

## 安全

- 不含任何密钥或账号信息；登录由你自己在浏览器里扫码完成，skill 不会代填账号密码。
- **网络访问：** 出图只从 Google Fonts 下载字体，浏览器操作只在 xiaohongshu.com 上进行，没有其它外发请求。
- **发出去的内容都由你把关：** 发布默认「仅自己可见」，每条评论和回复都先给你看原文再发，改公开和删除由你自己做。
- 不做批量关注、刷赞、引流。

## 路线图 & 贡献

- [ ] 笔记数据复盘（浏览、收藏、涨粉，对比选题）
- [ ] 评论区自动起草回复
- [ ] 更多榜单版式和配色主题
- [ ] 视频笔记封面

欢迎提 issue 和 PR。新 skill 放在 `skills/<name>/SKILL.md`，提交前跑一下 `sh scripts/package.sh` 检查格式。觉得有用的话，点个 ⭐ 让更多人看到。

## 许可证

[MIT](LICENSE)
