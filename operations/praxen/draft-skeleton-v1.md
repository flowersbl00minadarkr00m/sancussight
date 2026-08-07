# Praxen draft manifest

## scan
- manifest_format_version: 1
- agent: {{SCAN_AGENT}}
- agent_slug: {{SCAN_AGENT_SLUG}}
- scan_date: {{SCAN_DATE}}
- scan_timestamp: {{SCAN_TIMESTAMP}}
- workspace: {{SCAN_WORKSPACE}}
- artifact_count: {{SCAN_ARTIFACT_COUNT}}

## intro_band
### agent_remit_summary
{{AGENT_REMIT_SUMMARY}}

### agent_structure_summary
{{AGENT_STRUCTURE_SUMMARY}}

## behavior_summary
{{BEHAVIOR_SUMMARY}}

## raise_posture
- weighted_overall: {{WEIGHTED_OVERALL}}

### weighted_rationale
{{WEIGHTED_RATIONALE}}

### categories
- key: limit_your_domain
  name: Limit Your Domain
  score: {{LIMIT_YOUR_DOMAIN_SCORE}}
  confidence: {{LIMIT_YOUR_DOMAIN_CONFIDENCE}}
  weight: 0.15
  rationale: {{LIMIT_YOUR_DOMAIN_RATIONALE}}
- key: balance_your_knowledge_base
  name: Balance Your Knowledge Base
  score: {{BALANCE_YOUR_KNOWLEDGE_BASE_SCORE}}
  confidence: {{BALANCE_YOUR_KNOWLEDGE_BASE_CONFIDENCE}}
  weight: 0.15
  rationale: {{BALANCE_YOUR_KNOWLEDGE_BASE_RATIONALE}}
- key: implement_zero_trust
  name: Implement Zero Trust
  score: {{IMPLEMENT_ZERO_TRUST_SCORE}}
  confidence: {{IMPLEMENT_ZERO_TRUST_CONFIDENCE}}
  weight: 0.25
  rationale: {{IMPLEMENT_ZERO_TRUST_RATIONALE}}
- key: manage_your_supply_chain
  name: Manage Your Supply Chain
  score: {{MANAGE_YOUR_SUPPLY_CHAIN_SCORE}}
  confidence: {{MANAGE_YOUR_SUPPLY_CHAIN_CONFIDENCE}}
  weight: 0.15
  rationale: {{MANAGE_YOUR_SUPPLY_CHAIN_RATIONALE}}
- key: build_an_ai_red_team
  name: Build an AI Red Team
  score: {{BUILD_AN_AI_RED_TEAM_SCORE}}
  confidence: {{BUILD_AN_AI_RED_TEAM_CONFIDENCE}}
  weight: 0.15
  rationale: {{BUILD_AN_AI_RED_TEAM_RATIONALE}}
- key: monitor_continuously
  name: Monitor Continuously
  score: {{MONITOR_CONTINUOUSLY_SCORE}}
  confidence: {{MONITOR_CONTINUOUSLY_CONFIDENCE}}
  weight: 0.15
  rationale: {{MONITOR_CONTINUOUSLY_RATIONALE}}

## remit_coverage
### rules
{{RULE_BLOCKS}}

## findings
{{FINDING_BLOCKS}}

## positives
{{POSITIVE_BLOCKS_OR_NONE}}

## log_files
- present: {{LOG_FILES_PRESENT}}
- no_logs_note: {{LOG_FILES_NOTE}}

### rows
{{LOG_ROWS_OR_EMPTY}}
