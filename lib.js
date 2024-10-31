const { deleteUser, getCardLink, getDevCardLink } = require("./api");

const locationBasedReplies = {
  en: "Hi! I’m Disaster Bot! I can let you know if there are active disaster reports in your area. Click here to sign up for notifications.",
  id: "Halo! Saya BencanaBot! Saya dapat memberikan informasi jika ada laporan bencana di sekitar anda. Klik link berikut untuk mendapatkan notifikasi.",
  ur: "ہائے! میں ڈیزاسٹر بوٹ ہوں! میں آپ کو بتا سکتا ہوں کہ آیا آپ کے علاقے میں تباہی کی فعال رپورٹیں ہیں۔ اطلاعات کے لیے سائن اپ کرنے کے لیے یہاں کلک کریں۔",
};

const replies = {
  en: "Hi! Report using this link, thanks.",
  id: "Hai! Laporkan menggunakan link ini. Terima kasih.",
  ur: "ہائے! اس لنک کو استعمال کرتے ہوئے رپورٹ کریں، شکریہ۔",
};

const unsubscribeReplies = {
  en: "Hey! You’ve successfully unsubscribed from location-based notifications. If you ever want to receive these updates again, just type “lmk” or “mauinfo”, to stay informed about active disaster reports in your area.",
  id: 'Halo! Kamu telah berhasil berhenti berlangganan notifikasi berbasis lokasi. Jika kamu ingin menerima informasi kejadian bencana terkini, cukup ketik "lmk" atau "mauinfo" untuk mendapat notifikasi tentang laporan bencana aktif disekitarmu.',
  ur: 'ارے! آپ نے مقام پر مبنی اطلاعات سے کامیابی کے ساتھ ان سبسکرائب کر دیا ہے۔ اگر آپ کبھی بھی یہ اپ ڈیٹس دوبارہ حاصل کرنا چاہتے ہیں، تو صرف "mauinfo" یا "lmk" ٹائپ کریں، اپنے علاقے میں فعال ڈیزاسٹر رپورٹس کے بارے میں باخبر رہنے کے لیے۔',
};

function getInitialMessageText(language, cardId, disasterType) {
  return `${replies[language]}\n${process.env.FRONTEND_CARD_PATH}/${cardId}/${disasterType}`;
}

function getLocationBasedText(recipientPhone, language, cardId, disasterType) {
  return `${locationBasedReplies[language]}\n${process.env.FRONTEND_CARD_PATH}/${cardId}/notifications/${disasterType}?waId=${recipientPhone}`;
}

function getNeedMessageText(language, cardId, disasterType, phonenumber) {
  const url = `https://cards-dev.aafatinfo.pk`;
  return `${replies[language]}\n${url}/${cardId}/${disasterType}?waId=${phonenumber}`;
}

function sendLocationBasedCard(
  whatsapp,
  recipientPhone,
  disasterType,
  language
) {
  return new Promise(async (resolve, reject) => {
    await getCardLink(recipientPhone, "whatsapp", language)
      .then(async (res) => {
        let messageText = getLocationBasedText(
          recipientPhone,
          language,
          res?.data?.cardId,
          disasterType
        );
        console.log("Message in location text", messageText);
        const whatsappReq = await whatsapp.sendText({
          recipientPhone,
          message: messageText,
        });
        resolve(whatsappReq);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function sendNeedDisasterCard(
  whatsapp,
  recipientPhone,
  disasterType,
  language
) {
  return new Promise(async (resolve, reject) => {
    await getDevCardLink(recipientPhone, "whatsapp", language)
      .then(async (res) => {
        let messageText = getNeedMessageText(
          language,
          res?.data?.cardId,
          disasterType,
          recipientPhone
        );
        const whatsappReq = await whatsapp.sendText({
          recipientPhone,
          message: messageText,
        });
        resolve(whatsappReq);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function unsubscribeUser(whatsapp, recipientPhone, language) {
  return new Promise(async (resolve, reject) => {
    await deleteUser(recipientPhone, language)
      .then(async (res) => {
        let messageText = unsubscribeReplies[language];
        const whatsappReq = await whatsapp.sendText({
          recipientPhone,
          message: messageText,
        });
        resolve(whatsappReq);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function sendDisasterCard(whatsapp, recipientPhone, disasterType, language) {
  return new Promise(async (resolve, reject) => {
    await getCardLink(recipientPhone, "whatsapp", language)
      .then(async (res) => {
        let messageText = getInitialMessageText(
          language,
          res?.data?.cardId,
          disasterType
        );
        const whatsappReq = await whatsapp.sendText({
          recipientPhone,
          message: messageText,
        });
        resolve(whatsappReq);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = {
  sendLocationBasedCard,
  sendNeedDisasterCard,
  unsubscribeUser,
  sendDisasterCard,
};
