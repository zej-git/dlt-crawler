// scrape.js  500.com 直链 JSON 版（国内不墙）
const axios = require('axios');
const fs   = require('fs');

// 你提供的最新直链：start=25000&end=25131（可往后改）
const URL = 'https://datachart.500.com/dlt/history/newinc/history.php?start=25000&end=25131';

async function fetch500() {
  try {
    const { data: html } = await axios.get(URL, { timeout: 8000 });
    // 按行拆分，去掉空行
    const lines = html.split('\n').filter(l => l.includes('<td class="t_tr1"'));
    const list = [];
    for (const l of lines) {
      // 提取所有 <td>数字</td>
      const tds = l.match(/<td[^>]*>(\d+)<\/td>/g);
      if (!tds || tds.length < 9) continue;
      const nums = tds.map(td => td.replace(/<\/?td[^>]*>/g, '').trim());
      const [issue, f1, f2, f3, f4, f5, b1, b2] = nums;
      list.push({
        issue: issue,
        front: [f1, f2, f3, f4, f5].map(v => v.padStart(2, '0')),
        back:  [b1, b2].map(v => v.padStart(2, '0'))
      });
      if (list.length >= 100) break; // 只留最近 100 期
    }
    if (list.length === 0) throw new Error('直链解析为空');
    return list;
  } catch (e) {
    console.warn('直链也失败', e.message);
    // 兜底：回退本地种子
    return JSON.parse(fs.readFileSync('./dlt100.json', 'utf-8'));
  }
}

(async () => {
  const list = await fetch500();
  fs.writeFileSync('dlt100.json', JSON.stringify(list, null, 2));
  console.log('✅ dlt100.json 已更新（共', list.length, '期）');
})();
