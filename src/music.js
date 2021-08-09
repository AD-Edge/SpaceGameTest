// export function sfxPlayButton() {
//     zzfx(...[,,200,.01,,.20,,,,,,,,0]); // Drum
// }

// export function sfxPlayPuff() {
//     zzfx(...[.7,.1,530,.08,.01,.3,2,.93,,.5,,,.15,5,,1,,.99,.001,.27]); // Explosion 30
// }

export function muteOn() {
    setVolume(0); //zzfx
    node.stop();
}
export function muteOff() {
    setVolume(0.09); //zzfx
    node = zzfxP(...buffer);
}



let node = null;


import { sanxion } from '../assets/music/sanxion.js';
import { sanxion2 } from '../assets/music/sanxion2.js';

const songData = sanxion;
const songData2 = sanxion2;


//load this to avoid delay 
let buffer = zzfxM(...songData2);

//Play Song
//node.stop();
//buffer = zzfxM(...songData2);
//const node = zzfxP(...buffer);


//ref https://github.com/keithclark/ZzFXM/blob/master/examples/song-player/index.html


//console.log('not playing music yet');

// This reduces CPU usage when a song isn't playing
// zzfxX.suspend();
// stop();
// setSong();


//if (player.hit(enemy)) {
// if(init) {
 

//     init = false;
// }