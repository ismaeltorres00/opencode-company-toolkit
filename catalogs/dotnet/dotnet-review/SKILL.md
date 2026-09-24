---
name: dotnet-review
description: "Trigger: .NET review, C# review, ASP.NET review. Review .NET changes for defects, regressions, architecture and test gaps."
license: Apache-2.0
metadata:
  author: company
  version: "1.0"
---

# .NET Review

## Activation Contract

Use when reviewing C#, .NET or ASP.NET changes. Review evidence from the repository before giving recommendations.

## Hard Rules

- Prioritize behavioral defects, public-contract changes, nullability, cancellation and error handling.
- Check dependency-injection registrations when adding services, options, handlers or clients.
- Do not request abstractions, patterns or tests without a concrete risk.
- Do not edit files unless the user explicitly requests a fix.

## Review Checks

| Area | Check |
|---|---|
| API | Compatibility, validation, status codes and cancellation tokens |
| Data | Async I/O, disposal, queries and migrations |
| Tests | Changed behavior, boundary cases and regressions |

## Output Contract

Report findings first, ordered by severity, with file and line references. State explicitly when no actionable finding exists.
