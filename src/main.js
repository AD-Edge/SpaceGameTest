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

const { init, GameLoop, Button, Text, Grid, 
  SpriteSheet, Sprite, initPointer, track } = kontra;

//get components from index
const { canvas, context } = init();
// console.log(canvas);
// console.log(context);

//Initilize interactions
initPointer();

//Initialize Keys
kontra.initKeys();
// var arrows = [37,38,39,40];

//Setup
var grid = 8;
var playerSprite = null;
var mvSpd = 0.6;
var numRows = canvas.height / grid;
var numCols = canvas.width / grid;

//Array for blocks
var blocks = [];

//Scene stuff
var timer = 0;
var sceneChange = -1;
var stateInit = true; //start true to not trigger

//PRIMARY GAME STATE
//0 = Intro Page
//1 = Game 
//2 = Credits
//3 = Death/Restart
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
let textStyle = { 
    color: 'white',
    font: '16px Arial, sans-serif'
};
let title = Text({
    text: '[SpaceGame.js]',
    color: '#999999',
    font: '16px Arial, bold, sans-serif'
});
let credits = Text({
    text: ' \n Game test by\n Alex Delderfield\n\n Made using Kontra.js\n 2021',
    color: 'black',
    font: '12px Arial, bold, sans-serif'
});
let startButton = Button({
    text: {
        text: 'Play',
        ...textStyle
    },
    render() {
        buttonRender(this, 1);
    }
});
let credButton = Button({
    text: {
        text: 'Credits',
        ...textStyle
    },
    render() {
        buttonRender(this, 2);
    }
});
let quitButton = Button({ //not used
    text: {
        text: 'Quit',
        ...textStyle
    },
    render() {
        buttonRender(this, 3);
    }
});
let backButton = Button({
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
let menuGrid = Grid({
    x: 64,
    y: 65,
    anchor: {x: 0.5, y: 0.5},

    rowGap: 6,

    justify: 'center',

    children: [title, startButton, credButton]

});

//Lower Controls Area (GAME)
const CTRLArea = Sprite({
    x: 0,
    y: canvas.height/2,
    width: canvas.width,
    height: canvas.height/2,
    
    render() {
        this.context.setLineDash([]);
        this.context.lineWidth = 3;
        this.context.strokeStyle = 'grey';
        this.context.strokeRect(0, 0, this.width, this.height);
    }
});
const CTRLCol = Sprite({
    x: 0,
    y: 0,
    color: 'black',
    width: CTRLArea.width,
    height: CTRLArea.height,
});

//Lower Controls Area (MENU)
const CTRLAreaMenu = Sprite({
    x: 0,
    y: canvas.height/2,
    width: canvas.width,
    height: canvas.height/2,
    
    render() {
        this.context.setLineDash([]);
        this.context.lineWidth = 3;
        this.context.strokeStyle = 'grey';
        this.context.strokeRect(0, 0, this.width, this.height);
    }
});
const CTRLColMenu = Sprite({
    x: 0,
    y: 0,
    color: 'black',
    width: CTRLAreaMenu.width,
    height: CTRLAreaMenu.height,
});


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
            buttonPress(txt)
            this.color = 'grey'
            //this.y +=2;
        },
        onUp() {
            this.color = c
            //this.y -=2;
            buttonEnd(txt)
        },
        onOver() {
            this.color = '#DDDDDD'
        },
        onOut: function() {
            this.color = c
            buttonEnd(txt)
        }
    });
    track(gridSQRbut);
    CTRLArea.addChild(gridSQRbut);
}

function createGameButtons() {
    createCTRLButton(44, 3, '🢕', 0, -5, keyUp, keyUpds, 0);
    createCTRLButton(44, 85, '🢗', 0, 15, keyDown, keyDownds, 0);
    createCTRLButton(3, 44, '🢔', 0, 5, keyLeft, keyLeftds, 0);
    createCTRLButton(85, 44, '🢖', 4, 5, keyRight, keyRightds, 0);
    
    createCTRLButtonTxt(3, 94, '⎋', -8, -2, 'grey', 10);
    
}
function createOffGameButtons() {
    createOffButton(44, 3, '#333333', 0);
    createOffButton(44, 85, '#333333', 0);
    createOffButton(3, 44, '#333333', 0);
    createOffButton(85, 44, '#333333', 0);
    createOffButton(3, 94, '#222222', 10);
}
function buttonPress(typ) {
    if(typ == '🢕') {
        upBool = true;
    } else if (typ == '🢗') {
        dnBool = true;
    } else if (typ == '🢔') {
        lfBool = true;
    } else if (typ == '🢖') {
        riBool = true;
    } else if (typ == '⎋') {
        qtBool = true;
    }
}
function buttonEnd(typ) {
    if(typ == '🢕') {
        upBool = false;
    } else if (typ == '🢗') {
        dnBool = false;
    } else if (typ == '🢔') {
        lfBool = false;
    } else if (typ == '🢖') {
        riBool = false;
    } else if (typ == '⎋') {
        qtBool = false;
    }
}
function buttonActions(typ) {
    if(upBool == true) {
        playerSprite.y -= mvSpd;
    } 
    else if (dnBool == true) {
        playerSprite.y += mvSpd;
    } else if (lfBool == true) {
        playerSprite.x -= mvSpd;
    } else if (riBool == true) {
        playerSprite.x += mvSpd;
    } else if (qtBool == true) {
        //switch game state back
        gameState = 0;
        stateInit = true; //reinitialize
    }

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
            playerSprite.x -= mvSpd;
        } else if (kontra.keyPressed('right')) {
            playerSprite.x += mvSpd;
        }

        if(kontra.keyPressed('up')) {
            playerSprite.y -= mvSpd;
        } else if (kontra.keyPressed('down')) {
            playerSprite.y += mvSpd;
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

function ClearObjects() {
    //console.log('clear blocks[] of length: ' + blocks.length);
    
    for (var i = 0; i <= blocks.length - 1; i++) {
        //console.log('removing object from blocks');
        blocks[i].isActive = false;
        //blocks[i].remove();
    }
    blocks.length = 0;
    blocks = [];
    
    //console.log('blocks[] now length: ' + blocks.length);

}

//Menu State Setup
function initMenuState() {
    console.log('init menu state');

    //reset canvas
    context.clearRect(0,0, canvas.width, canvas.height);
    //clear objects
    ClearObjects();
    
    //Create game controls panel
    CTRLAreaMenu.addChild(CTRLColMenu);

    //Todo, create and destroy depening on game scene???????????????????????????????
    createOffGameButtons();

}

//Game State Setup
function initGameState() {
    console.log('init game state');

    //reset canvas
    context.clearRect(0,0, canvas.width, canvas.height);

    //create game controls panel
    CTRLArea.addChild(CTRLCol);

    //now load Game Buttons
    createGameButtons();

    //create player
    //main menu
    playerSprite = Sprite({
        x: 50,
        y: 80,
        image: playerImg,
        dx: 0,
        dy: 0,
    });

    let rocketSheet = SpriteSheet({
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

    let rSprite = Sprite({
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

        if(gameState == 0) { //MENU

            //Run Initial Menu Setup
            if(stateInit == true) {
                stateInit = false; 
                initMenuState();
            }

        } else if (gameState == 1) { //GAME

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

            //render menu
            menuGrid.render();
            //render disabled buttons
            CTRLAreaMenu.render(); 

        }else if (gameState == 1) { //GAME
            
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
            CTRLAreaMenu.render();

        }
    },
});

//Kick off the gameloop
loop.start();