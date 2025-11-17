// scrape.js
const axios = require('axios');
const fs   = require('fs');
(async ()=>{
  const url='https://www.lottery.gov.cn/historykj/history';
  const {data} = await axios.post(url,
    'lotteryType=4&pageNum=1&pageSize=100',
    {headers:{'Content-Type':'application/x-www-form-urlencoded'}}
  );
  const list=data.result.map(r=>({
    issue:r.code,
    front:r.redBall.split(','),
    back :r.blueBall.split(',')
  }));
  fs.writeFileSync('dlt100.json',JSON.stringify(list,null,2));
  console.log('✅ 已写入 dlt100.json');
})();