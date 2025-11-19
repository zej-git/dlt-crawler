// scrape.js  500.com HTML → 纯数字（修复版）
const axios = require('axios');
const fs   = require('fs');

// 先抓最近 500 期，再留最后 100 期
const URL = 'https://datachart.500.com/dlt/history/inc/history.php?limit=500';

async function fetch500() {
  try {
    const { data: html } = await axios.get(URL, { timeout: 8000 });
    // 1. 拿整个 table
    const tableMatch = html.match(/<table[^>]*id="tablelist"[\s\S]*?<\/table>/i);
    if (!tableMatch) throw new Error('没拿到 table');
    const table = tableMatch[0];
    // 2. 按行提取 <tr class="t_tr1">
    const trMatches = table.match(/<tr[^>]*class="t_tr1"[\s\S]*?<\/tr>/gi);
    if (!trMatches) throw new Error('没拿到 tr');
    const all = [];
    for (const tr of trMatches) {
      // 3. 提取所有 <td>数字</td>
      const tds = tr.match(/<td[^>]*>(\d+)<\/td>/g);
      if (!tds || tds.length < 8) continue; // 8 个号码
      const nums = tds.map(td => td.replace(/<\/?td[^>]*>/g, '').trim());
      const issue = nums[0];                      // 第 1 个是期号
      const front = nums.slice(1, 6).map(v => v.padStart(2, '0')); // 第 2-6 是前区
      const back  = nums.slice(6, 8).map(v => v.padStart(2, '0')); // 第 7-8 是后区
      all.push({ issue, front, back });
    }
    // 4. 只留最近 100 期
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
