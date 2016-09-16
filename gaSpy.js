/**
 * Spy on calls to Google's Universal Analytics (analytics.js) library.
 * 
 * Built with GTM in mind, but can be used for other TMSes or custom JS.
 * 
 * Intended to piggyback and/or block external (non-GTM-based) tracking (i.e.
 * on-page code, plugins/platforms with built-in tracking, etc), in order to:
 *  - leverage benefits of GTM for non-GTM-based tracking
 *  - override naming system of external tracking with custom conventions
 *  - integrate external tracking with your measurement implementation
 * 
 * NOTE: This is as reliable as any custom code, including dataLayer snippets.
 * Performance impact is minimal. But it's preferable to migrate/modify/remove 
 * the external tracking, for a cleaner implementation. This code is provided 
 * for cases where editing the external code is not an option.
 *
 * NOTE: In order to spy on commands that fire immediately / page load/ready,
 * this must run before the code that loads analytics.js.
 * 
 * @see https://gist.github.com/smhmic/492213ea74bb47c5878b
 * @author Stephen M Harris <smhmic@gmail.com>
 * @version 0.4
 */
(function spyGoogleAnalytics( callback ){

   var
    gaObjName = window.GoogleAnalyticsObject || 'ga',
    ga        = window[gaObjName],
    console   = window.console || {error:function(){}},
    k, q, i,
    
    // Processes each set of arguments sent to GA object.
    // If returns false, arguments will not be passed through to GA object.
    handler = function( args ){ try{
      // If command is not via GTM Tag, return result of custom code.
      return ( args[0] && args[0].substr && args[0].substr( 0, 4 ) == 'gtm.' )
          || ( false !== callback( args ) );
    }catch(ex){ console.error(ex) } },
    
    // Spy on the GA object.
    spy = function(){
       var a, gaOrig = window[gaObjName];
       // Replace GA object with a proxy.
       window[gaObjName] = function(){
          if( handler( a = [].slice.call( arguments ) ) )
          // If command is via GTM Tag or custom code does not return false, 
          // pass through to GA command queue.
             return gaOrig.apply( gaOrig, a );
       };
       // Ensure methods/members of GA object remain accessible on the proxy. 
       for( k in gaOrig )
          if( gaOrig.hasOwnProperty( k ) )
             window[gaObjName][k] = gaOrig[k];
    };
   
   if( ! ga ){
      // Instantiate GA command queue a la UA snippet.
      ga = window[gaObjName] = function(){
         (window[gaObjName].q=window[gaObjName].q||[]).push( arguments ); };
      ga.l = 1 * new Date();
   }
      
   if( ga.getAll ){ // GA already loaded; cannot see previous commands.
      spy();
   } else if( ga.l ){ // UA snippet ran, but GA not loaded.
      if( ga.q ){
         // Run all existing command queue items through custom code.
         for( q=[], i = 0; i < ga.q.length; i++ )
            if( handler( [].slice.call( ga.q[i] ) ) )
               q.push( ga.q[i] );
         ga.q = q;
      } else {
         // No commands queued yet, instantiate queue.
         ga.q = [];
      }
      ga( spy );
      spy();
   } else { 
      throw new Error('spyGoogleAnalytics aborting; '
                      +'`'+gaObjName+'` not the GA object.' );
   }

})(function( a ){ 
    /** @var [Array] a - arguments passed to `ga()` **/
     
    //   v  v  v  CUSTOM CODE GOES HERE  v  v  v  
     
    // RETURN FALSE to prevent original hit from firing.
    // By default, the original hit fires just as it normally would.

    // ARGUMENTS passed to the GA object are available in the array `a`.
    // See GA documentation for parameter formats: https://goo.gl/muCY7Q
     
    // FOR DEBUGGING: console.debug.apply( console, a );
    
    // EXAMPLES: https://git.io/vK4VJ
    


    //   ^  ^  ^  CUSTOM CODE END  ^  ^  ^   
   
 });