import { AxonaPeer, AxonaDomain, NeuronNode, AxonaManager, deriveIdentity, dumpIdentity, loadIdentity, deriveTopicId, geoCellId, geoCellCenter } from '@axona/protocol';
// What is the right way to use webTransport? It doesn't seem to define a usable export nor define the necessary dependencies.
// So here we guess:
import wrtc from '@roamhq/wrtc';
globalThis.RTCPeerConnection = wrtc.RTCPeerConnection;
import { webTransport } from './node_modules/@axona/protocol/src/transport/web/index.js';

const { BigInt } = globalThis;
//const { URL, WebSocket } = globalThis; // For linters.
//import { WebContact } from '@yz-social/kdht';
import { v4 as uuidv4 } from 'uuid';
import process from 'node:process';

/* Temporary!
   
   For the time being, we also run an an alternate data store on the portal, in parallel to the DHT.
   The alternative and the DHT do NOT share data. One must use one or the other.
   The alternate allows us distinguish between bugs in the app vs bugs on the DHT.

   This alternative can be reached via the civildefense.io app by using a ?dht=0 query parameter.
   To have the bot use this, specify --dht 0 in the command line (e.g., node ./index.js --dht 0).
*/

export function regionPublisher(origin) {
  return geoCellId(origin.lat, origin.lng).toString(16).padStart(2, '0') + '0'.repeat(64);
}

export class NetworkClass {
  static configure({lat = 37.468467587148844, lng = -122.25860595703126} = {}) {
    this.region = geoCellCenter(geoCellId(lat, lng));
  }
  static async delay(ms, label = '', result) {
    console.log('delay', label, ms);
    await new Promise(resolve => setTimeout(resolve, ms, result));
    console.log('delayed');
    return result;
  }
  static async create({info, debug, region = this.region} = {}) {
    const contact = new this();
    await this.delay(1e3, 'start');
    // There is one peer doing all the alert-bot publishing, and we reuse the same identify for it on each run.
    // This is not the same as the application-level actor.
    const identity = await loadIdentity({"id":"80459655d660a503e6e8c66a8107091e368c3bdf1eb6f1a9ab298eb626ffe21814","pubkey":"01b76928b634daa48b145299da9868df8fa28da02b1a9ef1991099839827e014","privkey":"MC4CAQAwBQYDK2VwBCIEIJFDLeJS9AWSRYwJaiSCn+yX8VUnTtqwv/Zmfl+MtNiO","region":{"lat":34.64422054710852,"lng":-124.50852298766841},"createdAt":1780441759240});
    //const identity = await deriveIdentity(region);
    console.log(JSON.stringify(await dumpIdentity(identity)));
    await this.delay(1e3, 'creating transport');
    const transport = webTransport({ bridgeUrl: 'wss://bridge.axona.net', identity});
    await this.delay(1e3, 'starting transport');
    await transport.start(identity.id);
    const node     = new NeuronNode({
      id:  BigInt('0x' + identity.id),
      lat: region.lat, lng: region.lng,
    });
    node.transport = transport;
    const domain   = new AxonaDomain({ k: 20 });
    await this.delay(1e3, 'creating peer');
    contact.peer = new AxonaPeer({ domain, node, identity, transport });
    await this.delay(1e3, 'created peer');
    return contact;
  }
  async connect({} = {}) {
    await this.peer.join();
    console.log('joined', this.peer.health());
    await this.constructor.delay(1e3, 'after join');
    console.log('after pause', this.peer.health());
    const READY_SYNAPSE_COUNT = 4;
    const READY_TIMEOUT_MS    = 10_000;
    const waitForMeshReady = async () => {
      const t0 = Date.now();
      let now;
      while ((now = Date.now()) - t0 < READY_TIMEOUT_MS) {
	const size = this.peer._node.synaptome.size;
	//console.log({t0, now, READY_TIMEOUT_MS, size, READY_SYNAPSE_COUNT});
	if (size >= READY_SYNAPSE_COUNT) return this.peer._node.synaptome.size;
	await this.constructor.delay(200);
      }
      return this.peer._node.synaptome.size;
    };
    await waitForMeshReady();
    console.log('waited', this.peer.health());
  }
  async disconnect() { // Close network connection, if any.
    console.log('leaving', this.peer.health());
    await this.peer.leave();
    //console.log('stopping', this.peer.health());
    await this.peer.stop();
    //console.log('stopped', this.peer.health());
  }
  async publish({eventName, subject, payload, hashtag, act, issuedTime,
		 publisher = null
		}) {
    const message = {subject, payload};
    if (hashtag) message.hashtag = hashtag;
    if (act) message.act = act;
    //console.log('pub', message);
    console.log(eventName, publisher, await deriveTopicId(publisher, eventName), message, await this.peer.pub(eventName, message, { publisher }));
  }
}

//let NetworkClass;

// const dhtIndex = process.argv.indexOf('--dht');
// const externalBaseURLIndex = process.argv.indexOf('--externalBaseURL');
// const verboseIndex = process.argv.indexOf('--verbose');
// const dht = dhtIndex > 0 ? parseInt(process.argv[dhtIndex + 1]) : 1;
// const externalBaseURL = externalBaseURLIndex > 0 ? process.argv[externalBaseURLIndex + 1] : 'http://localhost:3000/kdht';
// const info = true;
// const verbose = verboseIndex > 0 ? JSON.parse(process.argv[verboseIndex + 1]) : false;

// if (dht !== 0) {

//   NetworkClass = WebContact;

// } else {

//   NetworkClass = class WebSocketPubSubClient { // A websocket-baed emulation of KDHT WebContact's connect/disconnect/subscribe/publish
//     flog(...rest) {
//       console.log(...rest);
//     }
//     log(...rest) {
//       if (!verbose) return;
//       this.flog(...rest);
//     }
//     ilog(...rest) {
//       if (!verbose && !info) return;
//       this.flog(...rest);
//     }
//     static async create({name = uuidv4()} = {}) {
//       const contact = new this();
//       const {promise:attachment, resolve:attached} = Promise.withResolvers();
//       const {promise:detachment, resolve:detached} = Promise.withResolvers();
//       Object.assign(contact, {attachment, detachment, attached, detached, name});
//       return Promise.resolve(contact); // WebContact returns a Promise, so we do, too.
//     }
//     async disconnect() { // Close network connection, if any.
//       const socket = await this.connection;
//       socket?.close(3000, 'inactivity');
//       this.connection = null;
//     }
//     async replicateStorage() { // In the KDHT, this ensure that the data we store is replicated on other nodes. No-op for server-based storage
//     }
//     connection = null; // Promise established at start of connect(), that resolves to socket/channel when open.
//     attachment = null; // In the DHT, this promise resolves to self when joined, but here it happens at the same time as connection.
//     detachment = null; // Promise established at start of connect(), that resolves when closed.
//     async connect(baseURL = externalBaseURL, wsURL = new URL(baseURL).origin.replace(/^http/, 'ws') + '/ws') { // Establish or re-establish a connection.
//       if ((await this.connection)?.readyState === WebSocket.OPEN) {
// 	//console.log('already connected');
// 	return this;
//       }
//       this.connection = new Promise(resolveConnection => { // Resolves to connection when open, b/c sending over a still-opening socket gives error.
// 	const socket = new WebSocket(wsURL);
// 	socket.onmessage = event => this.receive(JSON.parse(event.data));
// 	socket.onopen = () => {
// 	  if (socket.readyState !== WebSocket.OPEN) return; // You would think that can't happen, but...
// 	  this.ilog('connection open', wsURL);
// 	  resolveConnection(socket);
// 	  this.attached(this);
// 	};

// 	// onerror is of no help, as the event is generic.
// 	socket.onclose = event => {
// 	  this.ilog('websocket close', event.code, event.wasClean, event.reason);
// 	  this.detached(event.reason ===  'inactivity');
// 	  this.attached(this);
// 	  resolveConnection( null); // If anyone is waiting or will wait.
// 	  this.connection = this.attachment = this.detachment = null;
// 	};
//       });
//       await this.connection;
//       return this;
//     }

//     // In the DHT, there is storeValue(key, storageItems).
//     // For server-based pubsub, the eventName string is embedded within each storageItem in each sent/received message.

//     async send(eventName, messageObject) { // Send serialized message when ready, or nothing if no connection.
//       //console.log('send', eventName, messageObject);
//       (await this.connection)?.send(JSON.stringify({eventName, ...messageObject}));
//     };
//     receive(message) {  // Call the handler previously set using subscribe, if any.
//       const {eventName, subject, issuedTime, ...rest} = message;
//       //console.log('receive', {eventName, subject, issuedTime, ...rest});
//       const handler = this.handlers[eventName];
//       if (!handler) return;

//       // If the publish was tagged for filtering by its publisher, check to see if the publisher was here.
//       if (subject) {
// 	const index = this.inFlight.indexOf(subject + issuedTime);
// 	if (index >= 0) {
// 	  this.inFlight.splice(index, 1);
// 	  return;
// 	}
//       }

//       handler({subject, issuedTime, ...rest}, eventName);
//     }
//     handlers = {}; // Mapping eventName => function(messageData) for all active subcriptions
//     inFlight = [];
//     async subscribe({eventName, handler}) { // Assign handler for eventName, or remove any handler if falsy.
//       this.log('sub', {eventName, handler:!!handler});
//       eventName = eventName.toString();
//       if (handler) {
// 	this.handlers[eventName] = handler;
// 	await this.send(eventName, {type: 'sub', subject: this.name, payload: this.name});
//       } else {
// 	delete this.handlers[eventName];
// 	await this.send(eventName, {type: 'sub', subject: this.name, payload: null});
//       }
//     }
//     async publish({eventName, key, subject, immediate = false, issuedTime = Date.now(), ...rest}) { // Publish data to subscribers of eventName.
//       // key is ignored in server/websocket implemention.
//       this.log('pub', {eventName, subject, issuedTime, rest});
//       eventName = eventName.toString();

//       // IFF this client has a handler for this eventName, evaluate it immediately and tag the
//       // publish with a recognizable value so that we can ignore its receipt.
//       if (immediate && this.handlers[eventName]) { // Execute immediately.
// 	this.inFlight.push(subject + issuedTime);
// 	this.handlers[eventName]({subject, issuedTime, ...rest, immediateLocalAction: true}, eventName);
//       }

//       await this.send(eventName, {subject, issuedTime, ...rest, type: 'pub'});
//     }
//     async extend({eventName, subject, issuedTime = Date.now(), ...rest}) { // Extend the expiration of a publish by someone else, without changing the payload.
//       eventName = eventName.toString();
//       await this.send(eventName, {subject, issuedTime, ...rest, type: 'ext'});
//     }
//   };
// }

// export { NetworkClass };
