// scrape.js  GitHub 官方 CSV 源（国内不墙）
const axios = require('axios');
const fs   = require('fs');

const CSV_URL = 'https://raw.githubusercontent.com/kelvinchin/dlt-history/main/dlt.csv';

async function fetchCSV() {
  try {
    const { data } = await axios.get(CSV_URL, { timeout: 8000 });
    // 去掉表头，只拿最近 100 行
    const lines = data.trim().split('\n').slice(1).slice(-100);
    return lines.map(l => {
      const [issue, , f1, f2, f3, f4, f5, b1, b2] = l.split(',');
      return {
        issue: issue.trim(),
        front: [f1, f2, f3, f4, f5].map(v => String(v).padStart(2, '0')),
        back:  [b1, b2].map(v => String(v).padStart(2, '0'))
      };
    });
  } catch (e) {
    console.error('CSV 也失败', e.message);
    // 保底：回退到本地已有文件，不抛错
    return JSON.parse(fs.readFileSync('./dlt100.json', 'utf-8'));
  }
}

(async () => {
  const list = await fetchCSV();
  fs.writeFileSync('dlt100.json', JSON.stringify(list, null, 2));
  console.log('✅ dlt100.json 已更新（共', list.length, '期）');
})();
