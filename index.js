#!/usr/bin/env node
import process from 'node:process';
import {readdir} from 'node:fs/promises';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getContainingCells } from './s2.js';
import { demoData, users } from './demo-data.js';
import { P2PWebNetwork, agentTopic, alertTopic, canonicalTag } from '@yz-social/civildefense.io';
import {styles as radioStyles, streamingRootPath} from './common.js';
//globalThis.pica = (await import('pica')).default;
//const imageToUri = (await import('image-to-uri')).default;

const start = Date.now();
process.title = 'alert-bot'; // Handy for debugging when you have lots of nodejs processes.

// Command-line args. Here we use the yargs package to parse.
const argv = yargs(hideBin(process.argv))
      .usage(`Publish CivilDefense.io alerts.`)
      .option('baseURL', {
	type: 'string',
	default: 'http://localhost:3000/',
	description: "The base URL where the results can be reached."
      })
      .option('info', {
	alias: 'i',
	type: 'boolean',
	default: true,
	description: "Run with info logging."
      })
      .option('styles', {
	type: 'array',
	default: radioStyles,
	description: "Comma-separated list of styles to publish."
      })
      .option('throttleMS', {
	type: 'number',
	default: 100,
	description: "Number of milliseconds to pause between publish actions."
      })
      .option('dryRun', {
	type: 'boolean',
	default: false,
	description: "Skip actual publication."
      })
      .parse();

const {baseURL, info, styles, throttleMS, dryRun} = argv; // yargs puts values in argv.

function log(...rest) { // If info, log args (with newline at end).
  if (!info) return;
  console.log(...rest);
}
const url = new URL('/', baseURL)
const params = url.searchParams;
function makeURL({subject, lat, lng, tag}) {
  params.set('lat', lat);
  params.set('lng', lng);
  params.set('sub', subject);
  params.set('tags', encodeURIComponent(tag));
  return url.href;
}

// Create a p2p node and connect to the YZ network.
const network = await P2PWebNetwork.create({
  region: {lat: 37.468467587148844, lng: -122.25860595703126},
  infoLogger: log
});

let totalPublications = 0;
async function publish(options) { // Publish to network.
  const msgId = dryRun ? Date.now() : await network.publish(options);
  totalPublications++;
  if (throttleMS) await P2PWebNetwork.delay(throttleMS);
  return msgId;
}

// Post to CivilDefense.io (local network or shared, depending on the externaBaseURL).
let totalAlerts = 0;
async function publishAlert({lat, lng, // location on the globe
			     eventTime = Date.now(), // Javscript timestamp
			     source = 'alert-bot', // Name string of source. Please use a different one for each data source.
			     // (Later this will involve signing by a public key. https://github.com/kilroy-code/distributed-security
			     replies = [], // Additional information, if any.
			     topicWithDefaultIcon, // Hashtag with a leading emoji used as an icon on the map.
			     topicKey = canonicalTag(topicWithDefaultIcon) // Stripping off any leading emoji.
			    }) {
  if (!Array.isArray(replies)) replies = [replies]; // Accept array or single reply.
  const sourceTag = users[source].tag;
 
  // First we publish the "alert" - which will appear as an icon on the map.  
  // If the user opens it, it has a timestamp and an identicon for the source string.
  // To do this, we actually publish to a series of different eventNames based on map position. See s2.js.
  const cells = getContainingCells(lat, lng);
  const payload = {lat, lng};
  const publisher = 'FIXME' //P2PWebNetwork.regionPublisher(lat, lng);
  let alertIdentifier;
  for (const cell of cells) {
    const eventName = alertTopic(cell, topicKey);
    const msgId = await publish({eventName, payload, hashtag: topicWithDefaultIcon, act: sourceTag, issuedTime: eventTime, publisher});
    alertIdentifier = msgId;
  }
  for (const reply of replies) { // If there is more information, post that as a "reply" to the alertIdentifier.
    //console.log('reply', reply);
    let payload = reply, replySource = sourceTag;
    if (reply.message) { // Each reply can be a string or an object with message and optional user and filename.
      const {message, user = source, filename} = reply;
      payload = {message};
      replySource = users[user].tag;
      // if (filename) {
      // 	const dataURL = imageToUri(`./images/${filename}`); // Synchronous. Go figure.
      // 	payload.file = await network.chunkifyString(dataURL, publisher);
      // 	payload.name = filename;
      // 	if (throttleMS) await P2PWebNetwork.delay(throttleMS);
      // }
    }
    eventTime += 1e3;
    await publish({eventName: alertIdentifier, payload, act: replySource, issuedTime: eventTime, publisher});
  }
  totalAlerts++;
  if (!info) return;
  log(makeURL({subject: alertIdentifier, lat, lng, tag: topicWithDefaultIcon}));
}
  
  
// Publish the handle/avatar for each reporting user.
for (const {tag, handle, avatar} of Object.values(users)) {
  const eventName = agentTopic(tag);
  const issuedTime = Date.now();
  if (handle) await publish({eventName, type: 'handle', payload: handle, issuedTime});
  //if (avatar) await publish({eventName, type: 'avatar', payload: imageToUri(`./images/${avatar}`), issuedTime});
}

//for (const code of ['80', '81', '86', '87', '88', '89', '54', '53', '4d', '4c']) {
// for (const code of await readdir(streamingRootPath)) {
//   for (const style of styles) {
//     const path = `${streamingRootPath}/${code}/${style}.json`;
//     const dataModule = await import(path, {with: { type: 'json' }}).catch(_ => {return {default: []};}); // Not all styles are present.
//     console.log(path);
//     for (const station of dataModule.default) {
//       const {lat, lng, name, url, mime, homepage} = station;
//       const title = new URL(homepage).host.replace(/^www\./, '');
//       console.log(title, name);
//       const subject = await publishAlert({lat, lng, topicWithDefaultIcon: style, replies: [
// 	{message: `${title}: ${name} ${homepage} ${url}`}
// ]});
//       console.log(makeURL({subject, lat, lng, tag: style}));
//     }
//   }
// }

// Post each datum.
for (const {lat, lng, eventTime, tag, replies, source = 'alert-bot'} of demoData) {
  await publishAlert({lat, lng, eventTime, topicWithDefaultIcon: tag, replies, source});
}

log(`Posted ${totalAlerts} alerts with ${totalPublications} publications in ${(Date.now() - start).toLocaleString()} ms.`);
await network.disconnect();
process.exit(0); // FIXME: This should not be necessary!
