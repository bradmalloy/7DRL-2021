# 7DRL-2021
7 Day Roguelike challenge, 2021

## Elevator Pitch
This game is a roguelike take on the automation strategy genre.

## How To Run

First, install all requirements with `npm install`, then use `http-server .` in the `/src` folder to serve files. Then go to `localhost:8080` to see the game.

## Tech
- Pack for web with Browserify
- Deploy & host with Netlify
- rot.js for roguelike tools

## Notes

- Haven't decided on a title yet. Use `$GAME_TITLE` as a placeholder, then we can find/replace later.
- https://animate.style/ (CSS animations - used sparingly, might be nice)
- https://oxal.org/projects/sakura/demo/ (minimal CSS)

### Title Ideas

- Frogue (Factory Rogue, logo is a frog?)
- Factorogue (a little on the nose)
- Rogue Works
- Automatr
- Autorogue
- Automagic (if it ends up magic-themed?)
- Romatic

## Bugs

### Conveyor Belt Browser Crash
2021-03-08 @ 10:23 pm
1. Place a line of conveyor belts and connect a miner and box
2. Delete one belt in the middle
3. Place a new belt that outputs to an empty tile
4. Browser tab crashes

## ToDo notes to self

Player needs to be able to deposit items into buildins. Right now, we only drop all or nothing - needs to check how much it can drop before it does.