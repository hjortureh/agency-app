import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Client,
  Person,
  Project,
  Assignment,
  Scenario,
  Message
} from '../types';

// Sample colors for clients
const CLIENT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
];

function getRandomColor(): string {
  return CLIENT_COLORS[Math.floor(Math.random() * CLIENT_COLORS.length)];
}

function createEmptyScenario(name: string, isMain: boolean): Scenario {
  return {
    id: uuidv4(),
    name,
    isMain,
    clients: [],
    people: [],
    projects: [],
    assignments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Create initial scenarios with sample data
function createInitialScenarios(): { main: Scenario; current: Scenario } {
  const main = createEmptyScenario('Main', true);
  const current = createEmptyScenario('Draft', false);

  // Add some sample data to main
  const client1: Client = { id: uuidv4(), name: 'Acme Corp', color: '#3B82F6' };
  const client2: Client = { id: uuidv4(), name: 'TechStart Inc', color: '#10B981' };

  main.clients = [client1, client2];

  main.people = [
    { id: uuidv4(), name: 'Alice Johnson', clientId: client1.id, role: 'Designer' },
    { id: uuidv4(), name: 'Bob Smith', clientId: client1.id, role: 'Developer' },
    { id: uuidv4(), name: 'Carol White', clientId: client2.id, role: 'Project Manager' },
  ];

  main.projects = [
    { id: uuidv4(), name: 'Website Redesign', clientId: client1.id, color: '#60A5FA' },
    { id: uuidv4(), name: 'Mobile App', clientId: client1.id, color: '#34D399' },
    { id: uuidv4(), name: 'Brand Strategy', clientId: client2.id, color: '#FBBF24' },
  ];

  // Copy main to current for initial state
  current.clients = [...main.clients];
  current.people = [...main.people];
  current.projects = [...main.projects];
  current.assignments = [...main.assignments];

  return { main, current };
}

interface ScheduleState {
  // Scenarios
  mainScenario: Scenario;
  currentScenario: Scenario;
  activeScenarioId: string; // which one is being viewed/edited

  // UI State
  expandedClients: Set<string>;
  viewStartDate: Date;
  daysToShow: number;

  // Chat
  messages: Message[];
  isAgentThinking: boolean;

  // Actions - Scenario
  setActiveScenario: (id: string) => void;
  mergeToMain: () => void;
  discardCurrentScenario: () => void;

  // Actions - View
  toggleClientExpanded: (clientId: string) => void;
  setViewStartDate: (date: Date) => void;
  navigateDays: (delta: number) => void;

  // Actions - CRUD Clients
  createClient: (name: string, color?: string) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Actions - CRUD People
  createPerson: (name: string, clientId: string, role?: string) => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;

  // Actions - CRUD Projects
  createProject: (name: string, clientId: string, color?: string) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Actions - CRUD Assignments
  createAssignment: (personId: string, projectId: string, startDate: string, endDate: string, hours?: number) => Assignment;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  moveAssignment: (id: string, newStartDate: string) => void;
  resizeAssignment: (id: string, newStartDate: string, newEndDate: string) => void;

  // Actions - Chat
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setAgentThinking: (thinking: boolean) => void;

  // Getters
  getActiveScenario: () => Scenario;
  getClientPeople: (clientId: string) => Person[];
  getPersonAssignments: (personId: string) => Assignment[];
  getProjectById: (projectId: string) => Project | undefined;
}

const initialScenarios = createInitialScenarios();

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  // Initial state
  mainScenario: initialScenarios.main,
  currentScenario: initialScenarios.current,
  activeScenarioId: initialScenarios.current.id,

  expandedClients: new Set<string>(),
  viewStartDate: new Date(),
  daysToShow: 28, // 4 weeks

  messages: [],
  isAgentThinking: false,

  // Scenario actions
  setActiveScenario: (id) => set({ activeScenarioId: id }),

  mergeToMain: () => set((state) => {
    const newMain: Scenario = {
      ...state.currentScenario,
      id: state.mainScenario.id,
      name: 'Main',
      isMain: true,
      updatedAt: new Date().toISOString(),
    };
    return {
      mainScenario: newMain,
      currentScenario: { ...newMain, id: state.currentScenario.id, name: 'Draft', isMain: false },
    };
  }),

  discardCurrentScenario: () => set((state) => ({
    currentScenario: {
      ...state.mainScenario,
      id: state.currentScenario.id,
      name: 'Draft',
      isMain: false,
    },
  })),

  // View actions
  toggleClientExpanded: (clientId) => set((state) => {
    const newExpanded = new Set(state.expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    return { expandedClients: newExpanded };
  }),

  setViewStartDate: (date) => set({ viewStartDate: date }),

  navigateDays: (delta) => set((state) => {
    const newDate = new Date(state.viewStartDate);
    newDate.setDate(newDate.getDate() + delta);
    return { viewStartDate: newDate };
  }),

  // CRUD Clients
  createClient: (name, color) => {
    const client: Client = {
      id: uuidv4(),
      name,
      color: color || getRandomColor(),
    };
    set((state) => ({
      currentScenario: {
        ...state.currentScenario,
        clients: [...state.currentScenario.clients, client],
        updatedAt: new Date().toISOString(),
      },
    }));
    return client;
  },

  updateClient: (id, updates) => set((state) => ({
    currentScenario: {
      ...state.currentScenario,
      clients: state.currentScenario.clients.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
      updatedAt: new Date().toISOString(),
    },
  })),

  deleteClient: (id) => set((state) => ({
    currentScenario: {
      ...state.currentScenario,
      clients: state.currentScenario.clients.filter((c) => c.id !== id),
      people: state.currentScenario.people.filter((p) => p.clientId !== id),
      projects: state.currentScenario.projects.filter((p) => p.clientId !== id),
      updatedAt: new Date().toISOString(),
    },
  })),

  // CRUD People
  createPerson: (name, clientId, role) => {
    const person: Person = {
      id: uuidv4(),
      name,
      clientId,
      role,
    };
    set((state) => ({
      currentScenario: {
        ...state.currentScenario,
        people: [...state.currentScenario.people, person],
        updatedAt: new Date().toISOString(),
      },
    }));
    return person;
  },

  updatePerson: (id, updates) => set((state) => ({
    currentScenario: {
      ...state.currentScenario,
      people: state.currentScenario.people.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      updatedAt: new Date().toISOString(),
    },
  })),

  deletePerson: (id) => set((state) => ({
    currentScenario: {
      ...state.currentScenario,
      people: state.currentScenario.people.filter((p) => p.id !== id),
      assignments: state.currentScenario.assignments.filter((a) => a.personId !== id),
      updatedAt: new Date().toISOString(),
    },
  })),

  // CRUD Projects
  createProject: (name, clientId, color) => {
    const project: Project = {
      id: uuidv4(),
      name,
      clientId,
      color,
    };
    set((state) => ({
      currentScenario: {
        ...state.currentScenario,
        projects: [...state.currentScenario.projects, project],
        updatedAt: new Date().toISOString(),
      },
    }));
    return project;
  },

  updateProject: (id, updates) => set((state) => ({
    currentScenario: {
      ...state.currentScenario,
      projects: state.currentScenario.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      updatedAt: new Date().toISOString(),
    },
  })),

  deleteProject: (id) => set((state) => ({
    currentScenario: {
      ...state.currentScenario,
      projects: state.currentScenario.projects.filter((p) => p.id !== id),
      assignments: state.currentScenario.assignments.filter((a) => a.projectId !== id),
      updatedAt: new Date().toISOString(),
    },
  })),

  // CRUD Assignments
  createAssignment: (personId, projectId, startDate, endDate, hours) => {
    const assignment: Assignment = {
      id: uuidv4(),
      personId,
      projectId,
      startDate,
      endDate,
      hours,
    };
    set((state) => ({
      currentScenario: {
        ...state.currentScenario,
        assignments: [...state.currentScenario.assignments, assignment],
        updatedAt: new Date().toISOString(),
      },
    }));
    return assignment;
  },

  updateAssignment: (id, updates) => set((state) => ({
    currentScenario: {
      ...state.currentScenario,
      assignments: state.currentScenario.assignments.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
      updatedAt: new Date().toISOString(),
    },
  })),

  deleteAssignment: (id) => set((state) => ({
    currentScenario: {
      ...state.currentScenario,
      assignments: state.currentScenario.assignments.filter((a) => a.id !== id),
      updatedAt: new Date().toISOString(),
    },
  })),

  moveAssignment: (id, newStartDate) => set((state) => {
    const assignment = state.currentScenario.assignments.find((a) => a.id === id);
    if (!assignment) return state;

    const start = new Date(assignment.startDate);
    const end = new Date(assignment.endDate);
    const duration = end.getTime() - start.getTime();
    const newStart = new Date(newStartDate);
    const newEnd = new Date(newStart.getTime() + duration);

    return {
      currentScenario: {
        ...state.currentScenario,
        assignments: state.currentScenario.assignments.map((a) =>
          a.id === id
            ? {
                ...a,
                startDate: newStart.toISOString().split('T')[0],
                endDate: newEnd.toISOString().split('T')[0],
              }
            : a
        ),
        updatedAt: new Date().toISOString(),
      },
    };
  }),

  resizeAssignment: (id, newStartDate, newEndDate) => set((state) => ({
    currentScenario: {
      ...state.currentScenario,
      assignments: state.currentScenario.assignments.map((a) =>
        a.id === id
          ? { ...a, startDate: newStartDate, endDate: newEndDate }
          : a
      ),
      updatedAt: new Date().toISOString(),
    },
  })),

  // Chat actions
  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
      },
    ],
  })),

  setAgentThinking: (thinking) => set({ isAgentThinking: thinking }),

  // Getters
  getActiveScenario: () => {
    const state = get();
    return state.activeScenarioId === state.mainScenario.id
      ? state.mainScenario
      : state.currentScenario;
  },

  getClientPeople: (clientId) => {
    return get().getActiveScenario().people.filter((p) => p.clientId === clientId);
  },

  getPersonAssignments: (personId) => {
    return get().getActiveScenario().assignments.filter((a) => a.personId === personId);
  },

  getProjectById: (projectId) => {
    return get().getActiveScenario().projects.find((p) => p.id === projectId);
  },
}));
