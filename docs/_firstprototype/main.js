//Click the white squares, but don't click the red ones
//Spawn a new square in after the player clicks ones
//If the player clicks a red square they lose
//The new square has a 25% chance of being red and if it is then another white square will spawn a half second later
//Red squares dissappear after 1 second
title = " Quick Draw";

description = `  CLICK to Shoot

 Wait for targets
   to light up

`;

characters = [
  `
 rrrr 
rrllrr
rlrrlr
rlrrlr
rrllrr
 rrrr 
  `,
  `
 RRRR 
RRLLRR
RLRRLR
RLRRLR
RRLLRR
 RRRR 
  `,  
  `
 L L
L L L
 L L
L L L
 L L  
  `  
];

const G = {
  HEIGHT: 100,
  WIDTH: 100,

  DUSTBALL_SPEED_MIN: 0.25,
  DUSTBALL_SPEED_MAX: 0.5,
  DUSTBALL_ROTATION_SPD: 0.1,

  TARGET_WAITTIME_MIN: 30, //quarter of a second
  TARGET_WAITTIME_MAX: 60, //3 quarters of a second
  TARGET_UPTIME_MIN: 180, //1 and a half seconds
  TARGET_UPTIME_MAX: 240 //2 and a half seconds

};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  theme:"dark",
  isPlayingBgm: true,
  seed: 1
};

/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * rotation: number
 * }} DustBall
 */

/**
 * @type { DustBall[] }
 */
let dustballs;

/**
 * @typedef {{
 * pos: Vector,
 * remainingTime: number
 * }} TimeMeter
 */

/**
 * @typedef {{
 * pos: Vector,
 * waitTime: number,
 * upTime: number,
 * timeMeter: TimeMeter
 * }} Target
 */

/**
 * @type { Target[] }
 */
let targets;

/**
 * @type { number }
 */
let targetsHit;

function update() {
  //init
  if (!ticks) {
    //dustball initialization
    var count = 5;
    dustballs = times(10, () => {
      const posX = rnd(0, G.WIDTH);
      count += 10;
      return {
        pos: vec(posX, count),
        speed: rnd(G.DUSTBALL_SPEED_MIN, G.DUSTBALL_SPEED_MAX),
        rotation: rnd()
      };
    });

    targets = times(5, () => {
      const posX = rnd(6, G.WIDTH - 6);
      const posY = rnd(6, G.HEIGHT - 6);
      const timeUntilLose = rnd(G.TARGET_UPTIME_MIN, G.TARGET_UPTIME_MAX);
      var tm = {
        pos: vec(posX, posY - 4),
        remainingTime: timeUntilLose
      }
      return {
        pos: vec(posX, posY),
        waitTime: rnd(G.TARGET_WAITTIME_MIN, G.TARGET_WAITTIME_MAX),
        upTime: timeUntilLose,
        timeMeter: tm
      };
    });

    targetsHit = 0;
    

  }
  color("black");

  dustballs.forEach((db) => {
    //update position
    db.pos.x += db.speed;
    db.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
    db.rotation += G.DUSTBALL_ROTATION_SPD;
    char("c", db.pos, {rotation: db.rotation});
  });

  targets.forEach((t) => {
    //check if waittime is 0 yet
    if (t.waitTime < 0) {
      //check if uptime is 0 yet
      color("black");
      char("a", t.pos);
      //handle bar above target
      t.timeMeter.remainingTime--;
      var temp = t.timeMeter.remainingTime/15;
      if (t.timeMeter.remainingTime < 15 && t.timeMeter.remainingTime > 0) {
        temp = 1
      } else if (t.timeMeter.remainingTime < 0) {
        color("transparent");
      } else {
        color("yellow");
        rect(t.timeMeter.pos.x - 4, t.timeMeter.pos.y, temp, 1);
      }

      if (t.upTime < 0) {
        //player didn't click a target in time
        end();
        //play lose sound
        play("lucky");
      } else {
        t.upTime--;
      }
    } else {
      color("black");
      char("b", t.pos);
      t.waitTime--;
    }
  });

  remove(targets, (t) => {
    //ready to be shot
    color("transparent");
    var isCollidingWithTarget = box(input.pos, 1).isColliding.char.a;
    if (input.isJustPressed && isCollidingWithTarget) {
      //player clicked on target
      color("yellow");
      particle(t.pos);
      addScore(10 + (5 * targetsHit), t.pos);
      targetsHit++;
      play("hit");
      return true;
    }
    return false;
  });

  //when I click on a target it removes all targets
  // remove(targets, (t) => {
  //   color("transparent");
  //   const isCollidingWithTarget = box(input.pos, 1).isColliding.char.a;
  //   return isCollidingWithTarget && input.isJustPressed;
  // });
}
