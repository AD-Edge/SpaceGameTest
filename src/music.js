//import {zzfx} from './lib/zzfx.js'
//import {ZZFX, zzfx} from './ZzFX.js'
//import {zzfxm} from './lib/zzfxm.js'
export function sfxPlayButton() {
    zzfx(...[,,200,.01,,.20,,,,,,,,0]); // Drum
}

export function sfxPlayPuff() {
    zzfx(...[.7,.1,530,.08,.01,.3,2,.93,,.5,,,.15,5,,1,,.99,.001,.27]); // Explosion 30
}


let init = true;

let buffer;
let node;


// Create a song
//let mySongData = zzfxM(`./assets/music/sanxion.js`);
// Play the song (returns a AudioBufferSourceNode)
//let myAudioNode = zzfxP(...mySongData);
// Stop the song
//myAudioNode.stop();

    //zzfx(...[,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17]); // Game Over

    //zzfx(...[,,537,.02,.02,.22,1,1.59,-6.98,4.97]); // Heart

    //zzfx(...[1.5,.8,270,,.1,,1,1.5,,,,,,,,.1,.01]); // Piano

    //zzfx(...[,,129,.01,,.15,,,,,,,,5]); // Drum


// Later, play the sound
//if (player.hit(enemy)) {
if(init) {
 
    

    // // Build an explosion sound for use later
    // const explosion = zzfxM(...[,,333,.01,0,.9,4,1.9,,,,,,.5,,.6]);
    // zzfxP(explosion);

    //Loads a song
    // const load = async name => {
    //     //const res = await fetch(`../songs/${name}.js`);
    //     const res = await fetch(`assets/music/sanxion.js`);
    //     const src = await res.text();
    //     return parse(src);
    // }





    init = false;
}