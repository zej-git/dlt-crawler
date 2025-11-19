// scrape.js  500.com HTML → 纯数字（最终可用版）
const axios = require('axios');
const fs   = require('fs');

// 先抓最近 500 期，再留最后 100 期
const URL = 'https://datachart.500.com/dlt/history/inc/history.php?limit=500';

async function fetch500() {
  try {
    const { data: html } = await axios.get(URL, { timeout: 8000 });
    // ① 把整个 <table> 拿出来
    const tableMatch = html.match(/<table[^>]*id="tablelist"[\s\S]*?<\/table>/i);
    if (!tableMatch) throw new Error('没拿到 table');
    const table = tableMatch[0];
    // ② 按行提取 <tr>...</tr>
    const trMatches = table.match(/<tr[^>]*class="t_tr1"[\s\S]*?<\/tr>/gi);
    if (!trMatches) throw new Error('没拿到 tr');
    const all = [];
    for (const tr of trMatches) {
      // ③ 提取所有 <td>数字</td>
      const tds = tr.match(/<td[^>]*>(\d+)<\/td>/g);
      if (!tds || tds.length < 9) continue;
      const nums = tds.map(td => td.replace(/<\/?td[^>]*>/g, '').trim());
      const [issue, f1, f2, f3, f4, f5, b1, b2] = nums;
      all.push({
        issue: issue,
        front: [f1, f2, f3, f4, f5].map(v => v.padStart(2, '0')),
        back:  [b1, b2].map(v => v.padStart(2, '0'))
      });
    }
    // ④ 只留最近 100 期
    return all.slice(-500);
  } catch (e) {
    console.warn('HTML 也失败', e.message);
    // 兜底：回退本地种子
    return JSON.parse(fs.readFileSync('./dlt100.json', 'utf-8'));
  }
}

(async () => {
  const list = await fetch500();
  fs.writeFileSync('dlt100.json', JSON.stringify(list, null, 2));
  console.log('✅ dlt100.json 已更新（共', list.length, '期）');
})();

