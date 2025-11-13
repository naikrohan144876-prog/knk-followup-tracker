// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import TaskList from "./components/TaskList";
import TaskDetail from "./components/TaskDetail";
import AddTaskModal from "./components/AddTaskModal";
import AddFollowUpModal from "./components/AddFollowUpModal";
import MenuModal from "./components/MenuModal";
import "./styles.css";

const STORAGE_KEY = "knk_tasks_v4";
const APP_VERSION = "1.0.0";

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
  const [followUpTarget, setFollowUpTarget] = useState(null);
  const [detailTaskId, setDetailTaskId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const importRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (payload) => {
    const t = {
      id: Date.now(),
      ...payload,
      createdAt: new Date().toISOString(),
      status: payload.status || "Pending",
      followUps: [],
    };
    setTasks(prev => [t, ...prev]);
    setShowAddTask(false);
  };

  const addFollowUp = (taskId, fu) => {
    const fuFull = { ...fu, createdAt: new Date().toISOString() };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, followUps: [...(t.followUps||[]), fuFull] } : t));
    setShowAddFollowUp(false);
    setFollowUpTarget(null);
  };

  const deleteTask = (taskId) => {
    if (!window.confirm("Delete this task and all follow-ups?")) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (detailTaskId === taskId) setDetailTaskId(null);
  };

  const deleteFollowUp = (taskId, createdAt) => {
    if (!window.confirm("Delete this follow-up?")) return;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, followUps: (t.followUps||[]).filter(fu => fu.createdAt !== createdAt) } : t));
  };

  const toggleTaskStatus = (taskId, status) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  // export / import
  const exportData = () => {
    const payload = { exportedAt: new Date().toISOString(), tasks, projects, departments };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `knk-backup-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!window.confirm("This will replace local data. Continue?")) return;
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
        setProjects(Array.isArray(data.projects) ? data.projects : []);
        setDepartments(Array.isArray(data.departments) ? data.departments : []);
        alert("Imported successfully");
      } catch (err) {
        alert("Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const triggerImport = () => importRef.current?.click();

  // header title dynamic based on path (simple)
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const headerTitle = path.includes("/tasks") ? "Tasks" : "Dashboard";

  return (
    <Router>
      <div className="app-root">
        {/* Header (Option A): menu left, title center, version right */}
        <header className="top-header">
          <button className="dot-menu" onClick={() => setMenuOpen(true)}>⋯</button>
          <div className="header-title">{headerTitle}</div>
          <div className="header-version">v{APP_VERSION}</div>
        </header>

        {/* Search under header */}
        <div className="search-container">
          <input
            className="search-input"
            placeholder="Search by name / project / department"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <Dashboard
              tasks={tasks}
              onCardClick={(filter) => { localStorage.setItem("knk_filter", filter); window.history.pushState({}, "", "/tasks"); window.dispatchEvent(new PopStateEvent('popstate')); }}
            />
          } />
          <Route path="/tasks" element={
            <TaskList
              tasks={tasks}
              searchTerm={searchTerm}
              onOpenDetail={(id) => setDetailTaskId(id)}
              onOpenFollowUp={(id) => { setFollowUpTarget(id); setShowAddFollowUp(true); }}
            />
          } />
        </Routes>

        {/* Bottom nav simplified */}
        <div className="bottom-nav">
          <button className={path.includes("/dashboard") ? "active" : ""} onClick={() => { window.history.pushState({}, "", "/dashboard"); window.dispatchEvent(new PopStateEvent('popstate')); }}>Dashboard</button>
          <button className={path.includes("/tasks") ? "active" : ""} onClick={() => { window.history.pushState({}, "", "/tasks"); window.dispatchEvent(new PopStateEvent('popstate')); }}>Tasks</button>
        </div>

        {/* Large Add button */}
        <button className="fab-add" onClick={() => setShowAddTask(true)}><span style={{fontSize:20,fontWeight:900}}>+</span> Add</button>

        {/* Modals */}
        {showAddTask && <AddTaskModal onClose={() => setShowAddTask(false)} onSave={addTask} projects={projects} departments={departments} setProjects={setProjects} setDepartments={setDepartments} />}
        {showAddFollowUp && followUpTarget && <AddFollowUpModal onClose={() => { setShowAddFollowUp(false); setFollowUpTarget(null); }} onSave={(fu) => addFollowUp(followUpTarget, fu)} presetTaskId={followUpTarget} tasks={tasks} />}

        {detailTaskId && <TaskDetail
          task={tasks.find(t => t.id === detailTaskId)}
          onClose={() => setDetailTaskId(null)}
          onDelete={(id) => { deleteTask(id); }}
          onDeleteFollowUp={deleteFollowUp}
          onUpdateStatus={(id, status) => toggleTaskStatus(id, status)}
        />}

        {/* Menu modal */}
        <MenuModal open={menuOpen} onClose={() => setMenuOpen(false)} onExport={exportData} onImportClick={triggerImport} onOpenSettings={() => alert("Open settings")} />
        <input ref={importRef} type="file" accept=".json,application/json" style={{display:'none'}} onChange={(e)=> { const f = e.target.files && e.target.files[0]; if (f) onImportFile(f); e.target.value=''; }} />
      </div>
    </Router>
  );
}
