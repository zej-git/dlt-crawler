// scrape.js  500.com HTML → 纯数字（活参数，每晚更新）
const axios = require('axios');
const fs   = require('fs');

// 先抓最近 500 期，再留最后 100 期
const URL = 'https://datachart.500.com/dlt/history/inc/history.php?limit=100';

async function fetch500() {
  try {
    const { data: html } = await axios.get(URL, { timeout: 8000 });
    // 按行拆分，只保留含期号的 <tr>
    const lines = html.split('\n').filter(l => l.includes('<tr class="t_tr1">'));
    const all = [];
    for (const l of lines) {
      // 提取所有 <td>数字</td>
      const tds = l.match(/<td[^>]*>(\d+)<\/td>/g);
      if (!tds || tds.length < 9) continue;
      const nums = tds.map(td => td.replace(/<\/?td[^>]*>/g, '').trim());
      const [issue, f1, f2, f3, f4, f5, b1, b2] = nums;
      all.push({
        issue: issue,
        front: [f1, f2, f3, f4, f5].map(v => v.padStart(2, '0')),
        back:  [b1, b2].map(v => v.padStart(2, '0'))
      });
    }
    // 只留最近 100 期
    return all.slice(-100);
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
