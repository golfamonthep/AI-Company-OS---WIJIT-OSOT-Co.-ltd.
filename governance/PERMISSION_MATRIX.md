# Permission Matrix

## CEO

- allowed_workflows: content-production, product-research, ads-campaign, weekly-business-review
- allowed_harness_tools: filesystem, api
- can_approve: publishing, campaign, budget, workflow
- can_escalate_to: human
- execution_limits: final approval and strategic decisions

## CTO

- allowed_workflows: product-research, weekly-business-review
- allowed_harness_tools: filesystem, api, node, python
- can_approve: technical, harness_runtime
- can_escalate_to: ceo, human
- execution_limits: runtime tools require explicit approval

## CFO

- allowed_workflows: ads-campaign, weekly-business-review
- allowed_harness_tools: filesystem, api
- can_approve: budget, finance
- can_escalate_to: ceo
- execution_limits: financial data only within approved workflows

## Marketing

- allowed_workflows: content-production, ads-campaign, product-research, weekly-business-review
- allowed_harness_tools: filesystem, api
- can_approve: strategy
- can_escalate_to: ceo
- execution_limits: cannot publish externally without CEO or human approval

## Ads Performance

- allowed_workflows: ads-campaign, weekly-business-review, content-production
- allowed_harness_tools: filesystem, api
- can_approve: ads_targeting
- can_escalate_to: marketing, ceo
- execution_limits: cannot spend budget without CFO or CEO approval

## Content Creator

- allowed_workflows: content-production, ads-campaign
- allowed_harness_tools: filesystem
- can_approve: none
- can_escalate_to: marketing, rd, ceo
- execution_limits: cannot publish externally or modify company memory directly

## Video Editor

- allowed_workflows: content-production, ads-campaign
- allowed_harness_tools: filesystem, media
- can_approve: none
- can_escalate_to: marketing, ceo
- execution_limits: media harness is disabled until approved

## R&D

- allowed_workflows: product-research, content-production
- allowed_harness_tools: filesystem, api
- can_approve: product_claims, evidence
- can_escalate_to: ceo
- execution_limits: validates claims but does not publish
