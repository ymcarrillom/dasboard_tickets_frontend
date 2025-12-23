import { Navigate, Route, Routes } from "react-router-dom";

import MetricsPage from "./pages/MetricsPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import ClientsPage from "./pages/ClientsPage.jsx";
import CollaboratorsPage from "./pages/CollaboratorsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/metrics" replace />} />

      <Route path="/metrics" element={<MetricsPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/collaborators" element={<CollaboratorsPage />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/metrics" replace />} />
    </Routes>
  );
}
