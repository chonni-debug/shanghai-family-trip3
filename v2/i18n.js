(function(){
'use strict';
var STORAGE='sh-ui-language';
var lang=localStorage.getItem(STORAGE)==='zh'?'zh':'th';
var frame=document.getElementById('legacy');
var header=document.querySelector('.header');
var originalText=new WeakMap();
var applying=false;

var ZH={
'วันนี้':'今天','แผน':'行程','สำรวจ':'探索','ค่าใช้จ่าย':'费用','เพิ่มเติม':'更多','ฉุกเฉิน':'紧急','ปิด':'关闭','Plan B':'备选方案',
'เลือกสิ่งที่อยากหา':'选择想查找的内容','แผนที่':'地图','ดูจุดทั้งหมดและเส้นทาง':'查看全部地点和路线','สถานที่':'地点','ค้นหาไทย / 中文 / English':'支持泰语 / 中文 / English 搜索','ร้านอาหาร':'餐厅','เลือกร้านตามย่านและประเภท':'按区域和类型选择餐厅','ตัวเลือกเมื่อฝนตก ร้านปิด หรือมีเวลาเพิ่ม':'下雨、店铺关闭或有额外时间时的备选','Checklist':'行前清单','เช็กของและความพร้อม':'检查物品和准备情况','ประกันเดินทาง':'旅行保险','เบอร์ติดต่อและวงเงินสำคัญ':'重要联系方式和保障额度','ข้อมูลทริป':'行程信息','เที่ยวบิน โรงแรม และสัมภาระ':'航班、酒店和行李','ติดตั้งแอป':'安装应用','ข้อมูลเตรียมตัวและข้อมูลสำคัญ':'准备与重要信息',
'ป้ายจีน':'中文标识','จำลอง':'模拟','พจนานุกรมป้ายจีน':'中文标识词典','ใช้เทียบกับป้ายจริงแบบไม่ต้องอ่านจีน':'无需会读中文，直接对照真实标识','ไม่จำเป็นต้องอ่านออก ให้จำ “หน้าตา” ของตัวจีนแล้วเทียบกับป้ายจริง โดยเฉพาะ Exit / Transfer / Gate / Toilet':'不必会读中文，记住汉字的样子并与现场标识对照，尤其是出口 / 换乘 / 检票口 / 洗手间','ร้านอาหาร · Survival Mode':'餐厅 · 生存模式','ประโยคที่ใช้ได้ทันที':'可立即使用的句子','แตะ 🔊 หรือยื่นตัวอักษรจีนให้พนักงานดูได้ทันที':'点击 🔊，或直接把中文给工作人员看','Copy 中文':'复制中文','ฟังเสียง':'播放语音',
'สถานะครอบครัว':'家庭状态','ให้แผนปรับตามแรงที่เหลือ':'根据体力调整行程','เลือกตามสภาพจริง ไม่จำเป็นต้องทำครบทุกจุด':'按实际状态选择，不必完成所有地点','🙂 ปกติ':'🙂 正常','😮‍💨 เริ่มเหนื่อย':'😮‍💨 开始累了','🛋 ต้องพัก':'🛋 需要休息','เมื่อเลือก “เริ่มเหนื่อย/ต้องพัก” Journey Controller จะเน้น DiDi, จุดพัก และการข้ามกิจกรรม optional มากขึ้น':'选择“开始累了 / 需要休息”后，Journey Controller 会优先推荐 DiDi、休息点和跳过可选活动',
'จำลองทริป':'模拟行程','ฝึกใช้เว็บก่อนบิน':'出发前练习使用网站','ลองเดินทางก่อนวันจริง':'正式出发前先模拟','เลือก Day และเวลา จากนั้นหน้า Today จะจำลองว่า “ควรทำอะไรต่อ” โดยไม่กระทบสถานะถึงแล้วจริง':'选择天数和时间后，“今天”页面会模拟下一步操作，不会影响真实的到达状态','เวลา':'时间','เริ่มจำลอง':'开始模拟','กลับเวลาใช้งานจริง':'返回真实时间','โหมดจำลองจะแสดงป้าย “SIMULATION” บนหน้า Today เพื่อไม่ให้สับสนกับทริปจริง':'模拟模式会在“今天”页面显示“SIMULATION”，避免与真实行程混淆',
'ขนาดตัวอักษร':'字体大小','เพิ่มขนาดข้อความสำหรับผู้ใช้ที่ต้องการอ่านง่ายขึ้น':'为需要更易阅读的用户放大文字','A ปกติ':'A 正常','A+ ใหญ่':'A+ 大','A++ ใหญ่มาก':'A++ 特大','ป้ายจีนที่ต้องรู้':'必须认识的中文标识','4 คน · ไม่เผ็ด · คิดเงิน':'4人 · 不辣 · 买单','ปกติ / เหนื่อย / ต้องพัก':'正常 / 累了 / 需要休息','เพิ่มความอ่านง่าย':'提高可读性','ฝึก Day 1–6 ก่อนเดินทาง':'出发前练习第1–6天',
'🇨🇳 ช่วยฉัน':'🇨🇳 帮助我','จีนครั้งแรก':'第一次来中国','ช่วยฉัน · จีนครั้งแรก':'帮助我 · 第一次来中国','เลือกปัญหาที่กำลังเจอ':'请选择当前遇到的问题','📍 ฉันหลง':'📍 我迷路了','ประโยคให้คนจีนช่วยดูทาง':'给中国人看的求助句子','🚕 กลับโรงแรม':'🚕 返回酒店','ชื่อ/ที่อยู่จีนขนาดใหญ่':'大字显示酒店中文名称/地址','🚗 เรียก DiDi':'🚗 叫 DiDi','ทำทีละขั้น':'一步一步操作','🚇 ขึ้น Metro':'🚇 坐地铁','Line → Direction → Station → Exit':'线路 → 方向 → 车站 → 出口','🚆 ขึ้นรถไฟ Hangzhou':'🚆 去杭州坐高铁','Passport · Train · Gate · Coach':'护照 · 车次 · 检票口 · 车厢','🍜 สั่งอาหาร':'🍜 点餐','จำนวนคน · เมนู · ไม่เผ็ด':'人数 · 菜单 · 不辣','🚻 หาห้องน้ำ':'🚻 找洗手间','เปิดประโยคจีนเต็มจอ':'全屏显示中文句子','💳 จ่าย Alipay':'💳 使用支付宝','Scan / Pay ต่างกันอย่างไร':'Scan / Pay 有什么区别','เช็กความพร้อมก่อนบิน':'出发前检查准备情况','จำ Shanghai แบบง่าย':'快速记住上海方位',
'ขยายป้ายจีน · 看中文':'放大中文标识 · 看中文','ใช้เทียบกับป้ายจริงหรือยื่นให้คนจีนดู':'用于对照现场标识或直接给中国人看','ชื่อภาษาจีนที่ต้องมองหา':'需要寻找的中文名称','ไม่ต้องอ่านตัวจีนออก ให้จำรูปร่างตัวอักษรแล้วเทียบกับป้ายจริง':'不用会读中文，记住汉字形状并与现场标识对照','กลับโรงแรม':'返回酒店','ยื่นหน้านี้ให้คนขับได้':'可以直接把此页面给司机看','ช่วยพาเราไปโรงแรมนี้ ขอบคุณ':'请送我们去这家酒店，谢谢','Copy ชื่อจีน':'复制中文名称','Copy ที่อยู่':'复制地址','เปิด AMap':'打开高德地图','พูดให้คนขับฟัง':'播放给司机听',
'พร้อมไปจีนหรือยัง?':'去中国前准备好了吗？','ทดสอบ AMap':'测试高德地图','ทดสอบ Show to Driver':'测试“给司机看”','ก่อนเดินทางจริง แนะนำเปิดเว็บนี้ออนไลน์ 1 ครั้ง แล้วเปิด Airplane Mode ทดสอบว่าแผน / SOS / ชื่อจีนยังเปิดได้':'正式出发前，建议先联网打开一次本网站，再开启飞行模式测试行程 / SOS / 中文名称是否仍可使用',
'ตอนนี้ต้องทำอะไรต่อ?':'下一步该做什么？','ตามแผน':'按计划','แนะนำ: DiDi':'推荐：DiDi','ไม่ต้องเปลี่ยนสาย และใช้ชื่อจีนปลายทางจากเว็บนี้':'无需换乘，直接使用本网站的中文目的地名称','Metro มีเปลี่ยนสาย':'地铁需要换乘','ยึดหมายเลข Line และชื่อสถานีจีนเป็นหลัก':'以线路编号和中文站名为主','ค่อนข้างง่าย':'较简单','ยึด Line → ชื่อสถานี → Exit':'按 线路 → 站名 → 出口','ทำตามแผน':'按计划操作','ดูวิธีเดินทางในการ์ด':'查看卡片里的出行方式','เมื่อถึงแล้วต้องทำอะไร':'到达后要做什么','เริ่มเดินทาง':'开始出发','中文 ให้คนดู':'给别人看中文','ฉันถึงแล้ว':'我到了','ช่วยฉัน':'帮助我','ก่อนออกเดินทาง':'出发前','เตรียม 6 อย่างให้พร้อมก่อนบิน':'起飞前准备好 6 项','เปิดคู่มือมือใหม่':'打开新手指南','ก่อนหน้า':'上一站','ตอนนี้':'现在','ต่อไป':'下一站','ควรออก':'建议出发','ถึงประมาณ':'预计到达','วิธีเดินทาง':'出行方式','ความยาก':'难度','ระยะเดิน':'步行距离','ราคา':'价格',
'ความพร้อมของข้อมูล':'数据准备状态','แยกข้อมูลยืนยันแล้ว / ต้องเช็กสด / รอจอง':'已确认 / 当日确认 / 待预订','ข้อมูลสำคัญ':'重要信息','ออนไลน์':'在线','ออฟไลน์':'离线','ยืนยันแล้ว':'已确认','เช็กวันจริง':'当天确认','รอยืนยันตั๋ว':'等待车票确认','ตาม e-ticket':'以电子机票为准','Passport ตัวจริง':'护照原件','แหล่งข้อมูล':'数据来源','หลักการใช้งาน':'使用说明','ตำรวจ · 报警':'警察 · 报警','รถพยาบาล · 急救':'急救 · 急救','ดับเพลิง · 火警':'消防 · 火警','อุบัติเหตุจราจร':'交通事故','ช่วยเหลือต่างประเทศ':'海外援助','บริการลูกค้า':'客户服务','โทรโรงแรม':'致电酒店','ให้คนขับดูเต็มจอ':'全屏给司机看','Copy ที่อยู่จีน':'复制中文地址','ให้คนขับดู · 给司机看':'给司机看','ตัวอักษรจีนขนาดใหญ่':'大号中文','ยื่นหน้าจอนี้ให้คนขับรถ หรือกด Copy แล้ววางใน DiDi / AMap':'把此页面给司机看，或复制后粘贴到 DiDi / 高德地图',
'ทางเข้า':'入口','ทางออก':'出口','Metro / รถไฟใต้ดิน':'地铁','เปลี่ยนสาย':'换乘','จุดตรวจตั๋ว / Gate':'检票口','หมายเลขขบวน':'车次','ตู้โดยสาร':'车厢','ที่นั่ง':'座位','ห้องน้ำ':'洗手间','จุดบริการ':'服务台','ทางออกฉุกเฉิน':'紧急出口','จุดขึ้นรถ':'上车点','ทะเบียนรถ':'车牌号','ปลายทาง':'目的地','เมนู':'菜单','เมนูเด่น':'招牌菜','เผ็ดน้อย':'微辣','ไม่เผ็ด':'不辣','เช็กบิล':'买单',
'เรียก DiDi ครั้งแรก':'第一次叫 DiDi','ถ้าไปกันหลายคนและไม่คุ้น Metro วิธีนี้มักง่ายที่สุด':'多人同行且不熟悉地铁时，这通常是最简单的方式','เปิด DiDi ใน Alipay หรือแอป DiDi':'在支付宝或 DiDi App 中打开 DiDi','วางชื่อจีนของปลายทาง — ใช้ปุ่ม Copy 中文 ในเว็บนี้':'粘贴目的地中文名称——可使用本网站的“复制中文”按钮','ตรวจว่าหมุดอยู่ย่านที่ถูกต้องก่อนยืนยันรถ':'确认地图上的定位在正确区域后再叫车','ดูทะเบียนรถ / สีรถ / จุดรับรถ แล้วเดินไปจุด Pickup':'核对车牌 / 车辆颜色 / 上车点，然后前往 Pickup 点','ขึ้นรถแล้วเปิดปุ่ม ‘ให้คนขับดู’ หากต้องยืนยันปลายทาง':'上车后如需确认目的地，打开“给司机看”',
'ขึ้น Metro แบบไม่ต้องอ่านจีน':'不会中文也能坐地铁','จำ 4 อย่าง: หมายเลขสาย → ทิศทาง → ชื่อสถานี → Exit':'记住 4 件事：线路编号 → 方向 → 站名 → 出口','มองหาโลโก้ Metro และคำว่า 地铁 / Metro':'寻找 Metro 标志和“地铁 / Metro”字样','เช็กหมายเลขสาย เช่น 2号线 / Line 2 — ให้เลขเป็นตัวนำ ไม่ต้องอ่านชื่อจีน':'确认线路编号，例如 2号线 / Line 2——以数字为主，不必读中文','ก่อนขึ้นชานชาลา เทียบชื่อสถานีปลายทางที่เว็บแสดงกับป้ายจริง':'进入站台前，把网站上的目的地站名与现场标识进行对照','บนรถดูจำนวนสถานีและชื่อสถานีที่จะลง':'在车上留意剩余站数和下车站名','ถึงแล้วค่อยหา 出口 / Exit และหมายเลขทางออก':'到站后再寻找“出口 / Exit”和出口编号',
'รถไฟความเร็วสูง Shanghai ↔ Hangzhou':'上海 ↔ 杭州 高铁','Passport ตัวจริงสำคัญที่สุด และให้ยึด Train No. / Gate / Coach / Seat':'护照原件最重要，并以车次 / 检票口 / 车厢 / 座位为准','ไป 上海虹桥站 (Shanghai Hongqiao Railway Station) ล่วงหน้า':'提前前往上海虹桥站','เตรียม Passport ตัวจริงของทุกคน — เอกสารเดียวกับที่ใช้ซื้อตั๋ว':'准备好每个人的护照原件——必须与购票证件一致','ดู 车次 / Train No. แล้วหา 检票口 / Gate บนจอใหญ่':'先看车次 / Train No.，再在大屏幕上找检票口 / Gate','ผ่านจุดตรวจตั๋ว หากเครื่องอัตโนมัติไม่อ่าน Passport ให้ใช้ช่องเจ้าหน้าที่':'通过检票口；若自动闸机无法识别护照，请走人工通道','ลงชานชาลาแล้วดู 车厢 / Coach และ 座位 / Seat':'到站台后确认车厢 / Coach 和座位 / Seat','ขากลับทำขั้นตอนเดียวกันที่ 杭州东站':'返程在杭州东站按相同步骤操作',
'จ่ายเงินด้วย Alipay':'使用支付宝付款','เตรียมให้พร้อมก่อนเดินทางและมีบัตรสำรองอย่างน้อย 1 ใบ':'出发前设置好，并至少准备一张备用银行卡','เปิด Alipay และตรวจว่าบัตรผูกเรียบร้อย':'打开支付宝并确认银行卡已绑定','ร้านค้าส่วนใหญ่ใช้ Scan หรือ Pay/付款':'多数商家使用 Scan 或 Pay/付款','ถ้าร้านให้ QR ให้เปิด Scan/扫一扫 แล้วสแกน':'如果商家提供二维码，打开 Scan/扫一扫 扫码','ถ้าร้านสแกนเรา ให้เปิด Pay/付款 และยื่นโค้ดให้พนักงาน':'如果商家扫描你的付款码，打开 Pay/付款 并出示给工作人员','ตรวจยอดก่อนกดยืนยันทุกครั้ง':'每次确认付款前都要核对金额',
'เข้าร้านอาหารเมื่ออ่านเมนูจีนไม่ออก':'看不懂中文菜单时如何用餐','ใช้ชื่อร้านจีน + รูปอาหาร + ประโยคสั้น ๆ จะง่ายกว่าพยายามออกเสียงชื่อร้าน':'使用餐厅中文名称 + 食物图片 + 简短句子，比尝试念出店名更容易','เทียบชื่อจีนหน้าร้านกับชื่อที่เว็บแสดงก่อนเข้า':'进店前先把门店中文名称与网站显示名称进行对照','บอกจำนวนคน: 我们四个人。 = พวกเรา 4 คน':'告诉人数：我们四个人。','เปิดรูป/ชื่อเมนูในเว็บแล้วชี้ให้พนักงานดู':'打开网站中的菜品图片/名称并指给工作人员看','ถ้าไม่กินเผ็ด ใช้ 不要辣，谢谢。':'如果不吃辣，请说：不要辣，谢谢。','จ่ายเงินด้วย Alipay และตรวจยอดก่อนยืนยัน':'使用支付宝付款，并在确认前核对金额'
};

var RULES=[
[/^Day\s*(\d+)$/i,function(m){return '第'+m[1]+'天'}],
[/^เช็ก\s*(\d+)\/(\d+)\s*รายการ$/,function(m){return '已完成 '+m[1]+'/'+m[2]+' 项'}],
[/^ตรวจข้อมูลล่าสุด\s*(.+)$/,function(m){return '最近核验 '+m[1]}],
[/^ตรวจ\s*(\d{4}-\d{2}-\d{2})\s*▾$/,function(m){return '核验 '+m[1]+' ▾'}],
[/^(\d+)\s*จุด\s*·\s*เรียงตามเวลา$/,function(m){return m[1]+' 个地点 · 按时间排序'}],
[/ประมาณ\s*(\d+)\s*นาที/g,function(m){return '约 '+m[1]+' 分钟'}],
[/(\d+)\s*นาที/g,function(m){return m[1]+' 分钟'}],
[/(\d+(?:\.\d+)?)\s*กม\./g,function(m){return m[1]+' 公里'}],
[/(\d+)\s*ม\./g,function(m){return m[1]+' 米'}]
];

function translateValue(v){
  if(lang!=='zh')return v;
  var t=String(v||''),trim=t.trim();
  if(ZH[trim])return t.replace(trim,ZH[trim]);
  for(var i=0;i<RULES.length;i++){
    var r=RULES[i][0];r.lastIndex=0;
    if(r.test(trim)){r.lastIndex=0;return t.replace(trim,trim.replace(r,RULES[i][1]))}
  }
  return t;
}
function shouldSkip(n){
  var p=n.parentElement;if(!p)return true;
  if(/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(p.tagName))return true;
  if(p.closest('.cn,.jc-sign-cn,.ft-cn,.pr-driver-cn,[data-i18n-skip],.nav,#screenTitle,.lang-toggle,.event-card h3,.place-card h3,.restaurant-card h3,.idea-card h3'))return true;
  return false;
}
function translateTree(root){
  if(!root)return;
  var base=root.body||root,doc=base.ownerDocument||root;
  if(!base||!doc.createTreeWalker)return;
  var w=doc.createTreeWalker(base,NodeFilter.SHOW_TEXT),n;
  while((n=w.nextNode())){
    if(shouldSkip(n))continue;
    var current=n.nodeValue,stored=originalText.get(n);
    if(!stored){originalText.set(n,current);stored=current}
    else if(lang==='th'&&current!==stored&&/[ก-๙]/.test(current)){originalText.set(n,current);stored=current}
    else if(lang==='zh'&&/[ก-๙]/.test(current)&&current!==translateValue(stored)){originalText.set(n,current);stored=current}
    var target=lang==='zh'?translateValue(stored):stored;
    if(n.nodeValue!==target)n.nodeValue=target;
  }
}
function promoteChinese(doc){
  if(!doc||!doc.body)return;
  doc.querySelectorAll('.event-card,.place-card,.restaurant-card,.idea-card').forEach(function(c){
    var title=c.querySelector('h3'),cn=c.querySelector('.cn');if(!title||!cn)return;
    if(!title.dataset.i18nThTitle)title.dataset.i18nThTitle=title.textContent.trim();
    if(!cn.dataset.i18nCn)cn.dataset.i18nCn=cn.textContent.trim();
    if(lang==='zh'){
      if(title.textContent!==cn.dataset.i18nCn)title.textContent=cn.dataset.i18nCn;
      var secondary='泰: '+title.dataset.i18nThTitle;if(cn.textContent!==secondary)cn.textContent=secondary;
      cn.classList.add('i18n-th-secondary');
    }else{
      if(title.textContent!==title.dataset.i18nThTitle)title.textContent=title.dataset.i18nThTitle;
      if(cn.textContent!==cn.dataset.i18nCn)cn.textContent=cn.dataset.i18nCn;
      cn.classList.remove('i18n-th-secondary');
    }
  });
}
function injectFrameStyle(d){
  if(d.getElementById('i18n-th-zh-style'))return;
  var st=d.createElement('style');st.id='i18n-th-zh-style';
  st.textContent='.i18n-th-secondary{font-size:11px!important;color:#8b6b78!important;font-weight:600!important}html[data-lang="zh"] .event-card h3,html[data-lang="zh"] .place-card h3,html[data-lang="zh"] .restaurant-card h3{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}';
  d.head.appendChild(st);
}
function applyShell(){
  document.documentElement.lang=lang==='zh'?'zh-CN':'th';document.documentElement.dataset.lang=lang;
  document.title=lang==='zh'?'上海家庭旅行 · 行程助手':'Shanghai Family Trip · Journey Controller';
  var labels={home:['วันนี้','今天'],plan:['แผน','行程'],explore:['สำรวจ','探索'],budget:['ค่าใช้จ่าย','费用'],more:['เพิ่มเติม','更多']};
  document.querySelectorAll('.nav [data-root]').forEach(function(b){var a=labels[b.dataset.root],s=b.querySelector('span');if(a&&s&&s.textContent!==a[lang==='zh'?1:0])s.textContent=a[lang==='zh'?1:0]});
  var active=document.querySelector('.nav [data-root].active'),title=document.getElementById('screenTitle');if(active&&title){var a=labels[active.dataset.root];if(a&&title.textContent!==a[lang==='zh'?1:0])title.textContent=a[lang==='zh'?1:0]}
  var nav=document.querySelector('.nav');if(nav)nav.setAttribute('aria-label',lang==='zh'?'主菜单':'เมนูหลัก');
  var emergency=document.getElementById('emergencyBtn');if(emergency)emergency.setAttribute('aria-label',lang==='zh'?'紧急情况':'ฉุกเฉิน');
  toggle.innerHTML=lang==='zh'?'<b>中</b><span> / TH</span>':'<b>TH</b><span> / 中</span>';
  toggle.setAttribute('aria-label',lang==='zh'?'切换为泰语':'เปลี่ยนเป็นภาษาจีน');
  translateTree(document);
}
function applyFrame(){
  var d;try{d=frame&&frame.contentDocument}catch(e){return}if(!d||!d.body)return;
  d.documentElement.lang=lang==='zh'?'zh-CN':'th';d.documentElement.dataset.lang=lang;
  injectFrameStyle(d);promoteChinese(d);translateTree(d);
}
function applyAll(){if(applying)return;applying=true;try{applyShell();applyFrame()}finally{applying=false}}
function setLanguage(v){lang=v==='zh'?'zh':'th';localStorage.setItem(STORAGE,lang);window.SH_LANG=lang;applyAll();document.dispatchEvent(new CustomEvent('sh-language-change',{detail:{language:lang}}))}
window.SH_LANG=lang;window.shSetLanguage=setLanguage;window.shTranslate=function(th){return lang==='zh'?(ZH[th]||th):th};

var css=document.createElement('style');css.textContent='.lang-toggle{min-height:36px;min-width:54px;border:1px solid #e8bfd0;border-radius:999px;background:#fff;color:#7f3150;padding:5px 8px;font:800 10px/1 inherit;white-space:nowrap}.lang-toggle b{font-size:12px}.lang-toggle span{color:#9a7181;font-size:9px}@media(max-width:390px){.lang-toggle{min-width:46px;padding:5px 6px}.lang-toggle span{display:none}}html[data-lang="zh"] body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif}';document.head.appendChild(css);
var toggle=document.createElement('button');toggle.type='button';toggle.className='lang-toggle';toggle.setAttribute('data-i18n-skip','1');header.insertBefore(toggle,document.getElementById('emergencyBtn'));toggle.addEventListener('click',function(){setLanguage(lang==='zh'?'th':'zh')});

new MutationObserver(function(){if(!applying)requestAnimationFrame(applyAll)}).observe(document.body,{childList:true,subtree:true,characterData:true});
if(frame)frame.addEventListener('load',function(){setTimeout(applyFrame,50);setTimeout(function(){var d;try{d=frame.contentDocument}catch(e){}if(d&&d.body)new MutationObserver(function(){if(!applying)requestAnimationFrame(applyFrame)}).observe(d.body,{childList:true,subtree:true,characterData:true})},150)});
applyAll();setTimeout(applyAll,300);
})();
