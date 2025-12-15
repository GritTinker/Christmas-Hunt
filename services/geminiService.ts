
import { GoogleGenAI, Content, Type } from "@google/genai";
import { Question, WordData, ChatMessage } from "../types";

// FALLBACKS – คำศัพท์คริสต์มาส (คำที่นิยม ใช้จริง พบได้บ่อย)
export const fallbacks: WordData[] = [
  // ===== ศาสนา =====
  { word: "คริสต์มาส", hint: "เทศกาลสำคัญช่วงปลายปีที่ผู้คนทั่วโลกเฉลิมฉลองร่วมกัน มีทั้งความหมายทางศาสนา การให้ และการรวมตัวของครอบครัว", category: "ศาสนา" },
  { word: "พระเยซู", hint: "บุคคลสำคัญในเรื่องราวทางศาสนาที่เกี่ยวข้องกับวันนี้ เชื่อว่าเป็นผู้ที่ถือกำเนิดขึ้นในช่วงเวลานี้", category: "ศาสนา" },
  { word: "พระคริสต์", hint: "พระนามที่ใช้เรียกบุคคลเดียวกับพระเยซู โดยมีความหมายเกี่ยวข้องกับการเป็นผู้ไถ่ตามความเชื่อ", category: "ศาสนา" },
  { word: "การประสูติ", hint: "เหตุการณ์การถือกำเนิดของบุคคลสำคัญ ซึ่งเป็นจุดเริ่มต้นของเรื่องราวในวันสำคัญนี้", category: "ศาสนา" },
  { word: "รางหญ้า", hint: "สถานที่เรียบง่ายที่มักปรากฏในฉากเล่าเรื่องเกี่ยวกับการกำเนิดในวันคริสต์มาส", category: "ศาสนา" },
  { word: "ทูตสวรรค์", hint: "ผู้ส่งสารในเรื่องราวทางศาสนา มักปรากฏในภาพหรือการแสดงเกี่ยวกับวันคริสต์มาส", category: "ศาสนา" },

  // ===== ตัวละคร =====
  { word: "ซานตาคลอส", hint: "ตัวละครในวัฒนธรรมสมัยใหม่ ใส่ชุดสีแดง มีเคราขาว และเกี่ยวข้องกับการนำของขวัญมาให้เด็ก ๆ", category: "ตัวละคร" },
  { word: "ซานต้า", hint: "ชื่อเรียกสั้น ๆ ของตัวละครแจกของขวัญ ที่เด็ก ๆ มักเขียนจดหมายถึง", category: "ตัวละคร" },
  { word: "กวางเรนเดียร์", hint: "สัตว์ที่มักถูกเล่าเรื่องว่าใช้ลากพาหนะของซานต้าในคืนพิเศษเพียงคืนเดียว", category: "ตัวละคร" },
  { word: "รูดอล์ฟ", hint: "กวางตัวหนึ่งที่โดดเด่นจากตัวอื่น เพราะมีลักษณะพิเศษที่ช่วยนำทางในคืนที่มืด", category: "ตัวละคร" },
  { word: "เอลฟ์", hint: "ตัวละครขนาดเล็กในเรื่องเล่า ทำหน้าที่ช่วยเหลือซานต้าในการเตรียมของขวัญ", category: "ตัวละคร" },
  { word: "มนุษย์หิมะ", hint: "ตัวละครที่เกิดจากการปั้นในฤดูหนาว มักปรากฏในภาพและสื่อช่วงคริสต์มาส", category: "ตัวละคร" },

  // ===== สัญลักษณ์ =====
  { word: "ต้นคริสต์มาส", hint: "ต้นไม้ที่ถูกนำมาตกแต่งด้วยไฟและของประดับ กลายเป็นจุดศูนย์กลางของการเฉลิมฉลอง", category: "สัญลักษณ์" },
  { word: "ดาวคริสต์มาส", hint: "สัญลักษณ์ที่มักอยู่บนยอดต้นไม้ เชื่อมโยงกับการนำทางในเรื่องเล่าทางศาสนา", category: "สัญลักษณ์" },
  { word: "ไฟคริสต์มาส", hint: "ไฟสีสันที่ใช้ประดับบ้านและต้นไม้ สื่อถึงความสดใสและการเฉลิมฉลอง", category: "สัญลักษณ์" },
  { word: "พวงหรีด", hint: "ของตกแต่งรูปวงกลม มักแขวนหน้าประตูบ้านในช่วงเทศกาลปลายปี", category: "สัญลักษณ์" },
  { word: "กระดิ่ง", hint: "ของประดับที่ให้เสียงใส มักปรากฏในเพลงและของตกแต่งช่วงคริสต์มาส", category: "สัญลักษณ์" },

  // ===== สิ่งของ =====
  { word: "ของขวัญ", hint: "สิ่งที่ผู้คนมอบให้กันเพื่อแสดงความปรารถนาดี มักวางไว้ใต้ต้นไม้", category: "สิ่งของ" },
  { word: "กล่องของขวัญ", hint: "ภาชนะที่ใช้บรรจุของขวัญ มักถูกห่ออย่างสวยงามเพื่อสร้างความตื่นเต้น", category: "สิ่งของ" },
  { word: "ถุงเท้าคริสต์มาส", hint: "ของตกแต่งที่แขวนไว้ตามผนังหรือเตาผิง โดยเชื่อว่าจะมีของเล็ก ๆ อยู่ข้างใน", category: "สิ่งของ" },

  // ===== อาหาร =====
  { word: "เค้กคริสต์มาส", hint: "ขนมหวานที่นิยมรับประทานในเทศกาลนี้ มักทำขึ้นเป็นพิเศษช่วงปลายปี", category: "อาหาร" },
  { word: "ขนมปังขิง", hint: "ขนมอบที่มีกลิ่นเครื่องเทศ นิยมทำเป็นรูปคนหรือบ้านในช่วงคริสต์มาส", category: "อาหาร" },
  { word: "แคนดี้แคน", hint: "ลูกกวาดแท่งลายสีแดงขาว ที่พบได้บ่อยในของตกแต่งและถุงขนมเทศกาลนี้", category: "อาหาร" },

  // ===== เพลง =====
  { word: "เพลงคริสต์มาส", hint: "บทเพลงที่เปิดบ่อยในช่วงปลายปี เนื้อหามักเกี่ยวกับความสุขและการเฉลิมฉลอง", category: "เพลง" },
  { word: "จิงเกิลเบล", hint: "เพลงจังหวะสนุกที่มีเสียงกระดิ่ง และเป็นหนึ่งในเพลงที่คนทั่วโลกรู้จัก", category: "เพลง" },

  // ===== กิจกรรม =====
  { word: "แลกของขวัญ", hint: "กิจกรรมที่ผู้คนเตรียมสิ่งของให้กันและกัน เพื่อสร้างความสนุกและรอยยิ้ม", category: "กิจกรรม" },
  { word: "ตกแต่งบ้าน", hint: "การจัดบ้านด้วยไฟและของประดับ เพื่อสร้างบรรยากาศพิเศษในช่วงเทศกาล", category: "กิจกรรม" },

  // ===== บรรยากาศ =====
  { word: "ฤดูหนาว", hint: "ช่วงเวลาของปีที่อากาศเย็นในหลายประเทศ และเป็นช่วงที่ตรงกับเทศกาลนี้", category: "บรรยากาศ" },
  { word: "หิมะ", hint: "ปรากฏการณ์ธรรมชาติสีขาว ที่มักถูกใช้แทนภาพจำของคริสต์มาส", category: "บรรยากาศ" },

  // ===== คุณค่า =====
  { word: "ความรัก", hint: "คุณค่าที่มักถูกพูดถึงในช่วงคริสต์มาส ผ่านการดูแลและห่วงใยกัน", category: "คุณค่า" },
  { word: "การแบ่งปัน", hint: "แนวคิดสำคัญของเทศกาลนี้ ที่เน้นการให้และการช่วยเหลือผู้อื่น", category: "คุณค่า" }
];

export const generateQuestion = async (apiKey: string | undefined, usedWords: string[] = []): Promise<Question | null> => {
  // 1. Try Google Gemini API First
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a Thai vocabulary word related to Christmas, Winter, New Year, or Celebration.
                   The word must NOT be in this list: ${usedWords.slice(-20).join(', ')}.
                   
                   Response MUST be JSON object with:
                   - word: The Thai word (no spaces).
                   - hint: A clear Thai definition/hint (do not include the word itself).
                   - category: A short category name in Thai.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              hint: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["word", "hint", "category"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      if (data.word && data.hint) {
        return {
          category: data.category || "ทั่วไป",
          answer: data.word.replace(/\s+/g, ''),
          hint: data.hint
        };
      }
    } catch (error) {
      console.warn("Gemini API Error (using fallback):", error);
    }
  }

  // 2. Fallback to Static List
  // จำลองความล่าช้าเล็กน้อยให้รู้สึกเหมือนกำลังโหลด (ถ้าต้องการ)
  await new Promise(resolve => setTimeout(resolve, 300));

  // กรองคำที่ยังไม่เคยถูกใช้
  const availableWords = fallbacks.filter(item => !usedWords.includes(item.word.replace(/\s+/g, '')));

  // ถ้าไม่มีคำเหลือแล้ว ให้รีไซเคิลคำจาก fallback เพื่อให้เกมเล่นต่อได้
  if (availableWords.length === 0) {
      if (fallbacks.length > 0) {
         const randomRecycle = fallbacks[Math.floor(Math.random() * fallbacks.length)];
         return {
             category: randomRecycle.category,
             answer: randomRecycle.word.replace(/\s+/g, ''),
             hint: randomRecycle.hint
         };
      }
      return null;
  }

  const randomIndex = Math.floor(Math.random() * availableWords.length);
  const data = availableWords[randomIndex];

  return {
    category: data.category,
    answer: data.word.replace(/\s+/g, ''),
    hint: data.hint
  };
};

// Helper to handle API errors
const handleApiError = (error: any, context: string): string => {
  console.error(`${context} Error:`, error);
  // Check for 429 Resource Exhausted
  if (error?.status === 429 || error?.toString().includes('429') || error?.toString().includes('quota')) {
    return "โฮ่ โฮ่! ตอนนี้ซานต้ายุ่งมาก (โควต้าเต็ม) ลองพยายามด้วยตัวเองนะเด็กดี!";
  }
  return "โฮ่ โฮ่... สัญญาณจากขั้วโลกเหนือขาดหายไป (เกิดข้อผิดพลาด)";
};

// ฟังก์ชัน Chat กับ Santa
export const getSantaResponse = async (
  apiKey: string | undefined, 
  history: ChatMessage[], 
  newMessage: string
): Promise<string> => {
  if (!apiKey) {
    return "โฮ่ โฮ่ โฮ่! ดูเหมือนว่ากุญแจ API จะหายไปนะเด็กน้อย (กรุณาใส่ API Key)";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // แปลง history ให้เป็น format ของ API
    let contents: Content[] = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        // Updated system instruction for shorter answers
        systemInstruction: "คุณคือซานตาคลอส บุคลิก: ชายชราใจดี ร่าเริง (ชอบหัวเราะ โฮ่ โฮ่ โฮ่) มีเมตตา ชอบช่วยเหลือผู้อื่น รูปร่างท้วม เคราขาว สวมชุดสีแดง มีนิสัยรักเด็ก ชอบมอบของขวัญ และเป็นผู้รอบรู้เรื่องเด็กดี-เด็กดื้อทั่วโลก แต่ก็มีมุมเข้มแข็งเมื่อจำเป็นต้องปกป้องเด็กๆ หน้าที่ของคุณคือพูดคุยกับผู้ใช้งาน ตอบคำถามเกี่ยวกับวันคริสต์มาส หรือให้กำลังใจ ให้ใช้ภาษาไทยที่อบอุ่นและเป็นกันเอง **สำคัญ: ตอบให้สั้น กระชับ ได้ใจความ ไม่ต้องพิมพ์ยาวมาก เพื่อให้เด็กๆ อ่านง่าย**",
      }
    });

    return response.text || "โฮ่ โฮ่... ซานต้าไม่ได้ยินเสียงเธอเลย ลองพูดอีกทีได้ไหม?";
  } catch (error) {
    return handleApiError(error, "Santa Chat");
  }
};
