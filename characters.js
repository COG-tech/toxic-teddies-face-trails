export const TEDDIES = [
  { id:'tt01', primary:'Toxic Toby', alternate:'Radioactive Ricky', short:'Toby', tagline:'RADIATION MAKES HIM FUN', palette:['#8b5a2b','#5d351b','#b8ef32','#eefc84'], accent:'#b8ef32', feature:'radiation', lore:'A leaking science kit turned Toby into the glow-in-the-dark problem nobody can put back in the toy box.' },
  { id:'tt02', primary:'Moldy Molly', alternate:'Fungus Faye', short:'Molly', tagline:'EXPIRED BUT STILL SMILING', palette:['#76502d','#49331e','#7fa232','#d7e87b'], accent:'#91bd38', feature:'mold', lore:'One forgotten summer in a lunchbox gave Molly a permanent mushroom family.' },
  { id:'tt03', primary:'Dumpster Danny', alternate:'Trashcan Travis', short:'Danny', tagline:"ONE BEAR'S TRASH IS DANNY'S DINNER", palette:['#6e5538','#3b3328','#7b8d42','#c4b46d'], accent:'#a6b959', feature:'trash', lore:'Danny built an alley throne from dented cans and defends every mystery snack.' },
  { id:'tt04', primary:'Sludge Sam', alternate:'Gooey Grant', short:'Sam', tagline:'TOO THICK TO QUIT', palette:['#4a3825','#241f18','#6d8d29','#c4f052'], accent:'#88b532', feature:'sludge', lore:'Sam fell into a drain and came back with less stuffing and considerably more ooze.' },
  { id:'tt05', primary:'Battery Barry', alternate:'Leaking Leon', short:'Barry', tagline:'CHARGED PAST BEDTIME', palette:['#6b4c2d','#352919','#d9c934','#fff47b'], accent:'#f0db36', feature:'battery', lore:'Barry swallowed two batteries and now sparks whenever he gets excited.' },
  { id:'tt06', primary:'Maggot Mitch', alternate:'Wormy Walt', short:'Mitch', tagline:'FULL OF LITTLE IDEAS', palette:['#755032','#3e2c20','#d9d18b','#f6efb1'], accent:'#d8d08a', feature:'maggot', lore:'Mitch has roommates in every seam, and none of them pay rent.' },
  { id:'tt07', primary:'Burger Bear', alternate:'Greasy Gina', short:'Burger', tagline:'DOUBLE STUFFED, NEVER FRESH', palette:['#8a552d','#4a2b19','#e29a38','#f2cf59'], accent:'#e5a33d', feature:'burger', lore:'Burger Bear was left under a diner booth until his belly became the daily special.' },
  { id:'tt08', primary:'Rusty Randy', alternate:'Corroded Cory', short:'Randy', tagline:'BUILT TO FALL APART', palette:['#704627','#33251c','#b45c2c','#df8a45'], accent:'#c96a31', feature:'rust', lore:'Randy replaced his missing stuffing with scrap metal and immediately regretted nothing.' },
  { id:'tt09', primary:'Acid Andy', alternate:'Meltdown Mel', short:'Andy', tagline:'HANDLE WITH MISSING PARTS', palette:['#65442a','#33251c','#b9e63d','#edff83'], accent:'#c8ef42', feature:'acid', lore:'Andy hugged the wrong laboratory barrel and has been dripping through the floor ever since.' },
  { id:'tt10', primary:'Gas Mask Max', alternate:'Fumey Frank', short:'Max', tagline:'FRESH AIR IS SUSPICIOUS', palette:['#4f493d','#2a2823','#7e9b42','#bacb79'], accent:'#8faf4b', feature:'mask', lore:'Max refuses to breathe anything that has not passed through three filters and a bad attitude.' },
  { id:'tt11', primary:'Patchwork Pat', alternate:'Quilted Quinn', short:'Pat', tagline:'SEWN FROM EVERY BAD IDEA', palette:['#825132','#3f2b20','#c94e67','#68a6a2'], accent:'#d86a7f', feature:'patchwork', lore:'Pat is made from twelve retired toys and remembers all of their nightmares.' },
  { id:'tt12', primary:'Plague Bear', alternate:'Sickly Sonny', short:'Plague', tagline:'THE CURE IS WORSE', palette:['#3a3026','#171513','#63743c','#a2b65e'], accent:'#7f954a', feature:'plague', lore:'Plague Bear arrives with a lantern, a beak, and advice nobody survives long enough to review.' }
];

export const LEVELS_PER_TEDDY = 5;
export const TOTAL_LEVELS = TEDDIES.length * LEVELS_PER_TEDDY;

export const DIFFICULTIES = [
  { name:'EASY', tolerance:33, startRadius:48, routes:5, sampleCount:300, backtrack:11 },
  { name:'GROSS', tolerance:29, startRadius:44, routes:7, sampleCount:360, backtrack:9 },
  { name:'TOXIC', tolerance:25, startRadius:40, routes:9, sampleCount:420, backtrack:8 },
  { name:'VILE', tolerance:22, startRadius:37, routes:11, sampleCount:480, backtrack:7 },
  { name:'LEGENDARY', tolerance:19, startRadius:34, routes:13, sampleCount:560, backtrack:5 }
];
