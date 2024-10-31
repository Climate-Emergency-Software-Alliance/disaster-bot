const { rescheduleDeliveryDate, updateStatus } = require("./api");
const {
  sendLocationBasedCard,
  sendNeedDisasterCard,
  unsubscribeUser,
  sendDisasterCard,
} = require("./lib");

const WhatsAppCloudApi = require("./whatsappCloudApiWrapper");

const WhatsApp = new WhatsAppCloudApi({
  accessToken: process.env.WHATSAPP_PAGE_ACCESS_TOKEN,
  senderPhoneNumberId: process.env.WHATSAPP_SENDER_PHONENUMBER_ID,
  WABA_ID: process.env.WHATSAPP_BUSINESS_ID,
});

const initiate = {
  en: 'Hi! I`m Disaster Bot! Click "Report" to select the disaster you would like to report',
  id: 'Hi! Saya Bencana Bot! Klik "Laporkan" untuk memilih bencana yang ingin kamu laporkan. Hi! I`m Disaster Bot! Click "Report" to select the disaster you would like to report',
  ur: 'ہائے! میں ڈیزاسٹر بوٹ ہوں! آپ جس آفت کی اطلاع دینا چاہتے ہیں اسے منتخب کرنے کے لیے "رپورٹ" پر کلک کریں۔',
};

const start = {
  en: "Report",
  id: "Laporkan",
  ur: "رپورٹ",
};

const ALL_MESSAGE_TYPES = [
  "text_message",
  "radio_button_message",
  "simple_button_message",
  "quick_reply_message",
];

const headerForRadioButtons = {
  en: "Disaster Bot",
  id: "Bencana Bot",
  ur: "ڈیزاسٹر بوٹ",
};

const menuMessage = {
  en: "Select disaster type",
  id: "Pilih jenis bencana",
  ur: "تباہی کی قسم منتخب کریں۔",
};

const report_text = {
  en: "Hi! I’m Disaster Bot! Select the disaster you would like to report from the list",
  id: "Hi, Saya Bencana Bot! Silahkan pilih bencana yang ingin kamu laporkan",
  ur: "ہائے! میں ڈیزاسٹر بوٹ ہوں! فہرست سے وہ آفت منتخب کریں جس کی آپ اطلاع دینا چاہتے ہیں۔",
};

const disasters = {
  flood: {
    en: {
      title: "Flood",
      payload: "flood",
    },
    id: {
      title: "Banjir",
      payload: "banjir",
    },
    ur: {
      title: "سیلاب",
      payload: "سیلاب",
    },
  },
};

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

function constructMenuPayload(language) {
  return {
    headerText: headerForRadioButtons[language],
    actionTitle: menuMessage[language],
    bodyText: report_text[language],
    footerText: "Approved by www.aafatinfo.pk",
    listOfSections: [
      {
        title: "",
        rows: [
          {
            title: disasters["flood"][language]["title"],
            id: disasters["flood"][language]["payload"],
          },
        ],
      },
    ],
  };
}

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
          text: { body },
        } = data.message;
        const messageText = body?.toLowerCase();
        const isTextMessage = type === "text_message";
        let menuPayload;

        console.log("Incoming message: ", phone, name, body);
        await WhatsApp.markMessageAsRead({ message_id });

        if (isTextMessage && LOCATION_BASED_CARD.includes(messageText)) {
          const language = messageText === "lmk" ? "ur" : "en";
          await sendLocationBasedCard(WhatsApp, phone, "region", language)
            .then((data) => {
              let response = {
                statusCode: "200",
                body: "Success",
              };
              context.succeed(response);
            })
            .catch((err) => {
              let response = {
                statusCode: "400",
                body: err,
              };
              console.log("incoming err", err);
              context.succeed(response);
            });
        }

        if (isTextMessage && NEED_BASED_CARD.includes(messageText)) {
          const language = messageText === "need" ? "ur" : "en";
          await sendNeedDisasterCard(WhatsApp, phone, "need", language)
            .then((data) => {
              let response = {
                statusCode: "200",
                body: "Success",
              };
              context.succeed(response);
            })
            .catch((err) => {
              let response = {
                statusCode: "400",
                body: err,
              };
              context.succeed(response);
            });
        }

        if (isTextMessage && UNSUB.includes(messageText)) {
          const language = messageText === "unsubscribe" ? "ur" : "en";
          await unsubscribeUser(WhatsApp, phone, language)
            .then((data) => {
              let response = {
                statusCode: "200",
                body: "Success",
              };
              context.succeed(response);
            })
            .catch((err) => {
              let response = {
                statusCode: "400",
                body: err,
              };
              context.succeed(response);
            });
        }

        if (isTextMessage && messageText.includes("code")) {
          const splitCode = messageText.split("-");
          const extractNeedIds = splitCode.slice(1);
          const data = await updateStatus(phone, messageText, extractNeedIds)
            .then(async (data) => {
              await WhatsApp.sendTemplate({
                recipientPhone: phone,
                template: "crowdlogistics_donor_acknowledgment",
                languageCode: data[0]["giver_language"] || "id",
              });
              context.succeed({
                statusCode: "200",
                body: "Success",
              });
            })
            .catch(async (err) => {
              await WhatsApp.sendText({
                phone,
                message: "Invalid code , Please enter the correct code",
              });
              context.succeed({
                statusCode: "200",
                body: err,
              });
            });
        }

        if (isTextMessage && RADIO_BUTTONS.includes(messageText)) {
          switch (messageText) {
            case "laporkan":
              menuPayload = constructMenuPayload("id");
              break;
            case "report":
              menuPayload = constructMenuPayload("en");
              break;
            default:
              return;
          }

          await WhatsApp.sendRadioButtons({
            recipientPhone: phone,
            ...menuPayload,
          });

          let response = {
            statusCode: "200",
            body: "Success",
          };
          context.succeed(response);
        }

        if (
          isTextMessage &&
          type !== "quick_reply_message" &&
          !ALL.includes(messageText) &&
          !messageText.includes("code")
        ) {
          await WhatsApp.sendSimpleButtons({
            message: initiate[DEFAULT_LANGUAGE],
            phone,
            listOfButtons: [
              {
                title: start["ur"],
                id: "report-ur",
              },
              {
                title: start["en"],
                id: "report",
              },
            ],
          });
          let response = {
            statusCode: "200",
            body: "Success",
          };
          context.succeed(response);
        }

        if (type === "simple_button_message") {
          let button_id = data.message.button_reply.id;

          switch (button_id) {
            case "report-ur":
              menuPayload = constructMenuPayload("ur");
              break;
            case "report":
              menuPayload = constructMenuPayload("en");
              break;
            default:
              return;
          }
          await WhatsApp.sendRadioButtons({
            recipientPhone: phone,
            ...menuPayload,
          });

          let response = {
            statusCode: "200",
            body: "Success",
          };
          context.succeed(response);
        }

        if (type === "radio_button_message") {
          const selectionId = data.message.list_reply.id;
          let language = DEFAULT_LANGUAGE;
          let disasterType = "";
          switch (selectionId) {
            case "flood":
              disasterType = "flood";
              language = "en";
              break;
            case "banjir":
              disasterType = "flood";
              language = "id";
              break;
            case "earthquake":
              disasterType = "earthquake";
              language = "en";
              break;
            case "gempa":
              disasterType = "earthquake";
              language = "id";
              break;
            case "fire":
              disasterType = "fire";
              language = "en";
              break;
            case "hutan":
              disasterType = "fire";
              language = "id";
              break;
            case "wind":
              disasterType = "wind";
              language = "en";
              break;
            case "kencang":
              disasterType = "wind";
              language = "id";
              break;
            case "volcano":
              disasterType = "volcano";
              language = "en";
              break;
            case "api":
              disasterType = "volcano";
              language = "id";
              break;
            case "haze":
              disasterType = "haze";
              language = "en";
              break;
            case "asap":
              disasterType = "haze";
              language = "id";
              break;
            default:
              break;
          }
          await sendDisasterCard(WhatsApp, phone, disasterType, language)
            .then((data) => {
              let response = {
                statusCode: "200",
                body: "Success",
              };
              context.succeed(response);
            })
            .catch((err) => {
              let response = {
                statusCode: "400",
                body: err,
              };
              context.succeed(response);
            });
        }

        if (type === "quick_reply_message") {
          const payloadSplit = data.message.button.payload.split("-");
          const needIds = payloadSplit[1].split(",");
          const needUserId = payloadSplit[2];
          const needLanguage = payloadSplit[3];

          switch (payloadSplit[0]) {
            case "one":
              await rescheduleDeliveryDate("one", needIds)
                .then(async (data) => {
                  await WhatsApp.sendTemplate({
                    recipientPhone: needUserId,
                    template: "crowdlogistics_donor_reschedule",
                    message: [data[0][0].promised_date],
                    languageCode: needLanguage,
                  });
                  context.succeed({
                    statusCode: "200",
                    body: "Success",
                  });
                })
                .catch((err) => {
                  context.succeed({
                    statusCode: "400",
                    body: err,
                  });
                });
              break;
            case "two":
              await rescheduleDeliveryDate("two", needIds)
                .then(async (data) => {
                  await WhatsApp.sendTemplate({
                    recipientPhone: needUserId,
                    template: "crowdlogistics_donor_reschedule",
                    message: [data[0][0].promised_date],
                    languageCode: needLanguage,
                  });
                  context.succeed({
                    statusCode: "200",
                    body: "Success",
                  });
                })
                .catch((err) => {
                  context.succeed({
                    statusCode: "400",
                    body: err,
                  });
                });
              break;
            default:
              break;
          }
        }
        if (!ALL_MESSAGE_TYPES.includes(type)) {
          await WhatsApp.sendText({
            recipientPhone: phone,
            message: "Unsupported type , Kindly send a text message",
          });
          let response = {
            statusCode: "200",
            body: "Success",
          };
          context.succeed(response);
        }
      }
    } catch (error) {
      console.log("Error while parsing", error);
    }
  }
};
