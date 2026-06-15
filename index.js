#!/usr/bin/env node
import process from 'node:process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getContainingCells } from './s2.js';
import { demoData, users } from './demo-data.js';
import { P2PWebNetwork, agentTopic, alertTopic, canonicalTag } from '@yz-social/civildefense.io';

import { fetchStations, defaultRegions } from './station-data.js';
const imageToUri = (await import('image-to-uri')).default;

process.title = 'alert-bot'; // Handy for debugging when you have lots of nodejs processes.

// Command-line args. Here we use the yargs package to parse.
const argv = yargs(hideBin(process.argv))
      .usage(`Publish CivilDefense.io alerts.`)
      .option('externalBaseURL', {
	type: 'string',
	default: 'http://localhost:3000/kdht/',
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
      .option('radio-stations', {
	type: 'boolean',
	default: false,
	description: "Enable radio station mode instead of demo data."
      })
      .option('station-styles', {
	type: 'string',
	default: 'news,jazz,classic rock',
	description: "Comma-separated list of station styles to fetch."
      })
      .option('station-count', {
	type: 'number',
	default: 5,
	description: "Number of stations to fetch per style per region."
      })
      .option('station-region', {
	type: 'string',
	default: 'north-america',
	description: "Region key from defaultRegions (north-america, europe, or asia)."
      })
      .parse();

const {externalBaseURL, info, verbose, radioStations, stationStyles, stationCount, stationRegion} = argv; // yargs puts values in argv.

// Create a p2p node and connect to the YZ network through externalBaseURL.
const network = await P2PWebNetwork.create({region: {lat: 37.468467587148844, lng: -122.25860595703126}});

// Publish the handle/avatar for each reporting user.
for (const {tag, handle, avatar} of Object.values(users)) {
  const eventName = agentTopic(tag);
  const issuedTime = Date.now();
  if (handle) await network.publish({eventName, type: 'handle', payload: handle, issuedTime});
  if (avatar) await network.publish({eventName, type: 'avatar', payload: imageToUri(`./images/${avatar}`), issuedTime});
}


// Post to CivilDefense.io (local network or shared, depending on the externaBaseURL).
async function publishEvent({lat, lng, // location on the globe
			     eventTime, // Javscript timestamp
			     source, // Name string of source. Please use a different one for each data source.
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
  const publisher = P2PWebNetwork.regionPublisher(lat, lng);
  let alertIdentifier;
  for (const cell of cells) {
    const eventName = alertTopic(cell, topicKey);
    const msgId = await network.publish({eventName, payload, hashtag: topicWithDefaultIcon, act: sourceTag, issuedTime: eventTime, publisher});
    if (alertIdentifier && (alertIdentifier !== msgId)) throw new Error(`msgId drift ${alertIdentifier} => ${msgId}.`);
    alertIdentifier = msgId;
  }
  if (!replies?.length) return alertIdentifier;
  //await contact.peer.sub(alertIdentifier, console.log, {publisher, since: 'all'});
  //await NetworkClass.delay(1e3);
  for (const reply of replies) { // If there is more information, post that as a "reply" to the alertIdentifier.
    //console.log('reply', reply);
    let payload = reply, replySource = sourceTag;
    if (reply.message) { // Each reply can be a string or an object with message and optional user and filename.
      const {message, user = source, filename} = reply;
      payload = {message};
      replySource = users[user].tag;
      if (filename) {
	payload.file = imageToUri(`./images/${filename}`);
	payload.name = filename;
      }
    }
    eventTime += 1e3;
    await network.publish({eventName: alertIdentifier, payload, act: replySource, issuedTime: eventTime, publisher});
  }
  await P2PWebNetwork.delay(1e3);
  return alertIdentifier;
}

const url = new URL('/', externalBaseURL)
const params = url.searchParams;
  
let dataToPublish;

if (radioStations) {
  // Parse station options
  const styles = stationStyles.split(',').map(s => s.trim());
  const regionKey = stationRegion.toLowerCase();
  const regionConfig = defaultRegions[regionKey];
  
  if (!regionConfig) {
    console.error(`Unknown region: ${regionKey}. Available: ${Object.keys(defaultRegions).join(', ')}`);
    process.exit(1);
  }
  
  // Fetch radio stations
  if (info) console.log(`Fetching ${stationCount} stations per style for ${styles.join(', ')} in ${regionConfig.label}...`);
  dataToPublish = await fetchStations(styles, regionConfig.regions, stationCount);
  if (info) console.log(`Fetched ${dataToPublish.length} stations total.`);
} else {
  dataToPublish = demoData;
}

// Post each datum.
for (const {lat, lng, eventTime, tag, replies, source = 'alert-bot'} of dataToPublish) {
  const subject = await publishEvent({lat, lng, eventTime, topicWithDefaultIcon: tag, replies, source});
  params.set('lat', lat);
  params.set('lng', lng);
  params.set('sub', subject);
  params.set('tags', encodeURIComponent(tag));
  //console.log(url.href);
}

if (info) console.log('published');
//console.log('Staying connected to provide continuity, until we get multiple NodeJS nodes working.');
await network.disconnect();
if (info) console.log('done! winding down');
