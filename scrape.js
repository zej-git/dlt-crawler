// scrape.js  500.com API 版（国内不墙，每晚 21:20 后更新）
const axios = require('axios');
const fs   = require('fs');

const API = 'https://datachart.500.com/dlt/history/history.shtml'; // 直接返回 HTML 表格

async function fetch500() {
  try {
    const { data: html } = await axios.get(API, { timeout: 8000 });
    // 解析 HTML 表格
    const tr = html.match(/<tr[^>]*>(.*?)<\/tr>/g);
    if (!tr) throw new Error('HTML 解析失败');
    const list = [];
    for (let i = 2; i < Math.min(102, tr.length); i++) { // 跳过表头
      const td = tr[i].match(/<td[^>]*>(.*?)<\/td>/g);
      if (!td || td.length < 7) continue;
      const issue = td[0].replace(/<[^>]+>/g, '').trim();
      const front = [td[1], td[2], td[3], td[4], td[5]].map(v => String(v).padStart(2, '0'));
      const back  = [td[6], td[7]].map(v => String(v).padStart(2, '0'));
      if (issue && front.length === 5 && back.length === 2) list.push({ issue, front, back });
    }
    if (list.length === 0) throw new Error('API 无数据');
    return list;
  } catch (e) {
    console.warn('API 也失败', e.message);
    // 兜底：回退本地种子，不抛错
    return JSON.parse(fs.readFileSync('./dlt100.json', 'utf-8'));
  }
}

(async () => {
  const list = await fetch500();
  fs.writeFileSync('dlt100.json', JSON.stringify(list, null, 2));
  console.log('✅ dlt100.json 已更新（共', list.length, '期）');
})();
