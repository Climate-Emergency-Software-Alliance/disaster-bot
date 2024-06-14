const WhatsAppCloudApi = require('./whatsappcloudapi_wrapper/index')
const unirest = require('unirest')

const WhatsApp = new WhatsAppCloudApi({
	accessToken: process.env.WHATSAPP_PAGE_ACCESS_TOKEN,
	senderPhoneNumberId: process.env.WHATSAPP_SENDER_PHONENUMBER_ID,
	WABA_ID: process.env.WHATSAPP_BUSINESS_ID,
})

// GRASP card
const options = {
	host: process.env.SERVER_PATH,
	path: '/cards',
	method: 'POST',
	port: process.env.SERVER_PORT,
	headers: {
		'x-api-key': process.env.SERVER_API_KEY,
		'Content-Type': 'application/json',
	},
}

const Devoptions = {
	host: "https://dev-api.tabahinaqsha.pk",
	path: '/cards',
	method: 'POST',
	port: process.env.SERVER_PORT,
	headers: {
		'x-api-key': 'aYTEpkBqqs43fpRF9hYx52yihITl61234LnBwFBd',
		'Content-Type': 'application/json',
	},
}

const UnsubscribeOptions = {
	host: "https://api.tabahinaqsha.pk",
	path: '/subscriptions/delete-subscriber',
	method: 'DELETE',
	port: process.env.SERVER_PORT,
}

const UpdateStatusOptions = {
	host: "https://dev-api.tabahinaqsha.pk",
	path: '/needs/need',
	method: 'PATCH',
	port: process.env.SERVER_PORT,
}


// Welcome message to user
const initiate = {
	en: 'Hi! Saya Bencana Bot! Klik "Laporkan" untuk memilih bencana yang ingin kamu laporkan. Hi! I`m Disaster Bot! Click "Report" to select the disaster you would like to report',
	id: 'Hi! Saya Bencana Bot! Klik "Laporkan" untuk memilih bencana yang ingin kamu laporkan. Hi! I`m Disaster Bot! Click "Report" to select the disaster you would like to report',
	ur: 'ہائے! میں ڈیزاسٹر بوٹ ہوں! آپ جس آفت کی اطلاع دینا چاہتے ہیں اسے منتخب کرنے کے لیے "رپورٹ" پر کلک کریں۔'
}

const start = {
	en: 'Report',
	id: 'Laporkan',
	ur: 'رپورٹ'
}

const headerForRadioButtons = {
	en: 'Disaster Bot',
	id: 'Bencana Bot',
	ur: 'ڈیزاسٹر بوٹ'
}

const menuMessage = {
	en: 'Select disaster type',
	id: 'Pilih jenis bencana',
	ur: 'تباہی کی قسم منتخب کریں۔'
}

const report_text = {
	en: 'Hi! I’m Disaster Bot! Select the disaster you would like to report from the list',
	id: 'Hi, Saya Bencana Bot! Silahkan pilih bencana yang ingin kamu laporkan',
	ur: 'ہائے! میں ڈیزاسٹر بوٹ ہوں! فہرست سے وہ آفت منتخب کریں جس کی آپ اطلاع دینا چاہتے ہیں۔'
}

const DEFAULT_LANGUAGE = 'ur'

const disasters = {
	flood: {
		en: {
			title: 'Flood',
			payload: 'flood',
		},
		id: {
			title: 'Banjir',
			payload: 'banjir',
		},
		ur: {
			title: 'سیلاب',
			payload: 'سیلاب'
		}
	}
	// eq: {
	// 	en: {
	// 		title: 'Earthquake',
	// 		payload: 'earthquake',
	// 	},
	// 	id: {
	// 		title: 'Gempa',
	// 		payload: 'gempa',
	// 	},
	// },
	// ff: {
	// 	en: {
	// 		title: 'Forest Fire',
	// 		payload: 'fire',
	// 	},
	// 	id: {
	// 		title: 'Kebakaran Hutan',
	// 		payload: 'hutan',
	// 	},
	// },
	// hz: {
	// 	en: {
	// 		title: 'Haze',
	// 		payload: 'haze',
	// 	},
	// 	id: {
	// 		title: 'Kabut Asap',
	// 		payload: 'asap',
	// 	},
	// },
	// vl: {
	// 	en: {
	// 		title: 'Volcano',
	// 		payload: 'volcano',
	// 	},
	// 	id: {
	// 		title: 'Gunung Api',
	// 		payload: 'api',
	// 	},
	// },
	// ew: {
	// 	en: {
	// 		title: 'Extreme Wind',
	// 		payload: 'wind',
	// 	},
	// 	id: {
	// 		title: 'Angin Kencang',
	// 		payload: 'kencang',
	// 	},
	// },
}

// Replies to user
const replies = {
	en: 'Hi! Report using this link, thanks.',
	id: 'Hai! Laporkan menggunakan link ini. Terima kasih.',
	ur: 'ہائے! اس لنک کو استعمال کرتے ہوئے رپورٹ کریں، شکریہ۔'
}

const locationBasedReplies = {
	en: 'Hi! I’m Disaster Bot! I can let you know if there are active disaster reports in your area. Click here to sign up for notifications.',
	id: 'Halo! Saya BencanaBot! Saya dapat memberikan informasi jika ada laporan bencana di sekitar anda. Klik link berikut untuk mendapatkan notifikasi.',
	ur: 'ہائے! میں ڈیزاسٹر بوٹ ہوں! میں آپ کو بتا سکتا ہوں کہ آیا آپ کے علاقے میں تباہی کی فعال رپورٹیں ہیں۔ اطلاعات کے لیے سائن اپ کرنے کے لیے یہاں کلک کریں۔'
}

const unsubscribeReplies = {
	en: 'Hey! You’ve successfully unsubscribed from location-based notifications. If you ever want to receive these updates again, just type “lmk” or “mauinfo”, to stay informed about active disaster reports in your area.',
	id: 'Halo! Kamu telah berhasil berhenti berlangganan notifikasi berbasis lokasi. Jika kamu ingin menerima informasi kejadian bencana terkini, cukup ketik "lmk" atau "mauinfo" untuk mendapat notifikasi tentang laporan bencana aktif disekitarmu.',
	ur: 'ارے! آپ نے مقام پر مبنی اطلاعات سے کامیابی کے ساتھ ان سبسکرائب کر دیا ہے۔ اگر آپ کبھی بھی یہ اپ ڈیٹس دوبارہ حاصل کرنا چاہتے ہیں، تو صرف "mauinfo" یا "lmk" ٹائپ کریں، اپنے علاقے میں فعال ڈیزاسٹر رپورٹس کے بارے میں باخبر رہنے کے لیے۔'
}

/*
 * Get one time card link from the server
 */
function getCardLink(username, network, language) {
	const card_request = {
		username: username,
		network: network,
		language: language,
	}
	return new Promise((resolve, reject) => {
		unirest(options.method, `${options.host}${options.path}`)
			.headers(options.headers)
			.send(JSON.stringify(card_request))
			.end(function (res) {
				if (res.error) {
					let errorObject = () => {
						try {
							return (
								res.body?.error ||
								JSON.parse(res.raw_body)
							)
						} catch (e) {
							return {
								error: res.raw_body,
							}
						}
					}
					reject({
						status: 'failed',
						...errorObject(),
					})
				} else {
					resolve({
						status: 'success',
						data: res.body,
					})
				}
			})
	})
}

function getDevCardLink(username, network, language) {
	const card_request = {
		username: username,
		network: network,
		language: language,
	}
	return new Promise((resolve, reject) => {
		unirest(Devoptions.method, `${Devoptions.host}${Devoptions.path}`)
			.headers(Devoptions.headers)
			.send(JSON.stringify(card_request))
			.end(function (res) {
				if (res.error) {
					let errorObject = () => {
						try {
							return (
								res.body?.error ||
								JSON.parse(res.raw_body)
							)
						} catch (e) {
							return {
								error: res.raw_body,
							}
						}
					}
					reject({
						status: 'failed',
						...errorObject(),
					})
				} else {
					resolve({
						status: 'success',
						data: res.body,
					})
				}
			})
	})
}

function deleteUser(username, language) {
	return new Promise((resolve, reject) => {
		const request_payload = {
			phonenumber: username,
		}
		console.log("Request payload", request_payload)
		unirest(UnsubscribeOptions.method, `${UnsubscribeOptions.host}${UnsubscribeOptions.path}`)
			.send(request_payload)
			.end(function (res) {
				console.log("Response", res.body)
				if (res.error) {
					let errorObject = () => {
						try {
							return (
								res.body?.error ||
								JSON.parse(res.raw_body)
							)
						} catch (e) {
							return {
								error: res.raw_body,
							}
						}
					}
					reject({
						status: 'failed',
						...errorObject(),
					})
				} else {
					resolve({
						status: 'success',
						data: res.body,
					})
				}
			})
	})
}


function updateNeedStatus(payloads) {
	return new Promise((resolve, reject) => {
		const request_payload = {
			status: 'SATISFIED'
		};

		const promises = payloads.map(payload => {
			return new Promise((resolve, reject) => {
				unirest(`${UpdateStatusOptions.method}`, `${UpdateStatusOptions.host}${UpdateStatusOptions.path}/${parseInt(payload)}`)
					.send(request_payload)
					.end(function (res) {
						if (res.error) {
							let errorObject = () => {
								try {
									return (
										res.body?.error ||
										JSON.parse(res.raw_body)
									);
								} catch (e) {
									return {
										error: res.raw_body,
									};
								}
							};
							reject({
								status: 'failed',
								...errorObject(),
							});
						} else {
							resolve({
								status: 'success',
								data: res.body,
							});
						}
					});
			});
		});

		Promise.all(promises)
			.then(results => resolve(results))
			.catch(error => reject(error));
	});
}

function verifyDeliveryCode(recipientPhone, deliveryCode) {
	return new Promise((resolve, reject) => {
		unirest('GET', `${UpdateStatusOptions.host}/needs/verify-delivery-code/?giverId=${recipientPhone}&code=${deliveryCode}`)
			.end(function (res) {
				if (res.error) {
					let errorObject = () => {
						try {
							return (
								res.body?.error ||
								JSON.parse(res.raw_body)
							);
						} catch (e) {
							return {
								error: res.raw_body,
							};
						}
					};
					reject({
						status: 'failed',
						...errorObject(),
					});
				} else {
					resolve(res.body);
				}
			});
	});
}



function rescheduleDelivery(interval, ids) {
	return new Promise((resolve, reject) => {
		const request_payload = {
			interval: interval
		}
		const promises = ids.map(id => {
			return new Promise((resolve, reject) => {
				unirest('PATCH', `${UpdateStatusOptions.host}/needs/giver-details/${id}`)
					.send(request_payload)
					.end(function (res) {
						if (res.error) {
							let errorObject = () => {
								try {
									return (
										res.body?.error ||
										JSON.parse(res.raw_body)
									);
								} catch (e) {
									return {
										error: res.raw_body,
									};
								}
							};
							reject({
								status: 'failed',
								...errorObject(),
							});
						} else {
							resolve(res.body.data[0]);
						}
					});
			});
		})
		Promise.all(promises)
			.then(results => resolve(results))
			.catch(error => reject(error));
	})
}

function constructMenuPayload(language) {
	return {
		headerText: headerForRadioButtons[language],
		actionTitle: menuMessage[language],
		bodyText: report_text[language],
		footerText: 'Approved by TabahiNaqsha.pk',
		listOfSections: [
			{
				title: '',
				rows: [
					{
						title: disasters['flood'][language]['title'],
						id: disasters['flood'][language]['payload'],
					}
					// ,
					// {
					// 	title: disasters['eq'][language]['title'],
					// 	id: disasters['eq'][language]['payload'],
					// },
					// {
					// 	title: disasters['vl'][language]['title'],
					// 	id: disasters['vl'][language]['payload'],
					// },
					// {
					// 	title: disasters['ew'][language]['title'],
					// 	id: disasters['ew'][language]['payload'],
					// },
					// {
					// 	title: disasters['ff'][language]['title'],
					// 	id: disasters['ff'][language]['payload'],
					// },
					// {
					// 	title: disasters['hz'][language]['title'],
					// 	id: disasters['hz'][language]['payload'],
					// },
				],
			},
		],
	}
}

/*
 * Construct the initial message to be sent to the user
 */
function getInitialMessageText(language, cardId, disasterType) {
	return (
		replies[language] +
		'\n' +
		process.env.FRONTEND_CARD_PATH +
		'/' +
		cardId +
		'/' +
		disasterType
	)
}

function getNeedMessageText(language, cardId, disasterType, phonenumber) {
	return (
		replies[language] +
		'\n' +
		"https://cards-dev.tabahinaqsha.pk" +
		'/' +
		cardId +
		'/' +
		disasterType +
		'?waId=' +
		phonenumber
	)
}

function getLocationBasedText(recipientPhone, language, cardId, disasterType) {
	return (
		locationBasedReplies[language] +
		'\n' +
		process.env.FRONTEND_CARD_PATH +
		'/' +
		cardId +
		'/notifications/' +
		disasterType +
		'?waId=' + recipientPhone
	)
}

// Sends the disaster card to the user
function sendDisasterCard(recipientPhone, disasterType, language) {
	return new Promise(async (resolve, reject) => {
		await getCardLink(recipientPhone, 'whatsapp', language)
			.then(async (res) => {
				let messageText = getInitialMessageText(
					language,
					res?.data?.cardId,
					disasterType
				)
				const whatsappReq = await WhatsApp.sendText({
					recipientPhone,
					message: messageText,
				})
				resolve(whatsappReq)
			})
			.catch((err) => {
				reject(err)
			})
	})
}

function sendNeedDisasterCard(recipientPhone, disasterType, language) {
	return new Promise(async (resolve, reject) => {
		await getDevCardLink(recipientPhone, 'whatsapp', language)
			.then(async (res) => {
				let messageText = getNeedMessageText(
					language,
					res?.data?.cardId,
					disasterType,
					recipientPhone
				)
				const whatsappReq = await WhatsApp.sendText({
					recipientPhone,
					message: messageText,
				})
				resolve(whatsappReq)
			})
			.catch((err) => {
				reject(err)
			})
	})
}

// Sends the location based card to the user
function sendLocationBasedCard(recipientPhone, disasterType, language) {
	return new Promise(async (resolve, reject) => {
		await getCardLink(recipientPhone, 'whatsapp', language)
			.then(async (res) => {
				let messageText = getLocationBasedText(
					recipientPhone,
					language,
					res?.data?.cardId,
					disasterType
				)
				console.log("Message in location text", messageText)
				const whatsappReq = await WhatsApp.sendText({
					recipientPhone,
					message: messageText,
				})
				resolve(whatsappReq)
			})
			.catch((err) => {
				reject(err)
			})
	})
}

// Sends the location based card to the user
function unsubscribeUser(recipientPhone, language) {
	return new Promise(async (resolve, reject) => {
		await deleteUser(recipientPhone, language)
			.then(async (res) => {
				let messageText = unsubscribeReplies[language]
				const whatsappReq = await WhatsApp.sendText({
					recipientPhone,
					message: messageText,
				})
				resolve(whatsappReq)
			})
			.catch((err) => {
				reject(err)
			})
	})
}

function updateStatus(recipientPhone, deliveryCode, payloads) {
	return new Promise(async (resolve, reject) => {
		const data = await verifyDeliveryCode(recipientPhone, deliveryCode)
		if (data.length > 0) {
			await updateNeedStatus(payloads)
				.then(async (res) => {
					resolve(data)
				})
				.catch((err) => {
					reject(err)
				})
		}
		else {
			reject("Code not found")
		}
	})
}

function rescheduleDeliveryDate(interval, payloads) {
	return new Promise(async (resolve, reject) => {
		try {
			const data = await rescheduleDelivery(interval, payloads);
			resolve(data)
		} catch (error) {
			console.log("Error in Reschedule Delivery", error);
			reject(error)
		}
	})
}

module.exports.handler = async (event, context, callback) => {
	// Webhook handler - This is the method called by Facebook when you verify webhooks for the app
	if (event.httpMethod === 'GET') {
		// Facebook app verification
		if (
			event.queryStringParameters['hub.verify_token'] ===
			'validationtoken' &&
			event.queryStringParameters['hub.challenge']
		) {
			let response = {
				statusCode: '200',
				body: parseInt(
					event.queryStringParameters['hub.challenge']
				),
			}
			context.succeed(response)
		} else {
			let response = {
				statusCode: '400',
				body: JSON.stringify({
					error: event.queryStringParameters['hub.challenge'],
				}),
			}
			context.succeed(response)
		}
	}
	if (event.httpMethod === 'POST') {
		let menuPayload = DEFAULT_LANGUAGE
		try {
			const data = WhatsApp.parseMessage(JSON.parse(event.body))

			if (data.isNotificationMessage) {


				context.succeed({
					statusCode: '200',
					body: 'sucess',
				})


			}
			if (data?.isMessage) {
				let incomingMessage = data.message
				const {
					from: { phone: recipientPhone, name },
					type,
					message_id,
				} = incomingMessage
				console.log("Incoming message", incomingMessage)
				await WhatsApp.markMessageAsRead({ message_id })

				if (type === 'text_message' && ["lmk", "mauinfo"].includes(incomingMessage?.text?.body?.toLowerCase())) {
					const language = incomingMessage?.text?.body?.toLowerCase() === 'lmk' ? 'ur' : 'en'
					await sendLocationBasedCard(recipientPhone, 'region', language).then((data) => {
						let response = {
							statusCode: '200',
							body: 'Success',
						}
						context.succeed(response)
					})
						.catch((err) => {
							let response = {
								statusCode: '400',
								body: err,
							}
							console.log("incoming err", err);
							context.succeed(response)
						})
				}

				if (type === 'text_message' && ["need"].includes(incomingMessage?.text?.body?.toLowerCase())) {
					const language = incomingMessage?.text?.body?.toLowerCase() === 'need' ? 'en' : 'id'
					await sendNeedDisasterCard(recipientPhone, 'need', language).then((data) => {
						let response = {
							statusCode: '200',
							body: 'Success',
						}
						context.succeed(response)
					})
						.catch((err) => {
							let response = {
								statusCode: '400',
								body: err,
							}
							context.succeed(response)
						})
				}

				if (type === 'text_message' && ["unsubscribe", "stopinfo"].includes(incomingMessage?.text?.body?.toLowerCase())) {
					const language = incomingMessage?.text?.body?.toLowerCase() === 'unsubscribe' ? 'en' : 'id'
					await unsubscribeUser(recipientPhone, language).then((data) => {
						let response = {
							statusCode: '200',
							body: 'Success',
						}
						context.succeed(response)
					})
						.catch((err) => {
							let response = {
								statusCode: '400',
								body: err,
							}
							context.succeed(response)
						})
				}

				if (type === 'text_message' && incomingMessage?.text?.body?.toLowerCase().includes('code')) {
					const splitCode = incomingMessage?.text?.body?.split("-")
					const extractNeedIds = splitCode.slice(1)
					const data = await updateStatus(recipientPhone, incomingMessage?.text?.body?.toLowerCase(), extractNeedIds).then(async (data) => {
						await WhatsApp.sendTemplate({
							recipientPhone: recipientPhone,
							template: 'crowdlogistics_donor_acknowledgment',
							languageCode: data[0]['giver_language'] || 'id'
						})
						context.succeed({
							statusCode: '200',
							body: "Success",
						})
					}).catch(async (err) => {
						await WhatsApp.sendText({
							recipientPhone,
							message: 'Invalid code , Please enter the correct code',
						})
						context.succeed({
							statusCode: '200',
							body: err,
						})
					})
				}



				if (type === 'text_message' && ["report", "laporkan"].includes(incomingMessage?.text?.body?.toLowerCase())) {

					switch (incomingMessage?.text?.body?.toLowerCase()) {
						case 'laporkan':
							menuPayload = constructMenuPayload('id')
							break;
						case 'report':
							menuPayload = constructMenuPayload('en')
							break;
						default:
							return
					}
					await WhatsApp.sendRadioButtons({
						recipientPhone,
						...menuPayload,
					})

					let response = {
						statusCode: '200',
						body: 'Success',
					}
					context.succeed(response)
				}

				if (type === 'text_message' && type !== 'quick_reply_message' && !["lmk", "mauinfo", "report", "laporkan", "unsubscribe", "need"].includes(incomingMessage?.text?.body?.toLowerCase()) && !incomingMessage?.text?.body?.toLowerCase().includes('code')) {
					await WhatsApp.sendSimpleButtons({
						message: initiate['id'],
						recipientPhone,
						listOfButtons: [
							{
								title: start['id'],
								id: 'laporkan',
							},
							{
								title: start['en'],
								id: 'report',
							},
						],
					})
					let response = {
						statusCode: '200',
						body: 'Success',
					}
					context.succeed(response)
				}

				if (type === 'simple_button_message') {
					let button_id = incomingMessage.button_reply.id

					switch (button_id) {
						case 'laporkan':
							menuPayload = constructMenuPayload('id')
							break;
						case 'report':
							menuPayload = constructMenuPayload('en')
							break;
						default:
							return
					}
					await WhatsApp.sendRadioButtons({
						recipientPhone,
						...menuPayload,
					})

					let response = {
						statusCode: '200',
						body: 'Success',
					}
					context.succeed(response)
				}

				if (type === 'radio_button_message') {
					const selectionId = incomingMessage.list_reply.id
					let language = DEFAULT_LANGUAGE
					let disasterType = ''
					switch (selectionId) {
						case 'flood':
							disasterType = 'flood'
							language = 'en'
							break
						case 'banjir':
							disasterType = 'flood'
							language = 'id'
							break
						case 'earthquake':
							disasterType = 'earthquake'
							language = 'en'
							break
						case 'gempa':
							disasterType = 'earthquake'
							language = 'id'
							break
						case 'fire':
							disasterType = 'fire'
							language = 'en'
							break
						case 'hutan':
							disasterType = 'fire'
							language = 'id'
							break
						case 'wind':
							disasterType = 'wind'
							language = 'en'
							break
						case 'kencang':
							disasterType = 'wind'
							language = 'id'
							break
						case 'volcano':
							disasterType = 'volcano'
							language = 'en'
							break
						case 'api':
							disasterType = 'volcano'
							language = 'id'
							break
						case 'haze':
							disasterType = 'haze'
							language = 'en'
							break
						case 'asap':
							disasterType = 'haze'
							language = 'id'
							break
						default:
							break
					}
					await sendDisasterCard(recipientPhone, disasterType, language)
						.then((data) => {
							let response = {
								statusCode: '200',
								body: 'Success',
							}
							context.succeed(response)
						})
						.catch((err) => {
							let response = {
								statusCode: '400',
								body: err,
							}
							context.succeed(response)
						})
				}

				if (type === 'quick_reply_message') {
					const payloadSplit = incomingMessage.button.payload.split('-')
					const needIds = payloadSplit[1].split(',')
					const needUserId = payloadSplit[2]
					const needLanguage = payloadSplit[3]

					switch (payloadSplit[0]) {
						case 'one':
							await rescheduleDeliveryDate('one', needIds).then(async (data) => {
								await WhatsApp.sendTemplate({
									recipientPhone: needUserId,
									template: 'crowdlogistics_donor_reschedule',
									message: [data[0][0].promised_date],
									languageCode: needLanguage
								});
								context.succeed({
									statusCode: '200',
									body: "Success",
								})
							}).catch((err) => {
								context.succeed({
									statusCode: '400',
									body: err,
								})
							})
							break;
						case 'two':
							await rescheduleDeliveryDate('two', needIds).then(async (data) => {
								await WhatsApp.sendTemplate({
									recipientPhone: needUserId,
									template: 'crowdlogistics_donor_reschedule',
									message: [data[0][0].promised_date],
									languageCode: needLanguage
								});
								context.succeed({
									statusCode: '200',
									body: "Success",
								})
							}).catch((err) => {
								context.succeed({
									statusCode: '400',
									body: err,
								})
							})
							break;
						default:
							break;
					}

				}
				if (!['text_message', 'radio_button_message', 'simple_button_message', 'quick_reply_message'].includes(type)) {
					await WhatsApp.sendText({
						recipientPhone,
						message: 'Unsupported type , Kindly send a text message',
					})
					let response = {
						statusCode: '200',
						body: "Success",
					}
					context.succeed(response)

				}
			}
		}
		catch (e) {
			console.log("Error while parsing", e)
		}
	}
}
