//
// Illustrates a muti-threaded conversation
//
// Q: "How about some coffee (yes / no / cancel)"
// A: no
// Q: "What would you like to drink instead..?"
// A: Coke
//
const { BotkitConversation } = require( 'botkit' );

module.exports = function (controller) {

    const convo = new BotkitConversation( 'restaurants_chat', controller );

    convo.ask( 'What kind of food are you looking for? (fast food / casual / fine dining)', [
        {
            pattern: "fast food|casual|fine dining|doesn't matter|any",
            handler: async ( response, convo ) => {

                await convo.gotoThread( 'ask_zip' );
            }, 
        },
        {
            pattern: "no",
            handler: async ( response, convo ) => {

                await convo.gotoThread( 'ask_drink' );
            }
        },
        {
            pattern: 'cancel|stop|exit|nevermind',
            handler: async ( response, convo ) => {

                await convo.gotoThread( 'cancel' );
            }
        },
        {
            default: true,
            handler: async ( response, convo ) => {
                await convo.gotoThread( 'bad_response' );
            }
        }
    ],'statedType');

    convo.addMessage( {
        text: 'Ah...I seem to be fresh out!',
        action: 'complete'
    }, 'confirm' );

    convo.addMessage( {
        text: 'Got it...cancelling',
        action: 'complete'
    }, 'cancel' );

    convo.addMessage( {
        text: 'Sorry, I did not understand!\nTip: try "yes", "no", or "cancel"',
        action: 'default'
    }, 'bad_response' );

    // Thread: ask for a drink
    convo.addQuestion( 'Please tell me your 5 digit zip code', [], 'statedZip', 'ask_zip' );
    convo.addMessage( 'Excellent! Here are all the {{vars.statedType}} restaurants I found near {{ vars.statedZip }}: \n -McDonalds \n -Burger King \n -Subway', 'ask_zip' );

    controller.addDialog( convo );

    controller.hears( 'restaurants near me| restaurants', 'message,direct_message', async ( bot, message ) => {

        await bot.beginDialog( 'restaurants_chat' );
    });

    controller.commandHelp.push( { command: 'restaurants', text: 'Simple dialog example with threads' } );

}