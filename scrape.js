// scrape.js  500.com HTML → 纯数字
const axios = require('axios');
const fs   = require('fs');

const URL = 'https://datachart.500.com/dlt/history/history.shtml';

async function fetch500() {
  try {
    const { data: html } = await axios.get(URL, { timeout: 8000 });
    // ① 去掉换行符 ② 按行拆分 ③ 从第一行开始解析
    const lines = html.replace(/\r\n/g, '\n').split('\n');
    const list = [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      // 只抓 "<td>25131</td>" 开头的那一段
      if (!l.includes('<td class="t_tr1"')) continue;
      // 用正则一次性提取所有 <td>数字</td>
      const tds = l.match(/<td[^>]*>(\d+)<\/td>/g);
      if (!tds || tds.length < 9) continue;
      const nums = tds.map(td => td.replace(/<\/?td[^>]*>/g, '').trim());
      const [issue, f1, f2, f3, f4, f5, b1, b2] = nums;
      list.push({
        issue: issue,
        front: [f1, f2, f3, f4, f5].map(v => v.padStart(2, '0')),
        back:  [b1, b2].map(v => v.padStart(2, '0'))
      });
      if (list.length >= 100) break; // 只拿最近 100 行
    }
    if (list.length === 0) throw new Error('未解析到任何期号');
    return list;
  } catch (e) {
    console.warn('500 也失败', e.message);
    // 兜底：回退本地种子
    return JSON.parse(fs.readFileSync('./dlt100.json', 'utf-8'));
  }
}

(async () => {
  const list = await fetch500();
  fs.writeFileSync('dlt100.json', JSON.stringify(list, null, 2));
  console.log('✅ dlt100.json 已更新（共', list.length, '期）');
})();
