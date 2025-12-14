// การตั้งค่าไฟล์เสียง (Audio Configuration)
// กรุณาสร้างโฟลเดอร์ชื่อ "sounds" ไว้ที่ root ของโปรเจค (ระดับเดียวกับ index.html)
// และสร้างโฟลเดอร์ย่อย "bgm" และ "sfx" ข้างในนั้น

export const AUDIO_CONFIG = {
  // เพลงพื้นหลัง (BGM) - จะสุ่มเล่นตอนเริ่มและเล่นวนไปเรื่อยๆ
  bgm: [
    // ไฟล์ต้องอยู่ที่: ./sounds/bgm/Jingle_Bells.mp3
    "./sounds/bgm/Jingle_Bells.mp3",
    
    // ไฟล์ต้องอยู่ที่: ./sounds/bgm/We_Wish_You_A_Merry_Christmas.mp3
    "./sounds/bgm/We_Wish_You_A_Merry_Christmas.mp3",
    
    // ไฟล์ต้องอยู่ที่: ./sounds/bgm/Last_Christmas.mp3
    "./sounds/bgm/Last_Christmas.mp3"
  ],

  // เสียงเอฟเฟกต์ (SFX)
  sfx: {
    // เสียงซานต้า "Ho Ho Ho" ตอนชนะ
    // ไฟล์ต้องอยู่ที่: ./sounds/sfx/ho-ho-ho.mp3
    // (เปลี่ยนชื่อไฟล์เสียงของคุณให้เป็น ho-ho-ho.mp3 หรือแก้ชื่อที่นี่ให้ตรงกัน)
    santa: "./sounds/sfx/ho-ho-ho.mp3"
  }
};