# Feedback Schema

## Human Feedback

```json
{
  "organizationId": "sample-organization",
  "reviewerId": "human",
  "agentId": "content-creator",
  "workflowId": "content-production",
  "taskId": "mother-baby-hooks",
  "skillId": "hook-generation",
  "itemId": "hook-batch-001",
  "score": 4,
  "approvedCount": 8,
  "rejectedCount": 2,
  "approvedPatterns": [
    "reassurance framing",
    "practical checklist angle"
  ],
  "rejectedReasons": [
    "too generic",
    "implied unsupported product outcome"
  ],
  "comments": "Keep warm, practical hooks. Avoid claims that sound medical."
}
```

## Processed Feedback

- feedback_id
- organization_id
- source_type
- agent_id
- workflow_id
- task_id
- skill_id
- item_id
- normalized_score
- category
- strengths
- weaknesses
- action_hints
- created_at

## Improvement Proposal

- proposal_id
- organization_id
- improvement_type
- target_type
- target_id
- title
- summary
- rationale
- proposed_change
- expected_benefit
- status
- risk_level
- requires_human_approval
- safeguards
- evidence
- reviewer_id
- review_notes
- created_at
- updated_at
