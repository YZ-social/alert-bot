
const fire = "🔥 fire"; // With emoji so that people who just add the topic "fire" have a nice icon on the map.
const ice = "🧊 ice";
const flood = "🌊 flood";
const cake = "🍰 cake";
const democrazy = "🇺🇸 democrazy";
const help = "🆘 help";

const avoid = "⛔️ avoid";
const clear = "✅ clear";
const medic = "⛑️ medic";
const hospital = "🏥 hospital";
const rally = "🪧 rally";
const restroom = "🚻 restroom";

function ago(targetMinutes, rangeMinutes = 1) { // Return a random time approximately targetMintues ago
  const ago = targetMinutes * 60e3 + rangeMinutes/2 * 60e3 - Math.random() * rangeMinutes/2 * 60e3;
  return Math.round(Date.now() - Math.max(0, ago)); // Do not go into the future.
}

export const users = {
  ['alert-bot']: {handle: 'alert-bot', avatar: 'alert-bot.jpg', dump: '{"kind":"author","pubkey":"5a12889c94e14b4e7bff94824685a666e11747ceea6a68a53b81cd0631312d1b","privkey":"MC4CAQAwBQYDK2VwBCIEIIb8LcDnTDWtOWCAm8OxxUGn/pmCQD4NDRW/DvqVdxMW","createdAt":1783202744364}'},
  user2: {handle: 'alice', avatar: 'alice.jpeg', dump: '{"kind":"author","pubkey":"d9980054573d559bd65459426a2ffd64ac384fb9de5fa2d2eb1334f1dbd9ab20","privkey":"MC4CAQAwBQYDK2VwBCIEIPpQLxN9mNrDZebALJz1jb03lpEMQ6I1wAQ+Yg4/2vHV","createdAt":1783300645760}'},
  user3: {handle: 'bob', avatar: 'bob.jpg', dump: '{"kind":"author","pubkey":"66ae6f79c7458e5393c2d80c3cb6dabf614e3e7085dbfd3dd388d5a4d0b5171b","privkey":"MC4CAQAwBQYDK2VwBCIEIMTEQ6txMRj6io/i9HMF9p7Vt9R+Dyck6hfMTD1j+IPQ","createdAt":1783300703080}'}
};

// Note: The civildefense.io app downsizes alert images at the client to be no larger than 1024 on the longer dimension,
// but this app does not do that. Please make sure that images are already adjusted in size.
export const demoData = [

  // Movie setup.
  // {lat: 37.7822948, lng: -122.4135586, tag: hospital}, // Golden Gate, two east of Leavenworth.
  // {lat: 37.7859424, lng: -122.4237171, tag: hospital}, // Geary@VanNess x Franklin@Post
  // {lat: 37.7908801, lng: -122.4201728, tag: hospital}, // Hyde, Bush, Pine
  // {lat: 37.7787880226612, lng: -122.41752147674562, tag: rally}, // civic center, Grove
  // {lat: 37.778974579730495, lng: -122.41450130939485, tag: rally}, // Market@8
  // {lat: 37.781060594893326, lng: -122.41181373596193, tag: rally}, // Market@Jones
  // {lat: 37.78321438617593, lng: -122.40904569625856, tag: rally}, // Market@5
  // {lat: 37.785703039281096, lng: -122.40603357553485, tag: rally}, // Market@Stockton
  // {lat: 37.78823400256615, lng: -122.40716814994813, tag: rally}, // Union Square
  // {lat: 37.779415530931715, lng: -122.4158960580826, tag: restroom}, // Fulton Plaza/
  // {lat: 37.787553576232526, lng: -122.40743368864061, tag: restroom}, // Union Square

  // Fire
  {lat: 37.453500359600035, lng: -122.27911949157715, eventTime: ago(1000), tag: fire},
  {lat: 37.464503586118525, lng: -122.2788190841675, eventTime: ago(800), tag: fire},
  {lat: 37.46777358281261, lng: -122.27748870849611, eventTime: ago(600), tag: fire},
  {lat: 37.471626715651524, lng: -122.271526157856, eventTime: ago(400), tag: fire},
  {lat: 37.472563358818114, lng: -122.26354122161867, eventTime: ago(200), tag: fire, replies: 'Here we go'},
  {lat: 37.47179275779608, lng: -122.26040840148927, eventTime: ago(1), tag: fire, replies: [
    {message: 'Getting closer!', user: 'user2'},
    {message: 'stay safe', user: 'user3'}
  ]},

  // Flood
  {lat: 37.467603274015495, lng: -122.26244688034059, eventTime: ago(1), tag: flood, replies: [{message: 'Maybe the damn burst will put the fires out?', user: 'user2'}]},

  // Ice
  {lat: 37.48380854647693, lng: -122.24404960870746, eventTime: ago(1080), tag: ice},
  {lat: 37.482867787390276, lng: -122.24594324827197, eventTime: ago(800), tag: ice},
  {lat: 37.48134594614139, lng: -122.24717438220979, eventTime: ago(540), tag: ice},
  {lat: 37.48033278708841, lng: -122.24909484386446, eventTime: ago(270), tag: ice/*, replies: "They aren't stopping!"*/},
  {lat: 37.47896627769895, lng: -122.25022137165071, eventTime: ago(1), tag: ice, replies: [
    {message: "Avoid this area!", user: 'user2',
     filename: "ice-image.jpg"
    },
    {message: "Heading south", user: 'user3'}
  ]}
];
