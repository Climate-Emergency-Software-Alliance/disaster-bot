"use strict";

const { rescheduleDeliveryDate, updateStatus } = require("./api");
const {
  sendLocationBasedCard,
  sendNeedDisasterCard,
  unsubscribeUser,
  sendDisasterCard,
} = require("./lib");

let SUCCESS = { statusCode: "200", body: "Success" };
let BAD_REQ = { statusCode: "400" };

async function replyWithLocationBasedCard(params, context) {
  try {
    const { whatsapp, phone, language } = params;
    await sendLocationBasedCard(whatsapp, phone, "region", language);
    context.succeed(SUCCESS);
  } catch (error) {
    context.succeed({ ...BAD_REQ, body: error });
  } finally {
    return;
  }
}

async function replyForNeedDisasterCard(params, context) {
  try {
    const { whatsapp, phone, language } = params;
    await sendNeedDisasterCard(whatsapp, phone, "need", language);
    context.succeed(SUCCESS);
  } catch (error) {
    context.succeed({ ...BAD_REQ, body: error });
  } finally {
    return;
  }
}

async function replyForUnsubscribeUser(params, context) {
  try {
    const { whatsapp, phone, language } = params;
    await unsubscribeUser(whatsapp, phone, language);

    context.succeed(SUCCESS);
  } catch (error) {
    context.succeed({ ...BAD_REQ, body: error });
  } finally {
    return;
  }
}

async function replyOnUpdateStatus(params, context) {
  try {
    const { whatsapp, phone, messageText } = params;
    const splitCode = messageText.split("-");
    const extractNeedIds = splitCode.slice(1);
    await updateStatus(phone, messageText, extractNeedIds);

    await whatsapp.sendTemplate({
      recipientPhone: phone,
      template: "crowdlogistics_donor_acknowledgment",
      languageCode: data[0]["giver_language"] || "id",
    });

    context.succeed(SUCCESS);
  } catch (error) {
    await params.whatsapp.sendText({
      recipientPhone: phone,
      message: "Invalid code , Please enter the correct code",
    });
    context.succeed({
      statusCode: "200",
      body: err,
    });
  } finally {
    return;
  }
}

const DISASTERS = {
  flood: {
    en: {
      title: "Flood",
      payload: "flood",
    },
    ur: {
      title: "سیلاب",
      payload: "سیلاب",
    },
  },
};

const HEADER_RADIO_BUTTONS = {
  en: "Disaster Bot",
  ur: "ڈیزاسٹر بوٹ",
};

const MENU_TITLE = {
  en: "Select disaster type",
  ur: "تباہی کی قسم منتخب کریں۔",
};

const BODY_TEXT = {
  en: "Hi! I’m Disaster Bot! Select the disaster you would like to report from the list",
  ur: "ہائے! میں ڈیزاسٹر بوٹ ہوں! فہرست سے وہ آفت منتخب کریں جس کی آپ اطلاع دینا چاہتے ہیں۔",
};

function constructMenuPayload(language) {
  return {
    headerText: HEADER_RADIO_BUTTONS[language],
    actionTitle: MENU_TITLE[language],
    bodyText: BODY_TEXT[language],
    footerText: "Approved by www.aafatinfo.pk",
    listOfSections: [
      {
        title: "",
        rows: [
          {
            title: DISASTERS["flood"][language]["title"],
            id: DISASTERS["flood"][language]["payload"],
          },
        ],
      },
    ],
  };
}

async function replyWithMenu(params, context) {
  try {
    const { whatsapp, phone, messageText } = params;
    let menuPayload;

    switch (messageText) {
      case "سیلاب":
        menuPayload = constructMenuPayload("ur");
        break;
      case "report":
        menuPayload = constructMenuPayload("en");
        break;
      default:
        return;
    }

    await whatsapp.sendRadioButtons({
      recipientPhone: phone,
      ...menuPayload,
    });

    context.succeed(SUCCESS);
  } catch (error) {
    context.succeed({ ...BAD_REQ, body: error });
  } finally {
    return;
  }
}

const DEFAULT_LANGUAGE = "en";

const GREET = {
  en: 'Hi! I`m Disaster Bot! Click "Report" to select the disaster you would like to report',
  ur: 'ہائے! میں ڈیزاسٹر بوٹ ہوں! آپ جس آفت کی اطلاع دینا چاہتے ہیں اسے منتخب کرنے کے لیے "رپورٹ" پر کلک کریں۔',
};

const START = {
  en: "Report",
  ur: "رپورٹ",
};

async function replyWithGreeting(params, context) {
  try {
    const { whatsapp, phone } = params;

    await whatsapp.sendSimpleButtons({
      message: GREET[DEFAULT_LANGUAGE],
      recipientPhone: phone,
      listOfButtons: [
        {
          title: START["ur"],
          id: "report-ur",
        },
        {
          title: START["en"],
          id: "report",
        },
      ],
    });

    context.succeed(SUCCESS);
  } catch (error) {
    console.error(error);
  } finally {
    return;
  }
}

async function replyForUnsupportedMessageType(params, context) {
  try {
    const { whatsapp, phone } = params;
    await whatsapp.sendText({
      recipientPhone: phone,
      message: "Unsupported type, Kindly send a text message",
    });
    context.succeed(SUCCESS);
  } catch (error) {
    console.error(error);
  } finally {
    return;
  }
}

async function replyForQuickReplyMessage(params, context) {
  const { button, whatsapp } = params;
  const payloadSplit = button.payload.split("-");
  const needIds = payloadSplit[1].split(",");
  const needUserId = payloadSplit[2];
  const needLanguage = payloadSplit[3];

  if (payloadSplit[0] === "one" || payloadSplit[0] === "two") {
    try {
      const data = await rescheduleDeliveryDate(payloadSplit[0], needIds);

      await whatsapp.sendTemplate({
        recipientPhone: needUserId,
        template: "crowdlogistics_donor_reschedule",
        message: [data[0][0].promised_data],
        languageCode: needLanguage,
      });

      context.succeed(SUCCESS);
    } catch (error) {
      context.succeed({ ...BAD_REQ, body: error });
    } finally {
      return;
    }
  }
}

async function replyForSimpleButtonMessage(params, context) {
  const { whatsapp, phone, buttonId } = params;
  let menuPayload;

  switch (buttonId) {
    case "report-ur":
      menuPayload = constructMenuPayload("ur");
      break;
    case "report":
      menuPayload = constructMenuPayload("en");
      break;
    default:
      return;
  }

  try {
    await whatsapp.sendRadioButtons({
      recipientPhone: phone,
      ...menuPayload,
    });

    context.succeed(SUCCESS);
  } catch (error) {
    console.error(error);
  } finally {
    return;
  }
}

async function replyForRadioButtonMessage(params, context) {
  const { selectionId, phone, whatsapp, language } = params;

  let lan;
  console.log("replyForRadioButtonMessage", selectionId, phone, language);
  let disasterType;
  switch (selectionId) {
    case "flood":
      disasterType = "flood";
      lan = "en";
      break;
    case "سیلاب":
      disasterType = "flood";
      lan = "ur";
      break;
  }

  try {
    await sendDisasterCard(whatsapp, phone, disasterType, lan);

    context.succeed(SUCCESS);
  } catch (error) {
    context.succeed({ ...BAD_REQ, body: error });
  } finally {
    return;
  }
}

module.exports = {
  replyWithLocationBasedCard,
  replyForNeedDisasterCard,
  replyForUnsubscribeUser,
  replyOnUpdateStatus,
  replyWithMenu,
  replyWithGreeting,
  replyForUnsupportedMessageType,
  replyForQuickReplyMessage,
  replyForSimpleButtonMessage,
  replyForRadioButtonMessage,
};
