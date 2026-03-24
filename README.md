# Alert Bot

A NodeJS script to publish to the YZ network.

1. Install NodeJS from [nodejs.org](https://nodejs.org/). We tend to use a recent "LTS" (Long-Term Support) version rather than the very latest.
2. Get this code, e.g., `git clone https://github.com/YZ-social/alert-bot.git`, then `cd alert-bot`.
3. Install dependencies, e.g., `npm install`.
4. Run the bot once: `npm start`. This posts to the public instance of the YZ network. You can view the results by going to [civildefense.io](https://civildefense.io/?dht=1].<a href="#node">*</a>
5. You might instead want to run your own private version of the network for testing. To do this:
   1. Get the civil defense code: `cd ..` or someplace, then `git clone https://github.com/YZ-social/civildefense.io.git`, and `cd civildefense.io`.
   2. Run it: `npm run local`. This runs a portal at `http://localhost:3000` that does not connect to the public YZ network. Leave it running.
   3. Back in the alert-bot directory, instead of `npm start`, do `npm run local`, which publishes to network on localhost, and you can visit through the Web page at `http://localhost:3000/?dht=1`.

---
### Note

We're working on getting civildefense.io more responsive. For now, use [ki1r0y.com](https://ki1r0y.com/?dht=1).
