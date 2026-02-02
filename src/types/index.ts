export interface Client {
  id: string;
  name: string;
  color: string;
}

export interface Person {
  id: string;
  name: string;
  clientId: string;
  role?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  color?: string;
}

export interface Assignment {
  id: string;
  personId: string;
  projectId: string;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;   // ISO date string YYYY-MM-DD
  hours?: number;    // hours per day
  notes?: string;
}

export interface Scenario {
  id: string;
  name: string;
  isMain: boolean;
  clients: Client[];
  people: Person[];
  projects: Project[];
  assignments: Assignment[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  tool: string;
  params: Record<string, unknown>;
  result?: unknown;
}

// Agent tool types
export type ToolName =
  | 'create_client'
  | 'update_client'
  | 'delete_client'
  | 'list_clients'
  | 'create_person'
  | 'update_person'
  | 'delete_person'
  | 'list_people'
  | 'create_project'
  | 'update_project'
  | 'delete_project'
  | 'list_projects'
  | 'create_assignment'
  | 'update_assignment'
  | 'delete_assignment'
  | 'list_assignments'
  | 'get_schedule_context'
  | 'merge_scenario'
  | 'complete';

export interface Tool {
  name: ToolName;
  description: string;
  parameters: Record<string, {
    type: string;
    description: string;
    required?: boolean;
  }>;
  execute: (params: Record<string, unknown>) => ToolResult;
}

export interface ToolResult {
  success: boolean;
  output: string;
  data?: unknown;
  shouldContinue: boolean;
}
