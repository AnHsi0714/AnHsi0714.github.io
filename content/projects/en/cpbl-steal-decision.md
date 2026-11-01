# Should You Steal with Two Outs and a Runner on First? A Base-Running Decision Guide for CPBL Coaches

## Related Links

Slides download: <a href="/other/cpbl-steal-decision/%E5%85%A9%E5%87%BA%E5%B1%80%E4%B8%80%E5%A3%98%E6%9C%89%E4%BA%BA%E8%A9%B2%E4%B8%8D%E8%A9%B2%E8%B7%91%EF%BC%9A%E4%B8%AD%E8%81%B7%E6%95%99%E7%B7%B4%E7%9A%84%E8%B7%91%E5%A3%98%E6%B1%BA%E7%AD%96%E6%8C%87%E5%8D%97.pdf" download="兩出局一壘有人該不該跑：中職教練的跑壘決策指南.pdf">PDF (about 6.5 MB, in Chinese)</a>

Integrated report entry: [all-leagues-report](https://anhsi0714.github.io/CPBL2outStealDecision/reports/all-leagues-report.html). Each of the three leagues has its own set of reports, and the table below jumps straight to a league and season:

| League | Steal decision report | RE24 matrix | Win expectancy matrix | WPA threshold |
|---|---|---|---|---|
| CPBL | [2023](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-steal-decision-2023.html) · [2024](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-steal-decision-2024.html) · [2025](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-steal-decision-2025.html) · [2026](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-steal-decision-2026.html) | [2023](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-re24-matrix-2023.html) · [2024](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-re24-matrix-2024.html) · [2025](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-re24-matrix-2025.html) · [2026](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-re24-matrix-2026.html) | [Four seasons](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-win-expectancy-matrix.html) | [Four seasons](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-wpa-decision-thresholds.html) |
| KBO | [2023](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-steal-decision-2023.html) · [2024](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-steal-decision-2024.html) · [2025](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-steal-decision-2025.html) · [2026](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-steal-decision-2026.html) | [2023](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-re24-matrix-2023.html) · [2024](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-re24-matrix-2024.html) · [2025](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-re24-matrix-2025.html) · [2026](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-re24-matrix-2026.html) | [Four seasons](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-win-expectancy-matrix.html) | [Four seasons](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-wpa-decision-thresholds.html) |
| MLB | [2023](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-steal-decision-2023.html) · [2024](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-steal-decision-2024.html) · [2025](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-steal-decision-2025.html) · [2026](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-steal-decision-2026.html) | [2023](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-re24-matrix-2023.html) · [2024](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-re24-matrix-2024.html) · [2025](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-re24-matrix-2025.html) · [2026](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-re24-matrix-2026.html) | [Four seasons](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-win-expectancy-matrix.html) | [Four seasons](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-wpa-decision-thresholds.html) |

## Project Overview

This is our entry for the 2026 Taiwan Baseball Data Analysis Competition, On-Field Tactical Analysis Group.

What we wanted to know is **when it makes sense to steal**: in CPBL games with two outs and a runner on first only, in innings 1 through 8, is the run actually worth it? To answer that, we went on to work out how often a steal has to succeed to pay off (the break-even success rate), and how that threshold changes with lineup position, batter type, inning, and score. We later applied the same method to KBO and MLB for a cross-league comparison.

Traditional <span data-term="re24">RE24</span> only looks at the expected runs from the steal to the end of the half-inning, and misses something: with two outs, a failed steal makes the third out, the batter's plate appearance is left unfinished, and it is held over to the next inning. That trades the immediate out risk for pushing the whole lineup back one slot, which is the <span data-term="retention-effect">retention effect</span>, and it is the core contribution we add.

## Method

The analysis has three layers:

1. **Filtering the scenario**: finding at-bats in the pitch-by-pitch data with two outs and a runner on first only, in innings 1 through 8 (the 9th inning and extra innings are left out because the retention effect does not apply there)
2. **Batter decision simulation**: using each batter's own probabilities of a single, double, triple, home run, walk/HBP, and out, a <span data-term="monte-carlo">Monte Carlo simulation</span> runs the three paths (steal succeeds, steal fails, no steal) side by side, 2,000 times per situation, and averages the runs that follow to get the <span data-term="break-even-success-rate">break-even success rate</span>. Who leads off the next inning after a failed steal depends on the batting order, which a table cannot capture, so each simulation runs through the end of the same team's next half-inning of offense
3. **Group comparison**: grouping by lineup position (top 1-5 vs. bottom 6-9) and batter type, and using a <span data-term="mann-whitney-u">Mann-Whitney U test</span> to check whether the median thresholds differ significantly. Batter type uses <span data-term="iso">ISO</span> as a proxy for power and BB% as a proxy for plate discipline, deliberately avoiding <span data-term="slg">SLG</span> and <span data-term="obp">OBP</span> because the two overlap heavily

### How the Three Branches Are Computed

The same game moment is split into three parallel paths, each simulated to the end of the next half-inning of offense, and the average expected runs are taken. The threshold is:

p\* = (V_no-steal − V_fail) ÷ (V_success − V_fail)

Plugging in the 2025 league-wide averages of the three paths gives (0.666 − 0.470) ÷ (0.804 − 0.470) = 58.6%. The report instead computes one p\* per situation and takes the median, 58.5%. The two differ because "average first, then divide" is not the same as "divide per situation, then take the median".

The path where the steal fails keeps the batter over to lead off the next inning, which is where the <span data-term="retention-effect">retention effect</span> enters the model.

> **Calculation note**: when counting the runs that follow a successful steal, the starting point has to be the pitch on which the steal succeeds, not the start of the at-bat or the half-inning. Otherwise runs scored before the steal get counted too, and the benefit of stealing is overstated.

<figure>
  <img src="/images/projects/cpbl-steal-decision/branches.png" width="1232" height="644" alt="How the three branches are computed: steal succeeds 0.804, steal fails 0.470, no steal 0.666, median break-even across all situations 58.5%" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 example: success 0.804, fail 0.470, no steal 0.666 expected runs, and a median break-even success rate of 58.5% across all situations</figcaption>
</figure>

### Batters Are Not Treated as Identical

Each batter is simulated with their own outcome probabilities, and batters with too few plate appearances are smoothed toward a league-average prior of 50 PA. So the same situation gives different thresholds for different batters.

<figure>
  <img src="/images/projects/cpbl-steal-decision/personal.png" width="1232" height="538" alt="Batters are not treated as identical: conditional out cost, expected out penalty, retention effect by lineup spot, smoothing prior" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">Personalization parameters in the report: conditional out cost 0.544 runs, expected out penalty 0.347 runs, smoothing prior 50 PA, and the retention effect by lineup spot (in runs, positive for spots 1 to 4, meaning a cheaper failure, and negative for spots 6 to 9, raising the threshold by 4.1 points at spot 8)</figcaption>
</figure>

## Key Findings

The charts and numbers below use the **CPBL 2025 season** as the main example, and results pooled over four seasons are marked as such.

Across four seasons (2023 to 2026) of CPBL data, **the median break-even threshold sits at 54%-59% while the actual success rate is about 67%-70%**, roughly 10 points higher. So the question is not whether to steal, but which situations call for it.

| Season | Break-even threshold (median) | Actual steal success rate |
| ------ | ----------------------------- | ------------------------- |
| 2023   | 59.2%                         | 69.8%                     |
| 2024   | 57.3%                         | 67.6%                     |
| 2025   | 58.5%                         | 67.1%                     |
| 2026   | 54.0%                         | 69.6%                     |

- **Lineup slot**: the threshold is lowest around the leadoff spot, and the pure-ability high point is cleanup
- **Retention effect**: consistent across seasons, and worst at the 8th spot
- **Batter type**: a higher single rate lowers the threshold, while more plate discipline and more power raise it
- **Inning**: from the 4th inning on, judging by win probability lowers the threshold substantially
- **Pitcher**: steal success against left-handers is clearly lower than against right-handers

### Lineup Position and Batter Type

By lineup slot, the threshold is lowest at leadoff (55.0%) and highest at cleanup (61.9%). The cleanup threshold is mostly driven by the batter's own ability: left to bat, he can often drive in runs on his own, so getting caught stealing throws away the value of that at-bat.

What the group comparisons show:

- **Contact hitters with a high single rate have a significantly lower threshold** (−7.3 percentage points). Whether a single scores a runner from first depends heavily on which base he is on, so getting to second first is especially valuable
- High-power, high-walk, and high-TTO hitters have significantly higher thresholds: the stronger the hitter overall, the less he should risk stealing
- The gap between the top and bottom of the order is only 0.3 points and is not significant in 2025

<figure>
  <img src="/images/projects/cpbl-steal-decision/segment.png" width="1232" height="1215" alt="Bar chart of the median break-even threshold by lineup slot, and group comparison table" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 threshold by lineup slot and six group comparisons (Mann-Whitney U test)</figcaption>
</figure>

Lineup slot and batter type are tangled together, because managers do not assign slots at random. Slot may also relate to recent form, since managers tend to put hot hitters near the top. The chart below shows the share of each high-group batter type at every slot: in 2025, 81% of leadoff batters were high-single-rate hitters versus only 33% at the cleanup spot, and 86% of cleanup batters were high-power (ISO) hitters. So part of the gap between a low leadoff threshold and a high cleanup threshold comes from who is batting there, and slot differences should be read together with batter type and recent form.

<figure>
  <img src="/images/projects/cpbl-steal-decision/composition.png" width="1232" height="570" alt="Bar chart of the share of high-power, high-patience, high-OBP, high-single-rate and high-TTO batters in each lineup slot" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 batter type mix by lineup slot: leadoff leans high-single-rate, cleanup leans high-power and high-OBP (labels in Chinese)</figcaption>
</figure>

Across the four seasons the retention effect keeps the same shape: negative for spots 1 to 4 (the threshold drops), near zero at spot 5, positive from spot 6, and worst at spot 8 (+3.1 to 4.1 percentage points), because the lineup is pushed back one extra slot before the top of the order comes up.

### Team Decision Quality

A binomial test compares each team's actual success rate with its median threshold, and only p < 0.05 counts as "ran correctly" or "ran wrongly".

In 2025, only the Uni-President 7-ELEVEn Lions significantly ran correctly among the six teams (79.2% vs. a 58.9% threshold, p = 0.005). The other five have only 27 to 49 attempts, which is too few, so all we can say is "cannot determine", not that they ran wrongly.

<figure>
  <img src="/images/projects/cpbl-steal-decision/team.png" width="1232" height="604" alt="Team decision quality evaluation table" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 decision opportunities, steal attempts, actual success rate, 95% confidence interval, threshold, and verdict per team</figcaption>
</figure>

### Runners Who Clear the Threshold

The threshold moves from 55.0% to 61.9% depending on who bats next, so each runner is compared slot by slot. Of the 102 runners in 2025:

- 24 are worth sending no matter who bats next
- 8 depend on the next batter
- 16 are not recommended at any slot
- 54 have fewer than 5 attempts, so the sample is too small

<figure>
  <img src="/images/projects/cpbl-steal-decision/runner.png" width="1232" height="396" alt="Summary of runners who clear the threshold" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 runner classification: 24 can run, 8 depend on slot, 16 not recommended, 54 insufficient sample</figcaption>
</figure>

### Left-Handed vs. Right-Handed Pitchers

The pitcher's handedness does not change the threshold, because the batter determines it. It changes whether the runner can actually beat it.

- In 2025 the success rate was 59.4% against left-handers and 70.1% against right-handers, a 10.7-point gap (Fisher exact test p = 0.007)
- Pooled across four seasons it is 62.5% vs. 70.9%, an 8.4-point gap (p < 0.001)
- Against right-handers runners comfortably beat the threshold, while against left-handers they only just match it
- Runners barely adjust: pooled across four seasons, their per-pitch attempt rate against left-handers is only about 11% lower than against right-handers
- Individual runners vary a lot, so left-handers should not be assumed to be bad news for everyone

The 2026 rule change limited pickoffs, and pickoff rates did fall (4.19% for left-handers, 4.63% for right-handers, versus 6.0% to 8.0% in the previous three seasons), but success rates did not rise with them. All we can say is that we cannot show the new rule raises success, so the threshold was not adjusted.

<figure>
  <img src="/images/projects/cpbl-steal-decision/handedness.png" width="1232" height="421" alt="Left vs. right-handed pitcher: 59.4% success against lefties, 70.1% against righties" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025: 130 successes in 219 attempts against lefties, 321 in 458 against righties</figcaption>
</figure>

### Interactive Calculator

The report has a "try one representative situation" tool. You can filter by player, team, inning, lineup slot, or batter type to pick one decision, then drag the success-rate slider to compare the expected runs of stealing and not stealing, while also seeing that situation's V_success, V_fail, V_no-steal, and the batter's personal model.

<figure>
  <img src="/images/projects/cpbl-steal-decision/explorer.png" width="1232" height="1221" alt="Interactive calculator for one representative situation" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">Interactive calculator: pick a decision, drag the assumed success rate, and compare expected runs for stealing vs. not stealing instantly</figcaption>
</figure>

### Advice for Coaches

In short, **whether to run depends on the batter at the plate, not the runner**. Cleanup and the 8th and 9th spots are all "don't run", but for opposite reasons: at cleanup you hate to give up a good at-bat, while at 8 and 9 you fear a failure clogging the lineup. The results boil down to one decision table (using the RE version, which counts the runs scored this inning and the next):

| Batter at the plate | Advice          | Why                                                   |
| ------------------- | --------------- | ----------------------------------------------------- |
| Spots 1 and 2       | Most worth it   | They score on singles, so the runner needs to be on second |
| Spots 3 and 4       | Least worth it  | Lots of extra-base hits, so the runner scores from first   |
| Spots 5 to 7        | Depends on runner | Neither force is strong                             |
| Spots 8 and 9       | Don't run       | A failure clogs the lineup                            |

A few things to keep in mind:

- From the 4th inning on, judge by win probability instead; the threshold is usually lower, so the table should not be applied directly, and the lineup-slot advice is not stable under the win-probability version
- With the 9-hole batter at the plate don't run, but once he is on base and the leadoff man comes up, that runner should go
- Stealing suits a batter who is behind in the count better, and there is no clear difference on a full count
- Success is higher against right-handers; against left-handers judge runner by runner
- It does not apply to the 9th inning or extra innings, because the retention effect does not apply there

## Extended Analysis

### RE24 Matrix

<span data-term="re24">RE24</span> gives the average runs from each of the 24 out-and-base states to the end of the half-inning; the darker the cell, the more runs still to come. It is the base threshold without individual batter differences or the retention effect, and the whole model is measured against it. 2025 has 360 games and 27,699 state samples.

<figure>
  <img src="/images/projects/cpbl-steal-decision/re24.png" width="1192" height="587" alt="CPBL RE24 run expectancy matrix heatmap" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 RE24 heatmap: 0.452 runs with bases empty and no outs, 2.010 with bases loaded and no outs</figcaption>
</figure>

### Win Expectancy Matrix (WE)

The <span data-term="win-expectancy">win expectancy matrix</span> combines inning, batting side, score difference, outs, and base state, and works back from four seasons of data to the batting team's final win probability, covering 1,380 games and 106,621 state samples. It is the win-probability table the WPA thresholds look up.

<figure>
  <img src="/images/projects/cpbl-steal-decision/we.png" width="1192" height="1152" alt="CPBL win expectancy matrix heatmap" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">Win expectancy matrix pooled over 2023 to 2026; choose inning, batting side, and outs to see win probability by score difference and base state</figcaption>
</figure>

### WPA-Based Break-Even Threshold

The later the game, the more each run is worth, so we originally planned to use <span data-term="wpa">WPA</span> (win probability added) only for innings 7 and 8. Going further, we found it suits the earlier innings too, so we widened it to innings 2 to 8. **From the 4th inning on, the WPA threshold is clearly lower than the RE threshold**: RE sits around 53-60% in every inning from 2 to 8, while the four-season median range for WPA is about 36-52%, 37-43%, 24-27%, and 31-35% in innings 4, 6, 7, and 8.

The reason is that the same run weighs more late in the game. With a one-run lead the win rate is 58.5% in innings 1 to 6, 73.4% in the 7th, and 77.5% in the 8th, so ending the half-inning costs more late, and the threshold should come down. Runners that RE labels "never steal" mostly qualify under the late-inning WPA threshold.

Score matters too: when the margin (leading or trailing) is 5 to 6 runs or more, steal attempts drop to 3-4% (14.2% of the sample, 13.7% in 2025), though removing samples with a margin of 5 or more moves the median threshold by only 0.06 to 0.42 points (the largest in 2023).

<figure>
  <img src="/images/projects/cpbl-steal-decision/wpa-conclusion.png" width="1232" height="793" alt="Inning-by-inning comparison of WPA and RE thresholds, and win rates with a one-run lead or deficit" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">Median WPA vs. RE thresholds by inning, and how much the same run is worth in each inning</figcaption>
</figure>

The chart below shows the 95% confidence interval of the WPA threshold (blue) and the RE median (orange) by inning. For innings 2 to 8 the WPA interval never touches the RE threshold for the same inning, so the direction is reliable. The 1st inning has too small a denominator for a stable ratio and is for reference only; the 2nd and 3rd innings are also unstable (the median often falls outside its own interval), so cite from the 4th inning on.

<figure>
  <img src="/images/projects/cpbl-steal-decision/wpa-ci.png" width="1232" height="1104" alt="Four-season per-inning WPA threshold 95% confidence interval chart" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">95% confidence intervals of the WPA threshold (blue) and the RE median (orange) by inning for each season, 2023 to 2026</figcaption>
</figure>

## Cross-League Comparison

The same method was applied to KBO and MLB (four seasons, 2023 to 2026):

| Metric | CPBL | KBO | MLB |
|---|---|---|---|
| Median threshold (RE) | about 58% | 61%-64% | 69%-71% |
| Lineup-slot shape | low at leadoff, high at cleanup | low at leadoff, high at 4, 5, or 8 | nearly flat |
| Retention effect (spot 8) | +3.1 to 4.1pp | +3.3 to 3.9pp | +1.8 to 2.4pp |

- **The shape of the retention effect is the same in all three leagues**: negative early, positive from spot 6, and almost always worst at spot 8 (the only exception is MLB 2026, where it is spot 9). The size differs by league, with strength CPBL ≈ KBO > MLB
- The threshold level rises with each league's scoring environment, and is highest in MLB
- "Cleanup is the high point" and "the top/bottom split has no discriminating power" are not cross-league patterns and only hold for CPBL
- MLB success against left-handers over the four seasons combined (76.7%) is also lower than against right-handers (79.4%), the same direction as CPBL but a much smaller gap (2.7 vs. 8.4 points), and there is no difference at all in 2026
- Late-inning WPA thresholds in MLB are likewise far below RE: about 48-50%, 39-42%, and 29-36% in innings 6, 7, and 8 (about 70% under RE)
- In 2025 MLB had 12,115 decision situations and 1,127 actual steal attempts, with a 77.3% success rate against a median threshold of 69.7% (p < 0.001), so the league as a whole ran correctly
- For MLB runners the RE version rules out at every spot, 98 to 100% qualify to steal in at least one of innings 4 to 8 under the WPA thresholds, in all four seasons

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
<figure>
  <img src="/images/projects/cpbl-steal-decision/mlb-segment.png" width="1232" height="1215" alt="MLB 2025 break-even threshold by lineup slot and group comparison" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">MLB 2025: thresholds of 68.5% to 70.8% by slot, nearly flat</figcaption>
</figure>
<figure>
  <img src="/images/projects/cpbl-steal-decision/kbo-segment.png" width="1232" height="1215" alt="KBO 2025 break-even threshold by lineup slot and group comparison" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">KBO 2025: lowest at leadoff (58.4%), highest at the 8th spot (65.5%)</figcaption>
</figure>
</div>

## Outcomes and Contributions

- **Proposed and verified the retention effect**: it fills in the cost of a failed steal that traditional RE24 cannot see. It has a consistent shape across four CPBL seasons, KBO, and MLB, almost always worst at the 8th spot, with a size that differs by league, so it is a finding that carries across leagues
- **Found the steal threshold for each lineup slot**: lowest around leadoff, with cleanup the pure-ability high point. A coach does not need one fixed number for every slot
- **Clarified the effect of batter type**: contact hitters are the best candidates to steal second, while strong power and plate-discipline hitters should not take the risk lightly
- **Late innings are judged by win probability**: from the 4th inning on the WPA threshold is clearly below the RE one, and most runners who RE labeled "not recommended" are actually worth sending late
- **Concrete lists and numbers**: team-by-team, runner-by-runner, and slot-by-slot verdicts, plus the success-rate gap against left- and right-handers, which can be used directly as a reference for base-running decisions
- **A lineup-aware Monte Carlo simulation**: each batter uses their own outcome probabilities, and after a failed steal the simulation runs through the next inning, so the retention effect is built into the break-even threshold
- **A decision table coaches can read**: which slots are most and least worth running at, plus a reminder to switch to win probability in late innings
- **A reusable set of reports**: interactive reports for three leagues and four seasons plus a one-situation calculator, so anyone can change the conditions and see the result

## Data Sources and Validation

All data is self-collected:

- **CPBL**: pitch-by-pitch records from the official site, 2023 to 2026 seasons
- **KBO**: text play-by-play from the official site (no player IDs or running score, so it is less reliable)
- **MLB**: plate-appearance records from the MLB Stats API

Stolen bases are not a structured field and are parsed from text. To make sure the results hold up, we checked them against real data:

- The simulated 24-state <span data-term="re24">RE24</span> matches the real statistics with r = 0.992 and a weighted mean error of 0.033 runs (0.995 to 0.997 for MLB, 0.981 to 0.988 for KBO)
- The steal parsing is reconciled with official CPBL statistics game by game and team by team: in 2025 successes (508/508) and caught stealing (242/242) match exactly, and all 2,760 game-team combinations across four seasons match
- Conclusions do not change with the number of simulations, and 2,000 is already converged

The data also has limits: once actual steal attempts are split up, only a few dozen remain, too few for statistical tests, so the main conclusions rest on the simulation; the data has no catcher pop time or runner speed, so those effects can only be described qualitatively; and 2023 had five teams and 300 games versus six teams and 360 games from 2024, so comparisons across years need care.

