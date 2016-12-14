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
 * @version 0.9
 */

/**
 * @callback gaSpyCb 
 * Function to call whenever `ga()` is called.
 * @param {Object} event  - Provides original and parsed command arguments.
 *   @param {Array}  event.args - Arguments passed to `ga()`. @link https://goo.gl/muCY7Q
 *   @param {Object} event.the  - Provides tracker name, plugin name/method/etc parsed from the command.
 *     @param {Function|undefined} event.the.callback
 *     @param   {string|undefined} event.the.command
 *     @param   {string|undefined} event.the.trackerName
 *     @param   {string|undefined} event.the.hitType
 *     @param   {string|undefined} event.the.pluginName
 *     @param   {string|undefined} event.the.pluginMethodName
 * @return {boolean|*} - Return false to prevent command from being passed to analytics.js.
 */

/** 
 * @function gaSpy - Listener for commands passed to the UA library.
 * @param {Object|function} listenerCallback_or_configObj - If function, will be treated as `callback` of 
 *                                                          listener config, otherwise listener config object.
 *     @property {gaSpyCb}  callback  - Function to call whenever `ga()` is called.
 *     @property {string}   gaObjName - The name of the global ga object. Default: "ga".
 * 	   @property {boolean}  debug     - Set true to activate logging and avoid try/catch protection. Default: false.
 *     @property {boolean}  debugLogPrefix - String with which to prefix log messages. Default: "gaSpy".
 */
;window.gaSpy = window.gaSpy || function gaSpy( listenerCallback_or_configObj ){
  
  /** Listener configuration. **/
  var config = (function( config ){
    listenerCallback_or_configObj = null;
    config.debugLogPrefix = config.debugLogPrefix || 'gaSpy';
    config.debug = !!config.debug;
    if( !config.callback || 'function' !== typeof config.callback ){
      if( config.debug )
        throw new Error( '[' + config.debugLogPrefix + '] Aborting; No listener callback provided.' );
      config.callback = function(){};
    }
    config.gaObjName = config.gaObjName || window.GoogleAnalyticsObject || 'ga';
    return config;
  })('function' === typeof listenerCallback_or_configObj
    ? { 'callback' : listenerCallback_or_configObj }
    : listenerCallback_or_configObj ),
   
  /** The name of the global ga object. */
  gaObjName = config.gaObjName,
  
  /** The global ga object. */
  ga = window[gaObjName],

  /** Log to `console` (if supported by browser). */
  log = window.console && config.debug
    ? function(){var a=[].slice.call(arguments);a.unshift('['+config.debugLogPrefix+']');console.log.apply(console,a)} 
    : function(){},

  /**
   * @function processArgs
   * Processes each set of arguments passed to `ga()`.
   * @param   {Array} a - Array of arguments passed to `ga()`.
   * @returns {boolean} - Returns false to indicate this command should be blocked.
   */
  processArgs = function( a ){
    var _commandParts, ev = { args:a, the:{} }, the = ev.the;
    config.debug && (function(l,i){
      for( l='Intercepted: ga(',i=0; i<a.length; i++ ){
        l += 'string' === typeof a[i] ? '"'+a[i]+'"' : a[i];
        if( i+1<a.length ) l += ', ';
      }
      l += ')';
      log(l);
    })();
    // Parse command according to https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference
    if( 'function' === typeof a[0] ){
      the.callback = a[0];
    }else if( a[0] && a[0].split ){
      _commandParts = a[0].split( '.' );
      the.trackerName = _commandParts.length > 1 ? _commandParts[0] : 't0';
      the.command = _commandParts.length > 1 ? _commandParts[1] : _commandParts[0];
      _commandParts  = _commandParts[ _commandParts.length-1 ].split( ':' );
      the.pluginName = _commandParts.length > 1 ? _commandParts[0] : undefined;
      the.pluginMethodName = _commandParts.length > 1 ? _commandParts[1] : undefined;
      if( the.command === 'require' || the.command === 'provide' ){
        the.pluginName = a[1];
        if( the.command === 'provide' ) the.pluginConstructor = a[2];
      }else{
        if( the.command === 'send' )
          the.hitType = ( a[a.length-1] && a[a.length-1].hitType ) || a[1];
        if( 'object' === typeof a[a.length-1] ){
          the.trackerName = a[a.length-1].name || the.trackerName;
        }
      }
    }
    log( 'Run listener callback', the );
    if( false === config.callback( ev ) )
      return false;
    else return true;
  },
      
  /**
   * @function proxy
   * The function that will replace `ga()`.  Passes arguments to processArgs; if
   *   processArgs returns false also passes arguments to `ga()`.
   * @member  {Object} gaOrig - The original `ga()` object.
   */
  proxy = function(){
    var a = [].slice.call( arguments );
    if( config.debug ){ 
      if( ! processArgs( a ) ) return log( 'Command blocked.' ); 
    }else{ try{ 
      if( ! processArgs( a ) ) return; 
    }catch(ex){}}
    log( 'Command allowed:', a );
    return proxy._gaOrig.apply( proxy._gaOrig, a );
  },
      
  /** 
   * @function hijack
   * Replaces global GA object with a proxy. Assumes global object exists.
   */
  hijack = function(){
    // The current global GA object. Could be the command queue or the loaded GA object.
    var k, gaOrig = proxy._gaOrig = window[gaObjName];
    log( 'Hijack', gaOrig._gaOrig ? '(already hijacked)' : '' );
    // Replace GA object with a proxy.
    window[gaObjName] = proxy;
    // Maintain references to GA's public interface. 
    for( k in gaOrig )
      if( gaOrig.hasOwnProperty( k ) )
        window[gaObjName][k] = gaOrig[k];
  },
      
  q, i;
    
  log( 'Config:', config );
    
  if( !ga ){ // Instantiate GA command queue a la UA snippet.
    log( 'Instantiate GA command queue' );
    ga = window[gaObjName] = function(){
      (window[gaObjName].q = window[gaObjName].q || []).push( arguments ); };
    ga.l = 1 * new Date();
  }

  if( ga.getAll ){
    log( 'GA already loaded; cannot see previous commands' );
    hijack();
  } else if( ga.l ){
    log( 'Command queue instantiated, but library not yet loaded' );
    if( ga.q && ga.q.length ){
      log( 'Applying listener to',ga.q.length,' queued commands' );
      for( q = [], i = 0; i < ga.q.length; i++ )
        if( processArgs( [].slice.call( ga.q[i] ) ) )
          q.push( ga.q[i] );
      ga.q = q;
    } else { ga.q = []; }
    ga( hijack ); // Set a trap to re-hijack once GA is loaded.
    hijack(); // Hijack the command queue.
  } else if( config.debug ) {
    throw new Error( '['+config.debugLogPrefix+'] Aborting; `'+gaObjName+'` not the GA object.' );
  }

};



