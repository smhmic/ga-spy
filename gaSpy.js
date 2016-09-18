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
 * @version 0.5.2
 */

(
/** @param {function} listener - The function to execute when `ga()` is called. */
function gaSpy( listener ){

	/** Temp vars for processing GA command queue. */
	var q, i,
	 
	/** The name of the global ga object. */
	gaObjName = window.GoogleAnalyticsObject || 'ga',
	
	/** The global ga object. */
	ga = window[gaObjName],

	/** Permit use of `console` cross-browser. */
	console = window.console || {error : function(){}},

	/**
	 * Processes each set of passed to `ga()`.
	 * @param {Array} a     - Array of arguments passed to `ga()`.
	 * @returns {*|boolean} - Returns false to indicate that `ga()` should
	 *                        should not be called for this set of arguments.
	 */
	processArgs = function( a ){
		try { 
			return ( a[0] && a[0].substr && a[0].substr( 0, 3 ) == 'gtm' ) 
			       || ( a[a.length-1] && a[a.length-1].name && a[a.length-1].name.substr && a[a.length-1].name.substr( 0, 3 ) == 'gtm' )
			       || ( false !== listener( a ) );
		} catch( ex ){ console.error( ex ) }
	},
	    
	/**
	 * The function that will replace `ga()`.  Passes arguments to processArgs; if
	 *   processArgs returns false also passes arguments to `ga()`.
	 * @member {Object} gaOrig - The original `ga()` object.
	 * @returns {*|boolean}    - Returns false to indicate that `ga()` should
	 *                           should not be called for this set of arguments.
	 */
	proxy = function(){
		var a = [].slice.call( arguments );
		if( processArgs( a ) !== false ) return proxy.gaOrig.apply( proxy.gaOrig, a );
	},
	    
	/** Replaces global GA object with a proxy. Assumes global object exists. */
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
	
	if( !ga ){
	// Instantiate GA command queue a la UA snippet.
		ga = window[gaObjName] = function(){
			(window[gaObjName].q = window[gaObjName].q || []).push( arguments ); };
		ga.l = 1 * new Date();
	}

	if( ga.getAll ){ // GA already loaded; cannot see previous commands.
		hijack();
	} else if( ga.l ){ // UA snippet ran, but GA not loaded.
		if( ga.q ){
			// Run all existing command queue items through custom code.
			for( q = [], i = 0; i < ga.q.length; i++ )
				if( processArgs( [].slice.call( ga.q[i] ) ) )
					q.push( ga.q[i] );
			ga.q = q;
		} else { ga.q = []; } // No commands queued yet, instantiate queue.
		ga( hijack );
		hijack();
	} else {
		throw new Error( 'gaSpy aborting; `'+gaObjName+'` not the GA object.' );
	}

})( function( a ){ 
	/** @var [Array] a - arguments passed to `ga()` **/

	// RETURN FALSE to prevent original hit from firing.
	// By default, the original hit fires just as it normally would.

	// ARGUMENTS passed to the GA object are available in the array `a`.
	// See GA documentation for parameter formats: https://goo.gl/muCY7Q

	// EXAMPLES: https://git.io/vK4VJ

	//   v  v  v  CUSTOM CODE GOES HERE  v  v  v  
	
	
	console.debug.apply( console, a ); // FOR DEBUGGING
	

	//   ^  ^  ^  CUSTOM CODE END  ^  ^  ^   

} );