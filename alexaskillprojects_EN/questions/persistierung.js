const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return new Promise((resolve, reject) => {
      handlerInput.attributesManager.getPersistentAttributes()
        .then((attributes) => {  //Aufruf erfolgreich
          const { savedAttributes } = attributes;

          attributes.position = {
            'info': 'zustand'
          };

          handlerInput.attributesManager.setPersistentAttributes(attributes);
          handlerInput.attributesManager.savePersistentAttributes();

          let speechText = WELCOME_MESSAGE;

          resolve(handlerInput.responseBuilder
            .speak(speechText)
            .getResponse());
        })
        .catch((error) => { 
          console.log(error);
          reject(error);
        }); }); },  };

  


const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: 'skillTable',
  createTable: true
});




const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    // list of the handlers
  )
  .withPersistenceAdapter(persistenceAdapter) // <--
  .addErrorHandlers(ErrorHandler)
  .lambda();


  