import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import TaskList from "./components/TaskList";
import Dashboard from "./components/Dashboard";
import AddTaskModal from "./components/AddTaskModal";
import AddFollowUpModal from "./components/AddFollowUpModal";
import "./styles.css";

const STORAGE_KEY = "knk_tasks_v1";

const BottomNav = ({ active }) => {
  const navigate = useNavigate();
  return (
    <div className="bottom-nav">
      <button
        className={active === "tasks" ? "active" : ""}
        onClick={() => navigate("/")}
      >
        Tasks
      </button>
      <button
        className={active === "dashboard" ? "active" : ""}
        onClick={() => navigate("/dashboard")}
      >
        Dashboard
      </button>
    </div>
  );
};

const App = () => {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [followUpTargetTaskId, setFollowUpTargetTaskId] = useState(null);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn("localStorage error", e);
    }
  }, [tasks]);

  // Add new task
  const handleAddTask = (newTask) => {
    const task = { id: Date.now(), ...newTask, followUps: [] };
    setTasks((prev) => [task, ...prev]);
    setShowAddTask(false);
  };

  // Add follow-up (from modal)
  const handleSaveFollowUp = (payload) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === payload.taskId
          ? { ...t, followUps: [...t.followUps, payload] }
          : t
      )
    );
    setShowAddFollowUp(false);
    setFollowUpTargetTaskId(null);
  };

  const openFollowUpModalFor = (taskId) => {
    setFollowUpTargetTaskId(taskId);
    setShowAddFollowUp(true);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <TaskList
                  tasks={tasks}
                  onOpenFollowUpModal={openFollowUpModalFor}
                />
                <BottomNav active="tasks" />
              </>
            }
          />
          <Route
            path="/dashboard"
            element={
              <>
                <Dashboard tasks={tasks} />
                <BottomNav active="dashboard" />
              </>
            }
          />
        </Routes>

        {showAddTask && (
          <AddTaskModal
            isOpen={showAddTask}
            onClose={() => setShowAddTask(false)}
            onSave={handleAddTask}
          />
        )}

        {showAddFollowUp && (
          <AddFollowUpModal
            isOpen={showAddFollowUp}
            onClose={() => {
              setShowAddFollowUp(false);
              setFollowUpTargetTaskId(null);
            }}
            onSave={handleSaveFollowUp}
            tasks={tasks}
            presetTaskId={followUpTargetTaskId}
          />
        )}

        {/* Floating + for adding a new task */}
        <button className="fab" onClick={() => setShowAddTask(true)}>
          +
        </button>
      </div>
    </Router>
  );
};

export default App;
