# Should You Steal on Two Outs? A Base-Running Decision Guide for CPBL Coaches

## Related Links

GitHub: [CPBL2outStealDecision](https://github.com/AnHsi0714/CPBL2outStealDecision)

## Project Overview

An entry for the 2026 Taiwan Baseball Data Analysis Competition (On-Field Tactical Analysis Group), studying the break-even success-rate threshold for attempting a steal in the Chinese Professional Baseball League (CPBL) with two outs and a runner on first only, during innings 1 through 8, and how that threshold shifts with the batter's lineup position and batter type.

Traditional RE24 (Run Expectancy 24) analysis only looks at the run expectancy from the moment of the steal to the end of that half-inning, missing the fact that a failed steal (the third out) sends that batter's turn at bat back to the start of the next inning, effectively trading immediate out risk for shifting the whole lineup back by one slot. That retention effect is the core contribution this research adds: when calculating the runs expected after a steal, the starting point has to be the pitch on which the steal succeeds, not the start of the at-bat or the half-inning, otherwise runs scored before the steal get counted too and the benefit gets overstated.

## Data and Method

The data comes from a custom scraper pulling pitch-by-pitch, game-by-game data from the CPBL website for the 2025 season. The analysis has three layers:

1. **Filtering the scenario**: identifying at-bats from the pitch-by-pitch data with two outs and a runner on first only, in innings 1 through 8
2. **Batter decision simulation**: using each batter's individual probabilities of a single, double, triple, home run, walk/HBP, and out, simulating the expected runs for each of the three branches (steal succeeds, steal fails, no steal) to compute the break-even success rate
3. **Group comparison**: grouping by lineup position (top 1-5 vs. bottom 6-9) and batter type (ISO as a proxy for power, BB% as a proxy for plate discipline, deliberately avoiding SLG/OBP since the two overlap heavily), then using a Mann-Whitney U test to check whether group medians differ significantly

## Early Findings (2025 Season Data)

Per-lineup-slot analysis shows the break-even threshold is lowest at the 1 and 2 spots (53-54%) and highest at cleanup (61.3%). At the 1 and 2 spots, whether a failed steal holds the batter over or a normal out just moves things along to the next similarly-skilled early-lineup hitter, the difference is small, making these the spots where stealing is relatively the safest gamble. The high threshold at cleanup is mostly driven by the batter's own hitting ability: left to bat, that hitter often drives in runs on their own within the same half-inning, so getting caught stealing just forfeits that at-bat's value for nothing. The 9-hole threshold is also elevated (59.8%), but for a different reason, the retention effect: normally, once the 9-hole batter is out, the inning turns over to the team's strongest hitter leading off, but a caught stealing keeps the 9-hole batter himself at the plate to start the next inning, costing the team the chance to get its best hitter up early.

Comparing power hitters against contact hitters turned up something unexpected too: both groups showed a significantly higher threshold than their counterparts (p < 0.001), meaning the stronger a batter is overall at the plate, the less they should risk stealing, which doesn't fully match the original assumption that power and plate discipline would cancel each other out. Breaking "getting on base" down further made this clearer: a higher walk rate (BB%) correlates with a higher threshold, since a walk at best pushes the runner to second and rarely drives him home; but a higher pure single rate actually lowers the threshold (an 8.2-percentage-point gap, the largest of any group comparison), because these batters are most likely to produce a single when they come up, and whether a single scores a runner from first depends heavily on which base he's on, making the marginal value of stealing second first especially high.

## Current Status

Registration for the competition opened on 2026/07/01, written materials are due by 2026/10/31, and teams that advance present live on 2026/12/19. The 2025-season data collection, decision model, and group analysis are done, along with an interactive HTML report. Next steps are assembling the full presentation and running a sensitivity analysis on variables the model doesn't yet account for, like individual runner speed.
