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

    if (supportsDisplay(handlerInput)) {
      const title = getQuestion(attributes.counter, property, item);
      //const primaryText = new Alexa.RichTextContentHelper().withPrimaryText(getQuestionWithoutOrdinal(property, item)).getTextContent();
      const backgroundImage = new Alexa.ImageHelper().addImageInstance(getBackgroundImage(attributes.quizItem.Abbreviation)).getImage();
      const itemList = [];
      getAndShuffleMultipleChoiceAnswers(attributes.selectedItemIndex, item, property).forEach((x, i) => {
        itemList.push(
          {
            "token" : x,
            "textContent" : new Alexa.PlainTextContentHelper().withPrimaryText(x).getTextContent(),
          }
        );
      });
      response.addRenderTemplateDirective({
        type : 'ListTemplate1',
        token : 'Question',
        backButton : 'hidden',
        backgroundImage,
        title,
        listItems : itemList,
      });
    }

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
    console.log("LOGGG" + JSON.stringify(item));
    const response = handlerInput.responseBuilder;

    //IF THE DATA WAS FOUND
    if (item && item[Object.getOwnPropertyNames(data[0])[0]] !== undefined) {


      if (supportsDisplay(handlerInput)) {
        const title = `Frage über #${item.Year}`;
        const backgroundImage = new Alexa.ImageHelper().addImageInstance(getBackgroundImage()).getImage();
        const primaryText = new Alexa.RichTextContentHelper().withPrimaryText(getSpeechDescription(item)).getTextContent();
  
        response.addRenderTemplateDirective({
          type : 'BodyTemplate2',
          token : 'Question',
          backButton : 'hidden',
          backgroundImage,
          
          title, 
          textContent: primaryText
        });
      }
      
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
      
      if (supportsDisplay(handlerInput)) {
        const title = getQuestion(attributes.counter, property, item);
        //const primaryText = new Alexa.RichTextContentHelper().withPrimaryText(getQuestionWithoutOrdinal(property, item)).getTextContent();
        const backgroundImage = new Alexa.ImageHelper().addImageInstance(getBackgroundImage(attributes.quizItem.Abbreviation)).getImage();
        const itemList = [];
        getAndShuffleMultipleChoiceAnswers(attributes.selectedItemIndex, item, property).forEach((x, i) => {
          itemList.push(
            {
              "token" : x,
              "textContent" : new Alexa.PlainTextContentHelper().withPrimaryText(x).getTextContent(),
            }
          );
        });
        response.addRenderTemplateDirective({
          type : 'ListTemplate1',
          token : 'Question',
          backButton : 'hidden',
          backgroundImage,
          title,
          listItems : itemList,
        });
      }

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
const welcomeMessage = `Welcome to the Football World Cup Quiz Game! You can ask me about a World Cup after 1962 or start the quiz.  What do you want to do?`;
const helpMessage = `I know a lot about the football world championships. You can ask me a specific question or play the quiz. To play the quiz, just say Quiz.`;
const startQuizMessage = `OK.  I will now ask you 10 questions about the World Cup. `;
const exitSkillMessage = `Thanks for stopping by!`;
const errorMessage = `I am sorry, but I do not know that. Can you repeat that?`;
const repromptSpeech = `What else would you like to know?`;

const speechConsCorrect = ['bingo', 'cha ching','bravo'];
const speechConsWrong = ['aw', 'blarg', 'jinx'];

const backgroundImagePath = 'http://smart-home-system.org/wp-content/uploads/2019/03/fussball.jpg';

const data = [
  {Year: "1962",  Champion: "brasil",      Participants:16, Host: "Chile"},
  {Year: "1966",  Champion: "England",        Participants:16, Host: "England"},
  {Year: "1970",  Champion: "brasil",      Participants:16, Host: "Mexiko"},
  {Year: "1974",  Champion: "germany",    Participants:16, Host: "germany"},
  {Year: "1978",  Champion: "argentina",    Participants:16, Host: "argentina"},
  {Year: "1982",  Champion: "Italien",        Participants:24, Host: "Spanien"},
  {Year: "1986",  Champion: "argentina",    Participants:24, Host: "Mexiko"},
  {Year: "1990",  Champion: "germany",    Participants:24, Host: "Italien"},
  {Year: "1994",  Champion: "brasil",      Participants:24, Host: "united states"},
  {Year: "1998",  Champion: "france",     Participants:32, Host: "france"},
  {Year: "2002",  Champion: "brasil",      Participants:32, Host: "South korea and Japan"},
  {Year: "2006",  Champion: "Italy",        Participants:32, Host: "germany"},
  {Year: "2010",  Champion: "brasil",      Participants:32, Host: "South afrika"},
  {Year: "2014",  Champion: "germany",    Participants:32, Host: "brasil"},
  {Year: "2018",  Champion: "france",     Participants:32, Host: "russia"}
];

const states = {
  START: `_START`,
  QUIZ: `_QUIZ`,
};


/** Hilfsfunktionen **/

// returns true if the skill is running on a device with a display (show|spot)
function supportsDisplay(handlerInput) {
  var hasDisplay =
    handlerInput.requestEnvelope.context &&
    handlerInput.requestEnvelope.context.System &&
    handlerInput.requestEnvelope.context.System.device &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display
    console.log("Supported Interfaces are" + JSON.stringify(handlerInput.requestEnvelope.context.System.device.supportedInterfaces));

  return hasDisplay;
}

function getBackgroundImage() {
  return backgroundImagePath;
}


function getBadAnswer(item) {
  return `Unfortunately, I do not know much about ${item}. ${helpMessage}`;
}

function getCurrentScore(score, counter) {
  return `You currently have ${score} of a total of ${counter} points. `;
}

function getFinalScore(score, counter) {
  return `You have a total of ${score} of ${counter} points. `;
}




function formatCasing(key) {
  return key.split(/(?=[A-Z])/).join(' ');
}

function getQuestion(counter, property, item) {
  const   questionPart1 = `Here is your question number ${counter}. `
  if (counter === 0) {
    questionPart1 = ` `
  }
   
  
  if (property ==="Year") {
    return questionPart1 + ` When did the world championship take place in ${item.host}??`;
  } else if (property ==="Champion"){
    return questionPart1 + ` Who won the world championship ${item.Year}?`;
  } else if (property ==="Participants") {
    return questionPart1 + ` How many participants had the world championship ${item.Year}?`;
  } else if (property ==="Host") {
    return questionPart1 + ` Where did the world championship ${item.Year} take place?`;
  }
}

function askQuestion(handlerInput) {
  //Create Random Question
  const random = getRandom(0, data.length - 1);
  const item = data[random];
  const propertyArray = Object.getOwnPropertyNames(item);
  const property = propertyArray[getRandom(1, propertyArray.length - 1)];

  //get Session attributes
  const attributes = handlerInput.attributesManager.getSessionAttributes();

  //Specifying values for the attribute
  attributes.selectedItemIndex = random;
  attributes.quizItem = item;
  attributes.quizProperty = property;
  attributes.counter += 1;

  //save Attributes
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
  if (type) return `<say-as interpret-as='interjection'>${speechConsCorrect[getRandom(0, speechConsCorrect.length - 1)]}! That was correct. </say-as><break strength='strong'/>`;
  return `<say-as interpret-as='interjection'>${speechConsWrong[getRandom(0, speechConsWrong.length - 1)]} . That was not correct. </say-as><break strength='strong'/>`;
}

function getFinalScore(score, counter) {
  return `You have made ${score} points from ${counter}. `;
}

function getSpeechDescription(item) {
  return `The world championship ${item.Year} took place in ${item.Host}, had ${item.Participants} participants and was won by ${item.Champion}. About which World Championship do you want to know more ?`;
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






function getAndShuffleMultipleChoiceAnswers(currentIndex, item, property) {
  return shuffle(getMultipleChoiceAnswers(currentIndex, item, property));
}

// This function randomly chooses 3 answers 2 incorrect and 1 correct answer to
// display on the screen using the ListTemplate. It ensures that the list is unique.
function getMultipleChoiceAnswers(currentIndex, item, property) {

  // insert the correct answer first
  let answerList = [item[property]];

  // There's a possibility that we might get duplicate answers
  // 8 states were founded in 1788
  // 4 states were founded in 1889
  // 3 states were founded in 1787
  // to prevent duplicates we need avoid index collisions and take a sample of
  // 8 + 4 + 1 = 13 answers (it's not 8+4+3 because later we take the unique
  // we only need the minimum.)
  let count = 0
  let upperBound = 12

  let seen = new Array();
  seen[currentIndex] = 1;

  while (count < upperBound) {
    let random = getRandom(0, data.length - 1);

    // only add if we haven't seen this index
    if ( seen[random] === undefined ) {
      answerList.push(data[random][property]);
      count++;
    }
  }

  // remove duplicates from the list.
  answerList = answerList.filter((v, i, a) => a.indexOf(v) === i)
  // take the first three items from the list.
  answerList = answerList.slice(0, 3);
  return answerList;
}

// This function takes the contents of an array and randomly shuffles it.
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  while ( 0 !== currentIndex ) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
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
