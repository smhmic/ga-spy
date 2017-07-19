# GA Command Repeater

Piggyback off of existing tracking to send duplicate GA hits (differing only in configurable trackingId and/or other params).

## USAGE:

The config is all in the variable '{{GaCmdRepeater Config}}'. The logic is kinda like a lookup table, except it'll use every match not just the first one. You can use regex, or strings for exact match.  Note, this config is just for extra Properties; they will fire *in addition to* whatever property your GA Tracking ID variable points to.  This should not interfere with any existing tracking.


## Alternate Methods:
 
 A) add repeater triggers for every trigger (old; [simo ahava method](https://www.simoahava.com/analytics/firing-a-single-tag-multiple-times-in-gtm/)
 
 B) [GtmTagRepeater] add repeater events for every GTM event (old; [deprecated](https://tagmanager.google.com/#/versions/accounts/274743500/containers/6714694/versions/1))
 
 C) [GaCmdRepeater] (THIS SCRIPT) duplicate every command to additional trackers (just appending to the tracker name) (NEW)
 
 D) [GaHitRepeater] use Tasks API to duplicate MP hits (NEWish to GTM).
 
 
About replacing (B) with (C)(this script): code-wise, this change was a complete revamp, but pretty much all of it is under-the-hood. The config is the exact same as TagRepeater, except this one won't need any special triggers or vars. It works by simply listing for GA commands and running them multiple times, just with different trackers.  The downside is it's much more code than TagRepeater ... but has none of the big flaws and requires less setup.  It is also faster, since there is less processing to be done for each duplicated hit.

(D) is throetically the same as (C) except using the GA Tasks API.  It would be faster than Cmd Repeater, and also less code, and also more robust (i.e. Cmd Repeater can't duplicate some effects of plugins across hits).  TODO: Replace this gaspy method like [this](https://github.com/thyngster/universal-analytics-dual-tracking-plugin/tree/hackathon) or [this](https://www.simoahava.com/gtm-tips/send-google-analytics-tag-multiple-properties/) in customTask.


## NOTES

Currently ignoring pushed callback fns; potential issues?

How to handle hitCallback? Leave it on dupe hits? Remove it? Leave on only on last hit?  Currently it's left along so it's likely being called for the orig and each duped hit.
 
Currently ignoring `require` calls; generally cannot access mods from plugins with this method anyway (need to use Tasks API for that)

Could skip linker:autoLink if using same ga cookie? And cid? And ..? In cases where these are custom values then vanilla autolinker will not cut it anyway ... so i think it can be always skipped.   ga("gtm286.require", "linker");  ga("gtm286.linker:autoLink", ["a.org", "b.org", "c.com"], false, false);
        
         
TODO: update config to be more flexible:
    filter : null, // Fn ran against each extra hit config on page load to determine which is active.  If string, will be matched against `extraHit.filter` fields that are strings or regexes.
    extraHit : [
      {
        'filter' : '/sompath', // Run on page load to determine if this hit config will be active.  Can be custom fn, or if string or regex will be used by default config.filter() to determine if config should apply.
        'hit' : { ga fields } OR function(){} OR string(tid)
        'filterEach' : function(){}, // Run on every 
      }
    ]
    

