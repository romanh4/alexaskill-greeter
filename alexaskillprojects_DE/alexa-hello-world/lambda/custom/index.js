'use strict';
var https = require('https');
	
exports.handler = function(event, context) {

	var request = event.request;

	try {

		let options = {} //local object
		switch (event.request.type){
			case "LaunchRequest":
				options.speechText = welcomeMessage;
				options.repromptText = 
				options.endSession = false;
				context.succeed(getResponse(options));
				break;
			case "IntentRequest":
			    //console.log('IntentRequest');
				switch (request.intent.name){
					case "HelloIntent":
					    
						let name = request.intent.slots.Name.value;
						options.speechText = hello + "<emphasis level='strong'>" + name + "</emphasis>."
						options.speechText += getGreeting() + ".";
						options.speechText += quoteAnnouncement;

						getQuote(function(quote, error){
							if (error) {
								context.fail(error) //try catch won't catch this, it's asynchronous
							} else {
								
								options.speechText += quote;
								options.endSession = true;
								options.cardTitle = cardTitle
								options.cardContent = options.speechText
								// options.repromptText // kein reprompt, da Skill beendet
								context.succeed(getResponse(options));
							}
						});
						
						break;
					default:
						context.fail(unknownIntent);
						break;
				}
			case "SessionEndedRequest":
				// Session Ending
				endSession: true
				break;
			default:
				context.fail(`INVALID REQUEST TYPE: ${event.request.type}`);
			}
		} catch(error) {
			context.fail("Exception:" + error);
		}
		
}

function getResponse(options) {
	var response = {
		version: "1.0",
		response: {
			outputSpeech: {
				type: "SSML",
				ssml: "<speak>" +options.speechText+ "</speak>" }, 
				shouldEndSession: options.endSession
			} 
		}; 

		if(options.cardTitle) {
			
			response.response.card = {
			  type: "Simple",
			  title: options.cardTitle,
			  text: options.cardContent
			}
		
			if(options.imageUrl) {
			  response.response.card.type = "Standard";
			  response.response.card.text = options.cardContent;
			  response.response.card.image = {
				smallImageUrl: options.imageUrl,
				largeImageUrl: options.imageUrl
			  };
		
		}
			
		}
		return response;
	
}

function getGreeting() {
		var myDate = new Date();
		var hours = myDate.getUTCHours(); 
		if (hours < 0) {
			hours = hours + 24;
	}
	if (hours < 12) {
		return goodMorning
	} else if (hours < 18) {
		return goodDay
	} else {
		return goodEvening
	}
}


function getQuote(callback) {	
var url = 'https://api.chucknorris.io/jokes/random';
var req = https.get(url, function(res){ 
	var body = "";
	res.on('data', function(chunk) {
		body += chunk; //build response
	});
	res.on('end', function(chunk) {
		var quote = JSON.parse(body);
		callback(quote.value); 
		});
	}); 
		req.on('error', function(error){
		//hier Fehlerbehandlung
		callback('', error)	
	});
}

const welcomeMessage =  `Willkommen im Hello World Skill. Wen soll ich grüßen? `;
const repromptSpeech =  `Du kannst einen Namen nennen oder mir sagen, wen ich grüßen soll. `; //wird nur vorgelesen, wenn der Nutzer > 8 Sekunden nicht reagiert 
const hello = `Servus`;
const quoteAnnouncement = `Ich habe ein neues Zitat für dich. Chuck sagt: `;
const goodMorning = `Guten Morgen`;
const goodDay = `Guten Tag`;
const goodEvening = `Guten Abend`;
const unknownIntent = `Nicht bekannt`;
const cardTitle = "Chuck's Zitat für dich";

const useCardsFlag = true;