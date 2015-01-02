var nPlayerWidth = 52;
var nPlayerHeight = 52;
//set dummy values which will updated when the device is ready
var nCanvasWidth = 480;
var nCanvasHeight = 640;
var bScreenIsRotated = false;
var nPlayerStartPosX = 40;
var nPlayerStartPosY = 40;

var nSpaceshipStepLeft = 60;
var nSpaceshipStepRight = 60;
var nSpaceshipStepUp = 6;
var nSpaceshipStepDown = 3;
var nFrameRate = 30;

//config limits for medals
var nResLimit1 = 1000;
var nResLimit2 = 2500;
var nResLimit3  = 5000;

var nCanvasHeightSpaceshipMovement = nPlayerStartPosY;

//Health and damages
var nPlayerHeath = 100;
var nPlanetoidDamage = 40;
var nAsteroidDamage = 33;
var nSpaceJunkDamage = 20;
var nMeteoriteDamage = 33;

var nAmmoBulletsPackage = 200;
var nAmmoBulletsDefault = 200;
var nAmmoBullets = nAmmoBulletsDefault;

var nAmmoBombsPackage = 1;
var nAmmoBombsDefault = 3;
var nAmmoBombs = nAmmoBombsDefault;

var nTimestampAmmoBullets = new Date().getTime();
var nTimestampAmmoBombs = new Date().getTime();

var bIsPlayerHit = false;

var bEnableCreateHealthRecovery = true;

//config
var nConfigAmmoBulletsInterval = 45000;
var nConfigAmmoBombsInterval = 60000;
var nHealthRecoverInterval = 600;

//spaceships
var Spaceships = [
	{
		image : "spaceshipLarge01.png",
		imageGame : "spaceship01",
		speed : 70,
		ammo : 50,
		shield : 50,

		//these values will be recalculated depending on the screen size
		moveLeft : 3,
		moveRight : 3,
		moveUp : 6,
		moveDown : 4,

		ammoPackageBullets : 100,
		ammoPackageBombs : 1,
		damagePlanetoid : 40,
		damageAsteroid : 33,
		damageSpaceJunk : 20,
		damageMeteorite : 33,

		bulletColor : "#a8cd00"
	},

	{
		image : "spaceshipLarge02.png",
		imageGame : "spaceship02",
		speed : 80,
		ammo : 70,
		shield : 60,
		moveLeft : 4,
		moveRight : 4,
		moveUp : 20,
		moveDown : 6,
		ammoPackageBullets : 200,
		ammoPackageBombs : 2,
		damagePlanetoid : 33,
		damageAsteroid : 25,
		damageSpaceJunk : 15,
		damageMeteorite : 25,

		bulletColor : "#CC3333"
	},

	{
		image : "spaceshipLarge03.png",
		imageGame : "spaceship03",
		speed : 90,
		ammo : 100,
		shield : 70,
		moveLeft : 5,
		moveRight : 5,
		moveUp : 26,
		moveDown : 7,
		ammoPackageBullets : 250,
		ammoPackageBombs : 3,
		damagePlanetoid : 25,
		damageAsteroid : 20,
		damageSpaceJunk : 10,
		damageMeteorite : 20,

		bulletColor : "#00AEEF"
	}
];

var nSelectedSpaceship = 0;

//difficulty
var nPntPerDestPlanet = 2;
var nPntPerDestAsteroid = 3;
var nPntPerDestSpaceJunk = 1;
var nPntPerDestMeteorite = 3;
var nVelocityBase = 1000;
var nPlanetoidCreationBase = 1000;
var nSpaceJunkCreationBase = 800;
var nMeteoriteCreationBase = 500;

var bIsGameStarted = false;
var bIsGameOver = true;
var nGameResult = 0;

//movement
var bGoLeft = false;
var bGoRight = false;
var bGoUp = false;
var bGoDown = false;

//enable fire at start of the game
var bFire = true;
var bDropBomb = false;

var bCanShoot = true;
var bCanDropBomb = true;

//pause
var bIsPaused = false;

var canvas = null;

var sBulletColor = "#E80000";

/**
* Returns a number whose value is limited to the given range.
*
* Example: limit the output of this computation to between 0 and 255
* <pre>
* (x * 255).clamp(0, 255)
* </pre>
*
* @param {Number} min The lower boundary of the output range
* @param {Number} max The upper boundary of the output range
* @returns A number in the range [min, max]
* @type Number
*/
Number.prototype.clamp = function(min, max) {
	return Math.min(Math.max(this, min), max);
};

function initCanvas() {
	var screenSize = getScreenSize();
	if (screenSize.height >= screenSize.width) {
		nCanvasWidth = screenSize.width;
		nCanvasHeight = screenSize.height;
	}
	else {
		//if the app was started in landscape mode
		//and after that has been automatically rotated to portrait
		nCanvasWidth = screenSize.height;
		nCanvasHeight = screenSize.width;
	}

	nPlayerStartPosX = Math.round(nCanvasWidth/2) - Math.round(nPlayerWidth/2);
	nPlayerStartPosY = nCanvasHeight -  Math.round(1.5*nPlayerHeight);

	calculateSpaceshipMovementSteps();
	loadSpaceship();

	var canvasElement = document.getElementById('game');
	//expand canvas to the whole screen minus height for the game ctrl height
	canvasElement.setAttribute('width', nCanvasWidth);
	canvasElement.setAttribute('height', nCanvasHeight);
	canvas = canvasElement.getContext('2d');
}

function calculateSpaceshipMovementSteps() {
	var nCoef = nCanvasWidth/240;
	if (1 >= nCoef) {
		//nothing to recalculate
		return;
	}

	for (var nShip = 0; nShip < Spaceships.length; nShip++) {
		var nStep = Math.round(Spaceships[nShip].moveLeft * nCoef);
		Spaceships[nShip].moveLeft = nStep;
		Spaceships[nShip].moveRight = nStep;
	}
}

function getScreenSize() {
	var windowHeight = 0;
	var windowWidth = 0;
	if (typeof (window.innerWidth) == 'number') {
		windowHeight = window.innerHeight;
		windowWidth = window.innerWidth;

	} else if (document.documentElement &&
		(document.documentElement.clientWidth || document.documentElement.clientHeight)) {
			windowHeight = document.documentElement.clientHeight;
			windowWidth = document.documentElement.clientWidth;

		} else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
			windowHeight = document.body.clientHeight;
			windowWidth = document.body.clientWidth;
		}
		return { "width": windowWidth, "height" : windowHeight };
}

//game elements
var player =
{
	color: "#FFFFFF",
	x: nPlayerStartPosX,
	y: nPlayerStartPosY,
	width: nPlayerWidth,
	height: nPlayerHeight,
	draw: function()
	{
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);
	}
};

player.mask = Sprite("spaceshipMask");

//array
var Bullets = [];
var Bombs = [];
var AmmoBullets = [];
var AmmoBombs = [];
var Planetoids = [];
var Asteroids = [];
var SpaceJunks = [];
var Meteorites = [];
var HealthRecovery = [];

//fast buttons for mobile web browsers
function FastButton(element, handler)
{
	this.element = element;
	this.handler = handler;
	element.addEventListener('touchstart', this, false);
};
//------------------------------------------------------------------------------

FastButton.prototype.handleEvent = function(event)
{
	switch (event.type)
	{
		case 'touchstart':
			this.onTouchStart(event);
		break;
		case 'touchmove':
			this.onTouchMove(event);
		break;
		case 'touchend':
			this.onClick(event);
		break;
		case 'click':
			this.onClick(event);
		break;
	}
};
//------------------------------------------------------------------------------

FastButton.prototype.onTouchStart = function(event)
{
	event.stopPropagation();
	this.handler(event);
	this.element.addEventListener('touchend', this, false);
	document.body.addEventListener('touchmove', this, false);
	this.startX = event.touches[0].clientX;
	this.startY = event.touches[0].clientY;
};
//------------------------------------------------------------------------------

FastButton.prototype.onTouchMove = function(event)
{
	if ( (Math.abs(event.touches[0].clientX - this.startX) > 10) ||
		(Math.abs(event.touches[0].clientY - this.startY) > 10) )
	{
		this.reset();
	}
};
//------------------------------------------------------------------------------

FastButton.prototype.onClick = function(event)
{
	event.stopPropagation();
	this.reset();
	if(event.type == 'touchend')
	{
	   preventGhostClick(this.startX, this.startY);
	}
};
//------------------------------------------------------------------------------

FastButton.prototype.reset = function()
{
	this.element.removeEventListener('touchend', this, false);
	document.body.removeEventListener('touchmove', this, false);
};
//------------------------------------------------------------------------------

function preventGhostClick(x, y)
{
	coordinates.push(x, y);
	window.setTimeout(gpop, 2500);
};
//------------------------------------------------------------------------------

function gpop()
{
	coordinates.splice(0, 2);
};
//------------------------------------------------------------------------------

//Listen for touch events
document.addEventListener('touchend', handleTouchEventEnd, true);
var coordinates = [];

function handleTouchEventEnd()
{
	//disable all
	bGoLeft = false;
	bGoRight = false;
	bGoUp = false;
	bGoDown = false;
};
//------------------------------------------------------------------------------

function handleTouchEventStart(sElementName)
{
	if ('buttonLeft' == sElementName)
	{
		bGoLeft = true;
		bGoRight = false;
		bGoUp = false;
		bGoDown = false;
	}
	else if ('buttonRight' == sElementName)
	{
		bGoLeft = false;
		bGoRight = true;
		bGoUp = false;
		bGoDown = false;
	}
	else if ('buttonUp' == sElementName)
	{
		bGoLeft = false;
		bGoRight = false;
		bGoUp = true;
		bGoDown = false;
	}
	else if ('buttonDown' == sElementName)
	{
		bGoLeft = false;
		bGoRight = false;
		bGoUp = false;
		bGoDown = true;
	}
};
//------------------------------------------------------------------------------

function randomFromTo(nFrom, nTo)
{
     return Math.floor(Math.random() * (nTo - nFrom + 1) + nFrom);
  }
//------------------------------------------------------------------------------

function disablePlayerHit()
{
	bIsPlayerHit = false;
}
//------------------------------------------------------------------------------

function checkHealth()
{
	if (0 >= nPlayerHeath)
	{
		window.navigator.vibrate([1000, 100, 1000]);
		player.explode();
	}
	else
	{
		window.navigator.vibrate(1000);
		bIsPlayerHit = true;
		setTimeout("disablePlayerHit()", 100);
	}
}
//------------------------------------------------------------------------------

function showSpaceship(bLeft)
{
	var nCurrentSpaceship = nSelectedSpaceship;
	if (true == bLeft)
	{
		//select previous spaceship
		nCurrentSpaceship -= 1;
		if (0 > nCurrentSpaceship)
		{
			//on error select the last spaceship
			nCurrentSpaceship = Spaceships.length-1;
		}
	}
	else
	{
		//select next spaceship
		nCurrentSpaceship += 1;
		if (nCurrentSpaceship >= Spaceships.length)
		{
			//select the first spaceship
			nCurrentSpaceship = 0;
		}
	}
	nSelectedSpaceship = nCurrentSpaceship;
	loadSpaceship();
}
//------------------------------------------------------------------------------

function loadSpaceship()
{
	document.getElementById('imgSpaceship').src = 'images/'+Spaceships[nSelectedSpaceship].image;
	//show speed
	document.getElementById('spaceshipSpeed').style.width = Spaceships[nSelectedSpaceship].speed+"%";
	//show ammo
	document.getElementById('spaceshipAmmo').style.width = Spaceships[nSelectedSpaceship].ammo+"%";
	//show shield
	document.getElementById('spaceshipShield').style.width = Spaceships[nSelectedSpaceship].shield+"%";

	//player settings
	nSpaceshipStepLeft = Spaceships[nSelectedSpaceship].moveLeft;
	nSpaceshipStepRight = Spaceships[nSelectedSpaceship].moveRight;
	nSpaceshipStepUp = Spaceships[nSelectedSpaceship].moveUp;
	nSpaceshipStepDown = Spaceships[nSelectedSpaceship].moveDown;

	nPlanetoidDamage = Spaceships[nSelectedSpaceship].damagePlanetoid;
	nAsteroidDamage = Spaceships[nSelectedSpaceship].damageAsteroid;
	nSpaceJunkDamage = Spaceships[nSelectedSpaceship].damageSpaceJunk;

	nAmmoBulletsPackage = Spaceships[nSelectedSpaceship].ammoPackageBullets;
	nAmmoBombsPackage = Spaceships[nSelectedSpaceship].ammoPackageBombs;

	sBulletColor = Spaceships[nSelectedSpaceship].bulletColor;
}
//------------------------------------------------------------------------------

document.getElementById('play').onclick=function(){
	keepscreenon.enable();
	motion.deviceMotion();
	//hide menu
	document.getElementById('menu').style.visibility = "hidden";
	//show select spaceship screen
	document.getElementById('selectSpaceship').style.visibility = "visible";
};
//------------------------------------------------------------------------------

document.getElementById('selectSpaceshipBack').onclick=function(){
	//hide select spaceship screen
	document.getElementById('selectSpaceship').style.visibility = "hidden";
	//show main menu
	document.getElementById('menu').style.visibility = "visible";
	//reset selected spaceship
	nSelectedSpaceship = 0;
	loadSpaceship();
};
//------------------------------------------------------------------------------

function showGameView()
{
	//show game control
	document.getElementById('gamecontrol').style.visibility = "visible";
	//pause button
	document.getElementById('pause').style.visibility = "visible";
	document.getElementById('buttonPause').style.visibility = "visible";
	//show game canvas
	document.getElementById('game').style.visibility = "visible";
}
//------------------------------------------------------------------------------

function startGame()
{
	//show game view
	showGameView();

	bIsGameOver = false;

	//start new game
	bIsGameStarted = true;
	//reset result
	nGameResult = 0;
	//reset position
	player.x = nPlayerStartPosX;
	player.y = nPlayerStartPosY;
	//reset planetoids, asteroid, bullets, bombs, etc
	if (0 < Planetoids.length)
	{
		Planetoids.splice(0, Planetoids.length);
	}
	if (0 < Asteroids.length)
	{
		Asteroids.splice(0, Asteroids.length);
	}
	if (0 < SpaceJunks.length)
	{
		SpaceJunks.splice(0, SpaceJunks.length);
	}
	if (0 < Meteorites.length)
	{
		Meteorites.splice(0, Meteorites.length);
	}
	if (0 < Bullets.length)
	{
		Bullets.splice(0, Bullets.length);
	}
	if (0 < Bombs.length)
	{
		Bombs.splice(0, Bombs.length);
	}
	if (0 < AmmoBullets.length)
	{
		AmmoBullets.splice(0, AmmoBullets.length);
	}
	if (0 < AmmoBombs.length)
	{
		AmmoBombs.splice(0, AmmoBombs.length);
	}
	if (0 < HealthRecovery.length)
	{
		HealthRecovery.splice(0, HealthRecovery.length);
	}

	//chage spaceship image
	player.sprite = Sprite(Spaceships[nSelectedSpaceship].imageGame);

	//reset timers
	nTimestampAmmoBullets = new Date().getTime();
	nTimestampAmmoBombs = new Date().getTime();
}
//------------------------------------------------------------------------------

function selectSpaceship()
{
	//hide menu
	document.getElementById('menu').style.visibility = "hidden";
	//hide select spaceship
	document.getElementById('selectSpaceship').style.visibility = "hidden";
	startGame();
}
//------------------------------------------------------------------------------

document.getElementById('buttonSelectSpaceshipOK').onclick=function(){
	if (false == bIsGameOver)
	{
		return;
	}
	selectSpaceship();
};
//------------------------------------------------------------------------------

document.getElementById('buttonFireRight').onclick=function(){
	//Vibrate 3 times 'SOS' in Morse code
	navigator.vibrate(
		[100,30,100,30,100,200,200,30,200,30,200,200,100,30,100,30,100,
		100,30,100,30,100,200,200,30,200,30,200,200,100,30,100,30,100,
		100,30,100,30,100,200,200,30,200,30,200,200,100,30,100,30,100]);
	bDropBomb = !bDropBomb;
};
//------------------------------------------------------------------------------

function pause() {
	bIsPaused = true;
	//show pause menu
	document.getElementById('menupause').style.visibility = "visible";
}
//------------------------------------------------------------------------------

function resume() {
	//hide pause menu
	bIsPaused = false;
	document.getElementById('menupause').style.visibility = "hidden";
	//reset timers as a penalty for the pause ;)
	nTimestampAmmoBullets = new Date().getTime();
	nTimestampAmmoBombs = new Date().getTime();
}
//------------------------------------------------------------------------------

document.getElementById('buttonPause').onclick=function(){
	pause();
};
//------------------------------------------------------------------------------

//pause buttons
document.getElementById('buttonPausePlay').onclick=function(){
	resume();
};
//------------------------------------------------------------------------------

document.getElementById('buttonPauseMenu').onclick=function(){
	document.getElementById('menupause').style.visibility = "hidden";
	keepscreenon.disable();
	//game ends; show main menu
	GameOver();
};
//------------------------------------------------------------------------------

document.getElementById('gameOverOk').onclick=function(){
	//hide game over screen
	document.getElementById('gameOver').style.visibility = "hidden";
	document.getElementById('menu').style.visibility = "visible";
};
//------------------------------------------------------------------------------

function GameOver()
{
	//reset game status
	bIsGameStarted = false;
	bIsGameOver = true;
	//reset movement
	bGoLeft = false;
	bGoRight = false;
	bGoUp = false;
	bGoDown = false;
	bFire = true;
	bDropBomb = false;
	bCanShoot = true;
	bIsPaused = false;
	nAmmoBullets = nAmmoBulletsDefault;
	nAmmoBombs = nAmmoBombsDefault;
	nTimestampAmmoBullets = new Date().getTime();
	nTimestampAmmoBombs = new Date().getTime();
	nPlayerHeath = 100;
	bIsPlayerHit = false;
	//reset selected spaceship
	nSelectedSpaceship = 0;
	loadSpaceship();
	//hide game canvas
	document.getElementById('game').style.visibility = "hidden";
	//prepate and show result
	document.getElementById('result').innerHTML = '<p><h2>'+nGameResult+'</h2></p>';
	//hide game control
	document.getElementById('gamecontrol').style.visibility = "hidden";
	//pause
	document.getElementById('pause').style.visibility = "hidden";
	document.getElementById('buttonPause').style.visibility = "hidden";
	//show medal
	showMedal(nGameResult);
	//show game over screen
	document.getElementById('gameOver').style.visibility = "visible";
}
//------------------------------------------------------------------------------

function CreateBullet(Item)
{
	Item.active = true;

	Item.xVelocity = 0;
	Item.yVelocity = -Item.speed;
	Item.width = 4;
	Item.height = 4;
	Item.color = sBulletColor;

	Item.inBounds = function()
	{
		return ( (0 <= Item.x) && (Item.x <= nCanvasWidth) &&
				(0 <= Item.y) && (Item.y <= nCanvasHeight) );
	};

	Item.draw = function()
	{
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);
	};

	Item.update = function()
	{
		Item.x += Item.xVelocity;
		Item.y += Item.yVelocity;

		Item.active = (Item.active && Item.inBounds());
	};

	Item.explode = function()
	{
		this.active = false;
	};

	return Item;
}
//------------------------------------------------------------------------------

function CreateBomb(Item)
{
	Item.active = true;

	Item.x = 0;
	Item.xVelocity = 0;
	Item.yVelocity = -Item.speed;
	Item.width = nCanvasWidth;
	Item.height = 2;
	Item.color = sBulletColor;

	Item.inBounds = function()
	{
		return ( (0 <= Item.x) && (Item.x <= nCanvasWidth) &&
				(0 <= Item.y) && (Item.y <= nCanvasHeight) );
	};

	Item.draw = function()
	{
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);
	};

	Item.update = function()
	{
		Item.x += Item.xVelocity;
		Item.y += Item.yVelocity;

		Item.active = (Item.active && Item.inBounds());
	};

	Item.explode = function()
	{
		this.active = false;
	};

	return Item;
}
//------------------------------------------------------------------------------

function CreatePlanetoid(I) {
  I = I || {};

  I.active = true;
  I.age = Math.floor(Math.random() * 128);

  I.color = "#A2B";

  I.x = nCanvasWidth / 4 + Math.random() * nCanvasWidth / 2;
  I.y = 0;
  I.xVelocity = 0;
  I.yVelocity = 5;

  I.width = 32;
  I.height = 32;

  I.inBounds = function() {
	return I.x >= 0 && I.x <= nCanvasWidth &&
	  I.y >= 0 && I.y <= nCanvasHeight;
  };

  I.sprite = Sprite("planetoid");

  I.draw = function() {
	this.sprite.draw(canvas, this.x, this.y);
  };

  I.update = function() {
	I.x += I.xVelocity;
	I.y += I.yVelocity;

	I.xVelocity = 4 * Math.sin(I.age * Math.PI / 64);

	I.age++;

	I.active = I.active && I.inBounds();
  };

  I.explode = function() {

	this.active = false;
	// Extra Credit: Add an explosion graphic

	//update score
	nGameResult += nPntPerDestPlanet;
  };

  return I;
};
//------------------------------------------------------------------------------

function CreateAsteroid(I) {
  I = I || {};

  I.active = true;
  I.age = Math.floor(Math.random() * 128);

  I.color = "#A2B";

  I.x = nCanvasWidth / 4 + Math.random() * nCanvasWidth / 2;
  I.y = 0;
  I.xVelocity = 0;
  I.yVelocity = 6;

  I.width = 26;
  I.height = 26;

  I.inBounds = function() {
	return I.x >= 0 && I.x <= nCanvasWidth &&
	  I.y >= 0 && I.y <= nCanvasHeight;
  };

  //use different icons
  var nIconId = randomFromTo(1,10);
  switch(nIconId)
  {
	case 1:
		I.sprite = Sprite("asteroid01");
	break;
	case 2:
		I.sprite = Sprite("asteroid02");
	break;
	case 3:
		I.sprite = Sprite("asteroid03");
	break;
	case 4:
		I.sprite = Sprite("asteroid04");
	break;
	case 5:
		I.sprite = Sprite("asteroid05");
	break;
	case 6:
		I.sprite = Sprite("asteroid06");
	break;
	case 7:
		I.sprite = Sprite("asteroid07");
	break;
	case 8:
		I.sprite = Sprite("asteroid08");
	break;
	case 9:
		I.sprite = Sprite("asteroid09");
	break;
	default:
	case 10:
		I.sprite = Sprite("asteroid10");
	break;
  }

  I.draw = function() {
	this.sprite.draw(canvas, this.x, this.y);
  };

  I.update = function()
  {
	I.x += I.xVelocity;
	I.y += I.yVelocity;

	I.xVelocity = 5 * Math.sin(I.age * Math.PI / 64);

	I.age++;

	I.active = I.active && I.inBounds();
  };

  I.explode = function() {

	this.active = false;
	// Extra Credit: Add an explosion graphic

	//update score
	nGameResult += nPntPerDestAsteroid;
  };

  return I;
};
//------------------------------------------------------------------------------

function CreateMeteorite(I) {
  I = I || {};

  I.active = true;
  I.age = Math.floor(Math.random() * 128);

  I.color = "#000000";
  I.x = randomFromTo(0,nCanvasWidth);
  I.y = 0;
  I.xVelocity = 0;
  I.yVelocity = 6;

  I.width = 26;
  I.height = 26;

  I.inBounds = function() {
	return I.x >= 0 && I.x <= nCanvasWidth &&
	  I.y >= 0 && I.y <= nCanvasHeight;
  };

  //use different icons
  var nIconId = randomFromTo(1,2);
  switch(nIconId)
  {
	case 1:
		I.sprite = Sprite("meteorite01");
	break;
	default:
	case 2:
		I.sprite = Sprite("meteorite02");
	break;
  }

  I.draw = function() {
	this.sprite.draw(canvas, this.x, this.y);
  };

  I.update = function()
  {
	I.x += I.xVelocity;
	I.y += I.yVelocity;

	I.age++;

	I.active = I.active && I.inBounds();
  };

  I.explode = function() {

	this.active = false;
	// Extra Credit: Add an explosion graphic

	//update score
	nGameResult += nPntPerDestAsteroid;
  };

  return I;
};
//------------------------------------------------------------------------------

function CreateSpaceJunk(I) {
  I = I || {};

  I.active = true;
  I.age = Math.floor(Math.random() * 128);

  I.color = "#A2B";

  I.x = nCanvasWidth / 4 + Math.random() * nCanvasWidth / 2;
  I.y = 0;
  I.xVelocity = 0;
  I.yVelocity = (nGameResult > nVelocityBase) ? 4 : 3;

  I.width = 26;
  I.height = 26;

  I.inBounds = function() {
	return I.x >= 0 && I.x <= nCanvasWidth &&
	  I.y >= 0 && I.y <= nCanvasHeight;
  };

  //use different icons
  var nIconId = randomFromTo(1,10);
  switch(nIconId)
  {
	case 1:
		I.sprite = Sprite("spacejunk01");
	break;
	case 2:
		I.sprite = Sprite("spacejunk02");
	break;
	case 3:
		I.sprite = Sprite("spacejunk03");
	break;
	case 4:
		I.sprite = Sprite("spacejunk04");
	break;
	case 5:
		I.sprite = Sprite("spacejunk05");
	break;
	case 6:
		I.sprite = Sprite("spacejunk06");
	break;
	case 7:
		I.sprite = Sprite("spacejunk07");
	break;
	case 8:
		I.sprite = Sprite("spacejunk08");
	break;
	case 9:
		I.sprite = Sprite("spacejunk09");
	break;
	default:
	case 10:
		I.sprite = Sprite("spacejunk10");
	break;
  }

  I.draw = function() {
	this.sprite.draw(canvas, this.x, this.y);
  };

  I.update = function()
  {
	I.x += I.xVelocity;
	I.y += I.yVelocity;

	I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64);

	I.age++;

	I.active = I.active && I.inBounds();
  };

  I.explode = function() {

	this.active = false;
	// Extra Credit: Add an explosion graphic

	//update score
	nGameResult += nPntPerDestAsteroid;
  };

  return I;
};
//------------------------------------------------------------------------------

function CreateAmmoBullets(I) {
  I = I || {};

  I.active = true;
  I.age = Math.floor(Math.random() * 128);

  I.color = "#A2B";

  I.x = nCanvasWidth / 4 + Math.random() * nCanvasWidth / 2;
  I.y = 0;
  I.xVelocity = 0;
  I.yVelocity = 4;

  I.width = 40;
  I.height = 40;

  I.inBounds = function() {
	return I.x >= 0 && I.x <= nCanvasWidth &&
	  I.y >= 0 && I.y <= nCanvasHeight;
  };

  I.sprite = Sprite("ammobullets");

  I.draw = function() {
	this.sprite.draw(canvas, this.x, this.y);
  };

  I.update = function() {
	I.x += I.xVelocity;
	I.y += I.yVelocity;

	I.xVelocity = 0;

	I.age++;

	I.active = I.active && I.inBounds();
  };

  I.explode = function() {

	this.active = false;
	// Extra Credit: Add an explosion graphic

	//update bullets ammo
	nAmmoBullets += nAmmoBulletsPackage;
  };

  return I;
};
//------------------------------------------------------------------------------

function CreateAmmoBombs(I) {
  I = I || {};

  I.active = true;
  I.age = Math.floor(Math.random() * 128);

  I.color = "#A2B";

  I.x = nCanvasWidth / 4 + Math.random() * nCanvasWidth / 2;
  I.y = 0;
  I.xVelocity = 0;
  I.yVelocity = 6;

  I.width = 40;
  I.height = 40;

  I.inBounds = function() {
	return I.x >= 0 && I.x <= nCanvasWidth &&
	  I.y >= 0 && I.y <= nCanvasHeight;
  };

  I.sprite = Sprite("ammobombs");

  I.draw = function() {
	this.sprite.draw(canvas, this.x, this.y);
  };

  I.update = function() {
	I.x += I.xVelocity;
	I.y += I.yVelocity;

	I.xVelocity = 0;

	I.age++;

	I.active = I.active && I.inBounds();
  };

  I.explode = function() {

	this.active = false;
	// Extra Credit: Add an explosion graphic

	//update bullets ammo
	nAmmoBombs += nAmmoBombsPackage;
  };

  return I;
};
//------------------------------------------------------------------------------

function CreateHealthRecovery(I) {
  I = I || {};

  I.active = true;
  I.age = Math.floor(Math.random() * 128);

  I.color = "#A2B";

  I.x = nCanvasWidth / 4 + Math.random() * nCanvasWidth / 2;
  I.y = 0;
  I.xVelocity = 0;
  I.yVelocity = 4;

  I.width = 40;
  I.height = 40;

  I.inBounds = function() {
	return I.x >= 0 && I.x <= nCanvasWidth &&
	  I.y >= 0 && I.y <= nCanvasHeight;
  };

  I.sprite = Sprite("healthRecovery");

  I.draw = function() {
	this.sprite.draw(canvas, this.x, this.y);
  };

  I.update = function() {
	I.x += I.xVelocity;
	I.y += I.yVelocity;

	I.xVelocity = 0;

	I.age++;

	I.active = I.active && I.inBounds();
  };

  I.explode = function() {

	this.active = false;
	// Extra Credit: Add an explosion graphic

	//recover health
	nPlayerHeath = 100;
  };

  return I;
};
//------------------------------------------------------------------------------

setInterval(function() {
  update();
  draw();
}, 1000/nFrameRate);
//------------------------------------------------------------------------------

function enableShooting()
{
	bCanShoot = true;
}
//------------------------------------------------------------------------------

function enableDropBomb()
{
	bCanDropBomb = true;
}
//------------------------------------------------------------------------------

function generateAmmoBullets()
{
	if ("hidden" == document.getElementById('game').style.visibility)
	{
		return;
	}
	//get timestamp
	var nCurrentTimestamp = new Date().getTime();
	//do not allow more than 1 package with bullets on the screen
	if ( (false == bIsPaused) && (0 == AmmoBullets.length) &&
		(nCurrentTimestamp >= (nTimestampAmmoBullets + nConfigAmmoBulletsInterval) ) )
	{
		AmmoBullets.push(CreateAmmoBullets());
		nTimestampAmmoBullets = nCurrentTimestamp;
	}
}
//------------------------------------------------------------------------------

function generateAmmoBombs()
{
	if ("hidden" == document.getElementById('game').style.visibility)
	{
		return;
	}
	//get timestamp
	var nCurrentTimestamp = new Date().getTime();
	//do not allow more than 1 package with bombs on the screen
	if ( (false == bIsPaused) && (0 == AmmoBombs.length) &&
		(nCurrentTimestamp >= (nTimestampAmmoBombs + nConfigAmmoBombsInterval) ) )
	{
		AmmoBombs.push(CreateAmmoBombs());
		nTimestampAmmoBombs = nCurrentTimestamp;
	}
}
//------------------------------------------------------------------------------

function shootBullet()
{
	if ( (true == bCanShoot) && (0 < nAmmoBullets) )
	{
		player.shoot();
		nAmmoBullets -= 1;
		//timeout until the next bullet
		setTimeout("enableShooting()", 250);
		bCanShoot = false;
	}
}
//------------------------------------------------------------------------------

function dropBomb()
{
	if ( (true == bCanDropBomb) && (0 < nAmmoBombs) )
	{
		bDropBomb = false;
		bCanDropBomb = false;
		player.bomb();
		nAmmoBombs -= 1;
		//timeout until the next bomb
		setTimeout("enableDropBomb()",1000);
	}
}
//------------------------------------------------------------------------------

function goLeft() {
	player.x -= nSpaceshipStepLeft;
}

function goRight() {
	player.x += nSpaceshipStepRight;
}

function update()
{
	if ( (false == bIsGameStarted) || (true == bIsGameOver) || (true == bIsPaused) )
	{
		return;
	}

	if (bFire)
	{
		shootBullet();
	}

	if (bDropBomb)
	{
		dropBomb();
	}

	if(bGoLeft)
	{
		player.x -= nSpaceshipStepLeft;
	}

	if(bGoRight)
	{
		player.x += nSpaceshipStepRight;
	}

	player.x = player.x.clamp(0, nCanvasWidth - player.width);

	if(bGoUp)
	{
		player.y -= nSpaceshipStepUp;
	}

	if(bGoDown)
	{
		var nNewPlayerPosY = player.y + nSpaceshipStepDown;
		if (nNewPlayerPosY > nCanvasHeightSpaceshipMovement)
		{
			player.y = nCanvasHeightSpaceshipMovement;
		}
		else
		{
			player.y = nNewPlayerPosY;
		}

	}

	player.y = player.y.clamp(0, nCanvasHeight - player.height);

	Bullets.forEach(function(bullet)
	{
		bullet.update();
	});

	Bullets = Bullets.filter(function(bullet)
	{
		return bullet.active;
	});

	Bombs.forEach(function(bomb)
	{
		bomb.update();
	});

	Bombs = Bombs.filter(function(bomb)
	{
		return bomb.active;
	});

	Planetoids.forEach(function(planetoid)
	{
		planetoid.update();
	});

	Planetoids = Planetoids.filter(function(planetoid)
	{
		return planetoid.active;
	});

	Asteroids.forEach(function(asteroid)
	{
		asteroid.update();
	});

	Asteroids = Asteroids.filter(function(asteroid)
	{
		return asteroid.active;
	});

	SpaceJunks.forEach(function(SpaceJunk)
	{
		SpaceJunk.update();
	});

	SpaceJunks = SpaceJunks.filter(function(SpaceJunk)
	{
		return SpaceJunk.active;
	});

	Meteorites.forEach(function(meteorite)
	{
		meteorite.update();
	});

	Meteorites = Meteorites.filter(function(meteorite)
	{
		return meteorite.active;
	});

	HealthRecovery.forEach(function(health)
	{
		health.update();
	});

	HealthRecovery = HealthRecovery.filter(function(health)
	{
		return health.active;
	});

	AmmoBullets.forEach(function(ammobullets)
	{
		ammobullets.update();
	});

	AmmoBullets = AmmoBullets.filter(function(ammobullets)
	{
		return ammobullets.active;
	});

	AmmoBombs.forEach(function(ammobombs)
	{
		ammobombs.update();
	});

	AmmoBombs = AmmoBombs.filter(function(ammobombs)
	{
		return ammobombs.active;
	});

	handleCollisions();

	//create planetoid
	var nPlanetoidCoef = 0.03;
	if (nGameResult > nPlanetoidCreationBase)
	{
		//increase difficulty
		nPlanetoidCoef += 0.01;
	}
	if(nPlanetoidCoef > Math.random())
	{
		Planetoids.push(CreatePlanetoid());
	}

	//create asteroid
	var nAsteroidCoef = 0.05;
	if(nAsteroidCoef > Math.random())
	{
		Asteroids.push(CreateAsteroid());
	}

	//create meteorite
	var nMeteoritesCoef = 0.08;
	var nMeteoritesMaxCount = 2 + Math.round(nGameResult/nMeteoriteCreationBase);
	if (6 < nMeteoritesMaxCount)
	{
		nMeteoritesMaxCount = 6;
	}
	if ( (nMeteoritesCoef > Math.random()) && (nMeteoritesMaxCount > Meteorites.length) )
	{
		Meteorites.push(CreateMeteorite());
	}

	//TODO: push health
	if ( (0 < nGameResult%nHealthRecoverInterval) && (nHealthRecoverInterval <= nGameResult) )
	{
		if ( (bEnableCreateHealthRecovery) && (1 > HealthRecovery.length) )
		{
			HealthRecovery.push(CreateHealthRecovery());
			bEnableCreateHealthRecovery = true;
		}
		else
		{
			bEnableCreateHealthRecovery = false;
		}
	}
	else
	{
		bEnableCreateHealthRecovery = true;
	}

	//create space junk
	var nSpaceJunkCoef = (nGameResult/nSpaceJunkCreationBase)*0.1;
	if (0.5 < nSpaceJunkCoef)
	{
		nSpaceJunkCoef = 0.5;
	}
	else if (0.01 > nSpaceJunkCoef)
	{
		nSpaceJunkCoef = 0.01;
	}

	var nMaxSpaceJunkCount = 10;
	if ( (nSpaceJunkCoef > Math.random()) && (nMaxSpaceJunkCount > SpaceJunks.length) )
	{
		SpaceJunks.push(CreateSpaceJunk());
	}

	//create ammo

	//bullets
	if (0.9 < Math.random())
	{
		generateAmmoBullets();
	}

	//bombs
	if (0.9 < Math.random())
	{
		generateAmmoBombs();
	}

}
//------------------------------------------------------------------------------

player.shoot = function()
{
	var bulletPosition = this.midpoint();

	Bullets.push(CreateBullet({
		speed: nSpaceshipStepUp,
		x: bulletPosition.x,
		y: bulletPosition.y
	}));
};
//------------------------------------------------------------------------------

player.bomb = function()
{
	var bombPosition = this.midpoint();

	Bombs.push(CreateBomb({
		speed: 5,
		x: bombPosition.x,
		y: bombPosition.y
	}));
};
//------------------------------------------------------------------------------

player.midpoint = function()
{
	return {
		x: this.x + this.width/2 + 4,
		y: this.y + this.height/2
	};
};
//------------------------------------------------------------------------------

function workaroundClear() {
	var canvasHtmlElement = document.getElementById('game');
	canvasHtmlElement.style.opacity = 0.99;
	setTimeout(function() {
		canvasHtmlElement.style.opacity = 1;
	}, 1);
};
//------------------------------------------------------------------------------

function draw()
{
	if (null == canvas) {
		return;
	}

	//clear screen
	workaroundClear();
	canvas.clearRect(0, 0, nCanvasWidth, nCanvasHeight);

	if (false == bIsGameStarted)
	{
		//do not draw
		return;
	}


	canvas.font = "bold 20px Tahoma, Verdana, Arial, Sans-Serif";
	canvas.fillStyle = "#00AEEF";

	//draw result icon
	var imgInfoHealth = new Image();
	imgInfoHealth.src = 'images/gameInfoResult.png';
	canvas.drawImage(imgInfoHealth, 14, 82);
	//draw result
	canvas.fillText(nGameResult, 36, 100);

	//dynamically determine position of the text depending the longest string
	var sTextHealth = nPlayerHeath+"% ";
	var nMaxTextLen = canvas.measureText(sTextHealth).width;
	var nLenAmmoBullets = canvas.measureText(nAmmoBullets).width;
	var nLenAmmoBombs = canvas.measureText(nAmmoBombs).width;
	if (nMaxTextLen < nLenAmmoBullets)
	{
		nMaxTextLen = nLenAmmoBullets;
	}
	if (nMaxTextLen < nLenAmmoBombs)
	{
		nLenAmmoBombs = nLenAmmoBombs;
	}
	var nSignPosX = nCanvasWidth-nMaxTextLen;
	var nImgPosX = nSignPosX - 24;

	//draw health icon
	var imgInfoHealth = new Image();
	imgInfoHealth.src = 'images/gameInfoHealth.png';
	canvas.drawImage(imgInfoHealth, nImgPosX, 2);

	//draw player health
	canvas.fillText(sTextHealth, nSignPosX, 20);

	//draw bullets icon
	var imgInfoBullets = new Image();
	imgInfoBullets.src = 'images/gameInfoBullets.png';
	canvas.drawImage(imgInfoBullets, nImgPosX, 42);

	//draw bullets
	canvas.fillText(nAmmoBullets, nSignPosX, 60);

	//draw bombs icon
	var imgInfoBombs = new Image();
	imgInfoBombs.src = 'images/gameInfoBombs.png';
	canvas.drawImage(imgInfoBombs, nImgPosX, 82);

	//draw bombs
	canvas.fillText(nAmmoBombs, nSignPosX, 100);

	//draw player
	player.draw();

	//draw planetoids
	Planetoids.forEach(function(planetoid)
	{
		planetoid.draw();
	});

	//draw asteroids
	Asteroids.forEach(function(asteroid)
	{
		asteroid.draw();
	});

	//draw space junk
	SpaceJunks.forEach(function(spaceJunk)
	{
		spaceJunk.draw();
	});

	//draw meteorites
	Meteorites.forEach(function(meteorite)
	{
		meteorite.draw();
	});

	//draw bullets
	Bullets.forEach(function(bullet) {
		bullet.draw();
	});

	//draw bombs
	Bombs.forEach(function(bomb) {
		bomb.draw();
	});

	//draw ammon
	AmmoBullets.forEach(function(ammobullets) {
		ammobullets.draw();
	});

	AmmoBombs.forEach(function(ammobombs) {
		ammobombs.draw();
	});

	//draw HealthRecovery
	HealthRecovery.forEach(function(health) {
		health.draw();
	});
}
//------------------------------------------------------------------------------

function collides(Obj1, Obj2)
{
	return Obj1.x < Obj2.x + Obj2.width &&
		Obj1.x + Obj1.width > Obj2.x &&
		Obj1.y < Obj2.y + Obj2.height &&
		Obj1.y + Obj1.height > Obj2.y;
}
//------------------------------------------------------------------------------

function handleCollisions()
{
	Bullets.forEach(function(bullet)
	{
		Planetoids.forEach(function(planetoid)
		{
			if(collides(bullet, planetoid))
			{
				planetoid.explode();
				bullet.active = false;
			}
		});
		Asteroids.forEach(function(asteroid)
		{
			if(collides(bullet, asteroid))
			{
				asteroid.explode();
				bullet.active = false;
			}
		});
		SpaceJunks.forEach(function(spaceJunk)
		{
			if(collides(bullet, spaceJunk))
			{
				spaceJunk.explode();
				bullet.active = false;
			}
		});

	});

	//handle collision of a bomb
	Bombs.forEach(function(bomb)
	{
		Planetoids.forEach(function(planetoid)
		{
			if(collides(bomb, planetoid))
			{
				planetoid.explode();
			}
		});
		Asteroids.forEach(function(asteroid)
		{
			if(collides(bomb, asteroid))
			{
				asteroid.explode();
			}
		});
		SpaceJunks.forEach(function(spaceJunk)
		{
			if(collides(bomb, spaceJunk))
			{
				spaceJunk.explode();
			}
		});
		//meteorites can be destroyed only by bombs
		Meteorites.forEach(function(Meteorite)
		{
			if(collides(bomb, Meteorite))
			{
				Meteorite.explode();
			}
		});
	});

  Planetoids.forEach(function(planetoid)
  {
	if(collides(planetoid, player))
	{
		planetoid.explode();
		//count damages
		nPlayerHeath -= nPlanetoidDamage;
		checkHealth();
	}
  });

  Asteroids.forEach(function(asteroid)
  {
	if(collides(asteroid, player))
	{
		asteroid.explode();
		//count damages
		nPlayerHeath -= nAsteroidDamage;
		checkHealth();
	}
  });

  Meteorites.forEach(function(meteorite)
  {
	if(collides(meteorite, player))
	{
		meteorite.explode();
		//count damages
		nPlayerHeath -= nMeteoriteDamage;
		checkHealth();
	}
  });

  SpaceJunks.forEach(function(spaceJunk)
  {
	if(collides(spaceJunk, player))
	{
		spaceJunk.explode();
		//count damages
		nPlayerHeath -= nSpaceJunkDamage;
		checkHealth();
	}
  });

  //ammo bullets
  AmmoBullets.forEach(function(ammobullets)
  {
	if(collides(ammobullets, player))
	{
		ammobullets.explode();
	}
  });

  //ammo bombs
  AmmoBombs.forEach(function(ammobombs)
  {
	if(collides(ammobombs, player))
	{
		ammobombs.explode();
	}
  });

  HealthRecovery.forEach(function(health)
  {
	if(collides(health, player))
	{
		health.explode();
	}
  });

}
//------------------------------------------------------------------------------

player.explode = function()
{
	this.active = false;
	// game over
	GameOver();
};
//------------------------------------------------------------------------------

player.draw = function()
{
	this.sprite.draw(canvas, this.x, this.y);
	if (true == bIsPlayerHit)
	{
		this.mask.draw(canvas, this.x-8, this.y-12);
	}
};
//------------------------------------------------------------------------------

function determineMedalImg(nResult, bUseThumb)
{
	if (nResLimit1 >= nResult)
	{
		return (bUseThumb) ? 'images/medalSmallA.png' : 'images/medalA.png';
	}
	else if ( (nResLimit2 >= nResult) && (nResLimit1 < nResult) )
	{
		return (bUseThumb) ? 'images/medalSmallB.png' : 'images/medalB.png';
	}
	else if ( (nResLimit3 >= nResult) && (nResLimit2 < nResult) )
	{
		return (bUseThumb) ? 'images/medalSmallC.png' : 'images/medalC.png';
	}
	else //if (nResLimit3 < nResult)
	{
		return (bUseThumb) ? 'images/medalSmallD.png' : 'images/medalD.png';
	}
}
//------------------------------------------------------------------------------

function showMedal(nResult)
{
	document.getElementById('gameOverMedal').src = determineMedalImg(nResult, false);
}
//------------------------------------------------------------------------------
