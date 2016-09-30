/**
 * Log all ga commands to the console.
 */
(function(b){var d,e,c=function(a){if(b=null,!a.callback||"function"!=typeof a.callback)throw new Error("["+a.debugLogPrefix+"] Aborting; No listener callback provided.");return a.gaObjName=a.gaObjName||window.GoogleAnalyticsObject||"ga",a.debug=!!a.debug,a.debugLogPrefix=a.debugLogPrefix||"gaSpy",a}("function"==typeof b?{callback:b}:b),f=c.gaObjName,g=window[f],h=window.console&&c.debug?function(){var a=[].slice.call(arguments);a.unshift("["+c.debugLogPrefix+"]"),console.log.apply(console,a)}:function(){},i=function(a){var b,d={args:a,the:{}},e=d.the;return c.debug&&function(b,c){for(b="Intercepted: ga(",c=0;c<a.length;c++)b+="string"==typeof a[c]?'"'+a[c]+'"':a[c],c+1<a.length&&(b+=", ");b+=")",h(b)}(),"function"==typeof a[0]?e.callback=a[0]:a[0]&&a[0].split&&(b=a[0].split("."),e.trackerName=b.length>1?b[0]:"t0",e.command=b.length>1?b[1]:b[0],b=b[b.length-1].split(":"),e.pluginName=b.length>1?b[0]:void 0,e.pluginMethodName=b.length>1?b[1]:void 0,"require"===e.command||"provide"===e.command?(e.pluginName=a[1],"provide"===e.command&&(e.pluginConstructor=a[2])):("send"===e.command&&(e.hitType=a[a.length-1].hitType||a[1]),"object"==typeof a[a.length-1]&&(e.trackerName=a[a.length-1].name||e.trackerName))),h("Run listener callback",e),!1!==c.callback(d)||(h("Block hit")||!1)},j=function(){var a=[].slice.call(arguments);if(c.debug){if(!i(a))return}else try{if(!i(a))return}catch(a){}return j._gaOrig.apply(j._gaOrig,a)},k=function(){var a,b=j._gaOrig=window[f];h("Hijack",b._gaOrig?"(already hijacked)":""),window[f]=j;for(a in b)b.hasOwnProperty(a)&&(window[f][a]=b[a])};if(h("Config:",c),g||(h("Instantiate GA command queue"),g=window[f]=function(){(window[f].q=window[f].q||[]).push(arguments)},g.l=1*new Date),g.getAll)h("GA already loaded; cannot see previous commands"),k();else{if(!g.l)throw new Error("["+c.debugLogPrefix+"] Aborting; `"+f+"` not the GA object.");if(h("Command queue instantiated, but library not yet loaded"),g.q&&g.q.length){for(h("Applying listener to",g.q.length," queued commands"),d=[],e=0;e<g.q.length;e++)i([].slice.call(g.q[e]))&&d.push(g.q[e]);g.q=d}else g.q=[];g(k),k()}}
)( function _gaSpy_cb_( ev ){
	
	var the = ev.the, a = ev.args,
			namespace = 'ga', // log prefix
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