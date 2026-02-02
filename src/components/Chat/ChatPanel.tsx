import { useState, useRef, useEffect } from 'react';
import { useScheduleStore } from '../../store/scheduleStore';
import { executeTool } from '../../tools';
import './ChatPanel.css';

const API_URL = 'http://localhost:3001';

interface ToolCall {
  id: string;
  name: string;
  params: Record<string, unknown>;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; tool_use_id?: string; content?: string; id?: string; name?: string; input?: unknown }>;
}

export function ChatPanel() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isAgentThinking,
    addMessage,
    setAgentThinking,
    getActiveScenario,
  } = useScheduleStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Execute tools and return results
  const executeTools = (toolCalls: ToolCall[]) => {
    return toolCalls.map((tc) => {
      const result = executeTool(tc.name, tc.params);
      return {
        type: 'tool_result' as const,
        tool_use_id: tc.id,
        content: JSON.stringify(result),
      };
    });
  };

  // Get schedule context for the agent
  const getScheduleContext = () => {
    const scenario = getActiveScenario();
    return {
      clients: scenario.clients,
      people: scenario.people,
      projects: scenario.projects,
      assignments: scenario.assignments,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAgentThinking) return;

    const userMessage = input.trim();
    setInput('');
    setAgentThinking(true);

    addMessage({ role: 'user', content: userMessage });

    try {
      // Build message history for API
      const apiMessages: ApiMessage[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: userMessage },
      ];

      // Initial request
      let response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          scheduleContext: getScheduleContext(),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      let data = await response.json();

      // Agentic loop: keep going while we have tool calls
      while (data.type === 'tool_calls') {
        // Execute the tools locally
        const toolResults = executeTools(data.toolCalls);

        // Build the continuation messages
        const continuationMessages: ApiMessage[] = [
          ...apiMessages,
          {
            role: 'assistant' as const,
            content: data.assistantContent || data.toolCalls.map((tc: ToolCall) => ({
              type: 'tool_use',
              id: tc.id,
              name: tc.name,
              input: tc.params,
            })),
          },
          {
            role: 'user' as const,
            content: toolResults,
          },
        ];

        // Continue the conversation with tool results
        response = await fetch(`${API_URL}/api/chat/continue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: continuationMessages,
            scheduleContext: getScheduleContext(),
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        data = await response.json();

        // Update apiMessages for next iteration if needed
        apiMessages.push(
          {
            role: 'assistant' as const,
            content: continuationMessages[continuationMessages.length - 2].content,
          },
          {
            role: 'user' as const,
            content: toolResults as ApiMessage['content'],
          }
        );
      }

      // Final response
      addMessage({ role: 'assistant', content: data.content });
    } catch (error) {
      console.error('Error:', error);
      addMessage({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure the server is running on port 3001.`,
      });
    } finally {
      setAgentThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>Schedule Assistant</h2>
        <span className="chat-status">
          {isAgentThinking ? 'Thinking...' : 'Ready'}
        </span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <p>Hi! I'm your scheduling assistant powered by Claude.</p>
            <p>
              Tell me about your clients, team, and projects, and I'll help you
              build out the schedule.
            </p>
            <p className="chat-hint">
              Try: "Schedule Alice on Website Redesign for next week"
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {isAgentThinking && (
          <div className="chat-message assistant">
            <div className="message-content thinking">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your scheduling needs..."
          rows={2}
          disabled={isAgentThinking}
        />
        <button type="submit" disabled={!input.trim() || isAgentThinking}>
          Send
        </button>
      </form>
    </div>
  );
}
