/**
 * GA Spy configuration.
 * https://github.com/smhmic/gaSpy#configuration
 */
function(){
  return {
    
    // Function to call whenever `ga()` is called.
    'callback' : function( args, the ){
      
      //
      //   Your custom code goes here. 
      //   Return false to prevent command from being passed to analytics.js.
      //   Examples: https://git.io/vijBP
      //
      //   IMPORTANT: If this code triggers a UA hit tag, it will also re-run this callback.
      //   Be careful not to cause an infinite loop.
      //
      
    }
    
    // Activates low-level ga-spy debug logging.
    //,'debug' : true
    
    // The name of the global ga object.
    //,'gaObjName' : 'ga'
    
  }
}