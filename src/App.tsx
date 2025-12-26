import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Video, ChevronDown, ChevronRight, Target, Shield, Sparkles, AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface Message {
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface KnowledgeSection {
  title: string;
  content: string;
  icon: React.ReactNode;
}

// Simple markdown parser for chat messages
const parseMarkdown = (text: string): string => {
  return text
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-slate-700/50 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    // Bullet points
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^• (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    // Wrap consecutive list items
    .replace(/(<li class="ml-4 list-disc">.*<\/li>\n?)+/g, '<ul class="my-2 space-y-1">$&</ul>')
    .replace(/(<li class="ml-4 list-decimal">.*<\/li>\n?)+/g, '<ol class="my-2 space-y-1">$&</ol>')
    // Checkmarks and X marks
    .replace(/✓/g, '<span class="text-emerald-400">✓</span>')
    .replace(/✗/g, '<span class="text-red-400">✗</span>')
    .replace(/→/g, '<span class="text-violet-400">→</span>')
    // Line breaks (double newline = paragraph break)
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br/>');
};

const FormattedMessage = ({ content, isUser }: { content: string; isUser: boolean }) => {
  const formattedContent = parseMarkdown(content);
  return (
    <div 
      className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-slate'}`}
      dangerouslySetInnerHTML={{ __html: `<p>${formattedContent}</p>` }}
    />
  );
};

const App = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: `Welcome to the V2V Evaluation Guide! 🎬

I'm here to help you make consistent, accurate Video-to-Video editing evaluations. 

**V2V Components:** Text Prompt + Input Video + Two Output Videos

**Remember: 20-second max per question!**

I can help with all 9 evaluation questions:
1. **Instruction Following** - Did the edit happen correctly?
2. **Fails To Edit** - Is the video identical to input?
3. **Background Preservation** - Environment maintained?
4. **Subject Preservation** - Main subject identity intact?
5. **Motion Preservation** - When to use N/A vs assess normally
6. **Overall Structure** - All elements combined
7. **Face/Hand/Body Rendering** - Human rendering quality
8. **Edit Visual Quality** - Artifacts and quality issues
9. **Overall Preference** - Your final subjective call

**Try describing a specific scenario for step-by-step guidance!**`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core-principles']));
  
  const knowledgeBase: { [key: string]: KnowledgeSection } = {
    'core-principles': {
      title: 'Core V2V Principles',
      icon: <Target className="w-4 h-4" />,
      content: `VIDEO-TO-VIDEO (V2V) EDITING - CORE PRINCIPLES

CRITICAL TIME LIMIT:
Meta wants us to look at clips for NO MORE THAN 20 SECONDS when determining any question. However, don't let this time limit deter you from closely analyzing the videos to distinguish differences in elements.

WHAT IS V2V?
V2V evaluation assesses how well a model edits an existing video based on a TEXT PROMPT while preserving elements that should remain unchanged.

V2V COMPONENTS (only these 3):
1. Text prompt (the edit instruction)
2. Input video (the original)
3. Two output videos (A and B to compare)

THE GOLDEN RULE:
The edit instruction is KING. Everything flows from whether the video successfully applied the requested edit.

EVALUATION HIERARCHY (in order of importance):
1. Did the edit instruction get applied? (Most Critical)
2. Is structure preserved (background, subject, motion)?
3. Is the edit visually clean (no artifacts, glitches)?

EVALUATION QUESTIONS IN ORDER:
1. Instruction Following
2. Fails To Edit
3. Structure Preservation (Background)
4. Structure Preservation (Subject)
5. Structure Preservation (Motion)
6. Overall Structure Preservation
7. Face/Hand/Body Rendering
8. Edit Visual Quality
9. Overall Preference

THE CORE V2V QUESTION:
Which output video best follows the prompt instruction while preserving the input video's elements that weren't supposed to change?`
    },

    'instruction-following': {
      title: 'Instruction Following',
      icon: <CheckCircle className="w-4 h-4" />,
      content: `INSTRUCTION FOLLOWING: Which video better matches the edit instruction for the input video?

This is the MOST IMPORTANT dimension. A video that doesn't follow instructions fails the task.

WHEN TO CHOOSE EACH ANSWER:

VIDEO A or VIDEO B:
- If one video is fully or partially better in following instructions than the other
- If BOTH follow instructions, but one adds EXTRA that wasn't asked for → choose the other
- Example: Both follow instruction, but Video B creates 2 bugs when only 1 was asked → Video A wins

BOTH GOOD:
- If both follow the instructions equally and completely
- Example: Both videos change the subject exactly as instructed

BOTH BAD:
- If both videos follow the instructions only partially or not at all
- Example: Both fail to edit a walk to a cartwheel in the walking direction
- Example: "Ladybug slowly crawls down arm but does NOT climb up the man's hand" - hard to say which is better, Both Bad is fine

EXTRA CONTENT RULE:
If both videos follow the instruction correctly, but one adds unrequested elements:
- The video that ONLY does what was asked = better
- Adding extra = worse (even if the extra looks good)

INSTRUCTION COMPONENTS TO CHECK:
1. WHAT should change (subject, object, attribute)
2. HOW it should change (the transformation type)
3. WHERE the change should occur (if specified)

PARTIAL CREDIT:
- If prompt says "blue uniform with gold buttons" and video shows blue uniform without gold buttons → Partial fail
- If prompt says "make her smile" and video shows slight smirk → Acceptable (direction is correct)`
    },

    'fails-to-edit': {
      title: 'Fails To Edit',
      icon: <XCircle className="w-4 h-4" />,
      content: `FAILS TO EDIT: Does a video contain no edit?

IMPORTANT: Watch all videos ALL THE WAY THROUGH as sometimes the edit is minor (end of clip cutting off, etc.)

WHEN TO CHOOSE EACH ANSWER:

VIDEO A or VIDEO B:
- If there is NO edit done to one of the videos and it is identical to the input video
- Example: Video A is the same as input (even if slower with some distortion) → choose Video A as failing

BOTH:
- If there is NO edit done to BOTH videos and they are both identical to the input video

NONE:
- If BOTH videos have edits (most common answer)
- Both videos are different from the input

=== CRITICAL CLIENT UPDATE ===

If the video is NOT 100% identical because of:
- Lacking a few frames
- Minor distortion
- Slightly lower quality
- Slightly slower/faster
- Slightest color difference

→ We assume it has NO EDITS (these are artifacts, not intentional edits)

HOWEVER: Always safer to consider there WAS an edit and complete the rest of the task normally. The close-to-non-edited video would likely become the answer for most structure preservation questions anyway.

DETECTION TIPS:
1. Watch both videos completely - edits can be subtle or at the end
2. Compare start and end frames to input
3. Look for the specific change requested in the prompt
4. Minor quality differences ≠ edits
5. Frame drops or speed changes ≠ edits`
    },

    'structure-preservation': {
      title: 'Structure Preservation',
      icon: <Shield className="w-4 h-4" />,
      content: `STRUCTURE PRESERVATION - THREE DIMENSIONS

=== BACKGROUND PRESERVATION ===
If the instruction does not mention changing it, which video better preserves the original background/environment?

This question specifically refers to the BACKGROUND AND ENVIRONMENT ONLY.
If only PART of the background is to be changed via instructions → NOT N/A, still assess

WHEN TO CHOOSE:
VIDEO A or VIDEO B:
- If backgrounds are not identical, choose the one most closely resembling input
- Example: Hill in background preserved better in B → choose B

BOTH GOOD:
- If both equally maintain the background (minor adjustments okay if still recognizable)
- Example: Both maintain background other than requested color change

BOTH BAD:
- If both videos drastically changed the background

NOT APPLICABLE:
- ONLY if instruction said to change the FULL background/environment
- No discernible elements from original input video remain
- Example: "Dunes and sky are prompted to change the setting"

SPECIAL NOTE - TEXT IN VIDEOS:
Speech bubbles, advertisement text, overlay text, etc. = part of background/environment
- Preserving text adds to overall structure preservation
- Preserving text adds to edit visual quality

=== SUBJECT PRESERVATION ===
If the instruction does not mention changing it, which video better preserves the identity or appearance of the main character?

This question is about the MAIN SUBJECT ONLY. Other changes don't count here.
Main subjects can be: humans, objects, animals, etc. - whatever the focal item is!
There CAN be multiple subjects.

WHEN TO CHOOSE:
VIDEO A or VIDEO B:
- The video presenting character identically/closest to input
- Can choose even with minor adjustments requested by prompt
- Example: Video A better because Video B has weird indents on pig's back

BOTH GOOD:
- If both make NO changes to main subject, or minimally change it equally
- Can choose even with minor prompt-requested adjustments
- Example: Both videos - you can still tell it's the same man

BOTH BAD:
- If both make drastic changes making you question if it's the same thing
- Changes NOT requested by prompt
- Example: Dolphins both different from input - neither matches original

NOT APPLICABLE:
- If prompt requested changing the subject enough that you'd no longer identify them
- Example: Dog was told to change - despite not doing it well, it's N/A

=== OVERALL STRUCTURE PRESERVATION ===
Except for the edit instruction, which video better preserves the overall layouts, objects, and motions?

This question covers ALL layouts, motions, and objects INCLUDING the main subject.

WHEN TO CHOOSE:
VIDEO A or VIDEO B:
- Choose video keeping all items same/closest to input
- Can choose with minor prompt-requested adjustments
- Example: Video B - pig motions more similar to original

BOTH GOOD:
- If both equally look the same as input
- Can choose with minor adjustments if overall remains same
- Example: Despite Video A having more artifacts, motion stays same in both

BOTH BAD:
- If both equally changed video drastically - no longer comparable to original
- Example: Both remove silhouettes (not asked for)

NOT APPLICABLE:
- If instructions specifically say to change these elements significantly
- Input elements are not recognizable
- Even if videos failed to adhere to the request`
    },

    'visual-quality': {
      title: 'Edit Visual Quality',
      icon: <Sparkles className="w-4 h-4" />,
      content: `EDIT VISUAL QUALITY: Which video better preserves the visual quality of the input video and avoids edit artifacts?

This is about VISUAL QUALITY OVERALL.
- Is it more blurry? Grainy? Glitchy?
- Hands disappearing? Those are artifacts!
- This has NOTHING to do with how true to the prompt the video is

=== WHEN TO CHOOSE EACH ANSWER ===

VIDEO A or VIDEO B:
- Choose the video with same/better quality as original
- Even if instructions were or were not followed
- Example: Video A better because bird in B looks like body is breathing/morphing, bitrate lower, more blurriness
- Example: Video B's hand is morphed while A keeps original quality

BOTH GOOD:
- If both equally maintain same quality as original
- Even if instructions were/weren't followed
- No apparent edit artifacts or bitrate loss
- Example: Both edited but quality good and matches input

BOTH BAD:
- If quality of both significantly worse than original
- Both equally bad
- Example: Both women's faces get very distorted

=== QUALITY ISSUES TO LOOK FOR ===

ARTIFACTS:
- Glitchy or morphing body parts
- Hands/fingers disappearing or multiplying
- Flickering or strobing effects
- Blocky or pixelated areas
- Color bleeding or banding
- Edge distortion around edited areas

QUALITY DEGRADATION:
- Increased blur compared to input
- Grainy or noisy appearance
- Lower resolution/bitrate
- Loss of detail in textures
- Compression artifacts

TEMPORAL ISSUES:
- Inconsistent quality across frames
- Edit appearing/disappearing
- Color shifting over time
- "Swimming" textures

=== REMEMBER ===
- This is about VISUAL QUALITY, not prompt adherence
- A video can look bad but still follow instructions → still judge quality honestly
- Compare to INPUT video quality as baseline`
    },

    'face-hand-body': {
      title: 'Face/Hand/Body Rendering',
      icon: <User className="w-4 h-4" />,
      content: `FACE/HAND/BODY RENDERING: Which video has better rendering of human faces, hands, and body movements?

This considers THREE sub-elements:
1. Faces
2. Hands
3. Body movements

APPLIES TO:
- Realistic humans
- Stylized humans (e.g., cartoon)
- Humanoids

DOES NOT APPLY TO (use N/A):
- Anthropomorphic animals
- Monsters
- Non-human entities

=== WHEN TO CHOOSE EACH ANSWER ===

VIDEO A or VIDEO B:
- Choose where person/people look most like a real human
- Can choose even with some minor artifacts
- If you can tell it's a person overall, pick the better one
- Example: Body movement good in both, but hands and faces rendered better in Video B → choose B
- Both may be bad, but pick the clearer one

BOTH GOOD:
- If both clearly show it's a person
- Neither has more issues than the other (no six fingers, missing arms, etc.)
- Example: Little boy still looks and moves like a person in both

BOTH BAD:
- If both videos have significant issues with the "person"
- Example: Face so distorted you'll have nightmares

NOT APPLICABLE:
- If there is NO person in the video
- If only anthropomorphic animals, monsters, or non-human entities
- Example: Video only contains animals or creatures

=== WHAT TO CHECK ===

FACES:
- Proportions correct
- Features stable (not morphing)
- Expressions natural
- Eyes, nose, mouth look human

HANDS:
- Correct number of fingers (5!)
- Natural poses
- Proportions reasonable
- Not melting or morphing

BODY:
- Natural movement patterns
- Correct proportions
- Limbs attached properly
- Joints bend correctly

=== SUB-ELEMENT WEIGHTING ===
All three count, so consider:
- If body movement good in both but one has better face/hands → pick that one
- Severe face distortion often worse than hand issues
- Consider what's most visible/prominent in the video`
    },

    'decision-framework': {
      title: 'Decision Framework',
      icon: <Target className="w-4 h-4" />,
      content: `V2V DECISION FRAMEWORK - STEP BY STEP

REMEMBER: 20-second max viewing time per question!

V2V COMPONENTS: Text Prompt + Input Video + Two Output Videos

=== STEP 1: INSTRUCTION FOLLOWING (GATE) ===
For each video, ask:
□ Was the edit instruction from the prompt applied?
□ Did either add EXTRA unrequested elements?

If NEITHER follows instructions → Both Bad
If only ONE follows instructions → That video wins
If BOTH follow (one adds extra) → Video without extra is better
If BOTH follow equally → Continue to Step 2

=== STEP 2: FAILS TO EDIT ===
□ Is either video identical to input?
□ Check: frame drops, minor distortion, slight speed change = NOT an edit

If one failed to edit → Note it, other video likely wins
If both failed → Both (for this question)
If both edited → None, continue

=== STEP 3: STRUCTURE PRESERVATION ===

BACKGROUND:
□ Which preserves background/environment better?
□ Is text preserved?
□ Full background change requested? → N/A

SUBJECT:
□ Which preserves main subject identity/appearance?
□ Is it still recognizable as the same subject?
□ Subject change requested? → N/A

MOTION:
□ Explicit motion change in prompt? → N/A immediately
□ Implicit motion change (object interaction)? → N/A
□ Otherwise, which preserves motion better?

OVERALL STRUCTURE:
□ All layouts, objects, and motions combined
□ Which is closest to input overall?

=== STEP 4: FACE/HAND/BODY ===
□ Are there humans/humanoids in the video?
□ No humans → N/A
□ Which has better face, hand, body rendering?

=== STEP 5: EDIT VISUAL QUALITY ===
□ Which has better visual quality vs input?
□ Check for artifacts, blur, glitches
□ This is about QUALITY, not prompt adherence

=== STEP 6: OVERALL PREFERENCE ===
This is the FINAL SUBJECTIVE CALL.

Balance:
1. Instruction following
2. Structure preservation  
3. Edit visual quality

Ask yourself: "If I were a user editing this video for social media or professional use, which would I prefer?"

A video may be better at instruction following, but another may have better editing and preserved more elements. Weigh these factors.

Use your answers from previous questions as a guide, but this is your overall judgment call.`
    },

    'common-scenarios': {
      title: 'Common Scenarios',
      icon: <HelpCircle className="w-4 h-4" />,
      content: `COMMON V2V EVALUATION SCENARIOS

=== INSTRUCTION FOLLOWING SCENARIOS ===

SCENARIO: Extra content added
- Prompt: Add one ladybug
- Video A: Adds one ladybug
- Video B: Adds two ladybugs (looks good)
Decision: Video A wins
Reasoning: Following instructions exactly > adding unrequested extras

SCENARIO: Partial edit
- Prompt: Change walk to cartwheel in walking direction
- Video A: Does cartwheel but wrong direction
- Video B: Does cartwheel but also wrong direction
Decision: Both Bad
Reasoning: Neither fully followed instruction

SCENARIO: Different interpretations
- Prompt: Make her smile
- Video A: Natural-looking smile
- Video B: Exaggerated, unnatural grin
Decision: Video A wins
Reasoning: Natural interpretation beats over-execution

=== FAILS TO EDIT SCENARIOS ===

SCENARIO: Minor differences from input
- Video A: Same as input but slightly slower, minor distortion
- Video B: Clear edit applied
Decision: Video A = Fails to Edit (choose A for that question)
Reasoning: Speed/distortion changes = artifacts, not edits

SCENARIO: Both nearly identical to input
- Video A: Identical to input
- Video B: Identical to input with slight color shift
Decision: Both fail to edit
Reasoning: Neither applied the requested edit

=== STRUCTURE PRESERVATION SCENARIOS ===

SCENARIO: Background with added element
- Prompt: Add green car in background
- Both videos add car, backgrounds otherwise preserved
Decision: Background = Both Good
Reasoning: Adding requested element ≠ destroying background

SCENARIO: Subject change quality
- Video A: Subject preserved but pig has weird indents
- Video B: Subject smooth and clean
Decision: Subject = Video B
Reasoning: B better preserves original subject appearance

SCENARIO: One video warps background
- Prompt: Change shirt color to green
- Video A: Green shirt, background slightly warped
- Video B: Green shirt, background perfect
Decision: Video B wins for background preservation
Reasoning: Prompt didn't ask to change background

=== MOTION PRESERVATION SCENARIOS ===

SCENARIO: Instrument change
- Prompt: Change guitar to violin
Decision: Motion = N/A
Reasoning: Implicit motion change - different playing technique

SCENARIO: Background motion added
- Prompt: Add falling leaves in background
Decision: Motion = Assess normally (not N/A)
Reasoning: Background motion doesn't affect subject

SCENARIO: Appearance change
- Prompt: Replace lioness with kitten
- Cat in videos moves differently
Decision: Motion = Assess normally, pick best match
Reasoning: Appearance change ≠ motion request

=== FACE/HAND/BODY SCENARIOS ===

SCENARIO: Both have issues
- Video A: Face slightly distorted, hands okay
- Video B: Face clearer, hands morphed
Decision: Compare sub-elements, pick overall better
Reasoning: All three elements count

SCENARIO: No humans
- Video only contains dolphins
Decision: N/A
Reasoning: F/H/BR only applies to humans/humanoids

=== OVERALL PREFERENCE SCENARIOS ===

SCENARIO: Trade-offs
- Video A: Perfect instruction following, some artifacts
- Video B: Slightly off on instruction, beautiful quality
Decision: Usually Video A, but consider severity
Reasoning: Instruction following weighs heavily, but extreme quality differences matter`
    },

    'red-flags': {
      title: 'Red Flags & N/A Rules',
      icon: <AlertTriangle className="w-4 h-4" />,
      content: `RED FLAGS & WHEN TO USE N/A

=== AUTOMATIC FAIL CONDITIONS ===

These issues typically mean the video should not be selected:

1. INSTRUCTION FAILURE
- Edit not applied at all
- Wrong edit applied
- Extra unrequested elements added (when other video doesn't)

2. SEVERE RENDERING FAILURES
- Melted/distorted faces (unrecognizable)
- Grotesque body deformations
- Missing limbs or body parts
- Completely broken anatomy

3. CRITICAL ARTIFACTS
- Large portions of frame corrupted
- Severe flickering making video unwatchable
- Edit completely unstable/disappearing

4. IDENTITY DESTRUCTION
- Subject becomes unrecognizable
- Major unintended changes to subject

=== WHEN TO USE N/A ===

BACKGROUND PRESERVATION = N/A when:
- Instruction said to change FULL background/environment
- No discernible elements from original remain
- NOT N/A if only PART of background changes

SUBJECT PRESERVATION = N/A when:
- Prompt requested changing subject enough to no longer identify them
- NOT N/A just because subject looks different quality-wise

MOTION PRESERVATION = N/A when:
- Prompt EXPLICITLY changes subject motion
- Prompt IMPLICITLY forces motion change:
  • Object being used by subject is changed
  • Someone added to interact with subject
  • Structure being interacted with is removed
  • Functional environment changes affecting subject

NOT N/A for motion when:
- Appearance-only change
- Background-only change
- Indoors/outdoors change
- Room change only
- Adding non-interacted object
- Removing non-interacted object
- Style/theme/visual/fx/lighting edit
- Camera movement change
- Background motion added

OVERALL STRUCTURE = N/A when:
- Instructions specifically say to change elements significantly
- Input elements not recognizable

FACE/HAND/BODY = N/A when:
- No humans in video
- Only anthropomorphic animals, monsters, non-human entities

=== COMPARATIVE SEVERITY ===

When both videos have issues, rank by severity:

1. Instruction failure (worst)
2. Identity destruction  
3. Severe artifacts/corruption
4. Motion/temporal breakdown
5. Moderate quality issues
6. Minor artifacts
7. Slight inconsistencies (least severe)

=== THE USER TEST ===
Ask: "Would I share this on social media or use professionally?"
- Both acceptable → Compare on criteria
- One acceptable, one not → Acceptable wins
- Neither acceptable → Both Bad`
    },

    'rating-scale': {
      title: 'Rating Scale Guide',
      icon: <CheckCircle className="w-4 h-4" />,
      content: `V2V RATING SCALE - ALL QUESTIONS

=== ANSWER OPTIONS BY QUESTION ===

INSTRUCTION FOLLOWING:
- Video A / Video B: One is better (fully or partially)
- Both Good: Both follow equally and completely
- Both Bad: Both follow partially or not at all

FAILS TO EDIT:
- Video A / Video B: That video has NO edit (identical to input)
- Both: Neither video has an edit
- None: Both videos have edits

BACKGROUND PRESERVATION:
- Video A / Video B: One preserves background better
- Both Good: Both equally maintain background
- Both Bad: Both drastically changed background
- N/A: Full background change was instructed

SUBJECT PRESERVATION:
- Video A / Video B: One preserves subject better
- Both Good: Both make no/minimal equal changes
- Both Bad: Both drastically changed subject (unrequested)
- N/A: Subject change was instructed

MOTION PRESERVATION:
- Video A / Video B: One preserves motion better
- Both Good: Both make no/minimal equal motion changes
- Both Bad: Both drastically changed motion (unrequested)
- N/A: Subject motion change in prompt (explicit or implicit)

OVERALL STRUCTURE:
- Video A / Video B: One preserves overall structure better
- Both Good: Both equally match input
- Both Bad: Both drastically changed (unrequested)
- N/A: Significant changes instructed, input unrecognizable

FACE/HAND/BODY RENDERING:
- Video A / Video B: One has better human rendering
- Both Good: Both clearly show recognizable humans
- Both Bad: Both have significant human rendering issues
- N/A: No humans/humanoids in video

EDIT VISUAL QUALITY:
- Video A / Video B: One has better visual quality
- Both Good: Both maintain input quality
- Both Bad: Both significantly degraded quality

OVERALL PREFERENCE:
- Video A / Video B: Your subjective choice
- Both Good: Both acceptable, can't distinguish
- Both Bad: Neither acceptable for use

=== DECISION CONFIDENCE ===

HIGH CONFIDENCE (clear choice):
- One follows instructions, other doesn't
- One has severe defects, other doesn't
- Clear quality difference

LOWER CONFIDENCE (still decide):
- Both similar quality
- Trade-offs between dimensions
- Subjective territory

=== COMMON MISTAKES ===

❌ Using Both Good when one is clearly better
→ If you can distinguish quality, pick one

❌ Using Both Bad when one is salvageable
→ Both Bad = NEITHER is acceptable

❌ Forgetting N/A when instructed to change
→ Check prompt before each preservation question

❌ Mixing up Fails to Edit answers
→ Video A/B = that video failed (not "is better")

=== HELPFUL REMINDERS ===

1. Read the prompt FIRST every time
2. 20-second max per question
3. Watch videos ALL the way through
4. V2V = Prompt + Input Video + Output Videos
5. When in doubt on motion → assess normally
6. Overall Preference = put yourself in user's shoes`
    },

    'motion-preservation-na': {
      title: 'Motion Preservation',
      icon: <AlertTriangle className="w-4 h-4" />,
      content: `STRUCTURE PRESERVATION (MOTION)
If the instruction does not mention changing it, which video better maintains the motion of the subject?

This is SOLELY about the MOTION of the subject.
- Do NOT account for appearances in this question
- Do NOT negatively impact a video for poor quality

=== WHEN TO CHOOSE EACH ANSWER ===

VIDEO A or VIDEO B:
- Choose where motion from input is maintained or minimally changed
- Should still be able to relate the videos
- Can choose with minor prompt-requested adjustments
- Example: Video A kept the same motion → choose A

BOTH GOOD:
- If both make NO changes to motion, or have equally minimal changes
- Can choose with minor prompt-requested adjustments
- Example: Both maintain same motion despite object being changed

BOTH BAD:
- If both make drastic changes making motion unrecognizable from input
- Changes NOT requested in prompt
- Example: Motion not asked to change, but both changed it drastically

NOT APPLICABLE:
- If instructions specifically say to change subject motion elements
- Example: Instructions asked to change motion - now unrecognizable from original

=== UPDATE 12/9: IMMEDIATE N/A RULE ===
If there is ANYTHING related to the subject's motion changing in the prompt:
→ Immediately pick N/A for Motion Preservation
→ No need to find the best motion-preserving video
If NOT mentioned → answer the question normally

=== UPDATE 12/11: IMPLICIT MOTION ===
Choose N/A if the prompt:
- EXPLICITLY changes motion, OR
- IMPLICITLY forces new motion because:
  • Subject's object is changed (guitar → violin)
  • Interaction is changed
  • Activity is changed
  • Partner is added/removed
  • Functional environment changes (terrain, medium, physical constraints)
  • Trees, waves, grass, animals moving that affect subject

KEY TEST: Would the subject realistically have to move differently to fulfill the prompt?
- YES (even if motion not mentioned) → Implicit motion change → N/A
- NO → Assess normally

TIP: Use the input and output videos themselves - if you see motion change in one/both outputs, check if something in the instruction warranted an implicit motion change.

=== UPDATE 12/17: ADDITIONAL MOVEMENTS ===
- If additional movements are requested but DON'T affect main character's motion → Still rate normally
- Subject motion should still be answered even if main subject is switched
- As long as motion CAN be maintained → Not automatically N/A

=== UPDATE 12/21: QUIZ CLARIFICATIONS ===
Only prompt requests dealing with the SUBJECT'S motion = N/A
Every other type of motion request = Assess normally

EXPLICIT requests: Easy to spot, clearly written to change subject's motion
IMPLICIT requests: Rare - mainly object interaction changes (guitar → violin type)

=== WHEN NOT TO CHOOSE N/A ===
- Appearance-only change
- Background-only change
- Indoors to outdoors
- Changing the room only
- Adding a non-interacted object
- Removing a non-interacted object
- Style/theme/visual/fx/lighting edit
- No animate subjects or objects that would dictate motion
- Camera movement changes
- Background motion added
- Environmental motion not affecting subject

=== SAFETY RULE ===
If NOT an explicit motion change to subject, and you're unsure about implicit:
→ Safer to assess normally and pick best motion-preserving video
→ Review/audit team can fix to N/A later if needed

=== QUIZ EXAMPLES ===

GUITAR TO VIOLIN: N/A
- Instrument change = implicit motion change (different playing technique)
- Subject Preservation still Both Good if same person

GREEN CAR CATCHING UP: Assess normally
- Adding car to background ≠ subject motion
- Background: Both Good (most preserved even with car added)
- Motion: Video B or Both Bad acceptable

RAINFALL OF PEPPERONI: Assess normally
- Environmental motion doesn't affect subject
- Motion: Both Good

REPLACE LIONESS WITH KITTEN: Assess normally
- Appearance change, not motion request
- Motion: Both Good or Video B (matching blinking/head movement)`
    },

    'practical-tips': {
      title: 'Practical Evaluation Tips',
      icon: <FileText className="w-4 h-4" />,
      content: `PRACTICAL V2V EVALUATION TIPS

=== THE 20-SECOND RULE ===
Meta wants us to look at clips for NO MORE THAN 20 SECONDS per question.
- Don't let time limit prevent close analysis
- Focus on distinguishing key differences quickly
- Practice will make you faster

=== PRE-EVALUATION CHECKLIST ===
□ Read the prompt completely
□ Identify the specific edit requested
□ Note what should remain unchanged
□ Watch BOTH videos fully (edits can be at the end!)
□ Remember: V2V = Prompt + Input + Outputs only

=== EFFICIENT WORKFLOW ===

Quick cases (obvious winner): 30-60 seconds total
Standard cases: 1-2 minutes total
Complex cases: 2-3 minutes max

If taking longer → you might be overthinking

=== QUESTION-BY-QUESTION TIPS ===

INSTRUCTION FOLLOWING:
- Check: Did the edit happen?
- Check: Was the prompt followed correctly?
- Check: Any extra unrequested content?

FAILS TO EDIT:
- Watch all the way through!
- Minor speed/quality changes ≠ edits
- Safer to assume edit exists and continue

BACKGROUND:
- Only assess background, not subject
- Text counts as background
- Partial background changes ≠ N/A

SUBJECT:
- Focus on main subject only
- Can there be multiple? Yes!
- Is it still recognizable?

MOTION:
- Check prompt first for motion words
- Object interaction change? → likely N/A
- When in doubt → assess normally

OVERALL STRUCTURE:
- Big picture view
- All elements combined
- Compared to input

FACE/HAND/BODY:
- Only for humans/humanoids
- Animals/monsters → N/A
- Check all three: face, hands, body

EDIT VISUAL QUALITY:
- About quality, NOT prompt adherence
- Compare to input video quality
- Artifacts, blur, glitches

OVERALL PREFERENCE:
- Your final call
- Balance all factors
- "Would I use this?"

=== COMMON MISTAKES TO AVOID ===

❌ Letting quality override instruction following
❌ Over-penalizing minor issues
❌ Under-penalizing instruction failures
❌ Inconsistent standards between videos
❌ Not watching videos all the way through
❌ Rushing through without reading prompt
❌ Confusing V2V components (it's just: Prompt + Input + Outputs)

=== WHEN STUCK ===

1. Re-read the prompt
2. Check which video follows the prompt better
3. Look for obvious winner on instruction following
4. Consider: "Would a user accept this?"
5. If truly equal → Both Good (not forced choice)
6. If truly both unacceptable → Both Bad

=== ASK FOR HELP WHEN ===
- Weird edge cases that don't fit categories
- Unclear implicit motion situations
- Prompt is ambiguous
- You're consistently unsure

Better to ask than guess wrong consistently!`
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    const kbContent = Object.entries(knowledgeBase)
      .map(([_key, section]) => `=== ${section.title.toUpperCase()} ===\n${section.content}`)
      .join("\n\n");

    const systemPrompt = `You are an expert V2V (Video-to-Video) Evaluation Guide assistant. Your role is to help evaluators make consistent, accurate decisions when comparing video editing outputs.

CRITICAL RULES:
1. V2V means Video-to-Video editing evaluation ONLY
2. V2V has ONLY: text prompt + input video + two output videos
3. 20-SECOND MAX viewing time per question (Meta requirement)
4. Instruction following is the MOST IMPORTANT criterion
5. Always provide step-by-step reasoning for scenario-based questions
6. Be specific and actionable in your guidance

EVALUATION QUESTIONS IN ORDER:
1. Instruction Following - Did the edit from the prompt happen? Extra content added?
2. Fails To Edit - Is video identical to input? (Minor speed/quality changes = NOT an edit)
3. Background Preservation - Only background, not subject. Text counts as background.
4. Subject Preservation - Main subject identity. Can be multiple subjects.
5. Motion Preservation - Check for explicit/implicit motion change requests first
6. Overall Structure - All layouts, objects, motions combined
7. Face/Hand/Body Rendering - Humans/humanoids only. N/A for animals/monsters.
8. Edit Visual Quality - Quality vs input, NOT prompt adherence
9. Overall Preference - Balance all factors, "Would I use this?"

MOTION PRESERVATION N/A RULES (VERY IMPORTANT):
- Mark N/A ONLY when prompt requests changing the SUBJECT'S motion
- EXPLICIT: Prompt literally says to change motion → N/A immediately
- IMPLICIT: Object interaction changes affect motion (guitar→violin) → N/A
- NOT N/A: Camera movement, background motion, added elements, appearance changes
- When in doubt: Assess normally and pick best motion-preserving video
- Update 12/17: Additional movements not affecting main character = still rate normally
- Update 12/21: Most N/A cases are explicit; implicit requests are RARE

FAILS TO EDIT RULES:
- If video not 100% identical due to: missing frames, minor distortion, lower quality, speed changes, slight color difference → Assume NO EDIT
- Safer to assume edit exists and complete task normally

ANSWER OPTIONS:
- Video A / Video B: One is better
- Both Good: Both equally acceptable
- Both Bad: Neither acceptable
- N/A: Change was instructed (for preservation questions)
- None / Both: For Fails To Edit question only

KNOWLEDGE BASE:
${kbContent}

RESPONSE GUIDELINES:
- For scenario questions: Walk through the decision framework step-by-step
- For concept questions: Explain clearly with examples
- For edge cases: Acknowledge complexity but provide a recommended approach
- For motion preservation questions: Always check if it affects the SUBJECT's motion
- Always tie back to the core principle: Instruction following > Structure preservation > Visual quality
- Remind about the 20-second rule when discussing workflow

FORMAT:
- Use clear headers for multi-part answers
- Use bullet points for criteria lists
- Bold key decision points
- End scenario analyses with a clear RECOMMENDATION`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }]
        })
      });

      const data = await response.json();
      if (data?.error?.message) {
        return `Error from model: ${data.error.message}`;
      }
      return data.content?.[0]?.text ?? "No content returned.";
    } catch (error) {
      return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: userMessage, timestamp: new Date() }]);
    const botResponse = await generateResponse(userMessage);
    setMessages(prev => [...prev, { type: 'bot', content: botResponse, timestamp: new Date() }]);
    setIsLoading(false);
  };

  const sampleScenarios = [
    "Prompt says 'add sunglasses'. Video A adds them with minor flickering. Video B doesn't add sunglasses but looks perfect. Decision?",
    "Both videos change the shirt color as requested, but both have slight face distortion. How do I rate this?",
    "Video A looks identical to input but slightly slower with minor distortion. Video B clearly has the edit. How do I answer 'Fails to Edit'?",
    "Prompt says 'change guitar to violin'. Should Motion Preservation be N/A?",
    "Prompt says 'add falling leaves in background'. The subject's motion changed slightly in one video. Is this N/A for motion?",
    "Prompt says 'replace lioness with kitten'. The cat moves differently. Should motion be N/A?",
    "Both videos follow the instruction, but Video B adds an extra bug that wasn't asked for. Which is better for instruction following?",
    "There are no humans in the video, just dolphins. What do I put for Face/Hand/Body Rendering?",
    "Video has speech bubble text. One video preserves it, other doesn't. Does this matter for Background Preservation?",
    "Prompt says 'make her smile'. Video A has natural smile, Video B has exaggerated grin. Which wins?",
  ];

  const quickQuestions = [
    "What are the 3 components of V2V?",
    "What's the difference between 'Both Bad' and 'Both Good'?",
    "How do I handle partial edits?",
    "What are automatic fail conditions?",
    "When should Motion Preservation be N/A?",
    "What's an implicit motion change request?",
    "Does adding background motion make it N/A?",
    "What counts as 'Fails to Edit'?",
    "When is Face/Hand/Body N/A?",
    "How do I decide Overall Preference?",
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Sidebar */}
      <div className="w-96 bg-slate-900/50 border-r border-slate-800 flex flex-col backdrop-blur-sm">
        <div className="p-5 border-b border-slate-800">
          <h1 className="text-xl font-semibold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            V2V Evaluation Guide
          </h1>
          <p className="text-sm text-slate-400 mt-2">Video-to-Video Editing Assessment</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* Knowledge Base Sections */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Knowledge Base
            </h3>
            <div className="space-y-1">
              {Object.entries(knowledgeBase).map(([key, section]) => (
                <div key={key} className="rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-slate-800/50 transition-colors rounded-lg group"
                  >
                    {expandedSections.has(key) ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="text-violet-400">{section.icon}</span>
                    <span className="text-slate-300 group-hover:text-white transition-colors">{section.title}</span>
                  </button>
                  {expandedSections.has(key) && (
                    <div className="px-3 pb-3 ml-6">
                      <div className="text-xs text-slate-500 bg-slate-800/30 rounded-lg p-3 max-h-48 overflow-y-auto border border-slate-800">
                        <pre className="whitespace-pre-wrap font-sans">{section.content.substring(0, 500)}...</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sample Scenarios */}
          <div className="p-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Try These Scenarios
            </h3>
            <div className="space-y-2">
              {sampleScenarios.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(scenario)}
                  className="text-xs text-left text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 p-2.5 rounded-lg w-full transition-all border border-transparent hover:border-violet-500/20"
                >
                  {scenario}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Questions */}
          <div className="p-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Quick Questions
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(question)}
                  className="text-xs text-slate-400 hover:text-violet-300 bg-slate-800/50 hover:bg-violet-500/20 px-3 py-1.5 rounded-full transition-all border border-slate-700 hover:border-violet-500/30"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Reminder */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-lg p-3 border border-violet-500/20">
            <h4 className="text-xs font-semibold text-violet-300 mb-2">⏱️ 20-SEC RULE + PRIORITY</h4>
            <ol className="text-xs text-slate-400 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-[10px] font-bold">1</span>
                Instruction Following
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-[10px] font-bold">2</span>
                Structure Preservation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-[10px] font-bold">3</span>
                Visual Quality
              </li>
            </ol>
            <p className="text-[10px] text-slate-500 mt-2">Motion N/A = only subject motion changes</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-950 to-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-white">Evaluation Assistant</h2>
              <p className="text-sm text-slate-500">Describe your scenario for step-by-step guidance</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Ready to help
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-violet-400" />
                  )}
                </div>
                <div
                  className={`max-w-2xl rounded-2xl px-5 py-4 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white ml-12'
                      : 'bg-slate-800/50 text-slate-200 border border-slate-700/50 mr-12'
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    <FormattedMessage content={message.content} isUser={message.type === 'user'} />
                  </div>
                  <p className={`text-xs mt-3 ${message.type === 'user' ? 'text-violet-200' : 'text-slate-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-violet-400" />
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 mr-12">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                    <span className="text-sm text-slate-400">Analyzing scenario...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Describe your V2V evaluation scenario or ask a question..."
                  className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-slate-200 placeholder-slate-500 resize-none text-sm"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !inputValue.trim()}
                className="px-5 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-violet-500/20 disabled:shadow-none"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
