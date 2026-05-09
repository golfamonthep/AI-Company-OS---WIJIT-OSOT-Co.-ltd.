# Content Creator Skills

This file is executable by the Skill Execution Engine.

Skill is the instruction, SOP, workflow logic, quality criteria, and guardrail definition.
Harness is the actual tool/runtime used to perform work.

## Skill: Hook Generation

### Skill ID

hook_generation

### Purpose

Generate short-form hooks that create curiosity, name a real audience pain, and lead into the content promise.

### When To Use

- The task asks for hooks.
- The channel is TikTok, Instagram, Facebook, or another short-form platform.
- A campaign needs opening lines before scripts or captions are written.

### Required Inputs

- content_brief
- target_audience
- channel

### Optional Inputs

- product_name
- tone
- constraints
- memory_examples

### SOP Steps

1. Identify audience pain, desire, objection, or curiosity gap.
2. Generate at least 10 concise hook options.
3. Vary hook patterns across question, contrarian, checklist, story, and warning styles.
4. Remove unsupported product, medical, financial, or performance claims.
5. Recommend the strongest hook and explain why.

### Output Schema

- hooks: string[] - 10 hook options.
- hook_rationale: string - why the hooks fit the audience and brief.
- best_hook: string - recommended hook.

### Guardrails

- Do not claim guaranteed outcomes.
- Do not use fear-based manipulation.
- Do not make product, medical, financial, or performance claims without evidence.
- Do not publish externally.

### Quality Checklist

- Hooks are specific to the audience.
- Hooks are short enough for first 3 seconds of video.
- Hooks avoid vague hype.
- Best hook is clearly selected.

### Failure Modes

- Hooks are generic.
- Hooks overpromise.
- Hooks do not match the channel.
- Hooks repeat the same angle.

### Examples

- "Before you choose, check this first."
- "Most people miss this one detail."
- "If this keeps happening, start here."

### Harness Tools Needed

- openai
- json_parser
- memory

### Memory Usage

- Retrieve successful hooks.
- Retrieve brand voice.
- Retrieve audience pain points.

### Success Metrics

- Hook clarity.
- Audience relevance.
- Scroll-stopping strength.
- Compliance safety.

## Skill: Caption Writing

### Skill ID

caption_writing

### Purpose

Write captions that expand the hook, communicate the core message, and move the audience toward a clear next action.

### When To Use

- The task asks for captions.
- A script or hook needs supporting post copy.
- The content needs hashtags or short social copy.

### Required Inputs

- content_brief
- target_audience
- channel

### Optional Inputs

- product_name
- tone
- hooks
- cta
- constraints

### SOP Steps

1. Read the hook, product context, audience, and content goal.
2. Write 3 caption variants with different angles.
3. Keep the caption readable and concrete.
4. Add CTA and hashtags only when relevant.
5. State assumptions when product facts are missing.

### Output Schema

- captions: object[] - caption variants with caption and hashtags.
- recommended_caption: string - best caption to use first.
- caption_notes: string - assumptions or usage notes.

### Guardrails

- Do not invent product facts.
- Do not claim real analytics unless provided.
- Do not use misleading urgency.

### Quality Checklist

- Caption matches channel behavior.
- Caption has one clear message.
- CTA is natural.
- Hashtags are relevant.

### Failure Modes

- Caption is too broad.
- Caption does not connect to the hook.
- Caption has unsupported facts.
- Hashtags are spammy.

### Examples

- "Start with the problem, check the fit, then choose the next step that makes sense for you."

### Harness Tools Needed

- openai
- json_parser
- memory

### Memory Usage

- Retrieve brand voice.
- Retrieve prior high-performing captions.
- Retrieve product wording rules.

### Success Metrics

- Message clarity.
- Brand voice fit.
- CTA fit.
- Compliance safety.

## Skill: TikTok Script Writing

### Skill ID

tiktok_scripting

### Purpose

Create short scene-based TikTok scripts with a strong first 3 seconds, simple visual progression, and clear CTA.

### When To Use

- The channel is TikTok.
- The task asks for video scripts.
- A hook needs to become a short-form video outline.

### Required Inputs

- content_brief
- target_audience
- channel

### Optional Inputs

- product_name
- tone
- hooks
- constraints
- production_limits

### SOP Steps

1. Pick or create a hook for the first 3 seconds.
2. Structure the script into timestamps or scenes.
3. Show problem, insight, practical option, and next action.
4. Add production notes for visuals, text overlays, and pacing.
5. Check claims and assumptions before finalizing.

### Output Schema

- scripts: object[] - script variants with title and scenes.
- production_notes: string[] - editing or shooting guidance.
- assumptions: string[] - missing information that needs confirmation.

### Guardrails

- Do not create misleading before-after claims.
- Do not imply the content has been published.
- Do not make medical, financial, or performance claims without approval.

### Quality Checklist

- First scene works as a hook.
- Script is visual, not only narration.
- CTA appears at the end.
- Assumptions are explicit.

### Failure Modes

- Script is too long.
- Script has no visual action.
- Script overclaims.
- CTA is missing.

### Examples

- "0-3s: show the pain point clearly."
- "4-10s: introduce the practical option."

### Harness Tools Needed

- openai
- json_parser
- memory

### Memory Usage

- Retrieve successful TikTok script formats.
- Retrieve brand voice and compliance notes.
- Retrieve audience insights.

### Success Metrics

- First 3-second clarity.
- Scene usefulness.
- Production readiness.
- Compliance safety.

## Skill: Storytelling Framework

### Skill ID

storytelling

### Purpose

Create narrative angles that move from audience problem to insight, practical solution, and memorable next step.

### When To Use

- The task needs a story angle.
- The content should feel more human or emotionally clear.
- A campaign needs concept options before final copy.

### Required Inputs

- content_brief
- target_audience

### Optional Inputs

- product_name
- tone
- customer_context
- memory_examples

### SOP Steps

1. Define the before state.
2. Identify the tension, confusion, or missed belief.
3. Introduce the insight or practical option.
4. End with a clear next step.
5. Keep the story truthful and evidence-safe.

### Output Schema

- content_concepts: object[] - story concepts with title, angle, and audiencePain.
- story_arc: string - recommended narrative structure.
- emotional_trigger: string - primary emotion to use.

### Guardrails

- Do not fabricate customer stories.
- Do not exaggerate transformation.
- Do not imply proof that was not provided.

### Quality Checklist

- Story has a before and after logic.
- Tension is relevant to the audience.
- Solution is practical.
- No fake proof is used.

### Failure Modes

- Story is too abstract.
- Emotional trigger is manipulative.
- Concept does not fit the product.
- Missing audience pain.

### Examples

- "Before: unsure what to choose. Tension: too many options. Insight: use a checklist."

### Harness Tools Needed

- openai
- json_parser
- memory

### Memory Usage

- Retrieve customer insight.
- Retrieve prior successful story angles.
- Retrieve brand tone.

### Success Metrics

- Narrative clarity.
- Emotional relevance.
- Truthfulness.
- Reusability.

## Skill: CTA Generation

### Skill ID

cta_generation

### Purpose

Generate clear, low-friction calls to action that match the funnel stage and content goal.

### When To Use

- The content needs a CTA.
- A script or caption is missing the next action.
- The campaign needs conversion or engagement prompts.

### Required Inputs

- content_brief
- content_goal
- channel

### Optional Inputs

- target_audience
- product_name
- tone
- constraints

### SOP Steps

1. Identify funnel stage from the content goal.
2. Generate CTA options with different friction levels.
3. Avoid manipulative urgency.
4. Recommend one CTA and explain when to use it.

### Output Schema

- ctas: string[] - CTA variants.
- recommended_cta: string - strongest CTA.
- funnel_stage: string - awareness, engagement, conversion, or education.

### Guardrails

- Do not use fake scarcity.
- Do not pressure vulnerable audiences.
- Do not claim platform actions were taken.

### Quality Checklist

- CTA is specific.
- CTA matches funnel stage.
- CTA is easy to do.
- CTA does not overpromise.

### Failure Modes

- CTA is vague.
- CTA asks for too much too early.
- CTA conflicts with content goal.
- CTA uses manipulative urgency.

### Examples

- "Comment for the checklist."
- "Save this before you decide."

### Harness Tools Needed

- openai
- json_parser

### Memory Usage

- Retrieve prior CTA performance notes.
- Retrieve channel behavior notes.

### Success Metrics

- Action clarity.
- Funnel fit.
- Low friction.
- Compliance safety.

## Skill: Viral Content Analysis

### Skill ID

viral_content_analysis

### Purpose

Analyze why a content pattern may spread and extract reusable principles without promising virality.

### When To Use

- The task mentions viral content, trends, engagement, shareability, or competitor format analysis.
- A campaign needs pattern analysis before creative generation.

### Required Inputs

- content_brief
- channel

### Optional Inputs

- target_audience
- trend_reference
- competitor_example
- constraints

### SOP Steps

1. Identify the format pattern.
2. Analyze hook, pacing, emotion, novelty, and shareability.
3. Extract reusable principles.
4. List risks and what not to copy.
5. Avoid guaranteed virality claims.

### Output Schema

- pattern_analysis: string - why the format may work.
- reusable_principles: string[] - principles to reuse.
- risk_notes: string[] - risks, compliance notes, or weak assumptions.

### Guardrails

- Do not guarantee virality.
- Do not copy competitor creative directly.
- Do not claim analytics unless provided.

### Quality Checklist

- Analysis separates pattern from claim.
- Principles are reusable.
- Risks are named.
- No guaranteed result is stated.

### Failure Modes

- Analysis is trend-chasing without strategy.
- Output copies another creator.
- Risks are ignored.
- Virality is guaranteed.

### Examples

- "Pattern: fast checklist. Principle: clear first 3 seconds plus practical save value."

### Harness Tools Needed

- openai
- json_parser
- memory
- web_search

### Memory Usage

- Retrieve prior successful workflows.
- Retrieve content performance lessons.
- Retrieve channel insights.

### Success Metrics

- Pattern clarity.
- Reusable insight quality.
- Risk awareness.
- Strategic fit.
