# Product Research Workflow

## Workflow ID

product-research

## Name

Product Research Workflow

## Purpose

Turn a product idea into research notes, feasibility assumptions, and market opportunity summary.

## Participating Agents

- ceo
- rd
- marketing
- cto

## Inputs

- productIdea
- targetMarket
- constraints

## Outputs

- market research summary
- customer problem notes
- feasibility assumptions
- research decision log

## Steps

- receive_product_idea | Receive product idea | ceo | task | Product idea normalized | Capture objective and constraints.
- market_research | Research market and customers | marketing | agent_task | Market and audience insight | Prepare target market notes.
- rd_review | Review product claims and evidence | rd | agent_task | Evidence and claim constraints | Identify claim risks and required facts.
- technical_feasibility | Review technical feasibility | cto | agent_task | Feasibility notes | Identify implementation constraints.
- research_summary | Create research summary | ceo | report | Decision-ready summary | Summarize risks, opportunities, and next step.

## Approval Points

- research_summary

## Memory Updates

- Save research summary.
- Save decision log if CEO approves next step.

## Success Metrics

- Research includes market, evidence, and feasibility notes.
- Risks are explicit.
- Next step is decision-ready.

## Failure Handling

- Mark workflow failed if required product idea is missing.
- Escalate claim uncertainty to R&D.
