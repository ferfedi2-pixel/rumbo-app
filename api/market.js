export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  let ethShare=null,emShare=null,emDate=null,errors=[];
  try{
    const r=await fetch('https://api.coingecko.com/api/v3/global',{headers:{accept:'application/json','user-agent':'Mozilla/5.0 RUMBO/2.3'}});
    if(!r.ok)throw new Error('CoinGecko '+r.status);
    const j=await r.json(),v=Number(j?.data?.market_cap_percentage?.eth);
    if(Number.isFinite(v))ethShare=v;
  }catch(e){errors.push('ETH: '+String(e.message||e))}
  try{
    const h={'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36','accept':'text/html,application/xhtml+xml','accept-language':'en-US,en;q=0.9'};
    const [a,e]=await Promise.all([
      fetch('https://www.msci.com/indexes/index/892400/msci-acwi-index',{headers:h,cache:'no-store'}),
      fetch('https://www.msci.com/indexes/index/891800/msci-em-emerging-markets-index-2',{headers:h,cache:'no-store'})
    ]);
    if(!a.ok||!e.ok)throw new Error('MSCI '+a.status+'/'+e.status);
    const [at,et]=await Promise.all([a.text(),e.text()]);
    const clean=x=>x.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
    const cap=x=>{const m=clean(x).match(/Index Market Cap\s*(?:\||:)?\s*\$?\s*([0-9]+(?:\.[0-9]+)?)\s*T/i);return m?+m[1]:null};
    const date=x=>{const m=clean(x).match(/Data as of\s+([A-Za-z]{3,9}\.?)[\s]+(\d{1,2}),[\s]+(\d{4})/i);return m?(m[2]+' '+m[1]+' '+m[3]):null};
    const ac=cap(at),em=cap(et);
    if(ac&&em)emShare=em/ac*100;
    emDate=date(et)||date(at);
  }catch(e){errors.push('MSCI: '+String(e.message||e))}
  res.status(200).json({ethShare,emShare,emDate,updated:new Date().toLocaleDateString('es-ES',{timeZone:'Europe/Madrid'}),source:'MSCI + CoinGecko',errors});
}