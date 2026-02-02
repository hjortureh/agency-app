# Project Context for Claude

This file contains all context needed to continue development of this project in a new Claude session.

---

## 1. App Goal and Problem Statement

**What we're building**: An agent-native scheduling tool for agencies, similar to Harvest Forecast.

**Core concept**: Users can manage their agency's schedule either through:
- A traditional UI (clicking, dragging, forms)
- Natural language chat with an AI agent

The AI agent has full capability parity with the UI - anything you can do manually, you can ask the agent to do.

**Target users**: Agency managers who need to schedule team members across client projects.

---

## 2. Key Design Decisions and Assumptions

### Agent-Native Architecture (CRITICAL)

The app follows these principles from the user's original requirements:

1. **Parity**: Whatever the user can do through the UI, the agent must be able to achieve through tools. Every UI action has a corresponding agent tool.

2. **Granularity**: Prefer atomic primitives. Tools are single CRUD operations, not bundled workflows. The agent decides how to compose them.

3. **Composability**: New features = new prompts using existing tools. No code changes needed for new agent behaviors.

4. **Emergent Capability**: Agent can accomplish things not explicitly designed for by composing atomic tools.

### UI Design Decisions

- **Layout**: Chat panel (380px) on left, schedule view on right
- **Schedule style**: Harvest Forecast-like with clients as collapsible first-level rows, people as second-level rows nested under clients
- **Timeline**: Days as columns, starting from today, navigable by week
- **Clients collapsed by default**: Reduces visual noise on load
- **Dark theme**: Professional look for agency tools

### Scenario/Branching System

- All edits happen in a "Draft" scenario
- User can merge Draft into "Main" when satisfied
- User can discard Draft to revert to Main
- This allows experimentation without affecting the real schedule

### Backend Decision

- Minimal Express server exists only to proxy Claude API calls (browser can't call Anthropic API directly due to CORS)
- All state lives in frontend (Zustand store)
- Tools execute locally in the browser, not on the server
- "Backend and login come later" per user request

---

## 3. Current Architecture and File Structure

### Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **State**: Zustand
- **Styling**: Plain CSS (no framework)
- **Dates**: date-fns
- **Backend**: Express.js (API proxy only)
- **AI**: Claude 3.5 Haiku via @anthropic-ai/sdk

### File Structure

```
/
├── package.json
├── server/
│   └── index.js              # Express server with /api/chat endpoints
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Main layout component
│   ├── App.css               # Layout styles
│   ├── index.css             # Global styles
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── store/
│   │   └── scheduleStore.ts  # Zustand store with all state + actions
│   ├── tools/
│   │   └── index.ts          # Agent tool definitions + executeTool()
│   └── components/
│       ├── Chat/
│       │   ├── ChatPanel.tsx # Chat UI + agentic loop logic
│       │   └── ChatPanel.css
│       ├── Schedule/
│       │   ├── ScheduleView.tsx  # Main schedule container
│       │   ├── ScheduleView.css
│       │   ├── ClientRow.tsx     # Collapsible client row
│       │   ├── ClientRow.css
│       │   ├── PersonRow.tsx     # Person row with timeline
│       │   ├── PersonRow.css
│       │   ├── TimelineBar.tsx   # Draggable assignment bar
│       │   ├── TimelineBar.css
│       │   ├── DayHeader.tsx     # Day column header
│       │   └── DayHeader.css
│       ├── Toolbar/
│       │   ├── Toolbar.tsx       # Top bar with scenario toggle
│       │   └── Toolbar.css
│       └── Dialog/
│           ├── AddClientDialog.tsx
│           └── Dialog.css
```

### Data Model (src/types/index.ts)

```typescript
Client { id, name, color }
Person { id, name, clientId, role? }
Project { id, name, clientId, color? }
Assignment { id, personId, projectId, startDate, endDate, hours?, notes? }
Scenario { id, name, isMain, clients[], people[], projects[], assignments[], createdAt, updatedAt }
Message { id, role, content, timestamp, toolCalls? }
```

### Agent Tools (18 total)

CRUD for each entity:
- `create_client`, `list_clients`, `update_client`, `delete_client`
- `create_person`, `list_people`, `update_person`, `delete_person`
- `create_project`, `list_projects`, `update_project`, `delete_project`
- `create_assignment`, `list_assignments`, `update_assignment`, `delete_assignment`

Plus:
- `get_schedule_context` - Returns full state for agent awareness
- `merge_scenario` - Merges draft into main

### Agentic Loop (ChatPanel.tsx)

1. User sends message
2. Frontend POSTs to `/api/chat` with messages + scheduleContext
3. Server calls Claude Haiku with tool definitions
4. If response contains `tool_use`:
   - Frontend executes tools locally via `executeTool()`
   - Tools update Zustand store (UI updates immediately)
   - Frontend POSTs to `/api/chat/continue` with tool results
   - Loop repeats
5. When response is text only, display to user

---

## 4. Constraints and Non-Goals

### Constraints

- **No database yet**: All state is in-memory (Zustand), lost on refresh
- **Single user**: No auth, no multi-user support
- **API key required**: Must set `ANTHROPIC_API_KEY` env var for server

### Non-Goals (explicitly deferred)

- Backend persistence
- User authentication/login
- Real-time collaboration
- Mobile responsiveness
- Undo/redo history
- Data export/import

---

## 5. Current State of Implementation

### Working Features

- [x] Two-panel layout (chat + schedule)
- [x] Schedule view with collapsible client rows
- [x] People nested under clients with avatars and roles
- [x] Day header with month labels, today highlight, weekend shading
- [x] Week navigation (back/forward buttons, "Today" button)
- [x] Timeline bars for assignments (drag to move, drag edges to resize)
- [x] Scenario toggle (Draft/Main) with merge and discard buttons
- [x] Chat with Claude Haiku integration
- [x] Full agentic tool loop (agent can create/update/delete all entities)
- [x] Add Client dialog (+ button in toolbar)
- [x] Sample data: 2 clients, 3 people, 3 projects (no assignments)

### Not Working / Missing

- [ ] No assignments in sample data (so no timeline bars visible initially)
- [ ] No Add Person / Add Project dialogs (only via chat)
- [ ] No click-to-create assignments on timeline
- [ ] No edit/delete dialogs for existing items
- [ ] No visual feedback when agent executes tools
- [ ] No persistence (refresh loses everything)

---

## 6. Open Questions and Next Steps

### Likely Next Features

1. **Add Person dialog** - Similar to AddClientDialog, accessible from client row
2. **Add Project dialog** - Similar pattern
3. **Create assignment by clicking/dragging on timeline**
4. **Visual feedback for agent actions** - Show what tools are being called
5. **Persistence** - localStorage as quick win, or backend DB

### Open Design Questions

- Should assignments be created by clicking empty timeline space?
- Should there be a dedicated "Add Assignment" dialog?
- How to handle assignment conflicts (same person, overlapping dates)?
- Should the chat show tool calls inline?

---

## 7. Preserved Instructions

### Running the App

```bash
# Terminal 1 - Start backend (requires API key)
export ANTHROPIC_API_KEY=sk-ant-...
npm run server

# Terminal 2 - Start frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Original User Requirements (Verbatim)

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

### Agent-Native Principles (Verbatim from User)

> **Parity**: Whatever the user can do through the UI, the agent must be able to achieve through tools.
>
> **Granularity**: Prefer atomic primitives. Features are outcomes achieved by an agent in a loop.
>
> **Composability**: New features = new prompts (when tools are atomic and parity exists).
>
> **Emergent Capability**: Agent can accomplish things you didn't explicitly design for.

---

## Git State

- **Current branch**: `main`
- **Remote**: https://github.com/hjortureh/agency-app.git
- **Other branches**: `feature-project-prio` (empty, for future work)

---

## Notes for Next Claude Session

1. The server must be running with `ANTHROPIC_API_KEY` set for chat to work
2. Sample data has no assignments - ask the agent to "schedule Alice on Website Redesign for next week" to see timeline bars
3. All UI changes update the Draft scenario - toggle to Main to see it's unchanged until merged
4. The `executeTool` function in `src/tools/index.ts` directly calls Zustand store actions
