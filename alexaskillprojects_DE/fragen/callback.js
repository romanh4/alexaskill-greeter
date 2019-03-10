/**
 * Callback: Basics
 */
// Execute the function "doThis" with another function as parameter, in this case "andThenThis". doThis will execute whatever code it has and when it finishes it should have "andThenThis" being executed.
doThis(andThenThis)
// Inside of "doThis" it's referenced as "callback" which is just a variable that is holding the reference to this function
function andThenThis() {
  console.log('and then this')
}
// You can name it whatever you want, "callback" is common approach
function doThis(callback) {
  console.log('this first')
  
  // the '()' is when you are telling your code to execute the function reference else it will just log the reference
  callback()
}


/**
 * Callback: ASK-SDK v1
 */ 
var https = require('https');


getQuote(function(quote, error){
    if (error) {
    context.fail(error) //try catch won't catch this, it's asynchronous
    } else {
    options.speechText += quote;
    options.endSession = true;
    options.cardTitle = cardTitle
            options.cardContent = options.speechText
            // options.repromptText 
    // kein reprompt, da Skill beendet
            context.succeed(getResponse(options));
            }
    });

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
        
    
/**
 * Callback: ASK-SDK v2
 */ 

