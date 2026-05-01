// Topic constants with emoji tags for radio station styles
export const news = "🎙️ news";
export const classicRock = "🎸 classic rock";
export const jazz = "🎷 jazz";
export const pop = "🎵 pop";
export const hiphop = "🎤 hiphop";
export const edm = "🎧 edm";
export const country = "🤠 country";
export const classical = "🎼 classical";

// Map style names to their emoji-tagged constants
const styleMap = {
  'news': news,
  'classic rock': classicRock,
  'jazz': jazz,
  'pop': pop,
  'hiphop': hiphop,
  'edm': edm,
  'country': country,
  'classical': classical
};

// Default metro regions with bounding boxes [minLat, minLng, maxLat, maxLng]
export const defaultRegions = {
  'north-america': {
    label: 'North America',
    regions: [
      { name: 'San Francisco Bay Area', bbox: [37.3, -123.5, 38.0, -121.5] },
      { name: 'New York', bbox: [40.5, -74.3, 40.9, -73.7] },
      { name: 'Los Angeles', bbox: [33.7, -118.5, 34.2, -117.5] },
      { name: 'Chicago', bbox: [41.6, -88.3, 42.0, -87.5] },
      { name: 'Seattle', bbox: [47.4, -122.5, 47.7, -122.2] }
    ]
  },
  'europe': {
    label: 'Europe',
    regions: [
      { name: 'London', bbox: [51.3, -0.5, 51.7, 0.3] },
      { name: 'Berlin', bbox: [52.3, 13.1, 52.7, 13.7] },
      { name: 'Paris', bbox: [48.7, 2.2, 48.9, 2.5] },
      { name: 'Amsterdam', bbox: [52.3, 4.8, 52.4, 5.0] },
      { name: 'Madrid', bbox: [40.3, -3.9, 40.5, -3.5] }
    ]
  },
  'asia': {
    label: 'Asia',
    regions: [
      { name: 'Tokyo', bbox: [35.5, 139.5, 35.8, 140.0] },
      { name: 'Singapore', bbox: [1.2, 103.6, 1.5, 104.0] },
      { name: 'Hong Kong', bbox: [22.2, 114.0, 22.4, 114.3] },
      { name: 'Bangkok', bbox: [13.6, 100.4, 13.8, 100.8] },
      { name: 'Seoul', bbox: [37.4, 126.8, 37.6, 127.2] }
    ]
  }
};

/**
 * Fetch radio stations from the radio-browser.info API
 * @param {string[]} styles - Array of style names (e.g., ['news', 'jazz'])
 * @param {Array} regionsLatLng - Array of regions with bbox: [minLat, minLng, maxLat, maxLng]
 * @param {number} countPerRegion - Number of stations to fetch per region per style
 * @returns {Promise<Object[]>} Array of station objects with alert-bot format
 */
export async function fetchStations(styles = ['news'], regionsLatLng = [], countPerRegion = 5) {
  const stations = [];
  const collectedStations = [];
  
  for (const style of styles) {
    const tag = styleMap[style] || `🎵 ${style}`;
    
    try {
      // Build API URL with search parameters
      const apiUrl = new URL('https://de1.api.radio-browser.info/json/stations/search');
      apiUrl.searchParams.set('tag', style);
      apiUrl.searchParams.set('limit', 20); // Fetch more to get enough with geo
      
      // Fetch stations from the API
      const response = await fetch(apiUrl.toString());
      if (!response.ok) {
        console.error(`Failed to fetch stations for ${style}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      // Collect stations with geo
      for (const station of data) {
        const stationLat = parseFloat(station.geo_lat);
        const stationLng = parseFloat(station.geo_long);
        if (stationLat && stationLng) {
          collectedStations.push({ station, tag });
        }
      }
    } catch (error) {
      console.error(`Error fetching stations for style "${style}":`, error.message);
    }
  }
  
  // Now assign to regions
  let stationIndex = 0;
  for (const region of regionsLatLng) {
    const { bbox, name: regionName } = region;
    if (!bbox || bbox.length !== 4) continue;
    
    const [minLat, minLng, maxLat, maxLng] = bbox;
    
    for (let i = 0; i < countPerRegion; i++) {
      if (stationIndex >= collectedStations.length) break; // No more stations
      
      const { station, tag } = collectedStations[stationIndex];
      stationIndex++;
      
      const stationLat = parseFloat(station.geo_lat);
      const stationLng = parseFloat(station.geo_long);
      
      // Use actual geo if in bbox, else region center
      let lat = stationLat, lng = stationLng;
      if (!(stationLat >= minLat && stationLat <= maxLat &&
            stationLng >= minLng && stationLng <= maxLng)) {
        lat = (minLat + maxLat) / 2;
        lng = (minLng + maxLng) / 2;
      }
      
      stations.push({
        lat,
        lng,
        tag,
        source: 'alert-bot',
        replies: [{
          message: `${station.name} — ${station.country}. ${station.url}`
        }]
      });
    }
  }
  
  return stations;
}