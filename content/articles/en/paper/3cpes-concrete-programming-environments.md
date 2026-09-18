---
type: paper
title: "2024 Paper Notes on 《3CPEs: Learning Abstract Programming Concepts Through Concrete Objects》 How Do You Turn Abstract Concepts into a Learning Experience Elementary Students Can Understand?"
date: 2026-09-16
categories: [Paper, Education]
excerpt: Through designing 3CPEs, a concrete computational-concepts programming environment, and its CT Chef card game, and interviewing five elementary teachers, the study explores how to turn abstract programming concepts like variables, loops, conditionals, and functions into concrete metaphors elementary students can understand.
---

> Written between: 2026-09-16

**Original paper**: [3CPEs: Learning Abstract Programming Concepts Through Concrete Objects](https://dl.acm.org/doi/pdf/10.1145/3613905.3650833) (Ching-Ying Sung, Fu-Yin Cherng, Yi-Lun Chiu, Peng-Hsi Chen, Bing-Yu Chen, CHI EA 2024)

## Introduction

This paper designs an environment to help elementary students learn abstract programming concepts. The authors work physical objects and everyday items into CT Chef, an implementation of <span data-term="3cpes">3CPEs</span>, and evaluate the tool's capability and potential through interviews with five teachers. The findings suggest 3CPEs has the potential to help elementary students grasp more complex computational concepts.

## Methodology

<span data-term="3cpes">3CPEs</span> combines the advantages of CS-unplugged activities, such as concreteness and interactivity, with the flexibility of a programming environment.

In 3CPEs, abstract programming concepts are visualized through everyday objects and gamified elements, letting learners understand abstract concepts in a more concrete way.

CT Chef is a concrete instance of 3CPEs.

This reminded me a lot of my own capstone project: in my capstone, I used mini-games to let users learn abstract concepts through real-world scenarios, like using whack-a-mole to understand array indexing; CT Chef instead uses "cooking" as its single overarching theme, covering every programming concept it wants to convey.

The authors ran workshops introducing CT Chef and 3CPEs to five teachers experienced in elementary computational thinking and programming instruction. After the workshops, they conducted <span data-term="semi-structured-interview">semi-structured interviews</span> and <span data-term="thematic-coding">thematic analysis</span>, gathering teachers' CS teaching experience, feedback on 3CPEs, and views on CT Chef's usability.

Three research questions:
1. What difficulties and needs do elementary teachers face when teaching computational concepts?
2. What attitudes do teachers hold about applying concreteness to computational concepts in their teaching?
3. From teachers' perspective, how can this innovative approach, 3CPEs, be integrated into educational practice?

### CT Chef

CT Chef is a card-based programming learning environment set in a cooking scenario. Each card is an instruction; the categories include actions (mapping to functions), parameters, conditionals, and flow cards (loop & if-else). A conveyor-belt design lets students grasp the order in which a program executes.

| Concept | Metaphor |
| --- | --- |
| Program sequence | Conveyor belt |
| Variable | Food ingredient |
| Parameter | Parameter card |
| Loop | Loop flow card, cyclic track |
| Conditional | If-else flow card, branch track |
| List | Ingredient box |
| Self-defined function | Anywhere Door, sous chef[^1] |

By combining different cards' functions, students complete assigned goals during play while also grasping the related programming concepts.

### Design Workshop

The paper notes that the workshop's design and procedures were approved by the university's ethics committee.

This showed me that any activity involving interviews and human research participants needs to go through the corresponding ethical review and standards.

The authors used <span data-term="snowball-sampling">snowball sampling</span> to recruit teachers experienced in computer science, programming, and computational thinking.

For the workshop, they built a <span data-term="paper-prototype">paper prototype</span> of CT Chef, making it easier for participants to assess its usability and feasibility, and also to gauge their understanding of the underlying concept, <span data-term="3cpes">3CPEs</span>.

The goal was for participants to build a course with CT Chef and design two to three related tasks. Each workshop ran in two rounds: first designing a course around basic concepts like program sequence and loops, then around advanced concepts like conditionals and self-defined functions. After finishing their course designs, participants shared their ideas and teaching strategies, and took part in a group interview to gather feedback.

The team held three workshops in total, continuing until reaching thematic saturation. Data came from three sources: participants' course and task designs, workshop video recordings, and 30-minute group <span data-term="semi-structured-interview">semi-structured interviews</span> focused on teaching experience, impressions of CT Chef, and 3CPEs' influence on their teaching. In total they collected 9 hours of video, 10 course designs, and 23 task designs. After the workshops, two coders, one with a computer-science background and one with an education background, did a <span data-term="thematic-coding">thematic analysis</span> of this data together, converging on recurring themes through multiple rounds of discussion rather than one author coding alone.

## Findings

Teachers found CT Chef flexible and effective, helping students grasp complex concepts through everyday-object metaphors.
Based on this feedback, the authors further refined <span data-term="3cpes">3CPEs</span> and CT Chef's design considerations, and outlined potential directions for future <span data-term="k-12">K-12</span> CS education support.

This part reminded me a lot of the survey feedback for my own capstone project; both use user feedback to fill gaps in the design of your own tool.

### Course Design Cases

To show how CT Chef adapts to different teaching styles, the authors showcased two teachers' actual course designs.

P1 used a stir-fry restaurant theme, designing two tasks to teach sequence and self-defined functions: Task 1 had students use the Anywhere Door to sequence action cards for the sous chef; Task 2 had them program the sous chef's actions inside the Anywhere Door, using if-else cards to handle ingredients differently (e.g., cutting meat versus refrigerating other items).

P3 designed a lesson focused on loops, split into an in-class exercise and a homework task: Task 1 had students observe a complete program and spot the repeating segments (hinted at by tracks above them), practicing recognizing parts that could be simplified with a loop and parameter card; Task 2 gave a longer sequence mixing repeating and unique cards, testing whether students could correctly spot repeating patterns and apply loops.

These two cases show that CT Chef really can adapt to different teaching contexts such as in-class exercises, homework, and instructional videos, echoing the highly flexible design mentioned earlier.

### Qualitative Interview Findings

Three teachers mentioned that understanding computational concepts and thinking matters more than syntax for elementary students.

I think this connects closely to the current AI era. As AI-assisted programming becomes more common, syntax itself may no longer be the main barrier to learning programming; understanding how a program works through logic may matter more.

Teachers talked about difficulties with existing teaching tools, including that variables and lists are fairly abstract concepts that students find hard to understand; students also often struggle to understand the difference between a self-defined function and the main function.

I think interviewing teachers surfaces the pain points they actually run into during teaching, which can then guide improvements to the tool. That's information that's harder to get by studying students directly, since students usually only sense that they "don't understand" a concept, without necessarily being able to pinpoint where exactly they got stuck or which specific programming concept they don't understand.

Also, students tend to understand a single concept first; combining multiple concepts can increase cognitive load. For example, using lists and loops together tends to be harder to learn.

### Feedback

Teachers felt CT Chef suited children under eight, and that the cooking theme was more relatable to daily life than typical programming-learning tools.

The sous-chef and Anywhere Door design can represent self-defined functions and multiple parameters, setting it apart from typical teaching tools.

Some teachers also said they'd like to work CT Chef into their existing curriculum going forward; for example, one teacher mentioned planning to teach in the order ScratchJr → CT Chef → Scratch, letting students gradually move from a simpler tool to a more full-featured environment.

While CT Chef's variety was well received, teachers also worried that too many elements might get in the way of students understanding a single concept, and suggested limiting the range of ingredients and providing clear cooking rules; one teacher also noted that some students have limited cooking experience, which could affect how engaged they are with this theme.

## Limitations

The authors note that they haven't yet run workshops or user studies involving both teachers and elementary students together. If future work can collect <span data-term="quantitative-data">quantitative data</span>, it would more conclusively demonstrate <span data-term="3cpes">3CPEs</span>' learning benefits for this population.

## Conclusion & Future Directions

This paper offers a low-floor, high-ceiling teaching tool for building students' computational thinking. The authors argue these two traits particularly suit children at Piaget's "concrete operational stage," letting them practice computational thinking without relying on abstract thought.

This study focuses mainly on elementary students, i.e., younger learners, so different levels of students may call for different design approaches.

For example, beginners could use board games with rule constraints to lower the barrier to entry; advanced learners could use digital platforms for more complex learning.

This ties back to my own capstone project. In my capstone, we designed a digital platform aimed mainly at advanced learners, which resonates with the future direction the authors propose.

Another angle worth exploring is the influence of gender and cultural differences. I think this is a direction well worth exploring. Like the regional limitations I've mentioned before, differences between groups may also affect how a teaching tool gets used and how effective it is.

Finally, the authors bring up collaborative learning. This is a different direction from my own capstone project, but still worth considering. Research suggests collaborative learning can help improve learners' motivation and outcomes; CodePulse currently only offers a single-player learning experience. Adding peer interaction could potentially further increase learners' engagement and learning potential.

The authors also note, based on teacher feedback, that users may need more advanced programming concepts. So future versions could consider integrating additional logical operators, multiple variables, and similar concepts to better meet users' learning needs.

## Reading Notes

I think approaching this from teachers' perspective, rather than students' perspective directly, is a distinctive angle. The upside is that it lets teachers use the tool to help students learn; the downside is that it's harder to directly see what difficulties students actually run into when using the tool, or what learning outcomes it actually produces.

Compared with my own capstone project, the differences can be organized into a table:

| Comparison | 3CPEs (CT Chef) | My Capstone (CodePulse) |
| --- | --- | --- |
| Study subject | Instructors (elementary teachers) | Learners (students) |
| Tool format | Game (card game) | Digital platform |
| Target learner level | Beginners (elementary students) | Advanced learners (college/high school) |
| Metaphor design | Single theme (cooking) covering every concept | Multiple standalone mini-games, each mapped to a different concept (e.g., whack-a-mole for array indexing) |
| Evaluation approach | Qualitative feedback from teacher workshops; no student testing or quantitative data yet | Pre/post testing with college and high school students, with quantitative metrics like Normalized Gain |

[^1]: Here, "head chef" stands for the main program (main); "sous chef" stands for a user-defined function, not the main program itself.
