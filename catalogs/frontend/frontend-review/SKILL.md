---
name: frontend-review
description: "Trigger: frontend review, UI review, React review. Review frontend changes for defects, accessibility, responsive behavior and test gaps."
license: Apache-2.0
metadata:
  author: company
  version: "1.0"
---

# Frontend Review

## Activation Contract

Use when reviewing browser UI changes. Inspect the existing design system and framework conventions before suggesting changes.

## Hard Rules

- Prioritize broken user flows, inaccessible interaction, state inconsistencies and responsive regressions.
- Check loading, error and empty states when asynchronous data or mutations change.
- Preserve established components and visual conventions rather than proposing a new design system.
- Do not edit files unless the user explicitly requests a fix.

## Review Checks

| Area | Check |
|---|---|
| Interaction | Keyboard access, focus order, labels and feedback |
| Layout | Small screens, overflow and visible states |
| Tests | User-visible behavior and regression coverage |

## Output Contract

Report findings first, ordered by severity, with file and line references. State explicitly when no actionable finding exists.
