import { Worker, Job } from "bullmq";
import { redisConnection, WhatsAppJobData } from "../queues/whatsapp.queue";

/**
 * Builds localized bilingual (Urdu + English) WhatsApp text messages
 */
export function formatWhatsAppMessage(data: WhatsAppJobData): string {
  const { templateType, payload } = data;

  switch (templateType) {
    case "RFQ_SUBMITTED_SUPPLIER_ALERT":
      return `🔔 *SHERSHA B2B — نیا RFQ آرڈر الرٹ*

محترم *${payload.userName}* صاحب،
آپ کی فیکٹری کو ایک نیا ہول سیل کوٹیشن موصول ہوا ہے۔

📦 *پراڈکٹ:* ${payload.productTitle || "Footwear Bulk Order"}
🔢 *مطلوبہ تعداد:* ${payload.quantity?.toLocaleString()} جوڑے (${Math.ceil((payload.quantity || 24) / 24)} کارٹن)
📋 *RFQ نمبر:* \`${payload.rfqNumber}\`

⏱️ _فوری جواب دینے سے آپ کا فیکٹری Response Rate برقرار رہے گا۔_
👉 *کوٹیشن جمع کروائیں:* ${payload.actionUrl || "https://shersha.pk/supplier/rfqs"}`;

    case "SUPPLIER_QUOTED_BUYER_ALERT":
      return `🎉 *SHERSHA B2B — فیکٹری کا کوٹیشن موصول ہو گیا*

محترم *${payload.userName}* صاحب،
فیکٹری نے آپ کے آرڈر \`${payload.rfqNumber}\` کے لیے آفیشل ریٹ دے دیا ہے۔

💵 *کوٹڈ ریٹ:* PKR ${payload.amount?.toLocaleString()} فی جوڑا
🔢 *تعداد:* ${payload.quantity?.toLocaleString()} جوڑے
👉 *کوٹیشن چیک کریں اور آرڈر کنفرم کریں:* ${payload.actionUrl || "https://shersha.pk/buyer/rfqs"}`;

    case "ORDER_ESCROW_FUNDED":
      return `🛡️ *SHERSHA B2B — 100% محفوظ ایسکرو (Escrow) ادائیگی موصول*

محترم *${payload.userName}* صاحب،
آرڈر \`${payload.orderNumber}\` کی کل رقم *PKR ${payload.amount?.toLocaleString()}* اینامون کے ایسکرو اکاؤنٹ میں جمع ہو چکی ہے۔

✅ *فنڈز تصدیق شدہ ہیں — آپ تسلی کے ساتھ مال تیار کر کے ڈسپیچ کر سکتے ہیں۔*
فیکٹری کو رقم مال کی ترسیل کے بعد فوری ریلیز ہو جائے گی۔`;

    case "DISPATCH_TRACKING_ALERT":
      return `🚚 *SHERSHA B2B — مال روانہ کر دیا گیا (بِلٹی نمبر جاری)*

محترم *${payload.userName}* صاحب،
آپ کا آرڈر \`${payload.orderNumber}\` فیکٹری سے روانہ ہو چکا ہے۔

🚛 *ٹرانسپورٹ/کارگو:* ${payload.carrierName || "TCS Logistics / Faisal Movers Cargo"}
🧾 *بِلٹی نمبر (Bilti No):* \`${payload.biltiNumber}\`
👉 *لائیو ٹریکنگ:* ${payload.actionUrl || "https://shersha.pk/track"}`;

    default:
      return `SHERSHA B2B Notification for ${payload.userName}`;
  }
}

/**
 * WhatsApp Dispatcher (Integrates with Meta Cloud API or local Twilio/Gupshup gateway)
 */
export async function sendWhatsAppMessage(recipientPhone: string, messageText: string): Promise<boolean> {
  const metaToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (metaToken && phoneNumberId) {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: recipientPhone.replace("+", ""),
          type: "text",
          text: { body: messageText },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Meta WhatsApp API Error:`, errorText);
        return false;
      }

      console.log(`✅ WhatsApp sent successfully to ${recipientPhone} via Meta Cloud API.`);
      return true;
    } catch (err) {
      console.error("❌ Failed to call Meta WhatsApp API:", err);
      return false;
    }
  } else {
    // In local development or staging without Meta API credentials, log the simulated WhatsApp payload
    console.log(`\n📱 ══════════ SIMULATED WHATSAPP MESSAGE ══════════`);
    console.log(`TO: ${recipientPhone}`);
    console.log(messageText);
    console.log(`═══════════════════════════════════════════════════\n`);
    return true;
  }
}

/**
 * BullMQ Worker instance for processing WhatsApp background notifications.
 * Only instantiated when Redis is available (not on Vercel serverless).
 * Workers run on a separate persistent host (Railway/Render/Fly).
 */
export const whatsappWorker = redisConnection
  ? new Worker<WhatsAppJobData>(
      "whatsapp-notifications",
      async (job: Job<WhatsAppJobData>) => {
        console.log(`⚙️ Processing WhatsApp Job #${job.id} for ${job.data.recipientPhone}...`);
        const message = formatWhatsAppMessage(job.data);
        await sendWhatsAppMessage(job.data.recipientPhone, message);
      },
      {
        connection: redisConnection,
        concurrency: 5,
      }
    )
  : null;
