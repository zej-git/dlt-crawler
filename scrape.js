const CSV = 'https://raw.githubusercontent.com/kelvinchin/dlt-history/main/dlt.csv';
const axios = require('axios');
const fs   = require('fs');

async function fetchCSV() {
  const { data } = await axios.get(CSV, { timeout: 5000 });
  const lines = data.trim().split('\n').slice(1); // 去掉表头
  return lines.slice(-100).map(l => {
    const [issue, , f1, f2, f3, f4, f5, b1, b2] = l.split(',');
    return {
      issue: issue.trim(),
      front: [f1, f2, f3, f4, f5].map(v => v.padStart(2, '0')),
      back:  [b1, b2].map(v => v.padStart(2, '0'))
    };
  });
};

(async () => {
  const list = await fetchCSV();
  fs.writeFileSync('dlt100.json', JSON.stringify(list, null, 2));
  console.log('✅ dlt100.json 已更新（共', list.length, '期）');
})();
