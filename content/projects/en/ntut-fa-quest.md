# NTUT FA Quest: A Campus Puzzle Game Built on Finite Automata

## Related Links

GitHub: [ntut-fa-quest](https://github.com/AnHsi0714/ntut-fa-quest)

## Project Overview

This project turns NTUT's campus administrative paperwork (getting an advisor's signature, visiting the department office, the academic affairs office, and so on) into a 2D pixel-art campus treasure-hunt game. Players interact with NPCs at different offices to complete document-application tasks, and their sequence of actions is recorded as a Trace, which a <span data-term="finite-automaton">finite-automata</span> verification engine checks against the legal procedure, returning ACCEPT or REJECT with a counterexample.

## Core Idea: Abstracting Administrative Processes into Automata

- A process with a fixed step order is modeled as a <span data-term="dfa">DFA</span>
- A process with multiple legal orderings is modeled as an <span data-term="nfa">NFA</span>
- The game layer only decides what event happens (using time and probability to decide whether an NPC is currently present); the verification layer only judges whether that event is legal in the current <span data-term="finite-automaton">automaton</span> state. Time and randomness never enter the formal language itself, keeping the automaton definitions clean
- Verification happens after the fact rather than blocking in real time: players can freely wander and attempt any interaction, and illegal transitions are only flagged when the Trace is evaluated, never by blocking movement, i.e., "you can certainly go to the wrong place, the process just won't be approved"

## The Four Documents and Their Automata

- **Document A (<span data-term="dfa">DFA</span>)**: a linear three-step process, advisor to department office to academic affairs office
- **Document B (<span data-term="nfa">NFA</span>)**: a four-step process where the middle two steps (department office / department head) can be completed in either order, modeled with epsilon-transitions
- **Document C (PDA, not yet implemented)**: an add/drop course scenario where the number of dropped courses must stay greater than or equal to the number of added courses throughout, becoming equal at submission. This needs stack-based verification, a classic bracket-matching case for context-free languages. It's on hold until the coursework covers this
- **Document D (NFA + minimization, not yet implemented)**: print the application form and transcript in either order, then get a signature from any one of three authorized instructors (advisor, club advisor, or department teacher). After minimization, the three signature states collapse into one because the subsequent paths are identical, used to illustrate the difference between behavioral equivalence and Trace recording

## Map, Time, and Stamina Systems

The campus map grew from 22×17 to 56×40 tiles, positioning buildings to match NTUT's official campus layout. Buildings currently accessible include the Science Research Building, Teaching Buildings 1 through 4, Teaching Building 6, the General Studies Building, the Comprehensive Sciences Building, the Design Building, the Library (B1-3F, with service zones per the official floor-guide page), the Administration Building (8 floors, with each administrative unit mapped to its listing on the official directory page), and the Pioneer Building (formally the Pioneer International R&D Building, across Zhongxiao East Road, reachable only by crossing the street). The "Green Garden" restaurant on floors 1-2 of the Guanghua Building is where players go to restore stamina.

The time and stamina systems exist to stop players from just camping an NPC indefinitely: some NPCs are only present during a fixed morning or afternoon window, and others (like the department head) are present based on a probability that's only re-rolled when time advances. Interacting with an absent NPC triggers a `staff_absent` event that has no defined transition, resulting in an automatic REJECT, with no need for a separate "waiting" state. School hours run 08:00-20:00, and running out of stamina triggers side quests like eating or attending class that consume in-game time but never enter the Trace.

*(Map and NPC interaction screenshots: to be added)*

## Current Status

Completed so far: 2D pixel-art campus rendering, player movement with camera following, NPC collision and dialogue, plus the definitions for Documents A, B, and D integrated into the game. What's left, beyond finishing touches on the map and documents, is mainly the two automata-theory pieces the project proposal's software-verification goals explicitly call for, PDA and <span data-term="dfa">DFA</span> minimization; without them the verification engine isn't complete.

## Future Work

1. **PDA (Document C, add/drop scenario)**: the PDA data structure and simulation, wiring it into the verification engine's invalid-transition check, adding a stack display to the automaton viewer, legal/illegal Trace tests, and looking up the actual add/drop rules (credit caps, drop deadlines, etc.). This is on hold until coursework reaches context-free languages
2. **<span data-term="dfa">DFA</span> minimization (Document D, any-instructor-signs scenario)**: the <span data-term="nfa">NFA</span> and NFA-to-DFA conversion are done, but the table-filling minimization algorithm, an automaton-viewer view comparing pre/post minimization, and tests verifying the results match before and after are still missing
3. **Official process data collection**: the process steps for Documents A, B, and D are defined, but verifying that every step has a citable official source, with the source and lookup date recorded, hasn't been checked off item by item
4. **Per-building exit calibration**: every building's exit currently defaults to the south side of its main hall; each building needs to be checked individually against its real exit direction (the map editor now makes this relatively easy)
