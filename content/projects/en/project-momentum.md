# Momentum

## Project Overview

A personal timetable web app that tells me what to do right now. The top of the screen shows the current time block, how much time is left in it, and what comes next. Each day I tick off habits and write progress notes, and on weekends I answer a fixed set of review questions.

The timetable follows my own routine (classes, deep work, English, reading, exercise, bedtime), but the blocks and habits live in config files, so anyone can swap in their own.

### Origin and Motivation

After being worn down by graduate admission interviews, I realized there was still a real gap between where I was and where I wanted to be. It also sent me back to an idea from *Atomic Habits*: rather than relying on willpower alone, building a system and environment that suit you may be what keeps you acting over the long run.

Since I tend to work best in long, uninterrupted stretches, I designed Project Momentum as a personal time management system built around deep work. Planning each day's tasks in advance sets a steady rhythm, while tasks and breaks stay adjustable, so the plan can bend to how the day actually goes instead of locking me into a rigid timetable.

The goal isn't just to use time more efficiently. Through a systematic routine, I want to gradually build the ability to keep going, rest when I need to, and get back into work afterward.

### Design Principles

Project Momentum isn't just a to-do list. It's a personal time management system built on time blocks that combines task management, rest planning, and a weekly review. The design rests on these principles:

1. **Deep Work**: Tasks are scheduled in longer blocks to cut down on the distraction of frequent switching, so I can focus on one activity instead of jumping between tasks.
2. **Flexibility**: The daily timetable is planned ahead, but it isn't a fixed constraint. When an ad-hoc task or something unexpected comes up, I can change the time and order of the day's tasks, keeping the overall plan while leaving room to adapt.
3. **Active Execution**: I start and end each task myself, rather than having the app assume it happened on schedule. Recording what actually happened keeps planned time and actual time separate.
4. **Recovery**: Rest is treated as part of time management, not as empty space between work. Beyond leisure, it accounts for short naps and recovering energy, so long work sessions or low-quality breaks don't drag down what comes next.
5. **Continuous Improvement**: A weekly review looks at what got done, how time was spent, and what got in the way, then adjusts the plan going forward, rather than chasing the completion rate of a single plan.

## Screens

| Screen    | Contents                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Today     | Current block, progress bar, and the full-day timetable; tasks can be started and ended with actual times recorded; drag to adjust the day; a recovery mode for tired days |
| This Week | Days each habit was completed this week, and time spent per category per day                                                                    |
| Review    | Fixed weekly review questions, with backup export and import                                                                                    |
| Terms     | What each block name means, and what to keep or drop when time runs short                                                                       |

### Today: What to Do Now

<figure>
  <img src="/images/projects/project-momentum/today-now.png" width="1117" height="848" alt="Top of the Today page: the date and this week's day strip, and an in-progress card for the deep work block (coursework or project) showing a start time of 18:02, 12 minutes elapsed, a progress bar, 1 h 18 min left of 1 h 30 min, English next at 21:30, plus an End button and a floating item for dinner" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">The current block: actual start time, time elapsed and left, and what comes next; things without a fixed time, like dinner, are floating items (UI in Chinese)</figcaption>
</figure>

<figure>
  <img src="/images/projects/project-momentum/today-schedule.png" width="1127" height="760" alt="Bottom of the Today page: the full-day timetable highlighting the in-progress block and its actual start time, with a recovery mode toggle, today's goals (fixed wake and bed time: met; deep work: in progress), and a notes box for today's output and progress" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">The full-day timetable, recovery mode, today's goals, and progress notes</figcaption>
</figure>

### Adjusting the Timetable

On the timeline, drag a task to move it or drag its right edge to change its length, in 5-minute steps; the keyboard works too. Fixed blocks such as classes and commutes have dashed borders and can't be moved. Tasks can be dragged over each other, and overlaps are listed as conflicts that must all be resolved before confirming.

<figure>
  <img src="/images/projects/project-momentum/timeline-conflict.png" width="1012" height="873" alt="English and reading overlap on the timeline, with reading pushed to a second row and outlined in red; the conflicts box shows 1 conflict, English and reading overlapping 21:40–22:00 (20 min), and both tasks in the list below are marked as overlapping" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">When tasks overlap: the timeline splits into two rows, and the conflicts box lists each overlap with its time and length; selecting an item focuses that task so it can be moved off with the arrow keys</figcaption>
</figure>

<figure>
  <img src="/images/projects/project-momentum/insert-task.png" width="1129" height="766" alt="Insert task form: name, start time (24-hour), length in minutes, type, and a fixed-time checkbox" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">Inserting an ad-hoc task: existing tasks aren't pushed back; overlaps are listed as conflicts to drag apart by hand</figcaption>
</figure>

### This Week: Habit Progress and Daily Plans

<figure>
  <img src="/images/projects/project-momentum/week-habits.png" width="1006" height="635" alt="Habit progress on the This Week page: one row each for fixed wake and bed time, English, reading, exercise, deep work, coursework review, and the weekly review, each with Monday-to-Sunday boxes and a completion count, such as 2/7 for fixed wake and bed time and 0/5 for English" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">Which days each habit was done this week; the goal is a weekly count, not every day</figcaption>
</figure>

<figure>
  <img src="/images/projects/project-momentum/week-schedule.png" width="1026" height="934" alt="Daily plans on the This Week page: one card per day from Monday to Sunday, listing the day's theme (such as coursework and side project day), wake-up time, and the blocks for classes, deep work, exercise, English, and reading, with a button to view the full timetable" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">The week at a glance: each day has its own theme, wake-up time, and blocks for each kind of task</figcaption>
</figure>

### Review: Fixed Weekly Questions

<figure>
  <img src="/images/projects/project-momentum/weekly-review.png" width="754" height="940" alt="Weekly review page: six fixed questions, each with a text box, such as what the side project achieved this week, the most important deliverable next week, and which habits worked or didn't; export and import JSON backup buttons at the bottom" style="display: block; margin: 0 auto; width: 100%; height: auto;" />
  <figcaption style="text-align: center;">Six fixed review questions, saved automatically, with JSON backup export and import</figcaption>
</figure>

### Terms: What to Drop When Time Runs Short

<figure>
  <img src="/images/projects/project-momentum/terms-priority.png" width="1120" height="741" alt="Terms page: naming rules (or means pick one, a list means do all, text after a colon is what the block is for), and the order to drop things when time runs short: sleep, classes and commute, meals and showers, the day's most important task, other habits, light tasks, open time" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">How block names are written, and the order for cutting back when time runs short: the higher up, the more it's protected; open time goes first</figcaption>
</figure>

## Design Trade-offs and Lessons from Use

Project Momentum grew out of my own needs, so some design choices aren't about convenience. They take into account how I actually behave and what effect each mechanism might have.

1. **Unfinished tasks don't carry over automatically**
   - **How it works**: Tasks not finished today aren't moved to the next day. To do them another day, I have to schedule them again.
   - **Why**: This keeps unfinished tasks from piling up and crowding later timetables, and it makes me rethink their priority.
2. **The day's timetable stays adjustable**
   - **How it works**: Tasks can be moved within the same day; a new task is added through the insert feature, which adjusts the existing timetable.
   - **Why**: Compared with a fully fixed timetable, this keeps the original plan while letting me respond to how the day actually goes, instead of abandoning the whole plan over one ad-hoc task.
3. **Actual time is recorded by starting and ending tasks**
   - **How it works**: I start and end each task by hand. If the previous task hasn't ended, the elapsed time still counts toward it; the time between ending one task and starting the next counts as rest.
   - **Why**: Planned time isn't treated as time actually spent, so I can see the gap between the plan and what I really did.
4. **Leisure and recovery breaks are separate**
   - **How it works**: Besides regular rest blocks, I can insert extra recovery breaks, such as a short nap or resting my eyes.
   - **Why**: In practice, rest doesn't always restore energy. Scrolling on my phone is entertaining, but it doesn't necessarily make me less tired. So breaks should fit what I actually need, not just get longer.
5. **No punishment as the main tool**
   - **How it works**: Postponed, canceled, and unfinished tasks are all kept on record and examined in the weekly review, rather than pushing me to finish tasks with point deductions or penalties.
   - **Why**: Piling up failure records or penalties can make me numb to the records over time. Instead, the review is for finding problems that keep coming up and adjusting the system and how I work.

## Technical Architecture

- **Frontend**: Vite + TypeScript, views rendered with lit-html and split into components, styled with Sass.
- **Configuration**: The timetable, habits and weekly goals, and term definitions each live in config files under `src/config/`.
- **Data**: Stays on my own computer. When run with `npm run dev`, records are written to `data/momentum.json` in the project, with a copy kept in the browser; `data/` is not version-controlled, and backups are exported from the Review page.
- **Accessibility**: Every new screen must meet WCAG AA; the build runs a type check plus a contrast and font-size check first.

## Current Progress

Core features of all four screens are done, including start/end time tracking for tasks, floating items, free-drag timetable adjustment with a conflict list, and judging habit completion from the log.

## Future Work

- **Timetable**: Review whether weekday and weekend blocks are too full or too loose, and decide what a few gaps are for.
- **Side projects**: Pick topics (at most two in parallel), assign deep-work blocks, set phases and a first milestone, and add project records to the data.
- **Exercise**: Define each day's workout and how to track progress.
- **Customization**: Let users define their own task types and content.
- **Review**: Choose a metric for progress and show it on the Review page.
- **Data growth**: Once the data file passes 2–3 MB, minify the JSON first, then archive it by year.
