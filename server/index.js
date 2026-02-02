import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';

// Check for API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('\x1b[31mError: ANTHROPIC_API_KEY environment variable is not set.\x1b[0m');
  console.error('Please set it before running the server:');
  console.error('  export ANTHROPIC_API_KEY=your-api-key-here');
  console.error('  npm run server');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Tool definitions in Claude's format
const tools = [
  {
    name: 'create_client',
    description: 'Create a new client in the schedule',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Client name' },
        color: { type: 'string', description: 'Hex color (e.g., #3B82F6)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_client',
    description: 'Update an existing client',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Client ID' },
        name: { type: 'string', description: 'New name' },
        color: { type: 'string', description: 'New color' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_client',
    description: 'Delete a client and all associated people and projects',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Client ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_clients',
    description: 'List all clients in the current scenario',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_person',
    description: 'Create a new person/team member under a client',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Person name' },
        clientId: { type: 'string', description: 'ID of the client this person belongs to' },
        role: { type: 'string', description: 'Role/title (e.g., Designer, Developer)' },
      },
      required: ['name', 'clientId'],
    },
  },
  {
    name: 'update_person',
    description: 'Update an existing person',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Person ID' },
        name: { type: 'string', description: 'New name' },
        role: { type: 'string', description: 'New role' },
        clientId: { type: 'string', description: 'New client ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_person',
    description: 'Delete a person and all their assignments',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Person ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_people',
    description: 'List all people, optionally filtered by client',
    input_schema: {
      type: 'object',
      properties: {
        clientId: { type: 'string', description: 'Filter by client ID' },
      },
    },
  },
  {
    name: 'create_project',
    description: 'Create a new project under a client',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        clientId: { type: 'string', description: 'ID of the client this project belongs to' },
        color: { type: 'string', description: 'Project color for timeline bars' },
      },
      required: ['name', 'clientId'],
    },
  },
  {
    name: 'update_project',
    description: 'Update an existing project',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Project ID' },
        name: { type: 'string', description: 'New name' },
        color: { type: 'string', description: 'New color' },
        clientId: { type: 'string', description: 'New client ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_project',
    description: 'Delete a project and all associated assignments',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Project ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_projects',
    description: 'List all projects, optionally filtered by client',
    input_schema: {
      type: 'object',
      properties: {
        clientId: { type: 'string', description: 'Filter by client ID' },
      },
    },
  },
  {
    name: 'create_assignment',
    description: 'Create a new assignment - schedule a person to work on a project for a date range',
    input_schema: {
      type: 'object',
      properties: {
        personId: { type: 'string', description: 'Person ID' },
        projectId: { type: 'string', description: 'Project ID' },
        startDate: { type: 'string', description: 'Start date (YYYY-MM-DD format)' },
        endDate: { type: 'string', description: 'End date (YYYY-MM-DD format)' },
        hours: { type: 'number', description: 'Hours per day (optional)' },
      },
      required: ['personId', 'projectId', 'startDate', 'endDate'],
    },
  },
  {
    name: 'update_assignment',
    description: 'Update an existing assignment',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Assignment ID' },
        startDate: { type: 'string', description: 'New start date' },
        endDate: { type: 'string', description: 'New end date' },
        hours: { type: 'number', description: 'New hours per day' },
        notes: { type: 'string', description: 'Notes' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_assignment',
    description: 'Delete an assignment',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Assignment ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_assignments',
    description: 'List all assignments, optionally filtered by person or project',
    input_schema: {
      type: 'object',
      properties: {
        personId: { type: 'string', description: 'Filter by person ID' },
        projectId: { type: 'string', description: 'Filter by project ID' },
      },
    },
  },
  {
    name: 'get_schedule_context',
    description: 'Get full context of current schedule state including all clients, people, projects, and assignments. Use this to understand what exists before making changes.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'merge_scenario',
    description: 'Merge the current draft scenario changes into the main schedule',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
];

const systemPrompt = `You are a helpful scheduling assistant for an agency. You help manage clients, team members, projects, and scheduling assignments.

When users describe their scheduling needs in natural language, you should:
1. First use get_schedule_context to understand the current state
2. Then use the appropriate tools to make changes
3. Confirm what you've done

Key concepts:
- Clients: Companies/organizations the agency works with
- People: Team members who belong to clients and can be scheduled
- Projects: Work items that belong to clients
- Assignments: Scheduled time blocks where a person works on a project (have start and end dates)

Today's date is ${new Date().toISOString().split('T')[0]}.

Be concise in your responses. When creating multiple items, do them in sequence.`;

// Chat endpoint with agentic loop
app.post('/api/chat', async (req, res) => {
  const { messages, scheduleContext } = req.body;

  // Build conversation with context
  const conversationMessages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  // Collect all tool calls to send back to frontend
  const toolCalls = [];
  let continueLoop = true;
  let currentMessages = [...conversationMessages];

  try {
    while (continueLoop) {
      const response = await client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        system: systemPrompt + (scheduleContext ? `\n\nCurrent schedule state:\n${JSON.stringify(scheduleContext, null, 2)}` : ''),
        tools,
        messages: currentMessages,
      });

      // Check if we have tool use
      const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
      const textBlocks = response.content.filter(block => block.type === 'text');

      if (toolUseBlocks.length > 0) {
        // Add assistant's response with tool calls
        currentMessages.push({
          role: 'assistant',
          content: response.content,
        });

        // Process each tool call
        const toolResults = [];
        for (const toolUse of toolUseBlocks) {
          toolCalls.push({
            tool: toolUse.name,
            params: toolUse.input,
          });

          // Return tool call to frontend for execution
          // Frontend will execute and we'll get result back
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify({ pending: true, toolName: toolUse.name, params: toolUse.input }),
          });
        }

        // For now, send back the tool calls for frontend execution
        // The frontend will execute them and send results back
        res.json({
          type: 'tool_calls',
          toolCalls: toolUseBlocks.map(t => ({ id: t.id, name: t.name, params: t.input })),
          partialText: textBlocks.map(b => b.text).join(''),
        });
        return;
      } else {
        // No tool use, we have final response
        continueLoop = false;
        const finalText = textBlocks.map(b => b.text).join('');
        res.json({
          type: 'response',
          content: finalText,
          toolCalls,
        });
        return;
      }
    }
  } catch (error) {
    console.error('Error calling Claude:', error);
    res.status(500).json({ error: error.message });
  }
});

// Continue conversation after tool execution
app.post('/api/chat/continue', async (req, res) => {
  const { messages, toolResults, scheduleContext } = req.body;

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: systemPrompt + (scheduleContext ? `\n\nCurrent schedule state:\n${JSON.stringify(scheduleContext, null, 2)}` : ''),
      tools,
      messages,
    });

    const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
    const textBlocks = response.content.filter(block => block.type === 'text');

    if (toolUseBlocks.length > 0) {
      res.json({
        type: 'tool_calls',
        toolCalls: toolUseBlocks.map(t => ({ id: t.id, name: t.name, params: t.input })),
        partialText: textBlocks.map(b => b.text).join(''),
        assistantContent: response.content,
      });
    } else {
      res.json({
        type: 'response',
        content: textBlocks.map(b => b.text).join(''),
      });
    }
  } catch (error) {
    console.error('Error calling Claude:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
