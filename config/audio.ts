
// การตั้งค่าไฟล์เสียง (Audio Configuration)
// กรุณาสร้างโฟลเดอร์ชื่อ "sounds" ไว้ที่ root ของโปรเจค (ระดับเดียวกับ index.html)
// และสร้างโฟลเดอร์ย่อย "bgm" และ "sfx" ข้างในนั้น

export const AUDIO_CONFIG = {
  // เพลงพื้นหลัง (BGM) - จะสุ่มเล่นตอนเริ่มและเล่นวนไปเรื่อยๆ
  bgm: [
    "./sounds/bgm/Jingle_Bells.mp3",
    "./sounds/bgm/We_Wish_You_A_Merry_Christmas.mp3",
    "./sounds/bgm/Last_Christmas.mp3"
  ],
  
  // เสียงบรรยากาศ (Ambient) - เล่นวนเบาๆ ตลอดเวลา
  ambient: "./sounds/bgm/winter-ambience.mp3",

  // เสียงเอฟเฟกต์ (SFX)
  sfx: {
    // เสียงซานต้า "Ho Ho Ho" ตอนชนะ (Victory Only)
    victory: "./sounds/sfx/ho-ho-ho.mp3",
    
    // เสียงตอนกดปุ่มขอคำใบ้
    hint: "./sounds/sfx/MAGICAL-WHOOSH.mp3",

    // เสียงซานต้าบิน (เล่นพร้อมกัน 2 ไฟล์)
    flyingSantaVoice: "./sounds/sfx/ho-ho-ho-santa-voice.mp3",
    flyingBells: "./sounds/sfx/festive-christmas-bells.mp3"
  }
};
