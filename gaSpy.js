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
 * @author Stephen M Harris <smhmic@gmail.com>
 * @version 0.6.0
 */

(
/** 
 * @function gaSpy
 * @param {Object|function} listenerCallback_or_configObj
 * 			  If function, will be treated as `callback` of listener config, otherwise listener config object.
 * 				@property {function} callback
 * 			  @property {string} gaObjName - The name of the global ga object. Default: "ga".
 */
function gaSpy( listenerCallback_or_configObj ){
  
  /** Listener configuration. **/
  var config = (function( config ){
    listenerCallback_or_configObj = null;
    if( !config.callback || 'function' !== typeof config.callback )
      throw new Error( '[gaSpy] Aborting; No listener callback provided.' );
    config.gaObjName = config.gaObjName || window.GoogleAnalyticsObject || 'ga';
    return config;
  })('function' === typeof listenerCallback_or_configObj
    ? { 'callback' : listenerCallback_or_configObj }
    : listenerCallback_or_configObj ),
  
  /** Temp vars for processing GA command queue. */
  q, i,
   
  /** The name of the global ga object. */
  gaObjName = config.gaObjName,
  
  /** The global ga object. */
  ga = window[gaObjName],

  /** Permit use of `console` cross-browser. */
  console = window.console || {error : function(){}},

  /**
   * @function processArgs
   * Processes each set of arguments passed to `ga()`.
   * @param   {Array} a - Array of arguments passed to `ga()`.
   * @returns {boolean} - Returns false to indicate that `ga()` should
   *                      should not be called for this set of arguments.
   */
  processArgs = function( a ){
    // Parse command according to https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference
    var _commandParts, the = {};
    if( 'function' === typeof a[0] ){
      the.callback = a[0];
    }else if( a[0] && a[0].split ){
      _commandParts = a[0].split( '.', 1 );
      the.trackerName = _commandParts.length > 1 ? _commandParts[0] : 't0';
      the.command = _commandParts.length > 1 ? _commandParts[1] : _commandParts[0];
      _commandParts  = _commandParts[ _commandParts.length-1 ].split( ':' );
      the.pluginName = _commandParts.length > 1 ? _commandParts[0] : undefined;
      the.pluginMethodName = _commandParts.length > 1 ? _commandParts[1] : undefined;
      if( the.command === 'require' || the.command === 'provide' ){
        the.pluginName = a[1];
        if( the.command === 'provide' ) the.pluginConstructor = a[2];
      }else if( 'object' === typeof a[a.length-1] ){
        the.trackerName = a[a.length-1].name || the.trackerName;
      }
    }
    // Automatically allow (do not call listener) commands that come from GTM.
    if( the.trackerName.substr( 0, 3 ) === 'gtm' ) return true;
    // Call listener; return false only if listener returns false.
    return false !== config.callback( a, the, config );
  },
      
  /**
   * @function proxy
   * The function that will replace `ga()`.  Passes arguments to processArgs; if
   *   processArgs returns false also passes arguments to `ga()`.
   * @member  {Object} gaOrig - The original `ga()` object.
   * @returns {*|boolean}     - Returns false to indicate that `ga()` should
   *                            should not be called for this set of arguments.
   */
  proxy = function(){
    var a = [].slice.call( arguments );
    try { if( processArgs( a ) === false ) return; 
    } catch( ex ){ console.error( ex ) }
    return proxy.gaOrig.apply( proxy.gaOrig, a );
  },
      
  /** 
   * @function hijack
   * Replaces global GA object with a proxy. Assumes global object exists.
   */
  hijack = function(){
    // The current global GA object.  Could be the command queue or the loaded GA object.
    var k, gaOrig = proxy.gaOrig = window[gaObjName];
    // Replace GA object with a proxy.
    window[gaObjName] = proxy;
    // Maintain references to GA's public interface. 
    for( k in gaOrig )
      if( gaOrig.hasOwnProperty( k ) )
        window[gaObjName][k] = gaOrig[k];
  };
  
  if( !ga ){ // Instantiate GA command queue a la UA snippet.
    ga = window[gaObjName] = function(){
      (window[gaObjName].q = window[gaObjName].q || []).push( arguments ); };
    ga.l = 1 * new Date();
  }

  if( ga.getAll ){ // GA already loaded; cannot see previous commands.
    hijack();
  } else if( ga.l ){ // UA snippet ran, but GA not loaded.
    if( ga.q ){
      // Apply listener for each item in the command queue.
      for( q = [], i = 0; i < ga.q.length; i++ )
        if( processArgs( [].slice.call( ga.q[i] ) ) )
          q.push( ga.q[i] );
      ga.q = q;
    } else { ga.q = []; } // No commands queued yet; instantiate queue.
    ga( hijack ); // Set a trap to re-hijack once GA is loaded.
    hijack(); // Hijack the command queue.
  } else {
    throw new Error( '[gaSpy] Aborting; `'+gaObjName+'` not the GA object.' );
  }

})( function( a, the, config ){ 
  /** @var [Array]  a      - arguments passed to `ga()` **/
  /** @var [Object] the    - parsed hit data; provides tracker name, plugin name/method/etc. **/
  /** @var [Object] config - The listener config object. **/
    
  // RETURN FALSE to prevent original hit from firing.
  // By default, the original hit fires just as it normally would.

  // ARGUMENTS passed to the GA object are available in the array `a`.
  // See GA documentation for parameter formats: https://goo.gl/muCY7Q

  // EXAMPLES: https://git.io/vK4VJ

  //   v  v  v  CUSTOM CODE GOES HERE  v  v  v  
  
  
  console.debug.apply( console, a ); // FOR DEBUGGING
  

  //   ^  ^  ^  CUSTOM CODE END  ^  ^  ^   

} );