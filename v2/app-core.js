'use strict';

const DATA_URL='../data/app-data.json';
const UI={
  home:{th:'วันนี้',zh:'今天'},plan:{th:'แผน',zh:'行程'},explore:{th:'สำรวจ',zh:'探索'},budget:{th:'ค่าใช้จ่าย',zh:'费用'},more:{th:'เพิ่มเติม',zh:'更多'},
  help:{th:'ช่วยฉัน',zh:'帮助我'},emergency:{th:'ฉุกเฉิน',zh:'紧急'},close:{th:'ปิด',zh:'关闭'},
  countdown:{th:'ก่อนออกเดินทาง',zh:'出发前'},daysLeft:{th:'อีก {n} วัน',zh:'还有 {n} 天'},tripEnded:{th:'ทริปสิ้นสุดแล้ว',zh:'旅行已结束'},todayPlan:{th:'แผนวันนี้',zh:'今日行程'},
  nextStep:{th:'ตอนนี้ต้องทำอะไรต่อ?',zh:'下一步该做什么？'},previous:{th:'ก่อนหน้า',zh:'上一站'},current:{th:'ตอนนี้',zh:'现在'},next:{th:'ต่อไป',zh:'下一站'},leaveAt:{th:'ควรออก',zh:'建议出发'},arriveAt:{th:'เวลานัด/เริ่ม',zh:'计划开始'},
  doneToday:{th:'ไปแล้ววันนี้',zh:'今日已完成'},favorites:{th:'รายการโปรด',zh:'收藏'},expenses:{th:'ค่าใช้จ่าย',zh:'费用'},
  startTravel:{th:'เริ่มเดินทาง',zh:'开始出发'},showChinese:{th:'中文 ให้คนดู',zh:'给别人看中文'},arrived:{th:'ฉันถึงแล้ว',zh:'我到了'},undoDone:{th:'ยกเลิกไปแล้ว',zh:'取消已到达'},
  route:{th:'วิธีเดินทาง',zh:'出行方式'},meal:{th:'อาหาร/เมนู',zh:'餐饮/菜单'},arrival:{th:'เมื่อถึงแล้ว',zh:'到达后'},
  openAmap:{th:'เปิด AMap',zh:'打开高德地图'},openGoogle:{th:'Google Maps',zh:'Google 地图'},copyChinese:{th:'Copy 中文',zh:'复制中文'},speak:{th:'🔊 ฟังเสียง',zh:'🔊 播放语音'},
  timeline:{th:'ลำดับเวลา',zh:'时间线'},dayOverview:{th:'ภาพรวมวันนี้',zh:'今日概览'},items:{th:'รายการ',zh:'项'},
  searchPlaceholder:{th:'ค้นหา ไทย / 中文 / English',zh:'搜索 中文 / 泰语 / English'},all:{th:'ทั้งหมด',zh:'全部'},sight:{th:'เที่ยว',zh:'景点'},food:{th:'อาหาร',zh:'美食'},shopping:{th:'ช้อป',zh:'购物'},transport:{th:'เดินทาง',zh:'交通'},temple:{th:'วัด',zh:'寺庙'},market:{th:'ตลาด',zh:'市场'},walk:{th:'เดินเล่น',zh:'步行'},hotel:{th:'โรงแรม',zh:'酒店'},museum:{th:'พิพิธภัณฑ์',zh:'博物馆'},cafe:{th:'คาเฟ่',zh:'咖啡'},
  noPlaces:{th:'ไม่พบสถานที่',zh:'没有找到地点'},details:{th:'รายละเอียด',zh:'详情'},address:{th:'ที่อยู่',zh:'地址'},city:{th:'เมือง',zh:'城市'},
  totalSpent:{th:'ใช้ทั้งหมด',zh:'总支出'},records:{th:'รายการ',zh:'笔'},addExpense:{th:'+ เพิ่มค่าใช้จ่าย',zh:'+ 添加费用'},expenseTitle:{th:'เช่น มื้อเย็น',zh:'例如：晚餐'},amount:{th:'จำนวน CNY',zh:'金额 CNY'},payer:{th:'คนจ่าย',zh:'付款人'},category:{th:'หมวด',zh:'类别'},date:{th:'วันที่',zh:'日期'},splitWith:{th:'หารกับ',zh:'分摊给'},save:{th:'บันทึก',zh:'保存'},settlement:{th:'สรุปว่าใครคืนใคร',zh:'结算谁应付给谁'},noSettlement:{th:'ยังไม่มีข้อมูลเพียงพอ',zh:'暂无足够数据'},recent:{th:'รายการล่าสุด',zh:'最近记录'},delete:{th:'ลบ',zh:'删除'},noExpense:{th:'ยังไม่มีค่าใช้จ่าย',zh:'暂无费用记录'},
  categories:{food:{th:'อาหาร',zh:'餐饮'},transport:{th:'เดินทาง',zh:'交通'},ticket:{th:'ตั๋ว',zh:'门票/车票'},shopping:{th:'ช้อปปิ้ง',zh:'购物'},other:{th:'อื่น ๆ',zh:'其他'}},
  checklist:{th:'เช็กลิสต์',zh:'行前清单'},tripInfo:{th:'ข้อมูลทริป',zh:'行程信息'},signs:{th:'ป้ายจีนที่ต้องรู้',zh:'常用中文标识'},restaurant:{th:'ช่วยสั่งอาหาร',zh:'餐厅生存模式'},backup:{th:'Backup ข้อมูล',zh:'备份数据'},settings:{th:'ตั้งค่า',zh:'设置'},sos:{th:'SOS / ฉุกเฉิน',zh:'SOS / 紧急'},
  checklistProgress:{th:'เตรียมพร้อมแล้ว',zh:'准备完成'},resetChecklist:{th:'ล้างเครื่องหมายทั้งหมด',zh:'清空全部勾选'},confirmReset:{th:'ล้าง Checklist ทั้งหมด?',zh:'确定清空全部清单吗？'},
  flights:{th:'เที่ยวบิน',zh:'航班'},hotelInfo:{th:'โรงแรม',zh:'酒店'},insurance:{th:'ประกันเดินทาง',zh:'旅行保险'},call:{th:'โทร',zh:'拨打'},backHotel:{th:'กลับโรงแรม',zh:'返回酒店'},driverTitle:{th:'ให้คนขับดู',zh:'给司机看'},driverHint:{th:'ยื่นหน้าจอนี้ให้คนขับ หรือ Copy ไปวางใน DiDi / AMap',zh:'把此页面给司机看，或复制后粘贴到滴滴/高德地图'},
  signsHint:{th:'ไม่จำเป็นต้องอ่านออก ให้จำหน้าตาตัวจีนแล้วเทียบกับป้ายจริง',zh:'无需会读，直接把汉字外形与现场标识对照'},phrasesHint:{th:'แตะ Copy หรือ 🔊 แล้วให้พนักงานดู/ฟังได้ทันที',zh:'点击复制或播放语音，可直接给工作人员看/听'},
  export:{th:'Export JSON',zh:'导出 JSON'},import:{th:'Import JSON',zh:'导入 JSON'},backupHint:{th:'เก็บ Checklist, ค่าใช้จ่าย, Favorites และสถานะไปแล้วไว้ในเครื่อง',zh:'清单、费用、收藏和已到达状态保存在本机'},importOk:{th:'Import สำเร็จ',zh:'导入成功'},invalidFile:{th:'ไฟล์ไม่ถูกต้อง',zh:'文件无效'},
  language:{th:'ภาษา',zh:'语言'},fontSize:{th:'ขนาดตัวอักษร',zh:'字体大小'},normal:{th:'ปกติ',zh:'正常'},large:{th:'ใหญ่',zh:'大'},xlarge:{th:'ใหญ่มาก',zh:'特大'},familyStatus:{th:'สถานะครอบครัว',zh:'家庭状态'},familyNormal:{th:'🙂 ปกติ',zh:'🙂 正常'},familyTired:{th:'😮‍💨 เริ่มเหนื่อย',zh:'😮‍💨 开始累了'},familyRest:{th:'🛋 ต้องพัก',zh:'🛋 需要休息'},
  simulator:{th:'จำลองทริป',zh:'模拟行程'},simulatorHint:{th:'ฝึกหน้า Today ก่อนวันจริง โดยไม่เปลี่ยนสถานะไปแล้ว',zh:'正式出发前练习“今天”页面，不影响真实完成状态'},simDay:{th:'Day',zh:'天数'},simTime:{th:'เวลา',zh:'时间'},startSim:{th:'เริ่มจำลอง',zh:'开始模拟'},stopSim:{th:'กลับเวลาใช้งานจริง',zh:'返回真实时间'},simulation:{th:'SIMULATION · โหมดจำลอง',zh:'SIMULATION · 模拟模式'},
  localMembers:{th:'ชื่อสมาชิก (เก็บเฉพาะในเครื่อง)',zh:'成员姓名（仅保存在本机）'},membersHint:{th:'ไม่บันทึกชื่อสมาชิกลง GitHub; ใช้สำหรับหารค่าใช้จ่ายบนเครื่องนี้เท่านั้น',zh:'成员姓名不会写入 GitHub，仅用于本机费用分摊'},saveMembers:{th:'บันทึกสมาชิก',zh:'保存成员'},
  ready:{th:'พร้อมใช้',zh:'可用'},offline:{th:'Offline',zh:'离线'},online:{th:'ออนไลน์',zh:'在线'},dataSource:{th:'ข้อมูลสำคัญ',zh:'重要信息'},
  helpLost:{th:'📍 ฉันหลง',zh:'📍 我迷路了'},helpHotel:{th:'🚕 กลับโรงแรม',zh:'🚕 返回酒店'},helpDidi:{th:'🚗 เรียก DiDi',zh:'🚗 叫滴滴'},helpMetro:{th:'🚇 ขึ้น Metro',zh:'🚇 坐地铁'},helpTrain:{th:'🚆 รถไฟ Hangzhou',zh:'🚆 杭州高铁'},helpAlipay:{th:'💳 จ่าย Alipay',zh:'💳 支付宝付款'},helpFood:{th:'🍜 สั่งอาหาร',zh:'🍜 点餐'},helpToilet:{th:'🚻 ห้องน้ำ',zh:'🚻 洗手间'},
  copied:{th:'คัดลอกแล้ว',zh:'已复制'},saved:{th:'บันทึกแล้ว',zh:'已保存'},addedFav:{th:'เพิ่ม Favorites แล้ว',zh:'已加入收藏'},removedFav:{th:'นำออกจาก Favorites แล้ว',zh:'已取消收藏'},doneSaved:{th:'บันทึกว่าไปแล้ว ✓',zh:'已标记到达 ✓'},doneRemoved:{th:'ยกเลิกสถานะไปแล้ว',zh:'已取消到达状态'},
  privateNotice:{th:'ข้อมูลผู้โดยสาร/เลข Booking/เลขกรมธรรม์ไม่อยู่ใน data model สาธารณะของ v2',zh:'乘客姓名、预订编号和保单号不存放在 v2 公共数据模型中'},
  noIframe:{th:'Standalone v2 · ไม่ใช้ iframe',zh:'Standalone v2 · 无 iframe'}
};

let DATA=null;
const state={
  tab:'home',selectedDay:0,placeFilter:'all',placeQuery:'',moreView:'menu',
  lang:localStorage.getItem('sh-ui-language')==='zh'?'zh':'th',
  fontSize:localStorage.getItem('sh-text-size')||'normal',
  family:localStorage.getItem('sh-family-status')||'normal',
  sim:loadJSON('sh-sim-v3',null)
};

const app=document.getElementById('app');
const titleEl=document.getElementById('screenTitle');
const nav=document.getElementById('bottomNav');
const langBtn=document.getElementById('langBtn');
const modal=document.getElementById('modal');
const backdrop=document.getElementById('modalBackdrop');
const modalTitle=document.getElementById('modalTitle');
const modalSub=document.getElementById('modalSub');
const modalBody=document.getElementById('modalBody');
const toastEl=document.getElementById('toast');
let toastTimer=null;

function tr(key,vars={}){
  let v=UI[key];
  if(!v)return key;
  let s=typeof v==='string'?v:(v[state.lang]??v.th??key);
  Object.entries(vars).forEach(([k,x])=>s=s.replaceAll('{'+k+'}',x));
  return s;
}
function loc(v){if(v==null)return '';if(typeof v==='string')return v;return v[state.lang]??v.th??v.zh??''}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function loadJSON(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch{return fallback}}
function saveJSON(key,v){localStorage.setItem(key,JSON.stringify(v))}
function getSet(key){return new Set(loadJSON(key,[]))}
function saveSet(key,s){saveJSON(key,[...s])}
function toggleSet(key,id){const s=getSet(key);if(s.has(id))s.delete(id);else s.add(id);saveSet(key,s);return s.has(id)}
function eventKey(dayIndex,eventIndex,e){return `event:${DATA.days[dayIndex].date}|${e.time}|${e.cn||loc(e.name)}|${eventIndex}`}
function placeKey(p){return `place:${p.cn||loc(p.name)}`}
function toast(msg){clearTimeout(toastTimer);toastEl.textContent=msg;toastEl.classList.add('show');toastTimer=setTimeout(()=>toastEl.classList.remove('show'),1800)}
function copyText(s){if(navigator.clipboard?.writeText){navigator.clipboard.writeText(s).then(()=>toast(tr('copied'))).catch(()=>fallbackCopy(s))}else fallbackCopy(s)}
function fallbackCopy(s){const ta=document.createElement('textarea');ta.value=s;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast(tr('copied'))}catch{}ta.remove()}
function speak(s){if(!('speechSynthesis' in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(s);u.lang='zh-CN';u.rate=.82;window.speechSynthesis.speak(u)}
function amapUrl(obj){const q=obj.cn||obj.en||loc(obj.name)||'';return `https://uri.amap.com/search?keyword=${encodeURIComponent(q)}&city=${encodeURIComponent(obj.city||'上海')}&callnative=1`}
function googleUrl(obj){const q=[obj.en, obj.cn, obj.addr, obj.city].filter(Boolean).join(', ');return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q||loc(obj.name))}`}
function typeIcon(type){return ({transport:'🚕',market:'🧺',walk:'🚶',sight:'📍',rest:'🛋',food:'🍜',temple:'🛕',shopping:'🛍',cafe:'☕',train:'🚆',museum:'🏛',hotel:'🏨',flight:'✈️'})[type]||'📌'}
function categoryLabel(c){const map={อาหาร:'food',เดินทาง:'transport',ตั๋ว:'ticket',ช้อปปิ้ง:'shopping','อื่น ๆ':'other'};const key=map[c]||c;return UI.categories[key]?loc(UI.categories[key]):c}
function currentShanghai(){
  const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  const p=Object.fromEntries(fmt.formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
  return {date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`,minutes:Number(p.hour)*60+Number(p.minute)};
}
function dateDiff(a,b){const x=new Date(a+'T00:00:00Z'),y=new Date(b+'T00:00:00Z');return Math.round((y-x)/86400000)}
function minutes(s){const [h,m]=String(s).split(':').map(Number);return h*60+m}
function hhmm(n){n=(n+1440)%1440;return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
function bufferFor(e){if(e.type==='flight')return 180;if(e.type==='train')return 60;if(e.type==='transport')return 35;if(e.type==='sight'||e.type==='temple'||e.type==='museum')return 25;return 15}

function tripStatus(){
  if(state.sim?.active){const i=Math.max(0,Math.min(DATA.days.length-1,Number(state.sim.day)||0));return {phase:'during',day:i,time:state.sim.time||'09:00',minutes:minutes(state.sim.time||'09:00'),label:tr('simulation'),sim:true}}
  const now=currentShanghai();const start=DATA.days[0].date,end=DATA.days.at(-1).date;
  if(now.date<start)return {phase:'before',day:0,time:now.time,minutes:now.minutes,daysLeft:dateDiff(now.date,start)};
  if(now.date>end)return {phase:'after',day:DATA.days.length-1,time:now.time,minutes:now.minutes};
  const i=DATA.days.findIndex(d=>d.date===now.date);return {phase:'during',day:i<0?0:i,time:now.time,minutes:now.minutes};
}
function nextContext(dayIndex,nowMinutes){
  const d=DATA.days[dayIndex],done=getSet('sh-done');let idx=d.events.findIndex((e,i)=>!done.has(eventKey(dayIndex,i,e))&&minutes(e.time)>=nowMinutes-20);
  if(idx<0)idx=d.events.findIndex((e,i)=>!done.has(eventKey(dayIndex,i,e)));
  if(idx<0)idx=d.events.length-1;
  return {idx,prev:d.events[idx-1]||null,current:d.events[idx]||null,next:d.events[idx+1]||null};
}
function updateChrome(){
  document.documentElement.lang=state.lang==='zh'?'zh-CN':'th';document.documentElement.dataset.size=state.fontSize;
  document.title=state.lang==='zh'?'上海家庭旅行':'Shanghai Family Trip';
  const tabs=['home','plan','explore','budget','more'];
  nav.querySelectorAll('[data-tab]').forEach((b,i)=>{b.classList.toggle('active',b.dataset.tab===state.tab);b.querySelector('span').textContent=tr(tabs[i])});
  titleEl.textContent=tr(state.tab);langBtn.textContent=state.lang==='zh'?'中 / TH':'TH / 中';
  document.getElementById('helpBtn').setAttribute('aria-label',tr('help'));document.getElementById('emergencyBtn').setAttribute('aria-label',tr('emergency'));document.getElementById('modalClose').setAttribute('aria-label',tr('close'));
}
function render(){updateChrome();state.moreView=state.tab==='more'?state.moreView:'menu';app.innerHTML=({home:renderHome,plan:renderPlan,explore:renderExplore,budget:renderBudget,more:renderMore}[state.tab]||renderHome)();window.scrollTo({top:0,behavior:'instant'})}

function hero(d,label){return `<section class="hero"><img src="${esc(d.hero)}" alt="${esc(loc(d.title))}"><div class="hero-copy"><span class="pill">${esc(label)}</span><h1>${esc(loc(d.title))}</h1><p>${esc(loc(d.theme))}</p></div></section>`}
