import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import RefereeDashboard from "../pages/referee/RefereeDashboard";

import RoleRoute from "./RoleRoute";
import DisciplinesPage from "../pages/admin/DisciplinesPage";
import TeamsPage from "../pages/admin/TeamsPage";
import PlayersPage from "../pages/admin/PlayersPage";
import MatchesPage from "../pages/admin/MatchesPage";
import UsersPage from "../pages/admin/UsersPage";

import MatchDetailPage from "../pages/public/MatchDetailPage";
import StatsPage from "../pages/public/StatsPage";
import MatchesPublicPage from "../pages/public/MatchesPublicPage";
import TeamsPublicPage from "../pages/public/TeamsPublicPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/matches" element={<MatchesPublicPage />} />
        <Route path="/matches/:id" element={<MatchDetailPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/teams" element={<TeamsPublicPage />} />

        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/referee"
          element={
            <RoleRoute allowedRoles={["ARBITRO"]}>
              <RefereeDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/disciplines"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <DisciplinesPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/teams"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <TeamsPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/players"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <PlayersPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/matches"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <MatchesPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <UsersPage />
            </RoleRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
