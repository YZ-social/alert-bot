const observer = "👁️ observer corps DEMO";
const community = "🩷 community support DEMO";
const utility = "🧰 utility repairs DEMO";
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
export const styles = [fire, ice, flood, cake, democrazy, help, avoid, clear, medic, hospital, rally, restroom];

function ago(targetMinutes, rangeMinutes = 1) { // Return a random time approximately targetMintues ago
  const ago = targetMinutes * 60e3 + rangeMinutes/2 * 60e3 - Math.random() * rangeMinutes/2 * 60e3;
  return Math.round(Date.now() - Math.max(0, ago)); // Do not go into the future.
}

export const users = {
  ['alert-bot']: {handle: 'alert-bot', avatar: 'alert-bot.jpg', dump: '{"kind":"author","pubkey":"5a12889c94e14b4e7bff94824685a666e11747ceea6a68a53b81cd0631312d1b","privkey":"MC4CAQAwBQYDK2VwBCIEIIb8LcDnTDWtOWCAm8OxxUGn/pmCQD4NDRW/DvqVdxMW","createdAt":1783202744364}'},
  user2: {handle: 'alice', avatar: 'alice.jpeg', dump: '{"kind":"author","pubkey":"d9980054573d559bd65459426a2ffd64ac384fb9de5fa2d2eb1334f1dbd9ab20","privkey":"MC4CAQAwBQYDK2VwBCIEIPpQLxN9mNrDZebALJz1jb03lpEMQ6I1wAQ+Yg4/2vHV","createdAt":1783300645760}'},
  user3: {handle: 'bob', avatar: 'bob.jpg', dump: '{"kind":"author","pubkey":"66ae6f79c7458e5393c2d80c3cb6dabf614e3e7085dbfd3dd388d5a4d0b5171b","privkey":"MC4CAQAwBQYDK2VwBCIEIMTEQ6txMRj6io/i9HMF9p7Vt9R+Dyck6hfMTD1j+IPQ","createdAt":1783300703080}'},

  a: {handle: 'alex', dump: '{"kind":"author","pubkey":"5de3cc378698696ff3accdfaa927f53c05ff63a053a9afebef271a5f87624c00","privkey":"MC4CAQAwBQYDK2VwBCIEIPM7qONW6gcpKTyazywhfCNa2yQB/dQpWpX8XhU0iACH","createdAt":1785436071603}'},
  b: {handle: 'barb', dump: '{"kind":"author","pubkey":"c5bb878453ca47d5d52805e6becb90eb1041ac522d2351561174d1f62102364c","privkey":"MC4CAQAwBQYDK2VwBCIEIFVPBagXU50ioDNkphaZ19gOHz5g5lj6n6Fd5SUHFOm5","createdAt":1785263749744}'},
  c: {handle: 'chuck', dump: '{"kind":"author","pubkey":"b1201894688a92c59305a78db818dd55efe022c3e89132d8c7202a7333e82b4c","privkey":"MC4CAQAwBQYDK2VwBCIEIOd6vJWk/WmPT7mO06jj41C3fM0XBn6T1G5vCCnM2ShW","createdAt":1785435937708}'},
  d: {handle: 'denise', dump: '{"kind":"author","pubkey":"d634605587e793ce4c5081511c11e5619c40128269a9ed5cf1872e181d56a466","privkey":"MC4CAQAwBQYDK2VwBCIEIHLUSdQRWKtJxSxAKihdNkxdw6qKysPQ8Pf6HxMVSMRG","createdAt":1785436032843}'},
  e: {handle: 'eve', dump: '{"kind":"author","pubkey":"e96f8917a4a8440536a6b6e17db074b506ac1b7ca2a5ce92c80bac6e6265a37a","privkey":"MC4CAQAwBQYDK2VwBCIEIC3OUcjuVpA/lCCa3ufXjAVsqMtMRQI1I68kKi7xlt1Z","createdAt":1785263648581}'},
  f: {handle: 'frank', dump: '{"kind":"author","pubkey":"df1a152087a213cec0e34e59035a3176e989ac0b2cb22093c45cc27b0299bd55","privkey":"MC4CAQAwBQYDK2VwBCIEIHvG63c7a1fi144Wc9I4ujPJBJ0EecRnI8bC13P4tCOS","createdAt":1785263996941}'},
  g: {handle: 'greta', dump: '{"kind":"author","pubkey":"d23607ab404542b3f2f36a074d5016e87ae036497e3da4338b1e8101257a34ec","privkey":"MC4CAQAwBQYDK2VwBCIEIPLK/vHB+ITSbWTjVGPU3pBLu54h3vpUUbyWBMlRmOzI","createdAt":1785263894850}'},
  h: {handle: 'hector', dump: '{"kind":"author","pubkey":"7416d6ac093e6eaed80052792ed81276fe1ad3f0baa5bb0d89e94ae081a07856","privkey":"MC4CAQAwBQYDK2VwBCIEIAONXEcCdk8G/rsZwG5uGPCxvhUuX8PHiq0pQpg5DRjI","createdAt":1785436117310}'},

  x: {handle: 'xavier', dump: '{"kind":"author","pubkey":"bc4d34ad82365bbf065828cacedbe5055fe259136bc582e75e65b122d917988e","privkey":"MC4CAQAwBQYDK2VwBCIEICddj1QY3s1U5FOnvAv8WeBwu2xWxjKv9pzSaLwE/4Gh","createdAt":1785264023027}'},
  y: {handle: 'yvonne', dump: '{"kind":"author","pubkey":"c6254fc51a367c6641383d7010493fd6cdbeb19777a3912c54fa90b34a1fa462","privkey":"MC4CAQAwBQYDK2VwBCIEIMUejjcHChVaT9rlVccZ8I4093zZVYhDAD3nX+4QId8G","createdAt":1785449979295}'},
  z: {handle: 'zoey', dump: '{"kind":"author","pubkey":"0e41eeac6e07be9b53998b4f30f5c931e8e0341061f8f4b7c4a3446776649f98","privkey":"MC4CAQAwBQYDK2VwBCIEIOT42/jPdoJ5VPVh9n8Bxo/dYnx6vLkkmxf7hs1qOR0M","createdAt":1785264055446}'},

  i: {handle: 'ishmael', dump: '{"kind":"author","pubkey":"05bde76c5ebe8ba54f0c0222d639aa2537e6b4b54eff02fc83ccb4a6a19f6742","privkey":"MC4CAQAwBQYDK2VwBCIEIHyAXHk9XpyU/3WnsGZKBC1NSl5R3igGUH41RYDcJNrb","createdAt":1785436196179}'},
  j: {handle: 'jack', dump: '{"kind":"author","pubkey":"f98a81a1a03e0c6a7742d49f1ea3173fb9255c03b1224badeee09547e1afe8d8","privkey":"MC4CAQAwBQYDK2VwBCIEIK/Cp5WBc1fxPl5KIpRKxigldZ+iVYu1rXDXNi5DBX30","createdAt":1785264072802}'},
  k: {handle: 'karen', dump: '{"kind":"author","pubkey":"31d98631b0c79cf30d11e03f1c22fde0d3624e12249b3e6e8b41a76470822ff2","privkey":"MC4CAQAwBQYDK2VwBCIEIJhszToa91Xg3fSNdOwCgKoXIEv1TKkIaEIKm8SIC/zI","createdAt":1785436243139}'}
};

/*
Example, to impersonate alert-bot in civildefense.io,
localStorage.setItem('oldUser', localStorage.getItem('usertag'));
localStorage.setItem('usertag', '5a12889c94e14b4e7bff94824685a666e11747ceea6a68a53b81cd0631312d1b');
localStorage.setItem(localStorage.getItem('usertag'), '{"kind":"author","pubkey":"5a12889c94e14b4e7bff94824685a666e11747ceea6a68a53b81cd0631312d1b","privkey":"MC4CAQAwBQYDK2VwBCIEIIb8LcDnTDWtOWCAm8OxxUGn/pmCQD4NDRW/DvqVdxMW","createdAt":1783202744364}');
// And then later:
// localStorage.setItem('usertag', localStorage.getItem('oldUser'))

//user b:
localStorage.setItem('usertag', 'c5bb878453ca47d5d52805e6becb90eb1041ac522d2351561174d1f62102364c');
localStorage.setItem(localStorage.getItem('usertag'), '{"kind":"author","pubkey":"c5bb878453ca47d5d52805e6becb90eb1041ac522d2351561174d1f62102364c","privkey":"MC4CAQAwBQYDK2VwBCIEIFVPBagXU50ioDNkphaZ19gOHz5g5lj6n6Fd5SUHFOm5","createdAt":1785263749744}');
//user e:
localStorage.setItem('usertag', 'e96f8917a4a8440536a6b6e17db074b506ac1b7ca2a5ce92c80bac6e6265a37a');
localStorage.setItem(localStorage.getItem('usertag'), '{"kind":"author","pubkey":"e96f8917a4a8440536a6b6e17db074b506ac1b7ca2a5ce92c80bac6e6265a37a","privkey":"MC4CAQAwBQYDK2VwBCIEIC3OUcjuVpA/lCCa3ufXjAVsqMtMRQI1I68kKi7xlt1Z","createdAt":1785263648581}');
*/



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

  // Demo script
  // http://civildefense.io/?bridge=wss://testnet.axona.net&tags=%F0%9F%A9%B7%20community%20support%20DEMO,%F0%9F%91%81%EF%B8%8F%20observer%20corps%20DEMO,%F0%9F%A7%B0%20utility%20repairs%20DEMO&lat=44.948797641130824&lng=-93.26159758507859&z=14
  {lat: 44.95914228777231, lng: -93.24729681015016, eventTime: ago(21 * 60), tag: observer, source: 'b', replies: [
    {message: 'Checkpoint at Cedar & 24th, vehicles stopped in both directions'},
    {message: 'I see them, 4 vehicles, looks like they’re checking IDs', filename: "roadblock.png", user: 'a'},
    {message: 'Northbound only, southbound lane is clear', user: 'a', add: 8},
    {message: 'My neighbor just drove through, they waved her on, didn’t stop her', user: 'b', add: 22 - 8},
    {message: 'Still there', user: 'a', add: 1.5 * 60 - 22},
    {message: 'Legal observer heading over', user: 'b', add: 30},
    {message: 'Legal observer on site, documenting', user: 'b', add: 30},
    {message: 'They’re packing up', user: 'a', add: 1.5 * 60},
    {message: 'All clear, drove past, nobody there', user: 'c', add: 2 * 60}
  ]},
  {lat: 44.94876330298185, lng: -93.24740409851076, eventTime: ago(17 * 60), tag: observer, source: 'e', replies: [
    {message: 'Unmarked white van, Cedar Ave near Lake St, 3 individuals in vests, stationary 30+ min'},
    {message: 'Same van was on Franklin yesterday around noon, I got a partial plate', add: 15, user: 'd'},
    {message: 'MN plates, starts with EF', add: 5, user: 'e'},
    {message: 'They moved, now parked on 2nd Ave near the halal store', add: 180, user: 'd'},
    {message: 'Gone from 2nd Ave', add: 3 * 60, user: 'f'},
    {message: 'FYI someone posted about a similar van last week, different topic', add: 2 * 60, user: 'e'}
  ]},
  {lat: 44.944693196058864, lng: -93.25246810913087, eventTime: ago(9 * 60), tag: observer, source: 'g', replies: [
    {message: 'All clear — Bloomington & 32nd presence has dispersed as of 2pm'},
    {message: 'Confirmed, I walked past just now, nothing there', add: 30, user: 'g'},
    {message: 'Thanks for posting this, was nervous to go out', add: 90, user: 'h'}
  ]},
  {lat: 44.93688628795094, lng: -93.26255321502686, eventTime: ago(6 * 60), tag: observer, source: 'f', replies: [
    {message: 'Door-to-door on Chicago Ave 35th–38th, asking for residents by name'},
    {message: 'They skipped the businesses, only hitting apartments', add: 5, user: 'b'},
    {message: 'Two of them, badges visible, clipboards, taking notes', add: 2, user: 'f'},
    {message: 'They moved south past 35th now', add: 5, user: 'b'},
    {message: 'Haven’t seen them since, might be done for today', add: 30, user: 'f'}
  ]},
  {lat: 44.93396981648836, lng: -93.2772731781006, eventTime: ago(1 * 60), tag: observer, source: 'c', replies: [
    //{message: 'Vehicle matching earlier description seen near Nicollet & 38th'}
  ]},
  {lat: 44.92728567738864, lng: -93.27740192413331, eventTime: ago(20), tag: observer, source: 'd', replies: [
    //{message: 'Two people in suits photographing building entrances, Nicollet & 42nd'}
  ]},

  {lat: 44.95596121834308, lng: -93.26585769653322, eventTime: ago(16 * 60), tag: utility, source: 'x', replies: [
    {message: 'Water main break at Park Ave & 26th, avoid area, road flooded'},
    {message: 'Road is completely flooded, bus rerouted', add: 20, user: 'x'},
    {message: 'City crew is here working on it', add: 3 * 60 - 20, user: 'y'},
    {message: 'Fixed overnight, road is open but still wet', add: 11 * 60, user: 'x'}
  ]},
  {lat: 44.92698183440127, lng: -93.26753139495851, eventTime: ago(8 * 60), tag: utility, source: 'z', replies: [
    {message: 'Power outage affecting blocks around Portland & 42nd, Xcel aware'},
    {message: 'Xcel says estimated restore 6pm', add: 45, user: 'z'}
  ]},

  {lat: 44.94645302117303, lng: -93.2659435272217, eventTime: ago(4 * 60), tag: community, source: 'j', replies: [
    {message: "Free winter coats + hot food, All God's Children Church parking lot until 4pm"},
    {message: 'Do they have kids sizes?', add: 5, user: 'i'},
    {message: 'Yes! tons of kids coats, also hats and gloves', add: 7, user: 'j'},
    {message: 'There’s a line but it’s moving fast', add: 18, user: 'j'},
    {message: 'They also have diapers and formula, didn’t see that in the post', add: 30, user: 'k'},
    {message: 'Coats are running low, still have food', add: 60, user: 'j'},
    {message: 'They’re packing up, said they’ll be back next Saturday same time', add: 110, user: 'k'}
  ]},

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
  {lat: 37.467603274015495, lng: -122.26244688034059, eventTime: ago(1), tag: flood,
   //replies: [{message: 'Maybe the damn burst will put the fires out?', user: 'user2'}]
  },
  {lat: 50, lng: 17, eventTime: ago(1), tag: flood, replies: [{message: 'Canned data in eastern europe', user: 'user2'}]},

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
