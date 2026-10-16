(async()=>{
// Public match calendar feed. No player names, call-ups, or private notices.
const fs=require('node:fs');
const crypto=require('node:crypto');
const url=process.env.SUPABASE_URL;
const key=process.env.SUPABASE_PUBLISHABLE_KEY;
if(!url||!key)throw Error('Missing public Supabase configuration');
const response=await fetch(url+'/rest/v1/team_content?id=eq.main&select=content,updated_at',{headers:{apikey:key,Authorization:'Bearer '+key,Accept:'application/json'},signal:AbortSignal.timeout(15000)});
if(!response.ok)throw Error('Supabase returned HTTP '+response.status);
const rows=await response.json();
if(!Array.isArray(rows)||!rows.length)throw Error('No published content; preserving existing calendar');
const games=rows[0].content?.games;
if(!Array.isArray(games))throw Error('Missing games array; preserving existing calendar');
const escape=v=>String(v??'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,c=>'\\'+c);
const compact=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const dateKey=v=>{const x=String(v||'');return /^\d{2}\/\d{2}\/\d{4}$/.test(x)?x.split('/').reverse().join('-'):x};
const events=[];const duplicates=new Map();
for(const g of games){
 const date=dateKey(g.date||g.data);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))continue;
 const [year,month,day]=date.split('-').map(Number);
 const check=new Date(Date.UTC(year,month-1,day));
 if(check.getUTCFullYear()!==year||check.getUTCMonth()!==month-1||check.getUTCDate()!==day)continue;
 const dateCompact=date.replace(/-/g,'');
 const opponent=String(g.adversario||'Adversário a confirmar');
 const place=String(g.place||g.local||'').replace(/^(Casa · |Fora · )/,'');
 const tipo=String(g.tipo||'Jogo');
 const rawTime=String(g.time||g.hora||'');
 const match=/^(\d{1,2}):(\d{2})/.exec(rawTime);
 const timed=!!match&&+match[1]<24&&+match[2]<60;
 const start=timed?dateCompact+'T'+match[1].padStart(2,'0')+match[2]+'00':dateCompact;
 let end;
 if(timed){
  const endMatch=/^\d{1,2}:\d{2}\s*[-–]\s*(\d{1,2}):(\d{2})/.exec(rawTime);
  const endHour=endMatch?+endMatch[1]:+match[1]+2,endMin=endMatch?+endMatch[2]:+match[2];
  const endDate=new Date(Date.UTC(year,month-1,day,endHour,endMin));
  end=endDate.toISOString().slice(0,10).replace(/-/g,'')+'T'+endDate.toISOString().slice(11,16).replace(':','')+'00';
 }else{end=new Date(Date.UTC(year,month-1,day+1)).toISOString().slice(0,10).replace(/-/g,'')}
 const identity=String(g.id||g.uid||[opponent,tipo,place].join('|'));
 const occurrence=duplicates.get(identity)||0;duplicates.set(identity,occurrence+1);
 const uid=crypto.createHash('sha256').update(identity+'|'+occurrence).digest('hex').slice(0,24)+'@adargoncilhe.github.io';
 const suffix=timed?';TZID=Europe/Lisbon':';VALUE=DATE';
 const description=[tipo,g.description||g.descricao||''].filter(Boolean).join(' — ');
 events.push(['BEGIN:VEVENT','UID:'+uid,'DTSTAMP:'+compact(new Date(rows[0].updated_at||Date.now())),'DTSTART'+suffix+':'+start,'DTEND'+suffix+':'+end,'SUMMARY:'+escape('AD Argoncilhe · '+opponent),'LOCATION:'+escape(place),'DESCRIPTION:'+escape(description),'URL:https://adargoncilhe.github.io/ad-argoncilhe/','END:VEVENT'].join('\r\n'));
}
const calendar=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//AD Argoncilhe//Jogos Sub10//PT','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:AD Argoncilhe Sub-10 - Jogos','X-WR-TIMEZONE:Europe/Lisbon','REFRESH-INTERVAL;VALUE=DURATION:PT1H','X-PUBLISHED-TTL:PT1H',...events,'END:VCALENDAR'].join('\r\n')+'\r\n';
fs.writeFileSync('jogos.ics',calendar,'utf8');
console.log('Published '+events.length+' public matches');

})().catch(error=>{console.error(error);process.exitCode=1});
