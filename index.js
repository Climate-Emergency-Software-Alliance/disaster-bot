const {
  replyWithLocationBasedCard,
  replyForNeedDisasterCard,
  replyForUnsubscribeUser,
  replyOnUpdateStatus,
  replyWithMenu,
  replyWithGreeting,
  replyForQuickReplyMessage,
  replyForSimpleButtonMessage,
  replyForRadioButtonMessage,
} = require("./actions");

const WhatsAppCloudApi = require("./whatsappCloudApiWrapper");

const WhatsApp = new WhatsAppCloudApi({
  accessToken: process.env.WHATSAPP_PAGE_ACCESS_TOKEN,
  senderPhoneNumberId: process.env.WHATSAPP_SENDER_PHONENUMBER_ID,
  WABA_ID: process.env.WHATSAPP_BUSINESS_ID,
});

const ALL_MESSAGE_TYPES = [
  "text_message",
  "radio_button_message",
  "simple_button_message",
  "quick_reply_message",
];

const LOCATION_BASED_CARD = ["lmk", "mauinfo"];
const NEED_BASED_CARD = ["need"];
const UNSUB = ["unsubscribe", "stopinfo"];
const RADIO_BUTTONS = ["report", "laporkan"];
const ALL = [
  ...LOCATION_BASED_CARD,
  ...NEED_BASED_CARD,
  ...UNSUB,
  ...RADIO_BUTTONS,
];

module.exports.handler = async (event, context, callback) => {
  const HTTP_METHOD = event.httpMethod;

  if (HTTP_METHOD === "GET") {
    const HUB_CHALLENGE = event.queryStringParameters["hub.challenge"];
    const HUB_VERIFY_TOKEN_PARAM =
      event.queryStringParameters["hub.verify_token"];

    if (HUB_VERIFY_TOKEN_PARAM === "validationtoken" && HUB_CHALLENGE) {
      context.succeed({
        statusCode: "200",
        body: parseInt(HUB_CHALLENGE),
      });
    } else {
      context.succeed({
        statusCode: "400",
        body: JSON.stringify({
          error: event.queryStringParameters["hub.challenge"],
        }),
      });
    }
  } else if (HTTP_METHOD === "POST") {
    try {
      let DEFAULT_LANGUAGE = "en";
      const data = WhatsApp.parseMessage(JSON.parse(event.body));

      if (data.isNotificationMessage) {
        context.succeed({
          statusCode: "200",
          body: "sucess",
        });
      }

      if (data.isMessage) {
        const {
          from: { phone, name },
          type,
          message_id,
        } = data.message;
        const messageText = data.message.text?.body?.toLowerCase();
        const isTextMessage = type === "text_message";

        console.log("Incoming message: ", phone, name, messageText);
        await WhatsApp.markMessageAsRead({ message_id });

        if (isTextMessage && LOCATION_BASED_CARD.includes(messageText)) {
          const language = messageText === "lmk" ? "en" : "ur";
          await replyWithLocationBasedCard(
            {
              whatsapp: WhatsApp,
              phone,
              language,
            },
            context
          );
        }

        if (isTextMessage && NEED_BASED_CARD.includes(messageText)) {
          const language = messageText === "need" ? "en" : "ur";
          await replyForNeedDisasterCard(
            {
              whatsapp: WhatsApp,
              phone,
              language,
            },
            context
          );
        }

        if (isTextMessage && UNSUB.includes(messageText)) {
          const language = messageText === "unsubscribe" ? "ur" : "en";
          await replyForUnsubscribeUser(
            {
              whatsapp: WhatsApp,
              phone,
              language,
            },
            context
          );
        }

        if (isTextMessage && messageText.includes("code")) {
          await replyOnUpdateStatus(
            {
              messageText,
              phone,
              whatsapp: WhatsApp,
            },
            context
          );
        }

        if (isTextMessage && RADIO_BUTTONS.includes(messageText)) {
          await replyWithMenu(
            {
              whatsapp: WhatsApp,
              phone,
              messageText,
            },
            context
          );
        }

        if (
          isTextMessage &&
          type !== "quick_reply_message" &&
          !ALL.includes(messageText) &&
          !messageText.includes("code")
        ) {
          await replyWithGreeting(
            {
              whatsapp: WhatsApp,
              phone,
            },
            context
          );
        }

        if (type === "simple_button_message") {
          let buttonId = data.message.button_reply.id;

          await replyForSimpleButtonMessage(
            {
              whatsapp: WhatsApp,
              phone,
              buttonId,
            },
            context
          );
        }

        if (type === "radio_button_message") {
          const selectionId = data.message.list_reply.id;
          let language = DEFAULT_LANGUAGE;

          await replyForRadioButtonMessage(
            {
              whatsapp: WhatsApp,
              phone,
              selectionId,
              language,
            },
            context
          );
        }

        if (type === "quick_reply_message") {
          await replyForQuickReplyMessage(
            {
              button: data.message.button,
              whatsapp: WhatsApp,
            },
            context
          );
        }
        if (!ALL_MESSAGE_TYPES.includes(type)) {
          await replyForUnsupportedMessageType(
            {
              whatsapp: WhatsApp,
              phone,
            },
            context
          );
        }
      }
    } catch (error) {
      console.log("Error while parsing", error);
    }
  }
};
