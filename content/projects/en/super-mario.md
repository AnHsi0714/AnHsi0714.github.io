# Super Mario

## Project Overview

Our final project for Object-Oriented Programming Lab (OOPL).

### Game Overview

A recreation of the original 1985 *Super Mario Bros.* — a super Italian plumber working his way through a series of levels.

The player controls Mario as he runs and jumps through the game world toward the goal (the green flagpole) at the end of each level, dodging enemy attacks along the way. Items and game mechanics let the player defeat enemies and collect coins, with the goal of reaching the end of each level.

Genre: 2D side-scroller
Content: The original game's levels 1-1, 1-2, and 1-3

Controls: arrow keys to move, Shift to run/shoot fireballs, A for invincibility, Enter to skip levels/start, Up for a full jump, Space for a short jump.

### Team Division of Labor

| Week | 婁O翔 | 鄭安琋 |
| ---- | ----- | ----- |
| 01 | Collected game assets | Designed the base character class |
| 02 | Processed game assets | Designed the base character class; designed and tested collision boxes |
| 03 | Set up Mario's animation handling and sprite swapping on state changes | Designed the Mario class, including initialization, character movement, and physics handling |
| 04 | Fixed and tuned Mario's physics, added variable-height jumping | Tested Mario's collision detection and handling, made the camera follow Mario's movement, designed the base block class |
| 05 | Designed and tested collision detection between Mario and blocks, plus position/velocity correction on collision | Designed the question-mark block, pipe, and brick classes; tested whether blocks rendered correctly on the map |
| 06 | Drew all map assets, integrated background and block rendering | Stored level block dimensions in Global, tested the Map Manager, designed the Collision Manager class to centralize object physics and collision handling |
| 07 | Tested the Map Manager, designed the Goomba class | Added tracking of level floor collision box position/size, pipe position/height, and flag position across the various Managers |
| 08 | Set up coordination between the Map Manager and Collision Manager, handling object construction/deletion and cross-manager data access | Tested map rendering and object collision detection, fixed bugs |
| 09 | Added background music, tested that BGM played correctly and each level played the right track | Designed the base item class, designed the Mushroom, Fire Flower, Coin, and Starman classes, and added coins and mushrooms to question-mark blocks |
| 10 | Designed the Koopa class, added enemies to the Manager, wrote and tested Mario-enemy collision detection and score calculation | Designed the System Manager to unify UI, game screen, coins, remaining time, and lives; added start, loading, and end screens |
| 11 | Finished rendering and collision detection for all Level 1 objects; recorded all Level 2 object data (blocks, floor, enemies) in the Manager | Fixed level-transition bugs |
| 12 | Wrote the Piranha Plant and moving-platform classes, verified Level 2 objects were complete | Finished rendering and collision detection for all Level 2 objects, wrote the Fireball class, wrote the functions for question-mark blocks spawning items and Mario shooting fireballs, tested Mario's state changes on picking up items |
| 13 | Recorded all Level 3 object data (blocks, floor, enemies) in the Manager | Finished rendering and collision detection for all Level 3 objects, tested that fireballs worked correctly |
| 14 | Checked collision, kill scoring, interaction logic, and sprite transitions across all enemies | Built the level-clear animation, tested that it correctly returned to the start screen and allowed replaying afterward, finished UI setup and the scoring system |
| 15 | Set background image coordinates for all levels | Added the game-clear message, wrote and tested high-score updates on completion, tested that the timer reset correctly on level transitions and that Mario died when time ran out, tested that score/coins increased on picking up items and defeating enemies and that remaining time converted to score on level clear, tested that Mario losing a life correctly decremented lives or triggered the end screen and returned to the start screen |
| 16 | Added sound effects for Mario, enemies, and blocks, tested for missing or broken sound effects | Added items to the Map and Collision Managers, wrote level-clear detection, the level-clear animation (flag dropping, Mario entering the castle), the next-level transition, and special pipe functionality including entry/exit animation and map switching |
| 17 | Checked and fixed various bugs in the Manager classes and issues with objects not being handled correctly | Verified the game ran correctly, checked for and fixed any bugs that seriously affected gameplay |

## Gameplay

### Game Rules

The player's goal in each level is to reach the castle at the end.<br>
Touching the flag in front of the castle clears the level.<br>
Players must defeat or avoid hazards in the level, such as enemies and pits.<br>
Levels also contain items that help the player, such as mushrooms, fire flowers, 1-up mushrooms, and starmen.

### Screenshots

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
  <img src="/images/projects/super-mario/gameimg (2).png" alt="Title screen" style="width: 100%; display: block;" />
  <img src="/images/projects/super-mario/gameimg (1).png" alt="Level 1-2 gameplay" style="width: 100%; display: block;" />
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
  <img src="/images/projects/super-mario/gameimg (3).png" alt="Level 1-1 gameplay" style="width: 100%; display: block;" />
  <img src="/images/projects/super-mario/gameimg (4).png" alt="Level 1-1, later section" style="width: 100%; display: block;" />
</div>

## Software Design

### Code Architecture

- Main flow
  - main: Manages the game's start-up and shutdown states
  - App: Manages the game's start-up and shutdown process
  - AppUtil: Handles level object initialization and level switching
- Phase Resource Manager: Manages spawning and state updates for pipes, coins, text, and other background images on the map
- Enemy Manager: Manages enemy movement, collision, spawning, and state updates
  - Base class: Enemy
    - Goomba: A basic enemy with no special abilities
    - Flower (Piranha Plant): Spawns on pipes; moves up and down
    - Koopa: Has walking and shell states — Mario stomping it triggers the shell state; stomping the shell again sends it sliding to collide with other creatures (including Mario); left un-stomped for long enough, it reverts back to walking
    - FlyKoopa (Flying Koopa): A Koopa that flies through the air; degrades into a regular Koopa when stomped, sharing the same behavior as a regular Koopa, and moves up and down
- Block Manager: Manages block spawning and state updates
  - Base class: Block
    - Common Block: Can be broken by Mario
    - Immovable Block: Cannot be broken
    - Mystery Block (question-mark block): Holds an item inside; hitting it drops an item or a coin
- Prop Manager: Manages item spawning and state updates
  - Base class: Prop
    - Coin: Collecting it grants a coin and points
    - Magic Mushroom (red): Eating it grants the "grown" state and points
    - One-Up Mushroom (green): Eating it grants an extra life
    - Fire Flower: Eating it while grown grants the fire state; if Mario is in the normal (small) state, it behaves like a Magic Mushroom instead, granting points
    - Starman: Eating it grants invincibility
- Fly Platform Manager
  - Fly Platform (moving platform): Moves up/down or left/right, split into platforms that reverse direction after traveling a set distance and ones that respawn on the opposite side of the map after reaching the top or bottom
- Fireball Manager: Manages fireball movement and state updates
- Base class: Background Image
  - Animated Image: Extends the base class with animation-related functions
- States
  - Collision State
  - Dead State
- Other classes
  - Base class: Animated Character
    - Mario: The player character, controlled via keyboard
    - Fireball: Kills enemies on contact, explodes against walls, keeps bouncing when it hits the floor
  - Renderer: Camera and rendering
  - TaskText: On-map text
  - Global: Size and coordinate-offset variables

### OOP Techniques Used

Encapsulation, inheritance,<br>
<span data-term="function-overload">Function Overload</span>

## Conclusion

### Problems and Solutions

| Problem | Solution |
| --- | --- |
| Various bugs of different types after finishing a feature | Discussed with teammates, used breakpoints or print statements to track down bugs |
| Getting stuck on walls during collisions | Repeated testing revealed inconsistent sprite sizes; fixed by standardizing image dimensions |
| Growth animation only showed the first frame | Added a boolean flag so the animation-update function was only called when the animation actually needed to change, avoiding redundant calls |
| Sometimes couldn't tell whether the growth animation had finished | Switched to a timer to track the end time instead |
| Game objects wouldn't move | Used Manager classes to centralize control, calling movement functions each main-loop iteration to update positions |

### Reflections

For our OOPL final project, we chose to recreate the classic *Super Mario Bros. 1985* as our challenge. It wasn't just a piece of our childhood — it was also a great vehicle for practicing object-oriented design techniques like encapsulation, inheritance, polymorphism, and class modularization.

Throughout development, we dug deep into building a complete 2D side-scrolling game in C++. We modeled characters, blocks, enemies, items, and the map as classes, and used Manager classes to centralize logic and resource control, which kept the project structure clearer and easier to debug and maintain. Along the way we ran into plenty of strange bugs, which taught us how to patiently track down the root cause of a problem — and drove home just how much clean code matters.
