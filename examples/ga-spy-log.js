/**
 * Log all ga commands to the console.
 * 
 * https://github.com/smhmic/gaSpy/
 * @version 0.8
 */
 
(function(e){var n,t,o=function(n){if(e=null,!n.callback||"function"!=typeof n.callback)throw Error("["+n.debugLogPrefix+"] Aborting; No listener callback provided.");return n.gaObjName=n.gaObjName||window.GoogleAnalyticsObject||"ga",n.debug=!!n.debug,n.debugLogPrefix=n.debugLogPrefix||"gaSpy",n}("function"==typeof e?{callback:e}:e),a=o.gaObjName,i=window[a],l=window.console&&o.debug?function(){var e=[].slice.call(arguments);e.unshift("["+o.debugLogPrefix+"]"),console.log.apply(console,e)}:function(){},r=function(e){var n,t={};return o.debug&&function(n,t){for(n="Intercepted: ga(",t=0;t<e.length;t++)n+="string"==typeof e[t]?'"'+e[t]+'"':e[t],t+1<e.length&&(n+=", ");n+=")",l(n)}(),"function"==typeof e[0]?t.callback=e[0]:e[0]&&e[0].split&&(n=e[0].split("."),t.trackerName=n.length>1?n[0]:"t0",t.command=n.length>1?n[1]:n[0],n=n[n.length-1].split(":"),t.pluginName=n.length>1?n[0]:void 0,t.pluginMethodName=n.length>1?n[1]:void 0,"require"===t.command||"provide"===t.command?(t.pluginName=e[1],"provide"===t.command&&(t.pluginConstructor=e[2])):("send"===t.command&&(t.hitType=e[e.length-1].hitType||e[1]),"object"==typeof e[e.length-1]&&(t.trackerName=e[e.length-1].name||t.trackerName))),l("Run listener callback",t),!1===o.callback(e,t)?l("Block hit")||!1:!0},c=function(){var e=[].slice.call(arguments);if(o.debug){if(!r(e))return}else try{if(!r(e))return}catch(n){}return c.gaOrig.apply(c.gaOrig,e)},g=function(){var e,n=c.gaOrig=window[a];l("Hijack",n.gaOrig?"(already hijacked)":""),window[a]=c;for(e in n)n.hasOwnProperty(e)&&(window[a][e]=n[e])};if(l("Config:",o),i||(l("Instantiate GA command queue"),i=window[a]=function(){(window[a].q=window[a].q||[]).push(arguments)},i.l=1*new Date),i.getAll)l("GA already loaded; cannot see previous commands"),g();else{if(!i.l)throw Error("["+o.debugLogPrefix+"] Aborting; `"+a+"` not the GA object.");if(l("Command queue instantiated, but library not yet loaded"),i.q&&i.q.length){for(l("Applying listener to",i.q.length," queued commands"),n=[],t=0;t<i.q.length;t++)r([].slice.call(i.q[t]))&&n.push(i.q[t]);i.q=n}else i.q=[];i(g),g()}}
)( function gaSpy_log( a, the ){
	
	var namespace = 'ga', // log prefix
	    fields,
	    prefix = '?', color = 'red', style = '', 
	    log = function( args, _prefix ){
			_console( 'log', args, 'color:'+color+';'+style, _prefix||prefix, the.trackerName === 't0' ? undefined : the.trackerName );
	    },
	    _console = function _console( fnName, args, style, prefix, preprefix ){

			var prefixStyle, namespacePrefixStyle, color;

			if( !window.console || !window.console.log )
				return;
		
			if( ! args.unshift ) args = [ args ];

			namespacePrefixStyle = 'color:rgba(0,0,0,0.3);border:1px rgba(0,0,0,0.3) solid;font-size:0.9em;padding:0 0.2em;vertical-align:center;';
			color = style.match( /color\s*:\s*([^;]+)/i, '' );
			color = ( color ? color[ 1 ] : '#888' );
			style = 'vertical-align:center;' + style + '';
			prefixStyle = namespacePrefixStyle + style + ';margin:0 0 0 0.1em;font-size:0.9em;border-color:' + color;
			if( prefix === '' )
				args.unshift( '%c' + namespace + '%c ', namespacePrefixStyle, style );
			else {
				if( preprefix )
					args.unshift(
					 '%c' + namespace + '%c.%c' + preprefix+'%c.%c'+(prefix || fnName.toUpperCase())+'%c ',
					 namespacePrefixStyle, 'font-size:0', namespacePrefixStyle, 'font-size:0', prefixStyle, style
					);
				else
					args.unshift(
					 '%c' + namespace + '%c.%c' + (prefix || fnName.toUpperCase())+'%c ',
					 namespacePrefixStyle, 'font-size:0', prefixStyle, style
					);
			}
		
			window.console[fnName].apply( window.console, args );
			return;

			/* Concatenate consecutive leading strings, and pass first non-string argument and all following arguments as-is.
			for( i = 0; i < args.length; i++ ){
				if( 'string' === typeof args[ i ] ){
					consoleArgs[0] = consoleArgs[0 ].trim + (args[i]?' ':'')+args[ i ];
					if( -1 < args[ i ].indexOf( '%c' ) ) // if( fw.contains( str[ i ], '%c' ) )
						i++;
					else
						continue;
				} else if( 'undefined' == typeof args[ i ] ){
					consoleArgs[ 0 ] += " (undefined) ";
					continue;
				}

				// Pass all following arguments.
				consoleArgs.push.apply( consoleArgs, consoleArgs.slice.call( args, i ) );
				break;
			}*/
			// Print colorized string, prefixed with framework identifier.
			window.console[ fnName ].apply( window.console, consoleArgs );
		};
	
	if( the.callback )
		return log( a[0], 'callback' );
	
	if( the.pluginName ){
		prefix = 'plugin';
		color = 'darkblue';
		return log( a );
	}
	
	if( the.hitType ){
		prefix = the.hitType;
		switch( the.hitType ){
			case 'pageview': color = 'purple'; break;
			case 'event':    color = 'darkorange'; break;
			case 'timing':   color = 'pink'; break;
			case 'social':    color = 'gold'; break;
			case 'transaction': color = 'darkgreen'; break;
			case 'item':     color = 'lightgreen'; break;
			default: prefix = 'hit?';
		}
		a.shift(); if( the.command === prefix ) a.shift();
		return log( a );
	}
	
	// Is tracker-level command: create/set/remove.
	prefix = the.command;
	style += 'font-style:italics;';
	switch( the.command ){
		case 'create':
			color = 'silver';
		    fields = typeof a[a.length-1] == 'object' ? a.pop() : {};
		    a = [ fields.trackingId || a[1], fields.cookieDomain || a[2], fields ];
			break;
		case 'set':
		    color = 'silver';
			break;
		case 'remove':
			break;
		default:
			prefix = '???';
	}
	if( a[0] === prefix ) a.shift();
	log( a );
	
} );