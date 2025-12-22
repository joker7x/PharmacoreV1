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
  const host = req.headers.host || 'pharmacore.app'; // افتراض النطاق في حال عدم توفره

  // التعامل مع روابط الفواتير العميقة: /start inv_ID_TOKEN
  if (text.startsWith('/start inv_')) {
    const payload = text.split(' ')[1]; 
    if (payload) {
      const parts = payload.split('_');
      const invoiceId = parts[1];
      const token = parts[2];

      try {
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
          const responseText = `📄 *تم رصد طلب عرض فاتورة*\n\nرقم الفاتورة: \`${invoiceId}\`\nالحالة: *جاهزة للمعاينة*\nالصلاحية: *ساعة واحدة*\n\nاضغط على الزر أدناه لفتح الفاتورة بأمان داخل التطبيق:`;
          
          await sendTelegramMessage(chatId, responseText, [
            [{ 
              text: "👁️ عرض وتفاصيل الفاتورة", 
              web_app: { 
                url: `https://${host}/#invoice?startapp=${payload}` 
              }
            }]
          ]);
        } else {
          await sendTelegramMessage(chatId, "⚠️ *عذراً، هذا الرابط غير صالح أو منتهي*\n\nروابط مشاركة الفواتير صالحة للاستخدام مرة واحدة أو لمدة ساعة كحد أقصى. يرجى طلب رابط جديد من الصيدلية.");
        }
      } catch (err) {
        console.error("Supabase error:", err);
        await sendTelegramMessage(chatId, "❌ حدث خطأ تقني أثناء محاولة جلب بيانات الفاتورة.");
      }
    }
  } else if (text === '/start') {
    await sendTelegramMessage(chatId, "مرحباً بك في *Pharma Core Terminal* ⚡\n\nأنا المساعد الذكي لإدارة الصيدلية. يمكنك استخدامي لـ:\n1️⃣ عرض الفواتير المشفرة.\n2️⃣ استلام تنبيهات الأسعار.\n3️⃣ تتبع حالة السوق.\n\n_بانتظار استلام رابط فاتورة لبدء العمل..._");
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