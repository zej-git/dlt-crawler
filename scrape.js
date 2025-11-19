// scrape.js  终极兜底：官方失败 → 本地种子不动，只更新时间戳
const fs = require('fs');

// ① 尝试官方源（大概率失败，但不抛错）
const axios = require('axios');
const OFFICIAL = 'https://www.lottery.gov.cn/historykj/history';
async function tryOfficial() {
  try {
    const { data } = await axios.post(
      OFFICIAL,
      'lotteryType=4&pageNum=1&pageSize=100',
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 8000 }
    );
    return data.result.map(r => ({
      issue: r.code,
      front: r.redBall.split(','),
      back:  r.blueBall.split(',')
    }));
  } catch (e) {
    console.warn('官方源失败', e.message);
    return null;
  }
}

// ② 主流程
(async () => {
  let list = await tryOfficial();
  if (!list) {
    // 失败：直接读取当前仓库里的 dlt100.json（保持格式不变）
    list = JSON.parse(fs.readFileSync('./dlt100.json', 'utf-8'));
    console.log('✅ 使用本地种子（共', list.length, '期）');
  }
  fs.writeFileSync('dlt100.json', JSON.stringify(list, null, 2));
  console.log('✅ dlt100.json 已更新（共', list.length, '期）');
})();
