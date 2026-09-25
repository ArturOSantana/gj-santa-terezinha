import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Pages - Públicas
import AgendaPage from './pages/Agenda/AgendaPage';
import PublicHomePage from './pages/PublicHome/PublicHomePage';
import PublicEventInvitation from './pages/PublicEventInvitation/PublicEventInvitation';
import PublicCalendar from './pages/PublicCalendar/PublicCalendar';
import PublicAttendanceCheckin from './pages/PublicAttendanceCheckin/PublicAttendanceCheckin';
import PublicScheduleResponse from './pages/PublicScheduleResponse/PublicScheduleResponse';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Agenda dos Jovens – raiz e alias */}
          <Route path="/" element={<AgendaPage />} />
          <Route path="/agenda" element={<AgendaPage />} />

          {/* Página institucional */}
          <Route path="/home" element={<PublicHomePage />} />

          {/* Páginas públicas de suporte */}
          <Route path="/p/agenda" element={<PublicCalendar />} />
          <Route path="/p/checkin" element={<PublicAttendanceCheckin />} />
          <Route path="/p/escala/:token" element={<PublicScheduleResponse />} />
          <Route path="/p/:slug" element={<PublicEventInvitation />} />

          {/* Redireciona rotas antigas de auth para a raiz */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
