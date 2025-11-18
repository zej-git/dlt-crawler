// scrape.js  镜像源版
const axios = require('axios');
const fs   = require('fs');

const MIRROR = 'https://www.lottery.gov.cn/historykj/history'; // 官方源
const BACKUP = 'https://kaijiang.78500.cn/dlt/';              // 国内镜像

async function fetch100() {
  try {
    // 优先官方
    const { data } = await axios.post(
      MIRROR,
      'lotteryType=4&pageNum=1&pageSize=100',
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 5000 }
    );
    return data.result.map(r => ({
      issue: r.code,
      front: r.redBall.split(','),
      back:  r.blueBall.split(',')
    }));
  } catch (e) {
    console.warn('官方源失败，尝试镜像...', e.message);
    // 镜像：直接抓 HTML 表格（示例用正则，简单可靠）
    const { data: html } = await axios.get(BACKUP, { timeout: 5000 });
    const tr = html.match(/<tr[^>]*>(.*?)<\/tr>/g);
    if (!tr) throw new Error('镜像解析失败');
    const list = [];
    for (let i = 1; i < Math.min(101, tr.length); i++) {
      const td = tr[i].match(/<td[^>]*>(.*?)<\/td>/g);
      if (!td || td.length < 7) continue;
      const issue = td[0].replace(/<[^>]+>/g, '').trim();
      const front = td[1].replace(/<[^>]+>/g, '').trim().split(/\s+/);
      const back  = td[2].replace(/<[^>]+>/g, '').trim().split(/\s+/);
      if (issue && front.length === 5 && back.length === 2) list.push({ issue, front, back });
    }
    if (list.length === 0) throw new Error('镜像也无数据');
    return list;
  }
}

(async () => {
  const list = await fetch100();
  fs.writeFileSync('dlt100.json', JSON.stringify(list, null, 2));
  console.log('✅ dlt100.json 已更新（共', list.length, '期）');
})();
