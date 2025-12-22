
import { BOT_TOKEN, SUPABASE_URL, SUPABASE_KEY, BOT_USERNAME } from '../constants';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message || !message.text) {
    return res.status(200).send('ok');
  }

  const chatId = message.chat.id;
  const text = message.text;

  console.log("Telegram Received:", text);

  // معالجة رابط الفاتورة: /start inv_ID_TOKEN
  if (text.startsWith('/start inv_')) {
    const payload = text.split(' ')[1]; // استخراج inv_ID_TOKEN
    if (payload) {
      const parts = payload.split('_');
      const invoiceId = parts[1];
      const token = parts[2];

      // التحقق من التوكن في سوبابيز
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/invoice_shares?invoice_id=eq.${invoiceId}&token=eq.${token}&is_used=eq.false&select=*`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      
      const shares = await checkRes.json();
      const isValid = shares && shares.length > 0 && new Date(shares[0].expires_at) > new Date();

      if (isValid) {
        const responseText = `🛡️ *تأكيد الهوية الرقمية للفاتورة*\n\nرقم الفاتورة: \`${invoiceId}\`\n\nلقد تم التحقق من أمان الرابط. يمكنك الآن عرض تفاصيل الفاتورة والأسعار المحدثة من خلال الزر أدناه:`;
        
        await sendTelegramMessage(chatId, responseText, [
          [{ 
            text: "📂 عرض الفاتورة الإلكترونية", 
            // استخدام رابط الميني آب المباشر
            url: `https://t.me/${BOT_USERNAME}/app?startapp=${payload}` 
          }]
        ]);
      } else {
        await sendTelegramMessage(chatId, "⚠️ *عذراً، هذا الرابط منتهي الصلاحية*\n\nروابط الفواتير مؤمنة للاستخدام لمرة واحدة فقط أو لفترة زمنية محدودة. يرجى طلب رابط جديد من الصيدلية.");
      }
    }
  } else if (text === '/start') {
    await sendTelegramMessage(chatId, "مرحباً بك في *Pharma Core Terminal* ⚡\n\nهذا البوت هو بوابتك الآمنة لمراجعة الفواتير الطبية المعتمدة. عند استلامك لرابط فاتورة، اضغط عليه وسيتم التحقق من هويتك هنا.");
  }

  return res.status(200).send('ok');
}

async function sendTelegramMessage(chatId: number, text: string, keyboard?: any[][]) {
  const body: any = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown',
  };
  if (keyboard) {
    body.reply_markup = { inline_keyboard: keyboard };
  }

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (e) {
    console.error("Telegram Send Error:", e);
  }
}
