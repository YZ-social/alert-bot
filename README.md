# Alert Bot

A NodeJS script to publish to the YZ network.

1. Install NodeJS from [nodejs.org](https://nodejs.org/). We tend to use a recent "LTS" (Long-Term Support) version rather than the very latest.
2. Get this code, e.g., `git clone https://github.com/YZ-social/alert-bot.git`, then `cd alert-bot`.
3. Install dependencies, e.g., `npm install`.

... TODO: complete instructions for various purposes. Below is just the testing...

# Test Setup

alert-bot makes use of `@xy-social/civildefense.io`, `@axona/protocol`, and `axona-bridge`. An `npm install` from the alert-bot directory should work, but it is desirable to not have multiple copies of the various dependencies and to be able to alter them between runs of the tests. 

For this purpose, I use npm workspaces. I have an yz directory that has a git clone of alert-bot and each of the above three as subdirectories:
```
yz
  package.json    # see below
  alert-bot       # https://github.com/YZ-social/alert-bot.git
  civildefense.io # https://github.com/YZ-social/civildefense.io.git
  axona-bot       # https://github.com/axona-net/axona-bridge.git
  axona-protocol  # https://github.com/axona-net/axona-protocol.git
```  

where xy/package.json is:
```
{
  "name": "yz",
  "private": true,
  "scripts": {
    "postinstall": "rm -rf civildefense.io/node_modules axona-bridge/node_modules alert-bot/node_modules"
  },
  "workspaces": ["axona-protocol", "axona-bridge", "civildefense.io", "alert-bot"],
  "overrides": {
    "@axona/protocol": "*",
    "axona-bridge": "*"
  }
}
```

With that in place, I can just do `npm install` from the yz directory, and everything gets set up. This creates a yz/node_modules that has a deduped copy of all the dependencies, with links to the git repo subdirectories. Note, though, if you already have installations in the subdirectories, you may need to `rm -rf node_modules package-lock.json` in each of them before running `npm install` in yz.

# Running oneshot and twoshot

From the alert-bot directory, this will start a local axona bridge (port 8080), a civildefense server (port 3000) and several host nodes, run a test, and then stop the hosts nodes, server, and bridge:

```
npm run localhost-oneshot
```

This will work, and it will work when you run it multiple times in a row. In particular, you should see a line near the end that says something like:
```
There were 0 pubs and 0 kills with mismatched events (of which 0 failures are different between run1 and run2), from the 2726 total publications (105 alerts in 896 topics), and 0 previous kills.
```

Currently, this runs the real world data for region 0x80: demo data, streaming radio stations, and fires. 

The first time you do this, it will fetch the NASA fire data into a file called `fire.csv` for the US, and then it will reuse that file on subsequent runs. The data is time stamped, so as time passes, there will be more fire alerts that have expired. You can delete fire.csv to get the latest, but note that NASA updates their file once a day.

The radio station data for region 0x80 should already be in the github checkout, and it does not expire.

To see a test fail, run twoshot:

```
npm run localhost-twoshot
```

This will do exactly the same thing, except that instead of shutting down after the successful test, it will run the test a second time. The second time it will see that there are publications in place from the first (successful) run, and it will (successfull) unpublish them. However, the much of the new data then published will fail to elicit an event when subscribed. So in this case, you will kept something like the same line as above, from the first run, and then failure when localhost-twoshot makes the second run for you.

```
There were 0 pubs and 0 kills with mismatched events ...
...
.............................................  (Lots of these from the unpblications.)
...
There were 229 pubs and 0 kills with mismatched events ...

```

After observing the failure, you should then manually clean up by doing:

```
npm run localhost-stop-all
```



