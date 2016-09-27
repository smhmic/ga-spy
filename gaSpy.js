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
 * @version 0.7.1
 */

/**
 * @callback gaSpyCb 
 * Function to call whenever `ga()` is called.
 * @param {Array}  a      - Arguments passed to `ga()`. @link https://goo.gl/muCY7Q
 * @param {Object} the    - Provides tracker name, plugin name/method/etc parsed from the command.
 *     @param {Function|undefined} the.callback
 *     @param   {string|undefined} the.command
 *     @param   {string|undefined} the.trackerName
 *     @param   {string|undefined} the.hitType
 *     @param   {string|undefined} the.pluginName
 *     @param   {string|undefined} the.pluginMethodName
 * @param {Object} config - The listener config object.
 * @return {boolean|*} - Return false to prevent command from being passed to analytics.js.
 */

/** 
 * @function gaSpy
 * @param {Object|function} listenerCallback_or_configObj - If function, will be treated as `callback` of 
 *                                                          listener config, otherwise listener config object.
 *     @property {gaSpyCb}  callback  - Function to call whenever `ga()` is called.
 *     @property {string}   gaObjName - The name of the global ga object. Default: "ga".
 * 	   @property {boolean}  debug     - Set true to activate logging and avoid try/catch protection. Default: false.
 *     @property {boolean}  debugLogPrefix - String with which to prefix log messages. Default: "gaSpy".
 */
;window.gaSpy = function gaSpy( listenerCallback_or_configObj ){
  
  /** Listener configuration. **/
  var config = (function( config ){
    listenerCallback_or_configObj = null;
    if( !config.callback || 'function' !== typeof config.callback )
      throw new Error( '['+config.debugLogPrefix+'] Aborting; No listener callback provided.' );
    config.gaObjName = config.gaObjName || window.GoogleAnalyticsObject || 'ga';
    config.debug = !!config.debug;
    config.debugLogPrefix = config.debugLogPrefix || 'gaSpy';
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
    // Parse command according to https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference
    var _commandParts, the = {};
    config.debug && (function(l,i){
      for( l='Intercepted: ga(',i=0; i<a.length; i++ ){
        l += 'string' === typeof a[i] ? '"'+a[i]+'"' : a[i];
        if( i+1<a.length ) l += ', ';
      }
      l += ')';
      log(l);
    })();
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
          the.hitType = a[a.length-1].hitType || a[1];
        if( 'object' === typeof a[a.length-1] ){
          the.trackerName = a[a.length-1].name || the.trackerName;
        }
      }
    }
    log( 'Run listener callback', the );
    if( false === config.callback( a, the, config ) )
      return log( 'Block hit' ) || false;
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
      if( ! processArgs( a ) ) return; 
    }else{ try{ 
      if( ! processArgs( a ) ) return; 
    }catch(ex){}}
    return proxy.gaOrig.apply( proxy.gaOrig, a );
  },
      
  /** 
   * @function hijack
   * Replaces global GA object with a proxy. Assumes global object exists.
   */
  hijack = function(){
    // The current global GA object. Could be the command queue or the loaded GA object.
    var k, gaOrig = proxy.gaOrig = window[gaObjName];
    log( 'Hijack', gaOrig.gaOrig ? '(already hijacked)' : '' );
    // Replace GA object with a proxy.
    window[gaObjName] = proxy;
    // Maintain references to GA's public interface. 
    for( k in gaOrig )
      if( gaOrig.hasOwnProperty( k ) )
        window[gaObjName][k] = gaOrig[k];
  };
    
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
  } else {
    throw new Error( '['+config.debugLogPrefix+'] Aborting; `'+gaObjName+'` not the GA object.' );
  }

};



