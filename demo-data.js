const fire = "🔥 fire"; // With emoji so that people who just add the topic "fire" have a nice icon on the map.
const ice = "🧊 ice";
const flood = "🌊 flood";


function ago(targetMinutes, rangeMinutes = 1) { // Return a random time approximately targetMintues ago
  const ago = targetMinutes * 60e3 + rangeMinutes/2 * 60e3 - Math.random() * rangeMinutes/2 * 60e3;
  return Math.round(Date.now() - Math.max(0, ago)); // Do not go into the future.
}

export const demoData = [
  // Fire
  {lat: 37.453500359600035, lng: -122.27911949157715, eventTime: ago(3), tag: fire},
  {lat: 37.464503586118525, lng: -122.2788190841675, eventTime: ago(5), tag: fire},
  {lat: 37.46777358281261, lng: -122.27748870849611, eventTime: ago(4), tag: fire},
  {lat: 37.47223553504491, lng: -122.26778984069826, eventTime: ago(3), tag: fire},
  {lat: 37.47179275779608, lng: -122.26040840148927, eventTime: ago(2), tag: fire},
  {lat: 37.470430349809625, lng: -122.25856304168703, eventtime: ago(1), tag: fire},

  // Flood
  {lat: 37.467603274015495, lng: -122.26244688034059, eventtime: ago(1), tag: flood},

  // Ice
  {lat: 37.48380854647693, lng: -122.24404960870746, eventTime: ago(5), tag: ice},
  {lat: 37.482867787390276, lng: -122.24594324827197, eventTime: ago(4), tag: ice},
  {lat: 37.48134594614139, lng: -122.24717438220979, eventTime: ago(3), tag: ice},
  {lat: 37.48033278708841, lng: -122.24909484386446, eventTime: ago(2), tag: ice, replies: "They aren't stopping!"},
  {lat: 37.47896627769895, lng: -122.25022137165071, eventTime: ago(1), tag: ice, replies: [
    {message: "This is what I'm seeing", user: 'user2', filename: "ice-image.png"},
    {message: "omg!", user: 'user3'}
  ]}
];
