import yargs from 'yargs';
import {hideBin } from 'yargs/helpers';
import {mkdir, writeFile} from 'node:fs/promises';
import {extname, join} from 'node:path';
import {canonicalTag, P2PWebNetwork} from '@yz-social/civildefense.io';
import {styles as allStyles, streamingRootPath as defaultStreamingRootPath} from './common.js';

const argv = yargs(hideBin(process.argv))
      .usage(`Collect station data from https://www.radio-browser.info/ and write to streaming-radio/<code>/<style>.json`)
      .option('styles', {
	type: 'string', array: true,
	default: allStyles.map(canonicalTag),
	description: "A list of styles to gather."
      })
      .option('root', {
	type: 'string',
	default: defaultStreamingRootPath,
	description: "Root of cache directory in which to write."
      })
      .option('info', {
	alias: 'i',
	type: 'boolean',
	default: true,
	description: "Run with info logging."
      })
      .option('checkStreams', {
	type: 'boolean',
	default: true,
	description: "Check that the announced stream actually works."
      })
      .strict()
      .parse();
const {info, styles, root:streamingRootPath} = argv;
const styleMap = {}; // maps, e.g., "news" => "🎙️ news";
styles.forEach(extended => styleMap[canonicalTag(extended)] = extended);

const audioMap = {
  mp3: 'audio/mpeg',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  opus: 'audio/ogg',
  m4a: 'audio/mp4',
  m3u8: 'audio/x-mpegurl',
  mp3u: 'audio/x-mpegurl',
  mpu: 'audio/x-mpegurl',
  mpd: 'application/dash+xml',
  // pls: 'audio/x-scpls' // Players gotta play
}

function tick(string = ".") { // If info, lock string without newlines.
  if (!info) return;
  process.stdout.write(string);
}
function log(...rest) { // If info, log args (with newline at end).
  if (!info) return;
  console.log(...rest);
}
async function safeFetch(url) { // fetch(url), but instead of throwing, log the error and answer falsy.
  const response = await fetch(url)
	.catch(error => log(url, error.cause?.message || error.cause || error.message));
  if (!response) return null;
  if (!response.ok) return log(url, response.statusText);
  const size = response.headers.get('content-length');
  if (size && !parseInt(size)) return log(url, "Empty");
  return response;
}

const homepages = new Set(); // For dedupping.
export async function fetchStations(styles) {
  const start = Date.now();
  const codesData = {}; // Maps Axon code => {[style], [stationData...]}
  const perQueryCount = 100;
  let total = 0;

  // Gather data for each requested style.
  for (const style of styles) {
    const tag = canonicalTag(style);
    const extended = styleMap[tag];
    let offset = 0;
    let data = [];
    let count = 0;
    const start = Date.now();
    tick(extended);
    do { // API shuts down getting everything at once, so loop perQueryCount at a time.
      tick('.');
      const apiUrl = new URL('https://de1.api.radio-browser.info/json/stations/search');
      apiUrl.searchParams.set('tag', tag);
      apiUrl.searchParams.set('hidebroken', true);
      apiUrl.searchParams.set('limit', perQueryCount);
      apiUrl.searchParams.set('offset', offset);
      offset += perQueryCount;
      const response = await safeFetch(apiUrl.toString());
      if (!response) break;
      data = await response.json();
      for (const {geo_lat, geo_long, name, url, homepage, favicon} of data) {
	if (!geo_lat || !geo_long || !homepage) continue;
	if (homepages.has(homepage)) continue; // Dedupe by homepage.
	const mime = audioMap[extname(url).replace(/^\./, '')];
	if (!mime) continue;
	if (!(await safeFetch(url))) continue;
	homepages.add(homepage);
	const lat = parseFloat(geo_lat);
	const lng = parseFloat(geo_long);
	const code = P2PWebNetwork.regionCode(lat, lng).toString(16).padStart(2, '0');
	const stylesData = codesData[code] ||= {};
	const stationsData = stylesData[extended] ||= [];
	count++;
	stationsData.push({name: name.trim(), lat, lng, url, mime, favicon, homepage});
      }
    } while (data.length);
    total += count;
    log(count, 'usable stations in', (Date.now() - start).toLocaleString(), 'ms.');
  }

  // Write to streamingRootPath/code/style.json
  const codes = Object.keys(codesData);
  log('Writing', codes.length, 'codes:');
  let nFiles = 0;
  for (const code of codes) {
    const stylesData = codesData[code];
    const codePath = join(streamingRootPath, code);
    await mkdir(codePath, {recursive: true});
    const styles = Object.keys(stylesData);
    log('  ', code, 'has', styles.length, 'styles:');
    for (const style of styles) {
      const stationsData = stylesData[style];
      log('    ', style, 'has', stationsData.length, 'stations.');
      const stylePath = join(codePath, style) + '.json';
      await writeFile(stylePath, JSON.stringify(stationsData), 'utf8');
      nFiles++;
    }
  }
  log(`Wrote ${total} stations to ${nFiles} files in ${codes.length} regions over ${(Date.now() - start).toLocaleString()} ms.`);
  return codesData;
}
await fetchStations(styles);

/*
  const modules = await Promise.all(styles.map(style => import(`./streaming-radio/80/${style}.json`, {with: { type: 'json' }})));
  modules.reduce((acc, module) => acc + module.default.length, 0)
 */
