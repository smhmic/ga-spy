function(){
  return {
  
    // The string to match against the first column under predicates below.
    'match' : location.hostname + location.pathname,
    
    // Each subarray is an array where the first item is a string or regex.  
    //   If that matches the 'match' setting above, then GA hits will be 
    //   repeated with the given tracking id. 
    'predicates' : [ 
      [ /(^|\.)domain\.com\/a/, 'UA-00000-2' ],
      [ /(^|\.)domain\.com\/b/, 'UA-00000-3' ],
      [ /(^|\.)domain\.com\/c/, 'UA-00000-4' ],
      [ /(^|\.)domain\.net\//,  'UA-00000-5' ],
      [ /.*/,                   'UA-00000-6' ], // Rollup property
    ],
    
    // If true, activates verbose debug logging.
    'debug' : {{Debug Mode}}
  }
}