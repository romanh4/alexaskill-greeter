exports.handler = function(event, context) {

	var request = event.request;

	try {
		let options = {} //lokales Objekt
		switch (event.request.type){
			case "LaunchRequest":
				//let options = {} //lokales Objekt
				options.speechText = "Willkommen im Hello World Skill. Wen soll ich grüßen?";  //Wird dem Nutzer zuerst vorgelesen
				options.repromptText = "Du kannst einen Namen nennen oder mir sagen, wen ich grüßen soll."; //wird nur vorgelesen, wenn der Nutzer > 8 Sekunden nicht reagiert 
				options.endSession = false;
				context.succeed(buildResponse(options)); // context-Objekt zum Aufruf
				break;
			case "IntentRequest":
				//let options = {} //lokales Objekt
				switch (request.intent.name){
					case "HelloIntent":
						let name = request.intent.slots.Name.value;
						options.speechText = "Hello" + name + ".";
						//options.speechText += getWish();
						options.endSession = true;
						// options.repromptText // kein reprompt, da Skill beendet
						context.succeed(buildResponse(options));
						break;
					default:
						context.fail("Unknown intent");
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

function buildResponse(options) {
	var response = {
		version: "1.0",
		response: {
			outputSpeech: {
				type: "SSML",
				ssml: "<speak>"+options.speechText+"</speak>" }, 
				shouldEndSession: options.endSession
			} 
		}; 
		return response;
	}

function getWish() {
		var myDate = new Date();
		var hours = myDate.getUTCHours() - 8;  //fixe Zeitzone = Pazifik 
		if (hours < 0) {
			hours = hours + 24;
	}
	if (hours < 12) {
		return "Guten Morgen"
	} else if (hours < 18) {
		return "Guten Tag"
	} else {
		return "Guten Abend"
	}
}