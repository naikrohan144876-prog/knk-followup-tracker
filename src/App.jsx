import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import TaskList from "./components/TaskList";
import Dashboard from "./components/Dashboard";
import AddTaskModal from "./components/AddTaskModal";
import AddFollowUpModal from "./components/AddFollowUpModal";
import "./styles.css";

const STORAGE_KEY = "knk_tasks_v4";

const BottomNav = ({ active }) => {
  const navigate = useNavigate();
  return (
    <div className="bottom-nav">
      <button className={active === "dashboard" ? "active" : ""} onClick={() => navigate("/dashboard")}>Dashboard</button>
      <button className={active === "tasks" ? "active" : ""} onClick={() => navigate("/tasks")}>Tasks</button>
    </div>
  );
};

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [projects, setProjects] = useState(() => ["Greenland", "Sriniketan"]);
  const [departments, setDepartments] = useState(() => ["Marketing", "Sales", "Admin", "Legal", "Accounts", "Liaisoning"]);

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [followUpTargetTaskId, setFollowUpTargetTaskId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // add new task
  const handleAddTask = (newTask) => {
    const task = {
      id: Date.now(),
      ...newTask,
      createdAt: new Date().toISOString(),
      followUps: [],
    };
    setTasks(prev => [task, ...prev]);
    setShowAddTask(false);
  };

  // add follow-up (modal)
  const handleSaveFollowUp = (payload) => {
    // ensure createdAt on followup
    const fu = { ...payload, createdAt: new Date().toISOString() };
    setTasks(prev => prev.map(t => t.id === fu.taskId ? { ...t, followUps: [...(t.followUps||[]), fu] } : t));
    setShowAddFollowUp(false);
    setFollowUpTargetTaskId(null);
  };

  // open follow-up for a specific task
  const openFollowUpModalFor = (taskId) => {
    setFollowUpTargetTaskId(taskId);
    setShowAddFollowUp(true);
  };

  // optional: add follow-up as a new "task" (if you wanted that behavior)
  // But follow-ups are stored inside tasks array as requested.

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Default landing: dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={
            <>
              <Dashboard tasks={tasks} />
              <BottomNav active="dashboard" />
            </>
          }/>

          <Route path="/tasks" element={
            <>
              <TaskList
                tasks={tasks}
                onOpenFollowUpModal={openFollowUpModalFor}
              />
              <BottomNav active="tasks" />
            </>
          }/>
        </Routes>

        {/* Add Task modal */}
        {showAddTask && (
          <AddTaskModal
            isOpen={showAddTask}
            onClose={() => setShowAddTask(false)}
            onSave={handleAddTask}
            projects={projects}
            departments={departments}
            setProjects={setProjects}
            setDepartments={setDepartments}
          />
        )}

        {/* Add Follow-Up modal */}
        {showAddFollowUp && (
          <AddFollowUpModal
            isOpen={showAddFollowUp}
            onClose={() => { setShowAddFollowUp(false); setFollowUpTargetTaskId(null); }}
            onSave={handleSaveFollowUp}
            tasks={tasks}
            presetTaskId={followUpTargetTaskId}
          />
        )}

        {/* Floating + for add task (moved slightly up so it doesn't overlap browser UI) */}
        <button className="fab" onClick={() => setShowAddTask(true)}>+</button>
      </div>
    </Router>
  );
}
