const unirest = require("unirest");

const UnsubscribeOptions = {
  host: "https://api.aafatinfo.pk",
  path: "/subscriptions/delete-subscriber",
  method: "DELETE",
  port: process.env.SERVER_PORT,
};

const UpdateStatusOptions = {
  host: "https://dev-api.aafatinfo.pk",
  path: "/needs/need",
  method: "PATCH",
  port: process.env.SERVER_PORT,
};

const options = {
  host: process.env.SERVER_PATH,
  path: "/cards",
  method: "POST",
  port: process.env.SERVER_PORT,
  headers: {
    "x-api-key": process.env.SERVER_API_KEY,
    "Content-Type": "application/json",
  },
};

const Devoptions = {
  host: "https://dev-api.aafatinfo.pk",
  path: "/cards",
  method: "POST",
  port: process.env.SERVER_PORT,
  headers: {
    "x-api-key": "aYTEpkBqqs43fpRF9hYx52yihITl61234LnBwFBd",
    "Content-Type": "application/json",
  },
};

function deleteUser(username, language) {
  return new Promise((resolve, reject) => {
    const request_payload = {
      phonenumber: username,
    };

    unirest(
      UnsubscribeOptions.method,
      `${UnsubscribeOptions.host}${UnsubscribeOptions.path}`
    )
      .send(request_payload)
      .end(function (res) {
        if (res.error) {
          let errorObject = () => {
            try {
              return res.body?.error || JSON.parse(res.raw_body);
            } catch (e) {
              return {
                error: res.raw_body,
              };
            }
          };
          reject({
            status: "failed",
            ...errorObject(),
          });
        } else {
          resolve({
            status: "success",
            data: res.body,
          });
        }
      });
  });
}

function updateNeedStatus(payloads) {
  return new Promise((resolve, reject) => {
    const request_payload = {
      status: "SATISFIED",
    };

    const promises = payloads.map((payload) => {
      return new Promise((resolve, reject) => {
        unirest(
          `${UpdateStatusOptions.method}`,
          `${UpdateStatusOptions.host}${UpdateStatusOptions.path}/${parseInt(
            payload
          )}`
        )
          .send(request_payload)
          .end(function (res) {
            if (res.error) {
              let errorObject = () => {
                try {
                  return res.body?.error || JSON.parse(res.raw_body);
                } catch (e) {
                  return {
                    error: res.raw_body,
                  };
                }
              };
              reject({
                status: "failed",
                ...errorObject(),
              });
            } else {
              resolve({
                status: "success",
                data: res.body,
              });
            }
          });
      });
    });

    Promise.all(promises)
      .then((results) => resolve(results))
      .catch((error) => reject(error));
  });
}

function getCardLink(username, network, language) {
  const card_request = {
    username: username,
    network: network,
    language: language,
  };
  return new Promise((resolve, reject) => {
    unirest(options.method, `${options.host}${options.path}`)
      .headers(options.headers)
      .send(JSON.stringify(card_request))
      .end(function (res) {
        if (res.error) {
          let errorObject = () => {
            try {
              return res.body?.error || JSON.parse(res.raw_body);
            } catch (e) {
              return {
                error: res.raw_body,
              };
            }
          };
          reject({
            status: "failed",
            ...errorObject(),
          });
        } else {
          resolve({
            status: "success",
            data: res.body,
          });
        }
      });
  });
}

function getDevCardLink(username, network, language) {
  const card_request = {
    username: username,
    network: network,
    language: language,
  };
  return new Promise((resolve, reject) => {
    unirest(Devoptions.method, `${Devoptions.host}${Devoptions.path}`)
      .headers(Devoptions.headers)
      .send(JSON.stringify(card_request))
      .end(function (res) {
        if (res.error) {
          let errorObject = () => {
            try {
              return res.body?.error || JSON.parse(res.raw_body);
            } catch (e) {
              return {
                error: res.raw_body,
              };
            }
          };
          reject({
            status: "failed",
            ...errorObject(),
          });
        } else {
          resolve({
            status: "success",
            data: res.body,
          });
        }
      });
  });
}

function verifyDeliveryCode(recipientPhone, deliveryCode) {
  return new Promise((resolve, reject) => {
    unirest(
      "GET",
      `${UpdateStatusOptions.host}/needs/verify-delivery-code/?giverId=${recipientPhone}&code=${deliveryCode}`
    ).end(function (res) {
      if (res.error) {
        let errorObject = () => {
          try {
            return res.body?.error || JSON.parse(res.raw_body);
          } catch (e) {
            return {
              error: res.raw_body,
            };
          }
        };
        reject({
          status: "failed",
          ...errorObject(),
        });
      } else {
        resolve(res.body);
      }
    });
  });
}

function updateStatus(recipientPhone, deliveryCode, payloads) {
  return new Promise(async (resolve, reject) => {
    const data = await verifyDeliveryCode(recipientPhone, deliveryCode);
    if (data.length > 0) {
      await updateNeedStatus(payloads)
        .then(async (res) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      reject("Code not found");
    }
  });
}

function rescheduleDelivery(interval, ids) {
  return new Promise((resolve, reject) => {
    const request_payload = {
      interval: interval,
    };
    const promises = ids.map((id) => {
      return new Promise((resolve, reject) => {
        unirest(
          "PATCH",
          `${UpdateStatusOptions.host}/needs/giver-details/${id}`
        )
          .send(request_payload)
          .end(function (res) {
            if (res.error) {
              let errorObject = () => {
                try {
                  return res.body?.error || JSON.parse(res.raw_body);
                } catch (e) {
                  return {
                    error: res.raw_body,
                  };
                }
              };
              reject({
                status: "failed",
                ...errorObject(),
              });
            } else {
              resolve(res.body.data[0]);
            }
          });
      });
    });
    Promise.all(promises)
      .then((results) => resolve(results))
      .catch((error) => reject(error));
  });
}

function rescheduleDeliveryDate(interval, payloads) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await rescheduleDelivery(interval, payloads);
      resolve(data);
    } catch (error) {
      console.log("Error in Reschedule Delivery", error);
      reject(error);
    }
  });
}

module.exports = {
  deleteUser,
  updateNeedStatus,
  getCardLink,
  getDevCardLink,
  updateNeedStatus,
  updateStatus,
  rescheduleDelivery,
  rescheduleDeliveryDate,
};
