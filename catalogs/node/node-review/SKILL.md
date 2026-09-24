---
name: node-review
description: "Trigger: Node review, JavaScript review, TypeScript review. Review Node.js changes for defects, async errors, security and test gaps."
license: Apache-2.0
metadata:
  author: company
  version: "1.0"
---

# Node.js Review

## Activation Contract

Use when reviewing JavaScript, TypeScript or Node.js changes. Base findings on the actual project conventions and runtime behavior.

## Hard Rules

- Prioritize uncaught async errors, incorrect validation, resource leaks and unsafe input handling.
- Check promise handling, cancellation or cleanup where the existing stack supports them.
- Verify that changes preserve package scripts, public APIs and environment-variable safety.
- Do not edit files unless the user explicitly requests a fix.

## Review Checks

| Area | Check |
|---|---|
| Runtime | Async flow, errors, cleanup and process lifecycle |
| Security | Input validation, authorization and secret exposure |
| Tests | Changed behavior, failure paths and regressions |

## Output Contract

Report findings first, ordered by severity, with file and line references. State explicitly when no actionable finding exists.
