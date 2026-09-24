import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Theme
import theme from './theme/theme';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Auth Components
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages - Liderança
import Dashboard from './pages/Dashboard/Dashboard';
import Calendar from './pages/Calendar/Calendar';
import EventsPage from './pages/Events/Events';
import PeoplePage from './pages/People/People';
import AttendancePage from './pages/Attendance/Attendance';
import SchedulesPage from './pages/Schedules/Schedules';
import FinancePage from './pages/Finance/Finance';
import TasksPage from './pages/Tasks/Tasks';
import MeetingsPage from './pages/Meetings/Meetings';
import DocumentsPage from './pages/Documents/Documents';
import { Profile } from './pages/Profile';
import ReportsPage from './pages/Reports/Reports';
import UsersPage from './pages/Users/Users';
import PublicHomeConfigPage from './pages/PublicHome/PublicHomeConfigPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Pages - Públicas / Jovens (Sem login)
import PublicHomePage from './pages/PublicHome/PublicHomePage';
import PublicEventInvitation from './pages/PublicEventInvitation/PublicEventInvitation';
import PublicCalendar from './pages/PublicCalendar/PublicCalendar';
import PublicAttendanceCheckin from './pages/PublicAttendanceCheckin/PublicAttendanceCheckin';
import PublicScheduleResponse from './pages/PublicScheduleResponse/PublicScheduleResponse';

// Agenda dos Jovens (Nova)
import AgendaPage from './pages/Agenda/AgendaPage';

// Permissions
import { PERMISSIONS } from './utils/permissions';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* ========================================================= */}
            {/* ROTAS PÚBLICAS PARA OS JOVENS (SEM LOGIN)                 */}
            {/* ========================================================= */}
            {/* Agenda dos Jovens – página principal */}
            <Route path="/" element={<AgendaPage />} />
            <Route path="/agenda" element={<AgendaPage />} />

            {/* Página Institucional do Grupo de Jovens */}
            <Route path="/home" element={<PublicHomePage />} />

            <Route path="/p/agenda" element={<PublicCalendar />} />
            <Route path="/p/checkin" element={<PublicAttendanceCheckin />} />
            <Route path="/p/escala/:token" element={<PublicScheduleResponse />} />
            {/* Qualquer evento público por slug — inclui /p/retiro-fiat-2026 e outros */}
            <Route path="/p/:slug" element={<PublicEventInvitation />} />

            {/* Rotas de Autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ========================================================= */}
            {/* ROTAS PROTEGIDAS - PAINEL DA COORDENAÇÃO (/admin)        */}
            {/* ========================================================= */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.ALL_USERS}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Painel de Comando / Início */}
              <Route index element={<Dashboard />} />

              {/* Agenda (Sincronizada Google Calendar) */}
              <Route path="calendar" element={<Calendar />} />

              {/* Módulo Principal: Eventos 360° & Inscrições */}
              <Route path="events" element={<EventsPage />} />

              {/* Pessoas & Jovens */}
              <Route path="people" element={<PeoplePage />} />

              {/* Presenças & Frequência Pastoral */}
              <Route path="attendance" element={<AttendancePage />} />

              {/* Equipes & Escalas */}
              <Route path="schedules" element={<SchedulesPage />} />

              {/* Caixa & Tesouraria */}
              <Route path="finance" element={<FinancePage />} />

              {/* Tarefas da Coordenação */}
              <Route path="tasks" element={<TasksPage />} />

              {/* Reuniões & Atas */}
              <Route path="meetings" element={<MeetingsPage />} />

              {/* Documentos & Drive */}
              <Route path="documents" element={<DocumentsPage />} />

              {/* Relatório de Calendário e Atividades */}
              <Route path="reports" element={<ReportsPage />} />

              {/* Gerenciamento de Usuários — ADM apenas */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={PERMISSIONS.ADMIN_ONLY}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />

              {/* Configuração da Página Pública — ADM apenas */}
              <Route
                path="public-page"
                element={
                  <ProtectedRoute allowedRoles={PERMISSIONS.ADMIN_ONLY}>
                    <PublicHomeConfigPage />
                  </ProtectedRoute>
                }
              />

              {/* Perfil */}
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Rota 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
