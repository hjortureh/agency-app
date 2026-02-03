# Project Context

This file is the source of truth for continuing this project in any Claude session.

---

## 1. Goal and Problem Statement

**What**: An agent-native scheduling tool for agencies, similar to Harvest Forecast.

**Problem**: Agency managers need to schedule team members across client projects. They want to do this either through a traditional UI or by describing their needs in natural language to an AI agent.

**Core insight**: The AI agent has full capability parity with the UI. Anything achievable through clicks and drags is also achievable through conversation.

---

## 2. Key Design Decisions and Assumptions

### Agent-Native Architecture

The app follows four principles:

1. **Parity**: Every UI action has a corresponding agent tool
2. **Granularity**: Tools are atomic CRUD operations, not workflows
3. **Composability**: New features = new prompts, not new code
4. **Emergence**: The agent can accomplish unplanned tasks by composing primitives

### UI Decisions

- Two-panel layout: chat (left), schedule (right)
- Schedule follows Harvest Forecast pattern: clients as collapsible rows, people nested underneath
- Days as columns starting from today, navigable by week
- Dark theme
- Clients collapsed by default

### Scenario System

- All edits happen in a "Draft" scenario
- User merges Draft into "Main" when satisfied
- User can discard Draft to revert
- Enables experimentation without risk

### State Architecture

- All state lives in the frontend (Zustand store)
- Backend exists only to proxy Claude API calls (browser CORS limitation)
- Agent tools execute locally in the browser, updating the store directly
- No persistence yet—state is lost on refresh

---

## 3. Core Architecture and Conceptual Model

### Data Model

- **Client**: An organization the agency works with (has name, color)
- **Person**: A team member belonging to a client (has name, role)
- **Project**: A piece of work belonging to a client (has name, color)
- **Assignment**: A scheduled block where a person works on a project (has date range)
- **Scenario**: A container holding all the above; supports draft/main branching

### Agent Tools

18 atomic primitives providing full CRUD:
- 4 tools each for Client, Person, Project, Assignment (create, list, update, delete)
- `get_schedule_context`: Returns full state for agent awareness
- `merge_scenario`: Commits draft changes to main

### Agentic Loop

1. User sends chat message
2. Server forwards to Claude Haiku with tool definitions and current schedule state
3. If Claude returns tool calls, frontend executes them locally (store updates, UI reacts)
4. Tool results sent back to Claude
5. Loop continues until Claude returns final text response

### Tech Stack

- React 19, TypeScript, Vite
- Zustand for state
- date-fns for dates
- Express.js backend (API proxy only)
- Claude 3.5 Haiku via Anthropic SDK

---

## 4. Constraints and Non-Goals

### Constraints

- Requires `ANTHROPIC_API_KEY` environment variable
- Single-user only (no auth)
- No database—all state in memory

### Explicit Non-Goals

- Backend persistence (deferred)
- Authentication/login (deferred)
- Multi-user collaboration
- Mobile responsiveness
- Undo/redo
- Data import/export

---

## 5. Current Implementation Status

### Complete

- Two-panel layout with chat and schedule
- Collapsible client rows with nested people
- Day columns with month labels, today indicator, weekend shading
- Week navigation
- Draggable, resizable timeline bars for assignments
- Scenario toggle (Draft/Main) with merge and discard
- Claude Haiku chat integration with full agentic loop
- Add Client dialog (+ button in toolbar)
- Sample data: 2 clients, 3 people, 3 projects

### Incomplete

- No assignments in sample data (timeline bars won't appear until created)
- No Add Person or Add Project dialogs (only via chat)
- No click-to-create on timeline
- No edit/delete dialogs
- No visual feedback during agent tool execution
- No persistence

---

## 6. Open Questions and Next Steps

### Likely Next Features

1. Add Person dialog (from client row context)
2. Add Project dialog
3. Click-to-create assignments on timeline
4. Visual feedback when agent calls tools
5. Persistence via localStorage or backend

### Open Questions

- How should users create assignments? Click empty space? Dedicated dialog?
- How to handle scheduling conflicts (same person, overlapping dates)?
- Should tool calls appear in the chat stream?

---

## 7. Preserved Instructions

### Running the App

```bash
# Terminal 1
export ANTHROPIC_API_KEY=sk-ant-...
npm run server

# Terminal 2
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

### Original Requirements (Verbatim)

> Make an agent-native scheduling tool for agencies with agent chat on the left side and a main scheduling view.
>
> You can write info about the client and project on in the chat, and the agent will fill in the schedule based on it.
>
> It's also possible to manually manage the schedule (crud clients and projects, add timelines and drag and drop to move them, or drag them on the left and right to resize).
>
> The schedule view should be similar to "Harvest Forecast" where on the left, there are clients on first level, and people on the second level. Clients are collapsable and should be closed at start. There are days on top, starting with today, and it's possible to go back and forward.
>
> When start filling in the schedule, you're creating a scenario, that that can then be merged into the main branch.
>
> On top there are toggles between current scenario and main.
>
> Start by just doing the UI, back-end and login come later.
>
> Tech: ReactJS.

### Agent-Native Principles (Verbatim)

> **Parity**: Whatever the user can do through the UI, the agent must be able to achieve through tools.
>
> **Granularity**: Prefer atomic primitives. Features are outcomes achieved by an agent in a loop.
>
> **Composability**: New features = new prompts (when tools are atomic and parity exists).
>
> **Emergent Capability**: Agent can accomplish things you didn't explicitly design for.

---

## 8. Update Rules

**Every time you make a meaningful change to the code, logic, or decisions in this project, you must update CLAUDE.md to reflect the new state.**

Treat CLAUDE.md as the source of truth for project memory. Summarize changes concisely and keep the file current at all times.

Examples of changes requiring an update:
- Adding or removing features
- Changing architecture or data model
- Making design decisions
- Completing items from the "Incomplete" list
- Adding new open questions or next steps

When updating, modify the relevant section directly rather than appending notes. The file should always reflect current state, not history.
