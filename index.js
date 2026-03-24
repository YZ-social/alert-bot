#!/usr/bin/env node
//import whyIsNodeRunning from 'why-is-node-running' // should be your first import
import process from 'node:process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { v4 as uuidv4 } from 'uuid';
import { getContainingCells } from './s2.js';
import { demoData } from './demo-data.js';
import { NetworkClass } from './network.js'; // Temporary hack. See file.
const imageToUri = (await import('image-to-uri')).default;

process.title = 'alert-bot'; // Handy for debugging when you have lots of nodejs processes.

// Command-line args. Here we use the yargs package to parse.
const argv = yargs(hideBin(process.argv))
      .usage(`Publish CivilDefense.io alerts.`)
      .option('externalBaseURL', {
	type: 'string',
	default: 'http://localhost:3000/kdht',
	description: "The base URL of the some other portal server to which we should connect ours, if any."
      })
      .option('info', {
	alias: 'i',
	type: 'boolean',
	default: true,
	description: "Run with info logging."
      })
      .option('verbose', {
	alias: 'v',
	type: 'boolean',
	default: false,
	description: "Run with verbose logging."
      })
      .option('dht', {
	type: 'number',
	default: 1,
	description: "Temporary hack option to use the alternative pub/sub if the value is 0."
      })
      .parse();

const {externalBaseURL, info, verbose} = argv; // yargs puts values in argv.
if (info) console.log({externalBaseURL, network: NetworkClass.name});

// Create a p2p node and connect to the YZ network through externalBaseURL.
// For more information, see https://github.com/YZ-social/kdht?tab=readme-ov-file#kdht, which is the p2p network used by Civil Defense.
const contact = await NetworkClass.create({info, debug: verbose});
await contact.connect(externalBaseURL);

// Post to CivilDefense.io (local network or shared, depending on the externaBaseURL used by the contact).
async function publishEvent({lat, lng, // location on the globe
			     eventTime, // Javscript timestamp
			     source, // Name string of source. Please use a different one for each data source.
			     // (Later this will involve signing by a public key. https://github.com/kilroy-code/distributed-security
			     replies = [], // Additional information, if any.
			     topicWithDefaultIcon, // Hashtag with a leading emoji used as an icon on the map.
			     topicKey = topicWithDefaultIcon.replace(/^\p{Extended_Pictographic}*\uFE0F?\s*/u, '') // Stripping off any leading emoji.
			    }) {
  if (!Array.isArray(replies)) replies = [replies]; // Accept array or single reply.

  // First we publish the "alert" - which will appear as an icon on the map.  
  // If the user opens it, it has a timestamp and an identicon for the source string.
  // To do this, we actually publish to a series of different eventNames based on map position. See s2.js.
  const cells = getContainingCells(lat, lng);
  const alertIdentifier = uuidv4(); // A unique identifier for this alert, which people will reply to.
  const payload = {lat, lng};
  console.log(source, lat, lng, topicWithDefaultIcon);
  for (const cell of cells) {
    const eventName = `s2:${cell}:${topicKey}`;
    await contact.publish({eventName, subject: alertIdentifier, payload, hashtag: topicWithDefaultIcon, act: source, issuedTime: eventTime});
  }
  for (const reply of replies) { // If there is more information, post that as a "reply" to the alertIdentifier.
    console.log('reply', reply);
    const replyIdentifier = uuidv4(); // A unique identifier for this reply.
    let payload = reply, replySource = source;
    if (reply.user) { // Each reply can be a string or an object with message and optional user and filename.
      const {message, user = source, filename} = reply;
      payload = {message};
      replySource = user;
      if (filename) {
	payload.file = imageToUri(`./images/${filename}`);
	payload.name = filename;
      }
    }
    await contact.publish({eventName: alertIdentifier, subject: replyIdentifier, payload, act: replySource});
  }
}

// Post each datum in demoData.
for (const {lat, lng, eventTime, tag, replies, source = 'alert-bot'} of demoData) {
  await publishEvent({lat, lng, eventTime, topicWithDefaultIcon: tag, replies, source});
}

if (info) console.log('published');
await new Promise(resolve => setTimeout(resolve, 5e3));
await contact.disconnect(true);
if (info) console.log('done! winding down');
//setImmediate(() => whyIsNodeRunning())
