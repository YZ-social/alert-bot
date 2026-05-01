# Alert Bot

A NodeJS script to publish to the YZ network.

1. Install NodeJS from [nodejs.org](https://nodejs.org/). We tend to use a recent "LTS" (Long-Term Support) version rather than the very latest.
2. Get this code, e.g., `git clone https://github.com/YZ-social/alert-bot.git`, then `cd alert-bot`.
3. Install dependencies, e.g., `npm install`.
4. Run the bot once: `npm run ki1r0y` or `npm run civildefense`. This posts to either of two public instance of the YZ network. You can view the results by going to [ki1r0y.com](https://ki1r0y.com] or [civildefense.io](https://civildefense.io], respectively.
5. You might instead want to run your own private version of the network for testing. To do this:
   1. Get the civil defense code: `cd ..` or someplace, then `git clone https://github.com/YZ-social/civildefense.io.git`, and `cd civildefense.io`.
   2. Run it: `npm run local`. This runs a portal at `http://localhost:3000` that does not connect to the public YZ network. It will launch n-cores/2 portals over about 15 seconds. Leave it running.
   3. Back in the alert-bot directory, instead of `npm run ki1r0y`, do `npm run local`, which publishes to the network on localhost, and you can visit through the Web page at [`http://localhost:3000`](http://localhost:3000).
