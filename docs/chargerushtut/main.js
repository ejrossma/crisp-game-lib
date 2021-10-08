title = "Charge Rush";

description = ` 
Destroy enemies.
     Do It.
`;

characters = [
`
  ll
 gllg
ggllgg
ggllgg
gg  gg
r    r
`,
`
y    y
cc  cc
ccllcc
ccllcc
 cllc
  ll
`,
`
y  y
yyyy
 y  y
 yyyy
y  y
yyyy
`
];

//container for constant variables for game
const G = {
  WIDTH: 100,
  HEIGHT: 150,
  
  STAR_SPEED_MIN: 0.75,
  STAR_SPEED_MAX: 1.5,

  PLAYER_FIRE_RATE: 5,
  PLAYER_GUN_OFFSET: 3,

  FBULLET_SPEED: 5,

  ENEMY_MIN_BASE_SPEED: 1.0,
  ENEMY_MAX_BASE_SPEED: 2.0,
  ENEMY_FIRE_RATE: 60,

  EBULLET_SPEED: 1.5,
  EBULLET_ROTATION_SPD: 0.1
};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  seed: 2,
  isPlayingBgm: true,
  isReplayEnabled: true,
  theme: "dark"
};

//PLAYER CODE BELOW HERE vvvvvvvv

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number,
 * isFiringLeft: boolean
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector
 * }} FBullet
 */

/** @type { FBullet[] } */
let fBullets;

//ENEMY CODE BELOW HERE vvvvvvvv

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number
 * }} Enemy
 */

/**
 * @type { Enemy[] }
 */
let enemies;

/**
 * @type { number }
 */
let currentEnemySpeed;

/**
 * @type { number }
 */
let waveCount;

/**
 * @typedef {{
 * pos: Vector,
 * angle: number,
 * rotation: number
 * }} EBullet
 */

/**
 * @type { EBullet[] }
 */
let eBullets;

//STAR CODE BELOW HERE vvvvvvvv

/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} Star
 */

/**
 * @type { Star[] }
 */
let stars;

//gameloop function
function update() {
  //init at startup
  if (!ticks) {

    //initialize player
    player = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
      firingCooldown: G.PLAYER_FIRE_RATE,
      isFiringLeft: true
    };

    //friendly bullet array
    fBullets = [];

    //enemy bullet array
    eBullets = [];

    //initialize enemy array & variables
    enemies = [];
    waveCount = 0;
    currentEnemySpeed = 0;

    //Using times()
    //First Argument: number of times the second argument is run
    //Second Argument: function that returns an object which is then added to an array which is the return value of times()
    stars = times(20, () => {
      //randomize the position
      const posX = rnd(0, G.WIDTH);
      const posY = rnd(0, G.HEIGHT);
      return {
        //position vector
        pos: vec(posX, posY),
        //speed number
        speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
      };
    });

  }
  //spawning enemies
  if (enemies.length === 0) {
    currentEnemySpeed = rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED) * difficulty;
    //9 at a time
    for (let i = 0; i < 9; i++) {
      const posX = rnd(0, G.WIDTH);
      const posY = -rnd(i * G.HEIGHT * 0.1);
      enemies.push({ pos: vec(posX, posY), firingCooldown: G.ENEMY_FIRE_RATE });
    }

    waveCount++; //increase wave tracker
  }


  //stars
  stars.forEach((s) => {
    //position
    s.pos.y += s.speed;
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
    //color + draw box
    color("light_purple");
    box(s.pos, 1, 2);
  });

  //player position
  player.pos = vec(input.pos.x, input.pos.y);
  player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);

  //reduce cooldown for next shot
  player.firingCooldown--;
  //ready to fire next shot
  if (player.firingCooldown <= 0) {
    //find which side firing from
    const offset = (player.isFiringLeft) ? -G.PLAYER_GUN_OFFSET : G.PLAYER_GUN_OFFSET;
    //switch side for next time
    player.isFiringLeft = !player.isFiringLeft;
    //create a bullet
    fBullets.push({
      pos: vec(player.pos.x + offset, player.pos.y)
    });
    //reset player cooldown
    player.firingCooldown = G.PLAYER_FIRE_RATE;

    color("red");
    //generate particles
    particle(
      player.pos.x + offset, //x value
      player.pos.y, //y value
      4, //number of particles
      1, //speed of particles
      -PI/2, //emitting angle
      PI/4 //emitting width
    )
  }

  //draw and color player
  color("black");
  char("a", player.pos);

  //draw and color bullets
  fBullets.forEach((fb) => {
    //move bullets upwards
    fb.pos.y -= G.FBULLET_SPEED;
    color("red");
    box(fb.pos, 2);
  });

  //add enemies & remove when they are off screen
  remove(enemies, (e) => {
    e.pos.y += currentEnemySpeed;
    //add enemy's firing
    e.firingCooldown--;
    if (e.firingCooldown <= 0) {
      eBullets.push({
        pos: vec(e.pos.x, e.pos.y),
        angle: e.pos.angleTo(player.pos),
        rotation: rnd()
      });
      e.firingCooldown = G.ENEMY_FIRE_RATE;
      play("laser");
    }

    color("black");
    //checking collision and drawing at the same time
    const isCollidingWithFBullets = char("b", e.pos).isColliding.rect.red;
    //if colliding then remove & replace with particles
    
    if (isCollidingWithFBullets) {
      color("red");
      particle(e.pos);
      play("explosion");
      addScore(10 * waveCount, e.pos);
    }

    //collision with player
    const isCollidingWithPlayer = char("b", e.pos).isColliding.char.a;
    if (isCollidingWithPlayer) {
      end();
      play("hit");
    }

    return (isCollidingWithFBullets || e.pos.y > G.HEIGHT);
  });

  remove(eBullets, (eb) => {
    //trigonometry to find velocity on each axis
    eb.pos.x += G.EBULLET_SPEED * Math.cos(eb.angle);
    eb.pos.y += G.EBULLET_SPEED * Math.sin(eb.angle);
    //bullet rotates
    eb.rotation += G.EBULLET_ROTATION_SPD;

    color("cyan");

    const isCollidingWithFBullets = char("c", eb.pos, {rotation: eb.rotation}).isColliding.rect.red;
    if (isCollidingWithFBullets) {
      addScore(5 + waveCount, eb.pos);
      play("hit");
      return (true);
    }
    const isCollidingWithPlayer = char("c", eb.pos, {rotation: eb.rotation}).isColliding.char.a;

    if (isCollidingWithPlayer) {
      //end the game
      end();
      //play lose sound
      play("hit");
    }
    //if not on screen remove it
    return (!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
  });

  //remove bullets that are off screen or have hit enemy
  remove(fBullets, (fb) => {
    //if bullet hits enemy remove it
    color("red");
    const isCollidingWithEnemies = box(fb.pos, 2).isColliding.char.b;
    return (isCollidingWithEnemies || fb.pos.y < 0);
  })

  //tracking bullets
  //text(fBullets.length.toString(), 3, 10);
}
