# Trigger Rules

## KPI Drop

- condition: kpi_drop
- severity: high
- action: prepare campaign performance review
- approval_required: yes

## Campaign Underperformance

- condition: campaign performance below target
- severity: high
- action: recommend optimization or budget pause
- approval_required: yes

## Content Pipeline Delay

- condition: overdue content tasks
- severity: medium
- action: create internal triage task
- approval_required: no unless publishing schedule changes externally

## Budget Anomaly

- condition: unusual budget or spend signal
- severity: critical
- action: escalate to CFO and CEO
- approval_required: yes

## Memory Quality Issue

- condition: stale or low-quality memory
- severity: low
- action: queue memory refinement suggestion
- approval_required: yes before archive/delete
