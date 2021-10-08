//Click the white squares, but don't click the red ones
//Spawn a new square in after the player clicks ones
//If the player clicks a red square they lose
//The new square has a 25% chance of being red and if it is then another white square will spawn a half second later
//Red squares dissappear after 1 second
title = "Red & White";

description = `  CLICK to Shoot

  Shoot The White

  Ignore The Red
`;

characters = [
  `
 pppp 
pp  pp
p    p
pp  pp
 pppp 
  `
];

options = {
  theme:"pixel"
};

function update() {
  //init
  if (!ticks) {
  }

  color("yellow")
  char("a", 50, 50)
}
