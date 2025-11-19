// scrape.js  500.com 隐藏 JSON 接口（活参数，每晚更新）
const axios = require('axios');
const fs   = require('fs');

// 隐藏接口：一次返回 100 期，倒序排列
const URL = 'https://datachart.500.com/dlt/history/inc/history.php?limit=500';

async function fetch500() {
  try {
    const { data } = await axios.get(URL, { timeout: 8000 });
    // data 是 JSON 数组，倒序，直接解析
    if (!Array.isArray(data) || data.length === 0) throw new Error('JSON 为空');
    return data.map(r => ({
      issue: String(r.code),
      front: [r.red1, r.red2, r.red3, r.red4, r.red5].map(v => String(v).padStart(2, '0')),
      back:  [r.blue1, r.blue2].map(v => String(v).padStart(2, '0'))
    }));
  } catch (e) {
    console.warn('隐藏 JSON 也失败', e.message);
    // 兜底：回退本地种子
    return JSON.parse(fs.readFileSync('./dlt100.json', 'utf-8'));
  }
}

(async () => {
  const list = await fetch500();
  fs.writeFileSync('dlt100.json', JSON.stringify(list, null, 2));
  console.log('✅ dlt100.json 已更新（共', list.length, '期）');
})();
