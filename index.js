#!/usr/bin/env node
import process from 'node:process';
import { readdir, open, rm, appendFile } from 'node:fs/promises';
import { EOL } from 'node:os';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { demoData, users, styles as demoStyles } from './demo-data.js';
import { P2PWebNetwork, agentTopic, alertTopic, canonicalTag, getContainingCells, location } from '@yz-social/civildefense.io';
import {styles as radioStyles, streamingRootPath} from './common.js';
const imageToUri = (await import('image-to-uri')).default;

const start = Date.now();
process.title = 'alert-bot'; // Handy for debugging when you have lots of nodejs processes.
const extendedStyles = radioStyles.concat(demoStyles);
const extendedMap = {}
extendedStyles.forEach(extended => extendedMap[canonicalTag(extended)] = extended);

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
      .option('verbose', {
	alias: 'v',
	type: 'boolean',
	default: false,
	description: "Run with extra debug logging."
      })
      .option('tags', {
	type: 'string', array: true,
	default: radioStyles.map(canonicalTag).concat('fire', 'ice', 'flood', 'help', 'cake'),
	description: "Space-separated enumeration of canonical tags to publish (without emoji)."
      })
      .option('regions', {
	type: 'array', string: true,
	description: "Restrict publication to these hex-code regions. (Empty means no restriction.)"
      })
      .option('kill', {
	type: 'boolean',
	default: true,
	description: "Before publishing, kill the alerts and replies that were published since the last kill, and clear the cache of identifying data in the file system."
      })
      .option('subTimeoutS', {
	type: 'number',
	default: 20,
	description: "If not dryRun or zero, subscribe to each topic for up to this number of seconds, to confirm that everything published to the topic was received."
      })
      .option('throttleMS', {
	type: 'number',
	default: 150,
	description: "Number of milliseconds to pause between publish actions."
      })
      .option('dryRun', {
	type: 'boolean',
	default: false,
	description: "Skip actual publication."
      })
      .strict()
      .parse();

const {baseURL, info, verbose, tags, regions, kill, throttleMS, subTimeoutS, dryRun} = argv; // yargs puts values in argv.

function log(...rest) { // If info, log args (with newline at end).
  if (!info) return;
  console.log(...rest);
}
function debug(...rest) { // If info, log args (with newline at end).
  if (!verbose) return;
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
function create() {
  return P2PWebNetwork.create({region: regions?.length ? P2PWebNetwork.regionCenter(parseInt(regions[0], 16)) : location, infoLogger: log});
}

// Create a p2p node and connect to the YZ network.
let network = await create();

async function getUserIdentity(source, region) { // Promise the author identity labeled by source in the users dictionary, and add region to the list of regions in which it was used.
  let user = users[source];
  // A truthy user.identity is used in signWith, and also indicates that it was used this run.
  user.identity ||= await P2PWebNetwork.createAuthorIdentity({persistAs: source, store: {
    set(key, value) { /* noop */ },
    get(key) { return user.dump; }
  }});
  if (!region) return user.identity;
  const regions = (user.regions ||= []);
  if (!regions.includes(region)) regions.push(region);
  return user.identity
}

let totalKilled = 0;
if (kill) { // Delete everything that had been recorded in killCache.txt in previous runs, and then delete the file.
  const file = await open('killCache.txt').catch(error => (error.code !== 'ENOENT') && console.error(error));
  if (file) {
    for await (const line of file.readLines()) {
      let {eventName, region, owner, subject, source} = JSON.parse(line);
      const signWith = await getUserIdentity(source);
      debug('kill', eventName, region, subject, signWith.authorId);
      if (!dryRun) {
	if (!Array.isArray(subject)) subject = [subject]; // Normally just one subject, but chunked data has an array.
	for (const msgId of subject) {
	  await network.publish({eventName, region, owner, subject:msgId, signWith});
	  if (throttleMS) await P2PWebNetwork.delay(throttleMS);
	}
      }
      totalKilled++;
    }
    if (!dryRun) rm('killCache.txt');
  }
}

function recordForKill({eventName, region, owner, subject, source}) { // Asynchronously add to Record in killCache.txt.
  return appendFile('killCache.txt', JSON.stringify({eventName, region, owner, subject, source}) + EOL, 'utf8');
}
let totalPublications = 0;
const topics = {}; // Map topic JSON string => {nPublished, isChunk, nReceived};
function countTopic(topic, subject) {
  const topicKey = JSON.stringify(topic);
  const isChunk = Array.isArray(subject);
  topics[topicKey] ??= {nPublished: 0, isChunk, nReceived: 0};
  topics[topicKey].nPublished += 1;
  totalPublications += isChunk ? subject.length : 1;
}
function record({eventName, region, owner, subject, source}) { // Asynchronously recordForKill and countTopic
  countTopic({name: eventName, region, owner}, subject);
  return recordForKill({eventName, region, owner, subject, source});
}

async function publish({eventName, region, owner, source, ...options}) { // Publish to network.
  const signWith = await getUserIdentity(source, region);
  const subject = dryRun ? Date.now() : await network.publish({eventName, region, owner, ...options, signWith});
  debug('publish', eventName, region, source, signWith.authorId, subject);
  await record({eventName, region, owner, subject, source});
  if (throttleMS) await P2PWebNetwork.delay(throttleMS);
  return subject;
}

// Post to CivilDefense.io (local network or shared, depending on the externaBaseURL).
let totalAlerts = 0;
async function publishAlert({lat, lng, // location on the globe
			     eventTime = Date.now(), // Javscript timestamp
			     source = 'alert-bot', // Identifier key in users dictionary. (Not the handle.)
			     replies = [], // Additional information, if any.
			     topicWithDefaultIcon, // Hashtag with a leading emoji used as an icon on the map.
			     topicKey = canonicalTag(topicWithDefaultIcon) // Stripping off any leading emoji.
			    }) {
  if (!tags.includes(topicKey)) return;
  if (!Array.isArray(replies)) replies = [replies]; // Accept array or single reply.
 
  // First we publish the "alert" - which will appear as an icon on the map.  
  // If the user opens it, it has a timestamp and an identicon for the source string.
  // To do this, we actually publish to a series of different eventNames based on map position. See s2.js.
  const region = P2PWebNetwork.regionCode(lat, lng);
  const cells = getContainingCells(lat, lng);
  const payload = {lat, lng};
  let alertIdentifier;
  for (const cell of cells) {
    const eventName = alertTopic(cell, topicKey);
    const msgId = await publish({eventName, region, payload, issuedTime: eventTime, hashtag: topicWithDefaultIcon, source});
    alertIdentifier = msgId;
  }
  for (const reply of replies) { // If there is more information, post that as a "reply" to the alertIdentifier.
    let payload = reply, replySource = source;
    if (reply.message) { // Each reply can be a string or an object with message and optional user and filename.
      const {message, user = source, filename} = reply;
      replySource = user;
      payload = {message};
      if (filename) {
	const dataURL = imageToUri(`./images/${filename}`); // Synchronous. Go figure.
	const blob = await P2PWebNetwork.dataURL2blob(dataURL, filename);
	const signWith = await getUserIdentity(source, region);
	const {topic:file, msgIds} = await network.chunkifyBlob({blob, region, signWith, maxDimension: 0});
	debug('publish chunk', file, msgIds.length, 'chunks.');
	totalPublications += msgIds.length;
	payload.file = file;
	countTopic(file);
	const {name, owner} = file;
	await record({eventName:name, region, owner, subject: msgIds, source});
	payload.name = filename;
	if (throttleMS) await P2PWebNetwork.delay(throttleMS);
      }
    }
    eventTime += 1e3;
    await publish({eventName: alertIdentifier, region, payload, issuedTime: eventTime, source: replySource});
  }
  totalAlerts++;
  if (!info) return;
  log(makeURL({subject: alertIdentifier, lat, lng, tag: topicWithDefaultIcon}));
}
  
for (const code of await readdir(streamingRootPath)) {
  if (regions && !regions.includes(code)) continue;
  const codeDir = `${streamingRootPath}/${code}`;
  for (const styleFileName of await readdir(codeDir)) {
    const style = styleFileName.slice(0, -'.json'.length);
    const canonical = canonicalTag(style)
    if (!tags.includes(canonical)) continue; // optimization
    const extended = extendedMap[canonical];
    const path = `${codeDir}/${styleFileName}`;
    const dataModule = await import(path, {with: { type: 'json' }})
	  .catch(_ => {return {default: []};}); // Not all styles are present.
    for (const station of dataModule.default) {
      const {lat, lng, name, url, mime, homepage} = station;
      const title = new URL(homepage).host.replace(/^www\./, '');
      const subject = await publishAlert({lat, lng, topicWithDefaultIcon: extended, replies: [
	{message: `${title}: ${name} ${homepage} ${url}`}
      ]});
    }
  }
}

// Post each datum.
for (const {lat, lng, eventTime, tag, replies, source = 'alert-bot'} of demoData) {
  const region = P2PWebNetwork.regionCode(lat, lng).toString(16);
  if (regions && !regions.includes(region)) continue;
  await publishAlert({lat, lng, eventTime, topicWithDefaultIcon: tag, replies, source});
}

// Publish the handle/avatar for each reporting user.
for (const key of Object.keys(users)) {
  const {handle, avatar, identity, regions = []} = users[key];
  const issuedTime = Date.now();
  for (const region of regions) {
    const owner = identity.authorId;
    if (handle) await publish({eventName: agentTopic('handle', owner), region, owner, payload: handle, issuedTime, source: key});
    if (avatar) await publish({eventName: agentTopic('avatar', owner), region, owner, payload: imageToUri(`./images/${avatar}`), issuedTime, source: key});
  }
}


log(`Deleted ${totalKilled} previous publications and then posted ${totalAlerts} alerts with ${totalPublications} publications in ${Object.keys(topics).length} topics, in ${(Date.now() - start).toLocaleString()} ms.`);
await P2PWebNetwork.delay(10e3); // Longer time to allow for migration of data to other roots.
await network.disconnect();

if (!dryRun && subTimeoutS) {
  log(`Now listening for ${subTimeoutS} seconds to confirm delivery.`);
  // Subscribe to everything in parallel.
  network = await create();
  await Promise.all(Object.keys(topics).map(topicString => {
    const {name, region, owner} = JSON.parse(topicString);
    const topicData = topics[topicString];
    const handler = ({deleted}) => {
      topicData.nReceived++;
      debug(deleted ? 'deleted' : 'received', topicString);
    };
    return topicData.isChunk ?
      network.assembleChunkedDataURL({name, region, owner}) :
      network.subscribe({eventName: name, region, owner, handler});
  }));
  // Wait for everyone to report.
  await P2PWebNetwork.delay(subTimeoutS * 1e3);
  await network.disconnect();
  // Report any incorrect results.
  for (const topicString in topics) {
    const {nPublished, nReceived} = topics[topicString];
    if (nPublished === nReceived) continue;
    console.log(`Topic ${topicString} published ${nPublished} but received ${nReceived}!`);
  }
}
