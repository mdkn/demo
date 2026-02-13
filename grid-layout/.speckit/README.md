# Spec-Kit Project Structure

This project uses spec-kit for spec-driven development.

## Directory Structure

```
.speckit/
├── config.json           # Spec-kit configuration
├── features/             # Feature specifications
│   └── 001-grid-memo-app.md
└── plans/                # Implementation plans
    └── 001-grid-memo-app-plan.md
```

## Files

- **config.json**: Project metadata and configuration
- **features/**: Detailed feature specifications created during the planning phase
- **plans/**: Step-by-step implementation plans for each feature

## Current Feature

**Feature #001: Grid Memo App**
- Specification: `features/001-grid-memo-app.md`
- Implementation Plan: `plans/001-grid-memo-app-plan.md`

## Workflow

1. **Start**: `/speckit.start` - Gather requirements
2. **Clarify**: `/speckit.clarify` - Resolve ambiguities (if needed)
3. **Plan**: `/speckit.plan` - Create implementation plan (done)
4. **Tasks**: `/speckit.tasks` - Break down into tasks (done)
5. **Implement**: `/speckit.implement` - Execute the plan

## CLI Tool

The spec-kit CLI tool is installed at:
```
~/.local/pipx/venvs/specify-cli/bin/specify
```

Note: The CLI tool requires interactive terminal support. In this environment, we use the slash commands instead.
