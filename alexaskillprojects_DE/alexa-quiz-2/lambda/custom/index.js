/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

/* INTENT HANDLERS */
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {

    return handlerInput.responseBuilder
      .speak(welcomeMessage)
      .reprompt(helpMessage)
      .getResponse();
  },
};

const QuizIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log("Inside QuizHandler");
    console.log(JSON.stringify(request));
    return request.type === "IntentRequest" &&
           (request.intent.name === "QuizIntent" || request.intent.name === "AMAZON.StartOverIntent");
  },
  handle(handlerInput) {
    console.log("Inside QuizHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder;
    attributes.state = states.QUIZ;
    attributes.counter = 0;
    attributes.quizScore = 0;

    var question = askQuestion(handlerInput);
    var speakOutput = startQuizMessage + question;
    var repromptOutput = question;

    const item = attributes.quizItem;
    const property = attributes.quizProperty;


    return response.speak(speakOutput)
                   .reprompt(repromptOutput)
                   .getResponse();
  },
};

const DefinitionHandler = {
  canHandle(handlerInput) {
    console.log("Inside DefinitionHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state !== states.QUIZ &&
           request.type === 'IntentRequest' &&
           request.intent.name === 'AnswerIntent';
  },
  handle(handlerInput) {
    console.log("Inside DefinitionHandler - handle");
    //GRABBING ALL SLOT VALUES AND RETURNING THE MATCHING DATA OBJECT.
    const item = getItem(handlerInput.requestEnvelope.request.intent.slots);
    const response = handlerInput.responseBuilder;

    //IF THE DATA WAS FOUND
    if (item && item[Object.getOwnPropertyNames(data[0])[0]] !== undefined) {

      return response.speak(getSpeechDescription(item))
              .reprompt(repromptSpeech)
              .getResponse();
    }
    //IF THE DATA WAS NOT FOUND
    else
    {
      return response.speak(getBadAnswer(item))
              .reprompt(getBadAnswer(item))
              .getResponse();
    }
  }
};

const QuizAnswerHandler = {
  canHandle(handlerInput) {
    console.log("Inside QuizAnswerHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state === states.QUIZ &&
           request.type === 'IntentRequest' &&
           request.intent.name === 'AnswerIntent';
  },
  handle(handlerInput) {
    console.log("Inside QuizAnswerHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder;

    var speakOutput = ``;
    var repromptOutput = ``;
    const item = attributes.quizItem;
    const property = attributes.quizProperty;
    const isCorrect = compareSlots(handlerInput.requestEnvelope.request.intent.slots, item[property]);

    if (isCorrect) {
      speakOutput = getSpeechCon(true);
      attributes.quizScore += 1;
      handlerInput.attributesManager.setSessionAttributes(attributes);
    } else {
      speakOutput = getSpeechCon(false);
    }

    //speakOutput += getAnswer(property, item);
    var question = ``;
    //IF YOUR QUESTION COUNT IS LESS THAN 10, WE NEED TO ASK ANOTHER QUESTION.
    if (attributes.counter < 10) {
      speakOutput += getCurrentScore(attributes.quizScore, attributes.counter);
      question = askQuestion(handlerInput);
      speakOutput += question;
      repromptOutput = question;

      return response.speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
    }
    else {
      speakOutput += getFinalScore(attributes.quizScore, attributes.counter) + exitSkillMessage;

      return response.speak(speakOutput).getResponse();
    }
  },
};



const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(helpMessage)
      .reprompt(helpMessage)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
      || request.intent.name === 'AMAZON.PauseIntent'  
      || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    //const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(exitSkillMessage)
      //.withSimpleCard('Hello World', speechText)
      .getResponse();
  },
    
};


const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${JSON.stringify(error)}`);
    console.log(`Handler Input: ${JSON.stringify(handlerInput)}`);

    return handlerInput.responseBuilder
      .speak(errorMessage)
      .reprompt(errorMessage)
      .getResponse();
  },
};


//Konstanten

const skillBuilder = Alexa.SkillBuilders.custom();
const welcomeMessage = `Willkommen im Fusball Weltmeisterschaft Quiz Spiel! Du kannst mich über eine WM nach 1962 fragen oder das Quiz beginnen.  Was willst du tun?`;
const helpMessage = `Ich weiß einiges über die Fussball Weltmeisterschaften. Du kannst mir eine genaue Frage stellen oder das Quiz spielen. Um das Quiz zu spielen, sage einfach Quiz.`;
const startQuizMessage = `OK.  Ich werde dir jetzt 10 Fragen zur Fussball Weltmeisterschaft stellen. `;
const exitSkillMessage = `Danke für Vorbeischauen!`;
const errorMessage = `Tut mir leid, aber das kenne ich nicht. Kannst du das wiederholen?`;
const repromptSpeech = `Was würdest du noch gerne wissen?`;

const speechConsCorrect = ['bingo', 'hurra','jawohl'];
const speechConsWrong = ['Schade', 'Mist', 'Kopf hoch'];

const data = [
  {Year: "1962",  Champion: "Brasilien",      Participants:16, Host: "Chile"},
  {Year: "1966",  Champion: "England",        Participants:16, Host: "England"},
  {Year: "1970",  Champion: "Brasilien",      Participants:16, Host: "Mexiko"},
  {Year: "1974",  Champion: "Deutschland",    Participants:16, Host: "Deutschland"},
  {Year: "1978",  Champion: "Argentinien",    Participants:16, Host: "Argentinien"},
  {Year: "1982",  Champion: "Italien",        Participants:24, Host: "Spanien"},
  {Year: "1986",  Champion: "Argentinien",    Participants:24, Host: "Mexiko"},
  {Year: "1990",  Champion: "Deutschland",    Participants:24, Host: "Italien"},
  {Year: "1994",  Champion: "Brasilien",      Participants:24, Host: "Vereinigte Staaten"},
  {Year: "1998",  Champion: "Frankreich",     Participants:32, Host: "Frankreich"},
  {Year: "2002",  Champion: "Brasilien",      Participants:32, Host: "Südkorea und Japan"},
  {Year: "2006",  Champion: "Italien",        Participants:32, Host: "Deutschland"},
  {Year: "2010",  Champion: "Brasilien",      Participants:32, Host: "Südafrika"},
  {Year: "2014",  Champion: "Deutschland",    Participants:32, Host: "Brasilien"},
  {Year: "2018",  Champion: "Frankreich",     Participants:32, Host: "Russland"}
];

const states = {
  START: `_START`,
  QUIZ: `_QUIZ`,
};


/** Hilfsfunktionen **/


function getBadAnswer(item) {
  return `Leider weiß ich über ${item} nicht so viel. ${helpMessage}`;
}

function getCurrentScore(score, counter) {
  return `Du hast aktuell ${score} von insgesamt ${counter} Punkten. `;
}

function getFinalScore(score, counter) {
  return `Du hast insagesamt ${score} von ${counter} Punkten. `;
}

function getQuestion(counter, property, item) {
  const questionPart1 = `Hier ist deine Frage Nummer ${counter}. `
  if (property ==="Year") {
    return questionPart1 + ` Wann fand die WM in ${item.Host} statt?`;
  } else if (property ==="Champion"){
    return questionPart1 + ` Wer gewann die WM   ${item.Year}?`;
  } else if (property ==="Participants") {
    return questionPart1 + ` Wieviele Teilnehmer hatte die WM ${item.Year}?`;
  } else if (property ==="Host") {
    return questionPart1 + ` Wo fand die die WM ${item.Year} statt?`;
  }
}

function askQuestion(handlerInput) {
  //Zufallsfrage erstellen
  const random = getRandom(0, data.length - 1);
  const item = data[random];
  const propertyArray = Object.getOwnPropertyNames(item);
  const property = propertyArray[getRandom(1, propertyArray.length - 1)];

  //Session attribute holen
  const attributes = handlerInput.attributesManager.getSessionAttributes();

  //Werte dem Attribut mitgeben
  attributes.selectedItemIndex = random;
  attributes.quizItem = item;
  attributes.quizProperty = property;
  attributes.counter += 1;

  //Attribute speichern
  handlerInput.attributesManager.setSessionAttributes(attributes);

  const question = getQuestion(attributes.counter, property, item);
  return question;
}

function getRandom(min, max) {
  return Math.floor((Math.random() * ((max - min) + 1)) + min);
}

function compareSlots(slots, value) {
  for (const slot in slots) {
    if (Object.prototype.hasOwnProperty.call(slots, slot) && slots[slot].value !== undefined) {
      if (slots[slot].value.toString().toLowerCase() === value.toString().toLowerCase()) {
        return true;
      }
    }
  }

  return false;
}

function getSpeechCon(type) {
  if (type) return `<say-as interpret-as='interjection'>${speechConsCorrect[getRandom(0, speechConsCorrect.length - 1)]}! </say-as><break strength='strong'/>`;
  return `<say-as interpret-as='interjection'>${speechConsWrong[getRandom(0, speechConsWrong.length - 1)]} </say-as><break strength='strong'/>`;
}

function getFinalScore(score, counter) {
  return `Du hast ${score} Punkte aus ${counter} gemacht. `;
}

function getSpeechDescription(item) {
  return `Die WM ${item.Year} fand statt in  ${item.Host}, hatte ${item.Participants} Teilnehmer und wurde von ${item.Champion} gewonnen. Über welche Weltmeisterschaft willst du noch etwas wissen?`;
}
  
function getItem(slots) {
  const propertyArray = Object.getOwnPropertyNames(data[0]);
  let slotValue;

  for (const slot in slots) {
    if (Object.prototype.hasOwnProperty.call(slots, slot) && slots[slot].value !== undefined) {
      slotValue = slots[slot].value;
      for (const property in propertyArray) {
        if (Object.prototype.hasOwnProperty.call(propertyArray, property)) {
          const item = data.filter(x => x[propertyArray[property]]
            .toString().toLowerCase() === slots[slot].value.toString().toLowerCase());
          if (item.length > 0) {
            return item[0];
          }
        }
      }
    }
  }
  return slotValue;
}


exports.handler = skillBuilder
.addRequestHandlers(
  LaunchRequestHandler,
  QuizIntentHandler,
  DefinitionHandler,
  QuizAnswerHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  SessionEndedRequestHandler
)
.addErrorHandlers(ErrorHandler)
.lambda();
