// en.js
module.exports = {
  translation : {
      'SKILL_NAME' : 'Super Welcome', // <- can either be a string...
      'GREETING' : [                  // <- or an array of strings.
          'Hello there',
          'Hey',
          'Hi!'
      ],
      'GREETING_WITH_NAME' : [
          'Hey %s',         // --> That %s is a wildcard. It will
          'Hi there, %s',   //     get turned into a name in our code.
          'Hello, %s'       //     e.g. requestAttributes.t('GREETING_WITH_NAME', 'Andrea')
      ],
      // ...more...
  }
}
  

//ASK - CLI
npm i —save i18next i18next-sprintf-postprocessor

// index.js
const i18n = require('i18next'); 
const sprintf = require('i18next-sprintf-postprocessor'); 
// further down the index.js 
const languageStrings = { 'en' : require('./i18n/en'), 'it' : require('./i18n/it'), // ... etc }

  // inside the index.js
const LocalizationInterceptor = {
  process(handlerInput) {
      const localizationClient = i18n.use(sprintf).init({
          lng: handlerInput.requestEnvelope.request.locale,
          fallbackLng: 'en', // fallback to EN if locale doesn't exist
          resources: languageStrings
      });

      localizationClient.localize = function () {
          const args = arguments;
          let values = [];

          for (var i = 1; i < args.length; i++) {
              values.push(args[i]);
          }
          const value = i18n.t(args[0], {
              returnObjects: true,
              postProcess: 'sprintf',
              sprintf: values
          });

          if (Array.isArray(value)) {
              return value[Math.floor(Math.random() * value.length)];
          } else {
              return value;
          }
      }

      const attributes = handlerInput.attributesManager.getRequestAttributes();
      attributes.t = function (...args) { // pass on arguments to the localizationClient
          return localizationClient.localize(...args);
      };
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
    .addRequestHandlers(
        // your intent handlers here
    )
    .addRequestInterceptors(LocalizationInterceptor) // <-- ADD THIS LINE
    .addErrorHandlers(ErrorHandler)
    .lambda();
};
