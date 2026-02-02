import { ChatPanel } from './components/Chat/ChatPanel';
import { ScheduleView } from './components/Schedule/ScheduleView';
import { Toolbar } from './components/Toolbar/Toolbar';
import './App.css';

function App() {
  return (
    <div className="app">
      {/* Left side - Chat */}
      <aside className="chat-sidebar">
        <ChatPanel />
      </aside>

      {/* Right side - Schedule */}
      <main className="schedule-main">
        <Toolbar />
        <ScheduleView />
      </main>
    </div>
  );
}

export default App;
