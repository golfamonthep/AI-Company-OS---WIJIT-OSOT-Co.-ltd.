# Connector Permission Matrix

## Read Actions

- default_approval: not required
- allowed_for: agents with related workflow access
- examples: read analytics, read selected files, read campaign metrics
- audit_required: yes

## Draft Write Actions

- default_approval: required
- allowed_for: responsible workflow owner after governance review
- examples: create Google Docs draft, create Notion page draft, create unpublished social draft
- audit_required: yes

## External Actions

- default_approval: required
- allowed_for: human-approved workflow only
- examples: send email, publish post, invite guests, change ad budget, contact customers
- audit_required: yes

## Blocked Without Explicit Approval

- publish content
- send email or messages
- spend ad budget
- modify financial records
- delete files
- change account settings
- contact customers
