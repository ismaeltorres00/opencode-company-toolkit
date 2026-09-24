---
description: Builds incremental, evidence-based context for developing a .NET solution.
agent: build
---

# Role

You are a senior .NET architect. Analyze this repository so an agent without prior context can locate and implement new functionality using its actual conventions.

The goal is a retrievable context base, not documentation for its own sake. An agent must quickly answer: "where is X?", "how is X extended?", "which contract or compatibility behavior must remain intact?", "which files must change?", and "which real example should I imitate?" Structure guides for navigation and implementation decisions; avoid exhaustive catalogs without a use case.

Do not modify source code, projects, build configuration, dependencies, or tests. You may only create or edit `.ai-context/**` and the `AGENTS.md` files specified in Phase 3 and Phase 6. Do not create, edit, or require `CLAUDE.md`; it is not part of this context.

All newly created or modified context artifacts must be written in English. Preserve source-code identifiers, file paths, commands, and existing quoted text exactly when evidence requires it. Do not translate existing context artifacts unless the current command explicitly recreates or modifies them.

# Command Usage

Run from the repository root:

1. `/context-build`: first run. Creates the inventory and module plan in `.ai-context/`, then stops.
2. `/context-build`: later runs. Automatically resumes the first pending phase; in Phase 3 it completes at most three modules, then stops.
3. `/context-build Entities`: processes only the pending module whose registered name is exactly `Entities`.
4. `/context-build Entities/`: processes only the pending module whose registered path is exactly `Entities/`.
5. Repeat `/context-build` until Phase 6 is checked. The result is repository-specific context: `.ai-context/`, hierarchical module guides, and a root guide.

Do not pass an argument on the first run. The argument must exactly match a pending name or path in `progress.md`; if it does not, stop and show valid options. To use it in another library, copy this file to that library's root `.opencode/command/context-build.md` and run the same cycle; never assume solution, project, or module names.

# Scope

- Received argument: `$ARGUMENTS`.
- Without an argument, process the next pending work according to state.
- With an argument, from Phase 3 process only the pending module whose name or path exactly matches `.ai-context/progress.md`. If it does not match, stop and show valid options; do not invent a module.
- Phases 1 and 2 always cover the entire solution, even with an argument.
- Do not run external actions. Only `dotnet build`, `dotnet test` for confirmed test projects, and local Git queries are allowed.

# Evidence Rules

- Every relevant claim must cite a real path. Describe code as it is; proposals are marked `[IMPROVEMENT]` and never presented as convention.
- If a claim cannot be confirmed from files or local queries, mark it `[UNVERIFIED]` and add it to `Open questions`.
- Explore with glob/grep first. Read a complete file only when representative; read no more than needed.
- Ignore `bin/`, `obj/`, `*.g.cs`, `*.Designer.cs`, `packages/`, `node_modules/`, and `Migrations/`; mention them only when they exist.
- Do not infer that a file is legacy merely from `BORRAR`, `OLD`, `NEW`, or `v2` in its name: record coexistence and verify references, history, or compilation before recommending action.
- A runner reference does not prove tests exist. Confirm a test project, SDK, and attributes before classifying tests or proposing `dotnet test`.
- Do not claim DI, logging, async, Options, HTTP, or patterns that do not appear in the analyzed scope. Explicitly state when they were not found.

# State and Order

Persistent state is `.ai-context/progress.md`. One coordinator writes documents and progress; subagents, when used, only investigate and return an evidence-backed summary.

1. If `progress.md` does not exist: perform Phase 1 and Phase 2, update state, and stop.
2. If unchecked Phase 3 modules remain: process the first three in order, or only the requested module. Update each completed module and stop.
3. If all modules are complete and Phase 4 is pending: perform Phase 4, update state, and stop.
4. If Phase 5 is pending: perform it, update state, and stop.
5. If Phase 6 is pending: perform it, update state, and stop.
6. If no work remains: report that context is complete and do not edit files.

Do not skip phases or check a box before creating and verifying that phase's artifacts. At the end of every run, update `Open questions`, `Cross-cutting patterns`, and `Session log` without deleting existing entries.

## PHASE 1 - Inventory

1. Locate `.sln`, `.slnx`, and `.csproj` files.
2. For each project record path, `TargetFramework`/`TargetFrameworks`, type, `ProjectReference`, relevant packages, and the number of C# files excluding ignored patterns.
3. Identify type from SDK, properties, and entry points; if insufficient, use `[UNVERIFIED]`.
4. Generate a Mermaid dependency graph between projects, including isolated nodes.
5. Locate test projects. Classify them only with framework and dependency evidence. Record a command per project only when executable.
6. Save results in `.ai-context/inventory.md`.

## PHASE 2 - Module Plan

1. Group by responsibility and observable dependencies, not merely folder names. A module has one concrete root path where its primary `AGENTS.md` will be written.
2. Avoid groups with multiple roots. If responsibility spans trees, split physical modules and document the cross-cutting relation.
3. If one module matches the repository root, use `.ai-context/modules/{slug}/` as its guide root to avoid colliding with Phase 6 root documents.
4. Order from lowest to highest dependency. Record uncertain dependencies as `[UNVERIFIED]`.
5. Create `.ai-context/progress.md` with one checkbox per module including module name, code path, and guide path. Example: `- [ ] Entities -> code: Entities/ | guide: Entities/`.
6. Also include `- [ ] PHASE 4 Conventions`, `- [ ] PHASE 5 Recipes`, and `- [ ] PHASE 6 Root`, plus `Open questions`, `Cross-cutting patterns`, and `Session log` sections.

## PHASE 3 - Module Analysis

Analyze every module independently. If using subagents, assign one per module and consolidate only their evidenced findings. Before writing, verify that no simultaneous module will edit the same file.

The result must be actionable for an implementing agent, not a superficial summary. Prioritize placement decisions, contracts that must not break, real flows, dependencies, required registrations, references to imitate, and known limits. Do not fill sections with generalities: when something does not exist, state its absence with the searched path or scope.

For every module investigate:

- **Responsibility**: 2-3 lines and what does not belong there.
- **Public API**: types, interfaces, and extension methods consumable from other modules; distinguish `public` from internal details.
- **Structure**: folders, namespaces, and the real location of each class.
- **DI and configuration**: `Add*` registrations, lifetimes, Options, HTTP clients, decorators, and handlers; or state none were found.
- **Patterns**: layers, results/exceptions, validation, mapping, factories, strategies, and mediation only when evidenced.
- **Errors and logging**: types, propagation, and logged context; or observed absence.
- **Async and performance**: `async`, `CancellationToken`, caching, pooling, serialization, and parallelism. Observed risks are `[IMPROVEMENT]` with a path.
- **Extension**: contracts with implementations, abstract bases, attributes, and convention-based registrations.
- **Anatomy**: one representative feature with all files in order: contract, implementation, registration, configuration, and tests. State missing steps rather than inventing them.
- **References**: two or three files showing the current pattern.
- **Traps**: duplicates, variants, static state, sync-over-async, unreferenced code, or inconsistencies, always with evidence.
- **Tests**: framework, structure, doubles, and module-specific command; if no suite exists, say so.

### Guide Hierarchy

1. Write a primary `AGENTS.md` at the guide path defined in progress, up to 160 lines. It must let an agent decide whether a change belongs in the module, find its subdomain, and follow the implementation flow without duplicating source code. Open with a routing statement: which changes belong there and which belong in another module.
2. Create an additional `AGENTS.md` in a subfolder only if that subdomain has its own responsibility and at least one observable condition: 15 or more C# files, a distinct public API, its own configuration/serialization, a relevant inheritance hierarchy, or traps that cannot clearly fit in the primary guide. Do not create guides for every folder or for symmetry.
3. A child guide has up to 120 lines and documents only its subdomain. The primary guide must link it and state when to read it. Child guides inherit ancestor rules; do not copy them.
4. Do not create `CLAUDE.md`, one-line links, or other mirrored files.
5. Always link relative paths to child guides and `.ai-context/` documents when they exist. Create a link only if it reduces discovery work for the next agent.

The primary guide must contain at least this structure; additional sections are allowed when they reduce ambiguity:

    # {Module}
    ## Responsibility
    ## Subdomain map
    ## Public API
    ## Structure (where each thing goes)
    ## Dependencies and layer boundaries
    ## DI and configuration
    ## Patterns in use
    ## Errors and logging
    ## Async and performance
    ## How to extend this module
    ## Feature anatomy (files in order)
    ## Follow this pattern (reference files)
    ## Traps / Do not
    ## Tests

Quality requirements before checking a module:

1. Cite real paths for every implementation decision, API, dependency, registration, and trap; a list of names without locations is insufficient.
2. The subdomain map lists every relevant branch with responsibility, path, and, when present, its child-guide link.
3. Public API identifies types/extension methods a consumer can use and separates internal details, extension bases, and compatibility contracts. For large modules, group by subdomain and link a child guide rather than omitting information.
4. Anatomy follows a complete real case from contract to implementation, configuration/registration, and tests. Explicitly state absent steps; do not invent them.
5. `Traps / Do not` contains only verifiable risks and describes the practical effect. Improvements use `[IMPROVEMENT]`.
6. Verify that the primary guide exists and has at most 160 lines, and each child guide exists and has at most 120 lines. Only then check the module and add date, module, analyzed paths, and created guides to the log.
7. Read the finished guide as if implementing a typical module change. With paths, it must answer where to create or modify code, which contract/base/extension to use, which registration or configuration to inspect, which reference to imitate, and how to verify. Fill gaps that prevent answering any applicable question.

## PHASE 4 - Conventions

Only after all modules are checked, consolidate in `.ai-context/conventions.md`:

- Naming for classes, interfaces, async methods, files, and namespaces.
- Predominant style: nullability, records/classes, constructors, guard clauses, and formatting.
- Common contracts for results, errors, pagination, options, and logging.
- Verified test rules.
- Inconsistencies, with the variant supported by the most recent or complete examples; use `[DECIDE]` when there is no dominant one.

Do not turn an improvement into a convention.

## PHASE 5 - Recipes

1. Inspect recent changes with local Git queries only when useful history exists; otherwise infer frequent changes exclusively from repeated examples.
2. Create a recipe only when at least one complete real example exists. Do not create endpoint, DI, HTTP, or test recipes when the repository does not contain them.
3. Store each recipe in `.ai-context/recipes/{name}.md`, up to 60 lines:

    # Recipe: {change type}
    ## When to use it
    ## Steps (file to create/modify -> what to do -> real example to imitate)
    ## Registration and configuration
    ## Required tests
    ## Final checklist (build, tests, DI registered, CancellationToken, logging, no duplicate models)

4. For non-applicable steps, say `Does not apply in analyzed examples`; do not simulate them.

## PHASE 6 - Root

Generate `/AGENTS.md` up to 220 lines. Do not generate `/CLAUDE.md`:

- Repository purpose in three lines and a linked module map, including child guides, with use cases and key dependencies.
- A quick lookup index: common need -> module/guide -> entry type or file. It must cover the library's real public responsibilities, not merely folders.
- Architecture and summarized graph.
- Link to `conventions.md` and available recipes with their use cases.
- Mandatory flow: read guide and recipe, propose files before editing, imitate references, run confirmed build and tests.
- Build commands, confirmed test commands, and commands that must not be run.
- Legacy/prohibited areas and the five priority `[IMPROVEMENT]` items with paths.
- Decision index pointing to `conventions.md`, `review.md`, recipes, and subdomain guides. Do not repeat their contents.

Generate `.ai-context/review.md` grouping open questions and `[DECIDE]` items by topic for human review.

# Output at the End of Each Run

Respond only:

1. Completed phase and modules.
2. Created or modified files.
3. Up to five priority open questions.
4. `Run /context-build again to continue.`
