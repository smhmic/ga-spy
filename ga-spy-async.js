/**
 * Spy on asynchronous calls to Google's Traditional Analytics (ga.js) library.
 * 
 * Built with GTM in mind, but can be used for other TMSes or custom JS.
 * 
 * Intended to piggyback and/or block external (non-GTM-based) tracking (i.e.
 * on-page code, plugins/platforms with built-in tracking, etc), in order to:
 *  - leverage benefits of GTM for non-GTM-based tracking
 *  - override naming system of external tracking with custom conventions
 *  - integrate external tracking with your measurement implementation
 *  
 * NOTE: NOT THOROUGHLY TESTED.
 * 
 * NOTE: This is as reliable as any custom code, including dataLayer snippets.
 * Performance impact is minimal. But it's preferable to migrate/modify/remove 
 * the external tracking, for a cleaner implementation. This code is provided 
 * for cases where editing the external code is not an option.
 *
 * NOTE: In order to spy on commands that fire immediately / page load/ready,
 * this must run before the code that loads ga.js.
 * 
 * @see https://gist.github.com/smhmic/492213ea74bb47c5878b
 * @author Stephen M Harris <smhmic@gmail.com>
 * @version 0.0.1
 */
(function spyGoogleAnalytics( callback ){

   var
    gaqObjName = '_gaq',
    _gaq       = window[gaqObjName],
    console    = window.console || {error:function(){}},
    k, i,
    
    // Processes each set of arguments sent to _gaq.push.
    // If returns false, arguments will not be passed through to _gaq.push.
    handler = function( a ){ try{
      // If command is not via GTM Tag, return result of custom code.
      return ( a[0] && a[0][0] && a[0][0].substr && a[0][0].substr( 0, 3 ) == 'gtm' )
          || ( false !== callback( a ) );
    }catch(ex){ console.error(ex) } },
    
    // Process array of push'ed args, and return filtered array.
    processArgSet = function( arr ){
       var aFiltered = [];
       for( i=0; i< arr.length; i++ )
          if( handler( arr[i] ) )
            aFiltered.push( arr[i] );
       return aFiltered;
    },
    
    // Spy on the _gaq.push function.
    spy = function(){
       var gaqPushOrig = window[gaqObjName].push;
       // Replace _gaq.push with a proxy.
       window[gaqObjName].push = function(){
          var aFiltered = processArgSet( [].slice.call( arguments ) );
          // If some args passing through, or no args were passed,
          //  pass through to _gaq.push.
          if( !arguments.length || aFiltered.length )
             return gaqPushOrig.apply( window[gaqObjName], aFiltered );
       };
       // Ensure methods/members of _gaq.push remain accessible on the proxy. 
       for( k in gaqPushOrig )
          if( gaqPushOrig.hasOwnProperty( k ) )
             window[gaqObjName].push[k] = gaqPushOrig[k];
    };
   
   if( ! _gaq ){
      // Instantiate GA command queue a la GA Async snippet.
      _gaq = window[gaqObjName] = [];
   }
      
   if( window._gat ){ // GA already loaded; cannot see previous commands.
      spy();
   } else if( _gaq.slice ){ // GA snippet ran, but GA not loaded.
      // Filter all existing command queue items through custom code.
      _gaq = window[gaqObjName] = processArgSet( _gaq );
      _gaq.push( spy );
      spy();
   } else { 
      throw new Error('spyGoogleAnalytics aborting; '
                      +'`'+gaqObjName+'` not the GA object.' );
   }

})(function( a ){ 
    /** @var [Array] a - The arguments pushed onto `_gaq` **/
     
    //   v  v  v  CUSTOM CODE GOES HERE  v  v  v  
     
    // RETURN FALSE to prevent original hit from firing.
    // By default, the original hit fires just as it normally would.

    // ARGUMENTS passed to the GA object are available in the array `a`.
    // See GA documentation for parameter formats: https://goo.gl/muCY7Q
     
    // FOR DEBUGGING: console.debug.apply( console, a );
    
    // EXAMPLES: https://git.io/vK4VJ
    


    //   ^  ^  ^  CUSTOM CODE END  ^  ^  ^   
   
 });