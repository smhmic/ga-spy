/**
 * Track sharethis/addthis share clicks via GTM.
 */
(function(b){var d,e,c=function(a){if(b=null,!a.callback||"function"!=typeof a.callback)throw new Error("["+a.debugLogPrefix+"] Aborting; No listener callback provided.");return a.gaObjName=a.gaObjName||window.GoogleAnalyticsObject||"ga",a.debug=!!a.debug,a.debugLogPrefix=a.debugLogPrefix||"gaSpy",a}("function"==typeof b?{callback:b}:b),f=c.gaObjName,g=window[f],h=window.console&&c.debug?function(){var a=[].slice.call(arguments);a.unshift("["+c.debugLogPrefix+"]"),console.log.apply(console,a)}:function(){},i=function(a){var b,d={args:a,the:{}},e=d.the;return c.debug&&function(b,c){for(b="Intercepted: ga(",c=0;c<a.length;c++)b+="string"==typeof a[c]?'"'+a[c]+'"':a[c],c+1<a.length&&(b+=", ");b+=")",h(b)}(),"function"==typeof a[0]?e.callback=a[0]:a[0]&&a[0].split&&(b=a[0].split("."),e.trackerName=b.length>1?b[0]:"t0",e.command=b.length>1?b[1]:b[0],b=b[b.length-1].split(":"),e.pluginName=b.length>1?b[0]:void 0,e.pluginMethodName=b.length>1?b[1]:void 0,"require"===e.command||"provide"===e.command?(e.pluginName=a[1],"provide"===e.command&&(e.pluginConstructor=a[2])):("send"===e.command&&(e.hitType=a[a.length-1].hitType||a[1]),"object"==typeof a[a.length-1]&&(e.trackerName=a[a.length-1].name||e.trackerName))),h("Run listener callback",e),!1!==c.callback(d)||(h("Block hit")||!1)},j=function(){var a=[].slice.call(arguments);if(c.debug){if(!i(a))return}else try{if(!i(a))return}catch(a){}return j._gaOrig.apply(j._gaOrig,a)},k=function(){var a,b=j._gaOrig=window[f];h("Hijack",b._gaOrig?"(already hijacked)":""),window[f]=j;for(a in b)b.hasOwnProperty(a)&&(window[f][a]=b[a])};if(h("Config:",c),g||(h("Instantiate GA command queue"),g=window[f]=function(){(window[f].q=window[f].q||[]).push(arguments)},g.l=1*new Date),g.getAll)h("GA already loaded; cannot see previous commands"),k();else{if(!g.l)throw new Error("["+c.debugLogPrefix+"] Aborting; `"+f+"` not the GA object.");if(h("Command queue instantiated, but library not yet loaded"),g.q&&g.q.length){for(h("Applying listener to",g.q.length," queued commands"),d=[],e=0;e<g.q.length;e++)i([].slice.call(g.q[e]))&&d.push(g.q[e]);g.q=d}else g.q=[];g(k),k()}}
)( function _gaSpy_cb_( ev ){
  var a = ev.args;
  if( a[0] == "send" && a[1] == "event" && ( a[2] == "ShareThis" || a[2] == "addthis" ) ){
    dataLayer.push({
      'event' : 'spy.ga.socialPlugin',
      'spy.ga.socialPlugin' : {
        'network' : a[3],
        'url'     : a[4]
      }
    });
  }
  return false; // Return false to stop original hit from attempting to fire. 
                // Returning true allows analytics.js to try to fire ShareThis/Addthis 
                //   built-in tracking.  Only return true if either on-page tracking 
                //   OR AddThis/Sharethis is configured to track to a separate 
                //   GA Property than the Property tracked by GTM.
});