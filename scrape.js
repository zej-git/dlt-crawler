// scrape.js  临时方案：用已推送的 dlt100.json 当种子，后续再换源
const fs = require('fs');
const axios = require('axios');

// ① 先尝试拉官方源（失败就跳过）
const OFFICIAL_URL = 'https://www.lottery.gov.cn/historykj/history';
async function tryOfficial() {
  try {
    const { data } = await axios.post(
      OFFICIAL_URL,
      'lotteryType=4&pageNum=1&pageSize=100',
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 5000 }
    );
    return data.result.map(r => ({
      issue: r.code,
      front: r.redBall.split(','),
      back:  r.blueBall.split(',')
    }));
  } catch (e) {
    console.warn('官方源失败，沿用旧数据', e.message);
    return null;
  }
}

// ② 主流程
(async () => {
  let list = await tryOfficial();
  if (!list) {
    // 失败：直接读取当前仓库的 dlt100.json（保持格式不变）
    list = JSON.parse(fs.readFileSync('./dlt100.json', 'utf-8'));
  }
  fs.writeFileSync('dlt100.json', JSON.stringify(list, null, 2));
  console.log('✅ dlt100.json 已更新（共', list.length, '期）');
})();
