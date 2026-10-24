// 在小红书创作平台的发布页里执行的辅助函数（用浏览器工具的「执行 JavaScript」功能整段粘贴运行一次）。
// 只读写当前页面的 DOM，不发起任何网络请求。页面改版后选择器可能失效，失效时先截图核对再改。

// 1. 删掉尺寸不对的图（「写长文」一键排版会自动生成模板图，和要发的图混在一起）。
//    keepW × keepH 是要保留的图的像素尺寸（全屏榜单图是 1300×2160，自动生成的模板图是 1440×2400）。
//    删除按钮只在悬停时出现、坐标点击常落空，所以直接点 DOM 元素；每次删一张、等界面刷新后再看下一张。
window.__removeImagesNot = async (keepW, keepH) => {
  const sizes = () => [...document.querySelectorAll('.img-container img')].map((i) => `${i.naturalWidth}x${i.naturalHeight}`);
  for (let n = 0; n < 20; n++) {
    const bad = [...document.querySelectorAll('.img-container')].find((c) => {
      const img = c.querySelector('img');
      return img && img.naturalWidth && !(img.naturalWidth === keepW && img.naturalHeight === keepH);
    });
    if (!bad) break;
    bad.querySelector('.close-btn')?.click();
    await new Promise((r) => setTimeout(r, 800));
  }
  return sizes();
};

// 2. 选话题：在正文末尾输入「#关键词」、等下拉出现（约 2 秒）后调用。
//    只选名字完全相同（不分大小写）且浏览量最大的那项；不选「新建话题」（浏览量 0）。
//    下拉第一项常常不是同名话题，所以不能直接回车。没有同名话题时返回前几个候选，交给人决定。
window.__pickTopic = (want) => {
  const items = [...document.querySelectorAll('.tippy-content .items .item')];
  const views = (t) => { const m = t.match(/([\d.]+)\s*(亿|万)?浏览/); return m ? parseFloat(m[1]) * (m[2] === '亿' ? 1e8 : m[2] === '万' ? 1e4 : 1) : 0; };
  const rows = items.map((it) => ({ it, name: it.querySelector('.name')?.textContent.trim() || '', views: views(it.textContent) }));
  const pick = rows.filter((r) => r.name.toLowerCase() === ('#' + want).toLowerCase() && r.views > 0).sort((a, b) => b.views - a.views)[0];
  if (!pick) return { ok: false, options: rows.slice(0, 6).map((r) => `${r.name} ${r.views}`) };
  pick.it.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  pick.it.click();
  return { ok: true, picked: pick.name, views: pick.views };
};

// 3. 发布前核对：图片尺寸和顺序、话题节点、正文结尾、原创声明开关、所选合集。
window.__checkDraft = () => {
  const pm = document.querySelector('.ProseMirror');
  return {
    images: [...document.querySelectorAll('.img-container img')].map((i) => `${i.naturalWidth}x${i.naturalHeight}`),
    topics: [...(pm?.querySelectorAll('a') || [])].map((a) => a.textContent.trim()),
    tail: pm?.innerText.slice(-120),
    original: !!document.querySelector('.original-wrapper .d-switch-simulator.checked'),
    collection: document.querySelector('.collection-plugin-wrapper')?.innerText.trim().split('\n').pop(),
  };
};
