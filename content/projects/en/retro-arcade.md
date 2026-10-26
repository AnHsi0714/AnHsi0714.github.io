# Retro Arcade

## Project Overview

A side-scrolling retro arcade corridor. The player walks left and right past a row of cabinets, presses a key in front of one to play, and returns to the corridor afterward to pick the next. Each cabinet is a mini game inspired by a classic arcade title, with original mechanics added.

Status: not started yet, currently in planning.

### Cabinets

| Cabinet       | Inspired by    | Key features                                                                                                     |
| ------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| Snake         | Snake          | Apple spawning, movement and collision, score                                                                    |
| Breakout      | Breakout       | Level layout, ball and brick collision logic, score                                                              |
| Star Defender | Space Invaders | Lives, player movement, shooting, group enemy movement                                                           |
| Meteor Drift  | Asteroids      | Three lives, screen wrap-around (like Mario's edge looping), score, asteroids split when hit, alien ships appear |
| Maze Chomper  | Pac-Man        | Maze map, four chasers with different movement logic, score and sound effects                                    |

### Build Order

From simple to complex: Snake, Breakout, Star Defender, Meteor Drift, Maze Chomper. Snake comes first to settle the shared cabinet module interface (game loop, input handling, enter/exit flow), which the later games reuse.

### Originality and Copyright

Game rules themselves are not protected by copyright, but the original games' art, music, sound effects, characters, and maze layouts are, and game names are often trademarks. All images and audio in this project are self-made or clearly licensed, characters and mazes are original designs, and every game except the generic-name Snake and Breakout uses its own name.

## Technical Architecture

- **Frontend**: Vite + TypeScript, bundled as static files and deployed to GitHub Pages.
- **Rendering**: HTML canvas.
- **Structure**: The corridor is the main scene. Each game is a standalone module sharing one game loop and input handler, so adding a cabinet means adding one module.

## Game Design Notes

### Meteor Drift

- Wrap-around: when an object leaves the screen, its coordinates are taken modulo the screen width/height so it reappears on the opposite side.
- Splitting: a large asteroid splits into two smaller ones when hit; the smallest ones disappear.
- Aliens: enemies that appear periodically and shoot at the player; destroying one gives a higher score.

### Maze Chomper

- The maze is a tile grid, and movement and turning are decided per tile.
- Each of the four chasers uses a different target-selection rule (for example direct chase, ambush ahead, flanking, random wander).

## Conclusion

### Expected Challenges

| Challenge                                     | Planned approach                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| Sharing one architecture across several games | Extract a game interface first, and revisit it once Snake is done                     |
| Scope tends to grow                           | Finish "corridor + one cabinet" first, then add cabinets one at a time                |
| Four chasers behaving differently             | Isolate "target tile selection" into a function; each chaser only swaps that function |
| Asset copyright                               | Use only self-made or CC0 assets, and record their sources                            |
