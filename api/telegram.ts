
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
  
  // تحديد النطاق الديناميكي لفتح الـ WebApp
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'pharmacore.app';
  const protocol = 'https';
  const appBaseUrl = `${protocol}://${host}`;

  // منطق التعامل مع روابط الفواتير العميقة: /start inv_<invoiceId>_<token>
  if (text.startsWith('/start inv_')) {
    const payload = text.split(' ')[1]; 
    if (payload) {
      const parts = payload.split('_');
      const invoiceId = parts[1];
      const token = parts[2];

      try {
        // التحقق من قاعدة البيانات (صلاحية التوكن والوقت)
        const checkRes = await fetch(
          `${SUPABASE_URL}/rest/v1/invoice_shares?invoice_id=eq.${invoiceId}&token=eq.${token}&select=*`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          }
        );
        
        const shares = await checkRes.json();
        const share = shares?.[0];
        const now = new Date();
        const isValid = share && new Date(share.expires_at) > now;

        if (isValid) {
          const responseText = `📄 *Pharma Core – Invoice Verification*\n\nInvoice ID: \`${invoiceId}\`\nStatus: *Ready to View*\nAccess: *Read-Only (Secure)*\n\nThis document is protected. Tap the button below to open it securely inside the Pharma Core application.`;
          
          await sendTelegramMessage(chatId, responseText, [
            [{ 
              text: "👁️ View Invoice", 
              web_app: { 
                // نفتح التطبيق المصغر مع تمرير المعاملات ليبدأ في وضع عرض الفاتورة
                url: `${appBaseUrl}/#invoice?token=${token}&id=${invoiceId}` 
              }
            }]
          ]);
        } else {
          await sendTelegramMessage(chatId, "⚠️ *Access Denied*\n\nThis invoice link is invalid, expired, or has been revoked. Please request a new share link from the pharmacy.");
        }
      } catch (err) {
        console.error("Security/Supabase error:", err);
        await sendTelegramMessage(chatId, "❌ *System Error*\n\nUnable to verify invoice at this time. Please try again later.");
      }
    }
  } 
  // الرد الافتراضي لأي رسائل أخرى
  else {
    await sendTelegramMessage(chatId, "🛡️ *Pharma Core Secure Bot*\n\nThis bot is strictly used as an extension for viewing *Pharma Core* invoices. \n\nPlease use the official share link provided to you to access your documents.");
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
    console.error("Telegram Transmission Error:", e);
  }
}
