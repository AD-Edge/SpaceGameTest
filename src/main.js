/*Space Game Test.js
//By Alex Delderfield//
//       2021        //
Just some Javascript practice and a small project for me to 
learn about the lightweight Kontra.js game engine.

Started in July 2021, ahead of the 2021 js13k gamejam
Very unoptimized, and yes everything is dumped into 1 file,
this is likely what ill do for js13k to save on files/data...

*laughs* Single-responsibility principle has no powar here**
*/

//for later, dynamic resize?
//canvasObject.setAttribute('width', '475');
import { sfxPlayButton, sfxPlayPuff } from './music.js';

const { init, GameLoop, Button, Text, Grid, 
  SpriteSheet, Sprite, initPointer, track } = kontra;

//get components from index
const { canvas, context } = init();
// console.log(canvas);
console.log(context);

//Initilize interactions
initPointer();

//Initialize Keys
kontra.initKeys();
// var arrows = [37,38,39,40];

//Setup
var playerSprite = null;
var rocketSheet = null;
var rSprite = null;
var grid = 8;
var mvSpd = 0.6;
var mvSpdX = 0;
var mvSpdY = 0;
var numRows = canvas.height / grid;
var numCols = canvas.width / grid;

//Array for blocks
var blocks = [];

//Scene stuff
var timer = 0;
var timerQ = 0;
var sceneChange = -1;
var stateInit = true; //start true to not trigger

//PRIMARY GAME STATE
//0 = Intro Page
//1 = Game 
//2 = Credits
//3 = Gameover
var gameState = 0;

//button states 
var upBool = false;
var dnBool = false;
var lfBool = false;
var riBool = false;
var qtBool = false;

//Load/Create Image Sprites
const playerImg = new Image();
playerImg.src = 'assets/images/rocket.png';

const keyUp = new Image(); keyUp.src = 'assets/images/keyUp.png';
const keyUpds = new Image(); keyUpds.src = 'assets/images/keyUpds.png';
const keyDown = new Image(); keyDown.src = 'assets/images/keyDown.png';
const keyDownds = new Image(); keyDownds.src = 'assets/images/keyDownds.png';
const keyLeft = new Image(); keyLeft.src = 'assets/images/keyLeft.png';
const keyLeftds = new Image(); keyLeftds.src = 'assets/images/keyLeftds.png';
const keyRight = new Image(); keyRight.src = 'assets/images/keyRight.png';
const keyRightds = new Image(); keyRightds.src = 'assets/images/keyRightds.png';

const rocketImage = new Image();
rocketImage.src = 'assets/images/flame_sheet_32x36.png';

//handle loading of images, trigger initial state once loaded
rocketImage.onload = () => {  
    stateInit = false;
};

//Text and Buttons
let textStyle = null;
let title = null;
let credits = null;
let startButton = null;
let credButton = null;
let quitButton = null;
let backButton = null;

//Main Menu Grid Interface
let menuGrid = null;

//Lower Controls Area (GAME)
let CTRLArea = null;
let CTRLCol = null;

//Lower Controls Area (MENU)
let CTRLAreaMenu = null;
let CTRLColMenu = null;

//Multi-function button trigger for navigation
function buttonRender(ct, id) {
    // focused by keyboard
    if (ct.focused) {
        ct.context.setLineDash([8,10]);
        ct.context.lineWidth = 3;
        ct.context.strokeStyle = 'grey';
        ct.context.strokeRect(0, 0, ct.width, ct.height);
      }
      // pressed by mouse, touch, or enter/space on keyboard
      if (ct.pressed) {  
        ct.textNode.color = 'black';
        if(timer <= 0) { // only plays once
            sfxPlayButton(); //sfx
        }

        timer = 0.25; //set delay for transition
        sceneChange = id; //trigger transition to scene [id]
        
      }
      // hovered by mouse
      else if (ct.hovered) {
        ct.textNode.color = '#CCCCCC';
        canvas.style.cursor = 'pointer';
      }
      else  {
        ct.textNode.color = 'white';
        canvas.style.cursor = 'initial';
      }
}
function sceneSwitch() {
        if(sceneChange == 1) { //PLAY GAME
            gameState = 1; 
            stateInit = true;
        } else if (sceneChange == 2) { //Credits GOTO 
            gameState = 2;
        } else if (sceneChange == 4) { //Credits BACK  
            gameState = 0; //just switch back, dont reset
        }        
        //reset trigger
        sceneChange = -1;
}

function createOffButton(xIn, yIn, c, sSub) {
    const gridSQRoff = Sprite({
        x: xIn,
        y: yIn,
        color: c,
        width: 40-sSub,
        height: 40-sSub,
    });
    CTRLAreaMenu.addChild(gridSQRoff);
}

function createCTRLButton(xIn, yIn, txt, ox, oy, im, imd, sSub) {
    const gridSQRbut = Button({
        x: xIn,
        y: yIn,
        image: im,
        width: 40-sSub,
        height: 40-sSub,

        // text properties
        text: {
            x: 12 + ox,
            y: 0 + oy,
            //text: txt,
            color: 'black',
            font: '30px Arial, sans-serif',
        },
        onDown() {
            this.image = imd;
            buttonPress(txt)
        },
        onUp() {
            this.image = im;
            buttonEnd(txt)
        },
        onOver() {

        },
        onOut: function() {
            this.image = im;
            buttonEnd(txt)
        }
    });
    track(gridSQRbut);
    CTRLArea.addChild(gridSQRbut);
}

function createCTRLButtonTxt(xIn, yIn, txt, ox, oy, c, sSub) {
    const gridSQRbut = Button({
        x: xIn,
        y: yIn,
        color: c,
        width: 40-sSub,
        height: 40-sSub,

        // text properties
        text: {
            x: 12 + ox,
            y: 0 + oy,
            text: txt,
            color: 'black',
            font: '30px Arial, sans-serif',
        },
        onDown() {
            qtBool = true;
            timerQ = 0.75; //set delay for transition
            this.color = 'grey'
            sfxPlayButton(); //sfx
            //buttonPress(txt) //moved to gameloop
            //this.y +=2;
        },
        onUp() {
            this.color = c
            //this.y -=2;
            //buttonEnd(txt)
        },
        onOver() {
            this.color = '#DDDDDD'
        },
        onOut: function() {
            this.color = c
            //buttonEnd(txt)
        }
    });
    track(gridSQRbut);
    CTRLArea.addChild(gridSQRbut);
}

function createGameButtons() {
    createCTRLButton(44, 3, 'up', 0, -5, keyUp, keyUpds, 0);
    createCTRLButton(44, 85, 'dn', 0, 15, keyDown, keyDownds, 0);
    createCTRLButton(3, 44, 'lf', 0, 5, keyLeft, keyLeftds, 0);
    createCTRLButton(85, 44, 'ri', 4, 5, keyRight, keyRightds, 0);
    
    createCTRLButtonTxt(3, 94, '⎋', -8, -2, 'grey', 10);
    
}
function createOffGameButtons() {
    createOffButton(44, 3, '#222222', 0);
    createOffButton(44, 85, '#222222', 0);
    createOffButton(3, 44, '#222222', 0);
    createOffButton(85, 44, '#222222', 0);
    createOffButton(3, 94, '#111111', 10);
}
function buttonPress(typ) {
    if(typ == 'up') {
        upBool = true;
    } else if (typ == 'dn') {
        dnBool = true;
    } else if (typ == 'lf') {
        lfBool = true;
    } else if (typ == 'ri') {
        riBool = true;
    } else if (typ == '⎋') {
        //qtBool = true;
    }
}
function buttonEnd(typ) {
    if(typ == 'up') {
        upBool = false;
    } else if (typ == 'dn') {
        dnBool = false;
    } else if (typ == 'lf') {
        lfBool = false;
    } else if (typ == 'ri') {
        riBool = false;
    } else if (typ == '⎋') {
        qtBool = false;
    }
}
function buttonActions() {
    if(upBool == true) {
        mvSpdY -= 0.1;
        playerSprite.dy = mvSpdY;
    } 
    else if (dnBool == true) {
        mvSpdY += 0.1;
        playerSprite.dy = mvSpdY;
    } else if (lfBool == true) {
        mvSpdX -= 0.1;
        playerSprite.dx = mvSpdX;
    } else if (riBool == true) {
        mvSpdX += 0.1;
        playerSprite.dx = mvSpdX;
    } 

    if(upBool || dnBool || lfBool || riBool) {
        sfxPlayPuff();
    }
    //else if (qtBool == true) {
    //     //switch game state back
    //     gameState = 0;
    //     stateInit = true; //reinitialize
    // }

}

//Create falling particles
function createFallBlock() {

    const block = Sprite({
        type: 'block',
        x: Math.floor(Math.random() * canvas.width) + 1,
        y: 0,
        color: 'white',
        width: 4,
        height: 4,
        dy: Math.random() * 1 + .25,
    });
    blocks.push(block);
    //console.log(block); 
}

//Game Logic During Game State
function GameUpdate() {
    //check for button inputs
    buttonActions(); 

    blocks.map(block => {
        block.update();

        if(block.y > canvas.height/2) {
            block.y = -block.height;
            block.x = Math.floor(Math.random() * canvas.width) + 1;
        }

    });

    if(playerSprite) {
        playerSprite.update();

        if(kontra.keyPressed('left')) {
            mvSpdX -= 0.1;
            playerSprite.dx = mvSpdX;
            sfxPlayPuff();
        }
        if (kontra.keyPressed('right')) {
            mvSpdX += 0.1;
            playerSprite.dx = mvSpdX;
            sfxPlayPuff();
        }
        if(kontra.keyPressed('up')) {
            mvSpdY -= 0.1;
            playerSprite.dy = mvSpdY;
            sfxPlayPuff();
        } else if (kontra.keyPressed('down')) {
            mvSpdY += 0.1;
            playerSprite.dy = mvSpdY;
            sfxPlayPuff();
        }

        if(playerSprite.x < 0 - playerSprite.width) {
            playerSprite.x = canvas.width -1;
        } else if (playerSprite.x > canvas.width) {
            playerSprite.x = 0 - playerSprite.width;
        }
        if(playerSprite.y < 0 - playerSprite.height) {
            playerSprite.y = (canvas.height/2) -1;
        } else if (playerSprite.y > canvas.height/2) {
            playerSprite.y = 0 - playerSprite.height;
        }
        
        //lil rocket shake
        var num = Math.floor(Math.random() * 3) - 1;
        playerSprite.x += num/10;
        num = Math.floor(Math.random() * 3) - 1;
        playerSprite.y += num/10;
        //console.log(num)
    }
}

function ClearGameObjects() {
    //console.log('clear blocks[] of length: ' + blocks.length);
    
    CTRLArea = null;
    CTRLCol = null;

    for (var i = 0; i <= blocks.length - 1; i++) {
        //console.log('removing object from blocks');
        blocks[i].isActive = false;
        //blocks[i].remove();
    }
    blocks.length = 0;
    blocks = [];
    
    //console.log('blocks[] now length: ' + blocks.length);

}
function ClearMenuObjects() {
    //TODO - add these objects to a list
    //Then just for-loop that list
    
    //Main UI objects
    CTRLAreaMenu = null;
    CTRLColMenu = null;
    //objects
    textStyle = null;
    title = null;
    credits = null;
    startButton = null;
    credButton = null;
    quitButton = null;
    backButton = null;
    //Menu Grid Interface
    menuGrid = null;
}

//Menu State Setup
function initMenuState() {
    console.log('init menu state');

    //reset exit button
    // upBool = false;
    // dnBool = false;
    // lfBool = false;
    // riBool = false;
    qtBool = false;

    //clear objects
    ClearGameObjects();
    
    //Lower Controls Area (MENU)
    CTRLAreaMenu = Sprite({
        x: 0,
        y: canvas.height/2,
        width: canvas.width,
        height: canvas.height/2,
        
        render() {
            this.context.setLineDash([]);
            this.context.lineWidth = 3;
            this.context.strokeStyle = 'black';
            this.context.strokeRect(0, 0, this.width, this.height);
        }
    });
    CTRLColMenu = Sprite({
        x: 0,
        y: 0,
        color: 'black',
        width: CTRLAreaMenu.width,
        height: CTRLAreaMenu.height,
    });
    //Create game controls panel
    CTRLAreaMenu.addChild(CTRLColMenu);

    //Text and Buttons
    textStyle = { 
        color: 'white',
        font: '16px Arial, sans-serif'
    };
    title = Text({
        text: '[SpaceGame.js]',
        color: '#999999',
        font: '16px Arial, bold, sans-serif'
    });
    credits = Text({
        text: ' \n Game test by\n Alex Delderfield\n\n Made using Kontra.js\n 2021',
        color: 'black',
        font: '12px Arial, bold, sans-serif'
    });
    startButton = Button({
        text: {
            text: 'Play',
            ...textStyle
        },
        render() {
            buttonRender(this, 1);
        }
    });
    credButton = Button({
        text: {
            text: 'Credits',
            ...textStyle
        },
        render() {
            buttonRender(this, 2);
        }
    });
    // quitButton = Button({ //not used
    //     text: {
    //         text: 'Quit',
    //         ...textStyle
    //     },
    //     render() {
    //         buttonRender(this, 3);
    //     }
    //});
    backButton = Button({
        x: 1,
        y: 110,
        text: {
            text: 'Back',
            ...textStyle
        },
        render() {
            buttonRender(this, 4);
        }
    });

    //Main Menu Grid Interface
    menuGrid = Grid({
        x: 64,
        y: 65,
        anchor: {x: 0.5, y: 0.5},

        rowGap: 6,

        justify: 'center',

        children: [title, startButton, credButton]

    });

    //Todo, create and destroy depening on game scene???????????????????????????????
    createOffGameButtons();
    

}

//Game State Setup
function initGameState() {
    console.log('init game state');

    //reset exit button
    // upBool = false;
    // dnBool = false;
    // lfBool = false;
    // riBool = false;
    qtBool = false;

    ClearMenuObjects();

    //initilize variables
    CTRLArea = Sprite({
        x: 0,
        y: canvas.height/2,
        width: canvas.width,
        height: canvas.height/2,
        
        render() {
            this.context.setLineDash([]);
            this.context.lineWidth = 3;
            this.context.strokeStyle = 'black';
            this.context.strokeRect(0, 0, this.width, this.height);
        }
    });
    CTRLCol = Sprite({
        x: 0,
        y: 0,
        color: 'black',
        width: CTRLArea.width,
        height: CTRLArea.height,
    });
    //create game controls panel
    CTRLArea.addChild(CTRLCol);

    //create player
    //main menu
    playerSprite = Sprite({
        x: 50,
        y: 80,
        image: playerImg,
        dx: mvSpdX,
        dy: mvSpdY,
    });

    rocketSheet = SpriteSheet({
        image: rocketImage,
        frameWidth: 36,
        frameHeight: 32,
        
        animations: {
            boost: {
                frames: '0..3',
                frameRate: 30
            }
        }
    });

    rSprite = Sprite({
        x: -3,
        y: 9,
        animations: rocketSheet.animations
        
    });

    track(playerSprite);
    playerSprite.addChild(rSprite);

    //generate falling blocks
    for (let i=0; i < 5; i++) {
        createFallBlock();
    }
    
    //now load Game Buttons
    createGameButtons();

}

//GameLoop setup
//Requires update & render functions
const loop = GameLoop({
    update: () => {

        //Run timer & check for scene switch
        if(sceneChange != -1) {
            if(timer > 0) {
                timer -= 0.1;
            } else {
                sceneSwitch();
            }
        }

        if(qtBool == true) {
            if(timerQ > 0) {
                timerQ -= 0.1;
            } else {
                //reset
                qtBool = false; 
                
                //go back 
                //buttonPress('⎋');
                
                gameState = 0;
                stateInit = true; //reinitialize
                
    
            }
        }

        if(gameState == 0) { //MENU

            //Initialize Menu
            if(stateInit == true) {
                stateInit = false;
                initMenuState();
            }

        } else if (gameState == 1) { //GAME

            //Initilize Game
            if(stateInit == true) {
                stateInit = false; 
                initGameState();
            }

            GameUpdate();

        } else if (gameState == 2) { //CREDITS
            
        } else if (gameState == 3) { //GAMEOVER

        }
    },
    render: () => {

        if(gameState == 0) { //MENU

            //Refresh
            if(stateInit == true) {
                context.clearRect(0,0, canvas.width, canvas.height);
            }

            //render menu
            if(menuGrid) {
                menuGrid.render();
            }
            //render disabled buttons
            if(CTRLAreaMenu) {
                CTRLAreaMenu.render(); 
            }
        } else if (gameState == 1) { //GAME
            
            //Refresh
            if(stateInit == true) {
                context.clearRect(0,0, canvas.width, canvas.height);
            }

            if(playerSprite) {
                playerSprite.render();
            }
            
            blocks.map(block => block.render());
            CTRLArea.render(); //render menu with enabled buttons
        } else if (gameState == 2) { //CREDITS
            
            credits.render();
            backButton.render();
            CTRLAreaMenu.render();

        } else if (gameState == 3) { //GAMEOVER

            //render disabled buttons
            if(CTRLArea) {
                CTRLAreaMenu.render();
            }

        }
    },
});

//Kick off the gameloop
loop.start();



//Mute
document.onkeypress = function(evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var charStr = String.fromCharCode(charCode);
    if (charStr == "m" || charStr == "M") {
        console.log("mute toggle triggered");
        //muteMusic()
    }
};