# Approval Policies

## Publishing Approval

- applies_to: external publishing, public campaign launch
- required_approvers: ceo, human
- rejection_flow: return to owner agent with required changes
- revision_allowed: yes

## Product Claim Approval

- applies_to: medical claims, safety claims, product efficacy claims
- required_approvers: rd
- rejection_flow: remove or rewrite unsupported claims
- revision_allowed: yes

## Budget Approval

- applies_to: ad spend, financial commitments
- required_approvers: cfo, ceo
- rejection_flow: revise budget or pause campaign
- revision_allowed: yes

## Runtime Tool Approval

- applies_to: python harness, node harness, browser harness, media harness
- required_approvers: cto, human
- rejection_flow: use non-runtime fallback or request manual operation
- revision_allowed: yes

## Emergency Stop

- applies_to: dangerous execution, policy breach, compliance risk
- required_approvers: ceo, cto, human
- rejection_flow: keep system paused until reviewed
- revision_allowed: no
