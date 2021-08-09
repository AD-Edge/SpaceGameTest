// export function sfxPlayButton() {
//     zzfx(...[,,200,.01,,.20,,,,,,,,0]); // Drum
// }

// export function sfxPlayPuff() {
//     zzfx(...[.7,.1,530,.08,.01,.3,2,.93,,.5,,,.15,5,,1,,.99,.001,.27]); // Explosion 30
// }

import { sanxion } from '/assets/music/sanxion.js';

import { sanxion2 } from '/assets/music/sanxion2.js';

const songData = sanxion;
const songData2 = sanxion2;

const buffer = zzfxM(...songData);

//Play Song
const node = zzfxP(...buffer);

//node.stop();

//if (player.hit(enemy)) {
// if(init) {
 

//     init = false;
// }