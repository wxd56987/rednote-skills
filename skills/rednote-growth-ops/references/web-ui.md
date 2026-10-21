# 小红书网页版（www.xiaohongshu.com）结构备忘

页面改版后选择器可能失效：失效时先截图核对，再改。

## 搜索

- 笔记搜索：`https://www.xiaohongshu.com/search_result?keyword=<关键词>&source=web_search_result_notes`
- 顶部 tab：全部 / 图文 / 视频 / 用户。「用户」tab 只匹配账号名，不匹配简介。
- 结果卡片：`section.note-item`，其中标题 `.title`，时间 `.time`，赞数 `.like-wrapper .count`。

## 笔记详情（弹层）

- 容器 `.note-container`：
  - 标题 `#detail-title`，正文 `#detail-desc`，发布时间和地点 `.date`。
  - 评论 `.comment-item`，评论内容 `.content`，评论点赞数 `.like .count`。
- 评论输入：
  1. 先点底部「说点什么…」展开。
  2. 输入框是 `#content-textarea`（contenteditable）。
  3. 「发送」按钮是 `.btn.submit`。
  4. 输入后先读 `#content-textarea` 的 innerText 核对原文，再发送。

## 作者主页

- 地址形如 `/user/profile/<id>`。资料区 `.user-info` 里有小红书号、IP 属地、简介、关注数、粉丝数、获赞与收藏。
- 关注按钮 `button.follow-button`，文字是「关注」或「已关注」。

## 已知限制

- 浏览器工具可能把作者名、链接参数当成敏感信息过滤掉，JavaScript 读出来会显示 BLOCKED。这时用 `find`（无障碍树）或截图读名字，不要设法绕过。
- 从搜索结果点作者名，会在新标签页打开主页。
- 网页版登录和创作平台（creator.xiaohongshu.com）不通用，第一次要单独扫码。
