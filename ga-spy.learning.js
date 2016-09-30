/*
 * This file contains simpler logic, more verbose syntax, in order to showcase the
 *   basic functionality found in ga-spy.js.  The code in the this file works, but
 *   will not be kept up-to-date and may contain bugs that are fixed in ga-spy.js.
 */



/**
 * gaSpy
 * The gaSpy is the listener for commands passed to the UA library.
 *   It accepts a single argument: the custom callback (which will 
 *   be passed the GA command arguments when it is called).
 */
function gaSpy( callback ){

	var

	// The name of the global ga object.
	gaObjName = window.GoogleAnalyticsObject || 'ga',

	// The global ga object.
	ga        = window[gaObjName],

	// Temp vars for processing GA command queue.
	k, q, i;

	/**
	 * processArgs
	 * Processes each set of arguments passed to `ga()` and send them to the callback.
	 * Returns false to indicate that `ga()` should not be called for this set of arguments.
	 */
	function processArgs( a ){
		// If is from a standard GTM UA template tag, automatically allow hit.
		if( a[0] && a[0].substr && a[0].substr( 0, 3 ) == 'gtm' )
			return true;
		// Call listener, return false only if listener returns false.
		return callback( a ) !== false;
	}
	 
  /**
   * proxy
   * The function that will replace `ga()`.  Passes arguments to processArgs; if
   *   processArgs returns false also passes arguments to `ga()`.
   */
	function proxy(){
		// Grab all arguments as an array.
		var args = [].slice.call( arguments );
		// Unless processArgs() returns false ...
		if( processArgs( args ) )
			// ... pass through to original GA object.
			return gaOrig.apply( gaOrig, args );
	}

  /** 
   * hijack
   * Replaces global GA object with a proxy. Assumes global object exists.
   */
	function hijack(){
		// The current global GA object (could be GA command queue or loaded GA object).
		var gaOrig = window.ga;
		// Replace global GA object with a proxy.
		window.ga = proxy;
		// Maintain references to GA's public interface. 
		for( k in gaOrig )
			if( gaOrig.hasOwnProperty( k ) )
				proxy[k] = gaOrig[k];
	}
	
	/////////////////////////////////////////////////////////////////////////////
	// The action starts here! Everything above is just variables / functions. //
	/////////////////////////////////////////////////////////////////////////////

	// Instantiate GA command queue a la UA snippet.
	if( !ga ){ 
		ga = function(){ 
			if( ! window[gaObjName].q )
				window[gaObjName].q = [];
			window[gaObjName].q.push( arguments );
		};
		ga.l = 1 * new Date();
		window[gaObjName] = ga;
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
		} else {
			// No commands queued yet, instantiate queue.
			ga.q = [];
		}
		ga( hijack );
		hijack();
	} else {
		throw new Error( 'gaSpy aborting; ' + '`' + gaObjName + '` not the GA object.' );
	}

};

gaSpy(function( a ){

	//   v  v  v  CUSTOM CODE GOES HERE  v  v  v  

	// RETURN FALSE to prevent original hit from firing.
	// By default, the original hit fires just as it normally would.

	// ARGUMENTS passed to the GA object are available in the array `a`.
	// See GA documentation for parameter formats: https://goo.gl/muCY7Q

	// FOR DEBUGGING: console.debug.apply( console, a );
	



	//   ^  ^  ^  CUSTOM CODE END  ^  ^  ^   

});