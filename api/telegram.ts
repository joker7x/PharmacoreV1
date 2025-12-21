
import { BOT_TOKEN, SUPABASE_URL, SUPABASE_KEY } from '../constants';

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

  // التحقق من Payload المشاركة الآمنة: /start inv_ID_TOKEN
  if (text.startsWith('/start inv_')) {
    const parts = text.split('_');
    if (parts.length >= 3) {
      const invoiceId = parts[1];
      const token = parts[2];

      // التحقق من صحة التوكن من Supabase مباشرة
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
      const isValid = shares.length > 0 && new Date(shares[0].expires_at) > new Date();

      if (isValid) {
        // إرسال رد تليجرام مع زر فتح الفاتورة
        const responseText = `📄 *تم العثور على الفاتورة التقديرية*\n\nالمعرف: \`${invoiceId}\`\nهذا الرابط صالح للاستخدام مرة واحدة فقط لضمان الخصوصية.\n\nاضغط على الزر أدناه لفتحها داخل نظام Pharma Core.`;
        
        await sendTelegramMessage(chatId, responseText, [
          [{ text: "👁️ فتح الفاتورة الآن", url: `https://t.me/i23Bot/app?startapp=inv_${invoiceId}_${token}` }]
        ]);
      } else {
        await sendTelegramMessage(chatId, "❌ نعتذر، هذا الرابط غير صالح أو انتهت صلاحيته الأمنية.");
      }
    }
  } else if (text === '/start') {
    await sendTelegramMessage(chatId, "مرحباً بك في بوت *Pharma Core* ⚡\n\nهذا البوت مخصص لاستقبال ومشاركة الفواتير الطبية بشكل آمن. يمكنك توليد الفواتير من داخل التطبيق ومشاركتها هنا.");
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

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}
