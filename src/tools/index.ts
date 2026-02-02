import type { Tool, ToolResult } from '../types';
import { useScheduleStore } from '../store/scheduleStore';

// Helper to create successful result
function success(output: string, data?: unknown): ToolResult {
  return { success: true, output, data, shouldContinue: true };
}

// Helper to create error result
function error(output: string): ToolResult {
  return { success: false, output, shouldContinue: true };
}

// Helper to create completion result
function complete(output: string): ToolResult {
  return { success: true, output, shouldContinue: false };
}

// Get store actions (call this inside tool execution)
function getStore() {
  return useScheduleStore.getState();
}

// Tool definitions - atomic primitives for agent parity
export const tools: Tool[] = [
  // === CLIENT TOOLS ===
  {
    name: 'create_client',
    description: 'Create a new client in the current scenario. Clients do not need colors.',
    parameters: {
      name: { type: 'string', description: 'Client name', required: true },
      color: { type: 'string', description: 'Hex color (optional, not used in UI)', required: false },
    },
    execute: (params) => {
      const { name, color } = params as { name: string; color?: string };
      if (!name) return error('Client name is required');
      const client = getStore().createClient(name, color);
      return success(`Created client "${client.name}" with ID ${client.id}`, client);
    },
  },
  {
    name: 'update_client',
    description: 'Update an existing client',
    parameters: {
      id: { type: 'string', description: 'Client ID', required: true },
      name: { type: 'string', description: 'New name', required: false },
      color: { type: 'string', description: 'New color', required: false },
    },
    execute: (params) => {
      const { id, ...updates } = params as { id: string; name?: string; color?: string };
      if (!id) return error('Client ID is required');
      getStore().updateClient(id, updates);
      return success(`Updated client ${id}`);
    },
  },
  {
    name: 'delete_client',
    description: 'Delete a client and all associated people and projects',
    parameters: {
      id: { type: 'string', description: 'Client ID', required: true },
    },
    execute: (params) => {
      const { id } = params as { id: string };
      if (!id) return error('Client ID is required');
      getStore().deleteClient(id);
      return success(`Deleted client ${id}`);
    },
  },
  {
    name: 'list_clients',
    description: 'List all clients in the current scenario',
    parameters: {},
    execute: () => {
      const clients = getStore().getActiveScenario().clients;
      if (clients.length === 0) {
        return success('No clients found', []);
      }
      const list = clients.map((c) => `- ${c.name} (ID: ${c.id})`).join('\n');
      return success(`Clients:\n${list}`, clients);
    },
  },

  // === PERSON TOOLS ===
  {
    name: 'create_person',
    description: 'Create a new person under a client',
    parameters: {
      name: { type: 'string', description: 'Person name', required: true },
      clientId: { type: 'string', description: 'ID of the client this person belongs to', required: true },
      role: { type: 'string', description: 'Role/title', required: false },
    },
    execute: (params) => {
      const { name, clientId, role } = params as { name: string; clientId: string; role?: string };
      if (!name || !clientId) return error('Name and clientId are required');
      const person = getStore().createPerson(name, clientId, role);
      return success(`Created person "${person.name}" with ID ${person.id}`, person);
    },
  },
  {
    name: 'update_person',
    description: 'Update an existing person',
    parameters: {
      id: { type: 'string', description: 'Person ID', required: true },
      name: { type: 'string', description: 'New name', required: false },
      role: { type: 'string', description: 'New role', required: false },
      clientId: { type: 'string', description: 'New client ID', required: false },
    },
    execute: (params) => {
      const { id, ...updates } = params as { id: string; name?: string; role?: string; clientId?: string };
      if (!id) return error('Person ID is required');
      getStore().updatePerson(id, updates);
      return success(`Updated person ${id}`);
    },
  },
  {
    name: 'delete_person',
    description: 'Delete a person and all their assignments',
    parameters: {
      id: { type: 'string', description: 'Person ID', required: true },
    },
    execute: (params) => {
      const { id } = params as { id: string };
      if (!id) return error('Person ID is required');
      getStore().deletePerson(id);
      return success(`Deleted person ${id}`);
    },
  },
  {
    name: 'list_people',
    description: 'List all people, optionally filtered by client',
    parameters: {
      clientId: { type: 'string', description: 'Filter by client ID', required: false },
    },
    execute: (params) => {
      const { clientId } = params as { clientId?: string };
      let people = getStore().getActiveScenario().people;
      if (clientId) {
        people = people.filter((p) => p.clientId === clientId);
      }
      if (people.length === 0) {
        return success('No people found', []);
      }
      const list = people.map((p) => `- ${p.name}${p.role ? ` (${p.role})` : ''} [ID: ${p.id}]`).join('\n');
      return success(`People:\n${list}`, people);
    },
  },

  // === PROJECT TOOLS ===
  {
    name: 'create_project',
    description: 'Create a new project under a client. Projects must have a color.',
    parameters: {
      name: { type: 'string', description: 'Project name', required: true },
      clientId: { type: 'string', description: 'ID of the client this project belongs to', required: true },
      color: { type: 'string', description: 'Project color (hex code, e.g., #3B82F6)', required: true },
    },
    execute: (params) => {
      const { name, clientId, color } = params as { name: string; clientId: string; color: string };
      if (!name || !clientId || !color) return error('Name, clientId, and color are required');
      const project = getStore().createProject(name, clientId, color);
      return success(`Created project "${project.name}" with ID ${project.id}`, project);
    },
  },
  {
    name: 'update_project',
    description: 'Update an existing project',
    parameters: {
      id: { type: 'string', description: 'Project ID', required: true },
      name: { type: 'string', description: 'New name', required: false },
      color: { type: 'string', description: 'New color', required: false },
      clientId: { type: 'string', description: 'New client ID', required: false },
    },
    execute: (params) => {
      const { id, ...updates } = params as { id: string; name?: string; color?: string; clientId?: string };
      if (!id) return error('Project ID is required');
      getStore().updateProject(id, updates);
      return success(`Updated project ${id}`);
    },
  },
  {
    name: 'delete_project',
    description: 'Delete a project and all associated assignments',
    parameters: {
      id: { type: 'string', description: 'Project ID', required: true },
    },
    execute: (params) => {
      const { id } = params as { id: string };
      if (!id) return error('Project ID is required');
      getStore().deleteProject(id);
      return success(`Deleted project ${id}`);
    },
  },
  {
    name: 'list_projects',
    description: 'List all projects, optionally filtered by client',
    parameters: {
      clientId: { type: 'string', description: 'Filter by client ID', required: false },
    },
    execute: (params) => {
      const { clientId } = params as { clientId?: string };
      let projects = getStore().getActiveScenario().projects;
      if (clientId) {
        projects = projects.filter((p) => p.clientId === clientId);
      }
      if (projects.length === 0) {
        return success('No projects found', []);
      }
      const list = projects.map((p) => `- ${p.name} [ID: ${p.id}]`).join('\n');
      return success(`Projects:\n${list}`, projects);
    },
  },

  // === ASSIGNMENT TOOLS ===
  {
    name: 'create_assignment',
    description: 'Create a new assignment (schedule a person on a project)',
    parameters: {
      personId: { type: 'string', description: 'Person ID', required: true },
      projectId: { type: 'string', description: 'Project ID', required: true },
      startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)', required: true },
      endDate: { type: 'string', description: 'End date (YYYY-MM-DD)', required: true },
      hours: { type: 'number', description: 'Hours per day', required: false },
    },
    execute: (params) => {
      const { personId, projectId, startDate, endDate, hours } = params as {
        personId: string;
        projectId: string;
        startDate: string;
        endDate: string;
        hours?: number;
      };
      if (!personId || !projectId || !startDate || !endDate) {
        return error('personId, projectId, startDate, and endDate are required');
      }
      const assignment = getStore().createAssignment(personId, projectId, startDate, endDate, hours);
      return success(
        `Created assignment: ${personId} on ${projectId} from ${startDate} to ${endDate}`,
        assignment
      );
    },
  },
  {
    name: 'update_assignment',
    description: 'Update an existing assignment',
    parameters: {
      id: { type: 'string', description: 'Assignment ID', required: true },
      startDate: { type: 'string', description: 'New start date', required: false },
      endDate: { type: 'string', description: 'New end date', required: false },
      hours: { type: 'number', description: 'New hours per day', required: false },
      notes: { type: 'string', description: 'Notes', required: false },
    },
    execute: (params) => {
      const { id, ...updates } = params as {
        id: string;
        startDate?: string;
        endDate?: string;
        hours?: number;
        notes?: string;
      };
      if (!id) return error('Assignment ID is required');
      getStore().updateAssignment(id, updates);
      return success(`Updated assignment ${id}`);
    },
  },
  {
    name: 'delete_assignment',
    description: 'Delete an assignment',
    parameters: {
      id: { type: 'string', description: 'Assignment ID', required: true },
    },
    execute: (params) => {
      const { id } = params as { id: string };
      if (!id) return error('Assignment ID is required');
      getStore().deleteAssignment(id);
      return success(`Deleted assignment ${id}`);
    },
  },
  {
    name: 'list_assignments',
    description: 'List all assignments, optionally filtered by person or project',
    parameters: {
      personId: { type: 'string', description: 'Filter by person ID', required: false },
      projectId: { type: 'string', description: 'Filter by project ID', required: false },
    },
    execute: (params) => {
      const { personId, projectId } = params as { personId?: string; projectId?: string };
      let assignments = getStore().getActiveScenario().assignments;
      if (personId) {
        assignments = assignments.filter((a) => a.personId === personId);
      }
      if (projectId) {
        assignments = assignments.filter((a) => a.projectId === projectId);
      }
      if (assignments.length === 0) {
        return success('No assignments found', []);
      }
      const list = assignments
        .map((a) => `- ${a.startDate} to ${a.endDate} [ID: ${a.id}]`)
        .join('\n');
      return success(`Assignments:\n${list}`, assignments);
    },
  },

  // === CONTEXT TOOL ===
  {
    name: 'get_schedule_context',
    description: 'Get full context of current schedule state (clients, people, projects, assignments)',
    parameters: {},
    execute: () => {
      const scenario = getStore().getActiveScenario();
      const context = {
        scenarioName: scenario.name,
        isMain: scenario.isMain,
        clientCount: scenario.clients.length,
        peopleCount: scenario.people.length,
        projectCount: scenario.projects.length,
        assignmentCount: scenario.assignments.length,
        clients: scenario.clients.map((c) => ({
          ...c,
          people: scenario.people.filter((p) => p.clientId === c.id),
          projects: scenario.projects.filter((p) => p.clientId === c.id),
        })),
        assignments: scenario.assignments,
      };
      return success(
        `Current scenario: ${scenario.name}\n` +
          `Clients: ${context.clientCount}, People: ${context.peopleCount}, ` +
          `Projects: ${context.projectCount}, Assignments: ${context.assignmentCount}`,
        context
      );
    },
  },

  // === SCENARIO TOOLS ===
  {
    name: 'merge_scenario',
    description: 'Merge current scenario changes into main',
    parameters: {},
    execute: () => {
      getStore().mergeToMain();
      return success('Merged current scenario into main');
    },
  },

  // === COMPLETION TOOL ===
  {
    name: 'complete',
    description: 'Signal that the task is complete',
    parameters: {
      message: { type: 'string', description: 'Completion message', required: false },
    },
    execute: (params) => {
      const { message } = params as { message?: string };
      return complete(message || 'Task completed');
    },
  },
];

// Execute a tool by name
export function executeTool(name: string, params: Record<string, unknown>): ToolResult {
  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    return error(`Unknown tool: ${name}`);
  }
  return tool.execute(params);
}

// Get tool definitions for agent context
export function getToolDefinitions(): string {
  return tools
    .map((t) => {
      const params = Object.entries(t.parameters)
        .map(([name, def]) => `  - ${name}: ${def.type}${def.required ? ' (required)' : ''} - ${def.description}`)
        .join('\n');
      return `${t.name}: ${t.description}\nParameters:\n${params || '  (none)'}`;
    })
    .join('\n\n');
}
