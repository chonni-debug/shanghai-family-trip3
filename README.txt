Shanghai Family Trip PWA v1.21 — Production Readiness

หน้าใช้งาน
- เวอร์ชันเดิม: /index.html
- UX v2 สำหรับมือถือ: /v2/

UX v2 เพิ่ม
- เมนูหลัก 5 รายการ: วันนี้ / แผน / สำรวจ / ค่าใช้จ่าย / เพิ่มเติม
- ปุ่มฉุกเฉิน: 110 ตำรวจ / 119 ดับเพลิง / 120 รถพยาบาล / 122 จราจร
- เบอร์ประกันและโรงแรมที่ใช้ได้แม้ออฟไลน์
- Show to Driver / 给司机看: แสดงชื่อจีนขนาดใหญ่สำหรับยื่นให้คนขับ
- Data Readiness: แยก ยืนยันแล้ว / เช็กวันจริง / รอยืนยันตั๋ว
- ป้ายภาพบรรยากาศสำหรับรูปที่ใช้แทนย่านหรือกิจกรรม ไม่ทำให้เข้าใจว่าเป็นภาพจุดนั้นโดยตรง
- Day 1 Family Energy: เต็มแผน / ลดครึ่งวัน / พักก่อน
- ซ่อน booking reference / policy number จากหน้าที่แสดงใน UX v2

ข้อมูลที่ตรวจล่าสุด 26 Aug 2026
- Yu Garden: ข้อมูลเวลาและราคาอ้างอิงเว็บไซต์ทางการ
- Shanghai Postal Museum: อ้างอิง China Post Shanghai
- East Jinling Road ↔ Dongchang Road Ferry: อ้างอิง Shanghai Government และต้องเช็กวันจริง
- Hangzhou high-speed train: เวลาใน itinerary ยังเป็นเวลาเป้าหมายจนกว่าจะจองจริงใน 12306

Offline
- Essential app shell, readiness data, manifest และ icon ถูก precache
- รูปจำนวนมากเป็น optional cache: รูปใดโหลดไม่ได้จะไม่ทำให้การติดตั้ง PWA ทั้งชุดล้ม
- แผนที่ถนนออนไลน์/Google Maps ต้องใช้อินเทอร์เน็ต แต่ข้อมูลชื่อจีน ตารางทริป Checklist Expense และข้อมูลฉุกเฉินยังใช้ได้จาก app shell ที่ cache แล้ว

ข้อควรทำก่อนเดินทาง
1. เปิด /v2/ ออนไลน์อย่างน้อยหนึ่งครั้งหลังอัปเดต เพื่อให้ Service Worker cache เวอร์ชันล่าสุด
2. ทดลอง Airplane Mode ก่อนออกเดินทาง
3. ตรวจ Flight status, 12306, Ferry และเวลาเปิดสถานที่ที่มีป้าย “เช็กวันจริง” อีกครั้ง
4. เก็บ Passport และเอกสารส่วนตัวในที่ปลอดภัย ไม่อัปโหลดเลขเอกสารเต็มลง public repository
