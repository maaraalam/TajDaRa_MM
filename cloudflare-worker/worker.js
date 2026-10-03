const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'Content-Type,X-TAJDARA-Key',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...CORS } });
}
function authorized(req, env) {
  const expected=String(env.APP_SHARED_KEY||'').trim();
  const received=String(req.headers.get('X-TAJDARA-Key')||'').trim();
  return Boolean(expected) && received === expected;
}

async function telegram(env, title, body) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) throw new Error('Telegram secrets are not configured');
  const text = `TAJDARA M&M\n${title}\n\n${body}`.slice(0, 4000);
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
  });
  if (!r.ok) throw new Error(`Telegram ${r.status}`);
  return r.json();
}

const TF_MS = { '15m': 900000, '30m': 1800000, '1h': 3600000, '4h': 14400000, '1d': 86400000 };
const TF_NX = { '15m': 15, '30m': 30, '1h': 60, '4h': 240, '1d': 'D' };
async function candles(v, s, tf = '1h', limit = 140, cfg = {}) {
  if (v === 'TX') {
    const endTime = Date.now(), startTime = endTime - limit * (TF_MS[tf] || 3600000);
    const r = await fetch(`https://api.toobit.com/quote/v1/klines?symbol=${encodeURIComponent(s)}&interval=${tf}&startTime=${startTime}&endTime=${endTime}&limit=${limit}`);
    let d = await r.json(); if (d?.data) d = d.data;
    return (Array.isArray(d) ? d : []).map(x => ({ t:+x[0],o:+x[1],h:+x[2],l:+x[3],c:+x[4],v:+(x[5]||0) }));
  }
  if (v === 'BN') {
    const r = await fetch(`https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(s)}&interval=${tf}&limit=${limit}`);
    const d = await r.json();
    return (Array.isArray(d) ? d : []).map(x => ({ t:+x[0],o:+x[1],h:+x[2],l:+x[3],c:+x[4],v:+(x[5]||0) }));
  }
  if (v === 'NX') {
    const sec = { '15m':900,'30m':1800,'1h':3600,'4h':14400,'1d':86400 }[tf] || 3600;
    const to = Math.floor(Date.now()/1000), from = to - limit*sec;
    const r = await fetch(`https://apiv2.nobitex.ir/market/udf/history?symbol=${encodeURIComponent(s)}&resolution=${TF_NX[tf] || 60}&from=${from}&to=${to}`);
    const d = await r.json(), f = s.endsWith('IRT') ? 10 : 1;
    return (d.t || []).map((_,i)=>({ t:+d.t[i]*1000,o:+d.o[i]/f,h:+d.h[i]/f,l:+d.l[i]/f,c:+d.c[i]/f,v:+(d.v?.[i]||0) }));
  }
  if (v === 'DX') {
    const h = (cfg.dxHistory || []).filter(x => +x.price > 0);
    return h.slice(-limit).map(x => ({ t:+x.t,o:+x.price,h:+x.price,l:+x.price,c:+x.price,v:0 }));
  }
  return [];
}
function ema(vals,n){if(!vals.length)return 0;let k=2/(n+1),e=vals[0];for(let i=1;i<vals.length;i++)e=vals[i]*k+e*(1-k);return e;}
function rsi(vals,n=14){if(vals.length<n+1)return 50;let g=0,l=0;for(let i=vals.length-n;i<vals.length;i++){let d=vals[i]-vals[i-1];if(d>0)g+=d;else l-=d;}g/=n;l/=n;if(!l)return 100;return 100-100/(1+g/l);}
function atr(rows,n=14){if(rows.length<2)return 0;let a=[];for(let i=1;i<rows.length;i++){let x=rows[i],pc=rows[i-1].c;a.push(Math.max(x.h-x.l,Math.abs(x.h-pc),Math.abs(x.l-pc)));}return a.slice(-n).reduce((p,c)=>p+c,0)/Math.min(n,a.length);}
function pivots(rows,left=2,right=2){let hs=[],ls=[];for(let i=left;i<rows.length-right;i++){let h=rows[i].h,l=rows[i].l;if(rows.slice(i-left,i).every(x=>h>x.h)&&rows.slice(i+1,i+right+1).every(x=>h>=x.h))hs.push([i,h]);if(rows.slice(i-left,i).every(x=>l<x.l)&&rows.slice(i+1,i+right+1).every(x=>l<=x.l))ls.push([i,l]);}return [hs,ls];}
function analyze(rows){
  let out={side:'WAIT',grade:'C',score:0,bos:'NONE',choch:'NONE',sweep:'NONE',price:0,entryLow:0,entryHigh:0,stop:0,tp1:0,tp2:0};
  if(rows.length<60)return out; const c=rows.map(x=>x.c),last=rows.at(-1); out.price=last.c; const e20=ema(c.slice(-80),20),e50=ema(c.slice(-120),50),R=rsi(c),A=Math.max(atr(rows),last.c*.001); let score=0,trend='RANGE';
  if(last.c>e20&&e20>e50){trend='UP';score+=2}else if(last.c<e20&&e20<e50){trend='DOWN';score-=2}
  const [hs,ls]=pivots(rows), ph=hs.length?hs.at(-1)[1]:Math.max(...rows.slice(-20,-1).map(x=>x.h)), pl=ls.length?ls.at(-1)[1]:Math.min(...rows.slice(-20,-1).map(x=>x.l));
  if(last.c>ph){out.bos='BULLISH';score+=2;if(trend==='DOWN'){out.choch='BULLISH';score++}} else if(last.c<pl){out.bos='BEARISH';score-=2;if(trend==='UP'){out.choch='BEARISH';score--}}
  if(last.l<pl&&last.c>pl){out.sweep='SELL-SIDE';score+=2}else if(last.h>ph&&last.c<ph){out.sweep='BUY-SIDE';score-=2}
  if(R<32)score++; else if(R>68)score--;
  if(score>=2){out.side='LONG';out.entryLow=last.c-A*.35;out.entryHigh=last.c+A*.08;out.stop=last.c-A*1.25;let risk=last.c-out.stop;out.tp1=last.c+risk*1.7;out.tp2=last.c+risk*2.8}
  else if(score<=-2){out.side='SHORT';out.entryLow=last.c-A*.08;out.entryHigh=last.c+A*.35;out.stop=last.c+A*1.25;let risk=out.stop-last.c;out.tp1=last.c-risk*1.7;out.tp2=last.c-risk*2.8}
  const confirms=[out.bos!=='NONE',out.choch!=='NONE',out.sweep!=='NONE'].filter(Boolean).length,abs=Math.abs(score);out.grade=out.side!=='WAIT'&&abs>=5&&confirms>=2?'A':out.side!=='WAIT'&&abs>=3?'B':'C';out.score=score;return out;
}
function gradeOk(sig,min){return min==='A'?sig.grade==='A':['A','B'].includes(sig.grade)}
function realized(t){let buys=(t.fills||[]).filter(f=>f.type==='BUY'),sells=(t.fills||[]).filter(f=>f.type==='SELL');let bq=buys.reduce((a,x)=>a+(+x.qty||0),0),sq=sells.reduce((a,x)=>a+(+x.qty||0),0);return {open:Math.max(0,bq-sq)};}
async function monitor(env){
  const raw=await env.WATCHES.get('config'); if(!raw)return; const cfg=JSON.parse(raw); const watches=(cfg.watches||[]).filter(x=>x.enabled);
  for(const w of watches){
    try{
      const rows=await candles(w.venue,w.symbol,w.timeframe,140,cfg); if(rows.length<2)continue; const sig=analyze(rows),p=sig.price||rows.at(-1).c; let kind='',msg='';
      if(w.types?.includes('BUY')&&sig.side==='LONG'&&gradeOk(sig,w.minGrade)){kind='BUY';msg=`${w.venue} ${w.symbol} ${w.timeframe} Grade ${sig.grade}\nPrice: ${p}\nEntry: ${sig.entryLow} - ${sig.entryHigh}\nStop: ${sig.stop}\nTP1: ${sig.tp1}\nTP2: ${sig.tp2}\nBOS: ${sig.bos} | CHoCH: ${sig.choch} | Sweep: ${sig.sweep}`;}
      const openTrades=(cfg.journal||[]).filter(t=>t.symbol===w.symbol&&t.venue===w.venue&&realized(t).open>0);
      if(!kind&&w.types?.includes('TAKE PROFIT'))for(const t of openTrades){if((+t.tp2&&p>=+t.tp2)||(+t.tp1&&p>=+t.tp1)){kind='TAKE PROFIT';msg=`${w.venue} ${w.symbol}\nPrice ${p} reached a planned profit level. Review partial/full profit taking.`;break}}
      if(!kind&&w.types?.includes('EXIT'))for(const t of openTrades){if((+t.stop&&p<=+t.stop)||(sig.side==='SHORT'&&gradeOk(sig,w.minGrade))){kind='EXIT';msg=`${w.venue} ${w.symbol}\nPrice: ${p}\n${(+t.stop&&p<=+t.stop)?'Invalidation / stop reached.':`Bearish Grade ${sig.grade} signal.`}`;break}}
      if(!kind&&w.types?.includes('EXIT')&&sig.side==='SHORT'&&gradeOk(sig,w.minGrade)){kind='SELL';msg=`${w.venue} ${w.symbol} ${w.timeframe} bearish Grade ${sig.grade}\nPrice: ${p}\nEntry: ${sig.entryLow} - ${sig.entryHigh}\nStop: ${sig.stop}\nTP1: ${sig.tp1}`;}
      if(kind){const key=`${kind}|${Math.round(p*10000)/10000}|${sig.grade}`;const last=await env.WATCHES.get(`last:${w.id}`);if(last!==key){await telegram(env,`${kind} SIGNAL · ${w.symbol}`,msg);await env.WATCHES.put(`last:${w.id}`,key,{expirationTtl:86400*7});}}
    }catch(e){console.log('watch failed',w.id,e?.message||e)}
  }
}


function decodeXml(s=''){return String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
function tag(block,name){let m=block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'));return m?decodeXml(m[1]):'';}
function atomLink(block){let m=block.match(/<link[^>]+href=["']([^"']+)["']/i);return m?m[1]:tag(block,'link');}
function impactFor(title='',source=''){let t=(title+' '+source).toLowerCase();let high=['federal reserve','fomc','interest rate','rate decision','cpi','consumer price','pce','payroll','nonfarm','jobs report','unemployment','tariff','sanction','war','attack','missile','ceasefire','oil shock','opec','sec approves','etf approval','etf outflow','etf inflow','crypto regulation','bitcoin reserve','iran','israel','china stimulus','pboc'];let med=['powell','fed governor','treasury yield','dollar index','gold price','bitcoin','ethereum','oil','inflation','employment','central bank','china','geopolitical'];let score=high.filter(k=>t.includes(k)).length*2+med.filter(k=>t.includes(k)).length;return score>=3?'HIGH':score>=1?'MEDIUM':'LOW';}
function categoryFor(title=''){let t=title.toLowerCase();if(/fed|fomc|rate|inflation|cpi|pce|payroll|jobs|unemployment|yield/.test(t))return 'MACRO';if(/bitcoin|crypto|ethereum|sec|etf/.test(t))return 'CRYPTO';if(/gold|silver|oil|opec/.test(t))return 'COMMODITY';if(/iran|israel|war|sanction|tariff|china|russia|ukraine/.test(t))return 'GEOPOLITICS';return 'MARKET';}
function parseFeed(xml,source){let blocks=[...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(m=>m[2]);return blocks.slice(0,30).map(b=>{let title=tag(b,'title'),link=atomLink(b),published=tag(b,'pubDate')||tag(b,'published')||tag(b,'updated'),summary=tag(b,'description')||tag(b,'summary')||tag(b,'content');let impact=impactFor(title,source);return {title,link,published,summary:summary.slice(0,280),source,impact,category:categoryFor(title),reason:impact==='HIGH'?'Potentially market-moving headline':''};}).filter(x=>x.title&&x.link);}
async function fetchNews(){
  const sources=[
    ['Federal Reserve','https://www.federalreserve.gov/feeds/press_all.xml'],
    ['Macro & Markets','https://news.google.com/rss/search?q=%28Federal+Reserve+OR+CPI+OR+PCE+OR+payrolls+OR+tariffs+OR+sanctions+OR+war+OR+gold+OR+oil%29+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen'],
    ['Crypto','https://news.google.com/rss/search?q=%28Bitcoin+OR+Ethereum+OR+crypto+ETF+OR+SEC+crypto%29+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen'],
    ['Iran FX','https://news.google.com/rss/search?q=%28Iran+currency+OR+Iran+dollar+OR+Iran+gold+OR+Iran+sanctions%29+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen']
  ];
  let all=[];for(const [name,url] of sources){try{let r=await fetch(url,{headers:{'user-agent':'TAJDARA-MM/1.0'}});if(!r.ok)continue;all.push(...parseFeed(await r.text(),name));}catch(e){}}
  const seen=new Set();all=all.filter(x=>{let k=(x.title||'').toLowerCase();if(seen.has(k))return false;seen.add(k);return true;});
  all.sort((a,b)=>{let w={HIGH:3,MEDIUM:2,LOW:1};let d=(w[b.impact]||0)-(w[a.impact]||0);if(d)return d;return (+new Date(b.published||0))-(+new Date(a.published||0));});
  return all.slice(0,40);
}
async function monitorNews(env){
  const raw=await env.WATCHES.get('config');if(!raw)return;const cfg=JSON.parse(raw);if(cfg?.settings?.newsAlerts===false)return;
  const items=await fetchNews();for(const n of items.filter(x=>x.impact==='HIGH').slice(0,8)){let key='news:'+btoa(unescape(encodeURIComponent(n.title))).slice(0,120);let seen=await env.WATCHES.get(key);if(seen)continue;await telegram(env,`MARKET NEWS · ${n.category}`,`${n.title}\n\nSource: ${n.source}\n${n.link}`);await env.WATCHES.put(key,'1',{expirationTtl:86400*3});}
}

export default {
  async fetch(req, env) {
    try {
      if (req.method === 'OPTIONS') return new Response(null,{status:204,headers:CORS});
      const u=new URL(req.url);
      if(u.pathname==='/health')return json({
        ok:true,
        service:'TAJDARA M&M Signals + News Worker v8.1',
        authConfigured:Boolean(String(env.APP_SHARED_KEY||'').trim()),
        telegramConfigured:Boolean(env.TELEGRAM_BOT_TOKEN&&env.TELEGRAM_CHAT_ID),
        kvConfigured:Boolean(env.WATCHES)
      });
      if(u.pathname==='/news'&&req.method==='GET'){let items=await fetchNews();return json({ok:true,items,generatedAt:new Date().toISOString()});}
      if(!authorized(req,env))return json({ok:false,error:'unauthorized',hint:'Pairing Key must exactly match APP_SHARED_KEY.'},401);
      if(u.pathname==='/signal'&&req.method==='POST'){const b=await req.json();const tg=await telegram(env,b.title||'SIGNAL',b.body||'');return json({ok:true,telegramMessageId:tg?.result?.message_id||null});}
      if(u.pathname==='/sync'&&req.method==='POST'){
        if(!env.WATCHES)return json({ok:false,error:'WATCHES KV binding is missing'},500);
        const b=await req.json();await env.WATCHES.put('config',JSON.stringify(b));return json({ok:true,watches:(b.watches||[]).length});
      }
      if(u.pathname==='/test'&&req.method==='POST'){const tg=await telegram(env,'TEST · TAJDARA M&M','Telegram signal delivery is active for this shared chat.');return json({ok:true,telegramMessageId:tg?.result?.message_id||null});}
      return json({ok:false,error:'not found'},404);
    } catch (e) {
      return json({ok:false,error:e?.message||String(e)},500);
    }
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(Promise.all([monitor(env),monitorNews(env)])); },
};
