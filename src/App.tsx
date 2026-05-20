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

// Pages
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Finance from './pages/Finance';
import Members from './pages/Members';
import Users from './pages/Users';
import Contributions from './pages/Contributions';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Permissions
import { PERMISSIONS } from './utils/permissions';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Rotas Protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.ALL_USERS}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard - Todos os usuários autenticados */}
              <Route
                index
                element={
                  <ProtectedRoute allowedRoles={PERMISSIONS.ALL_USERS}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Calendário - Todos os usuários autenticados */}
              <Route
                path="calendar"
                element={
                  <ProtectedRoute allowedRoles={PERMISSIONS.ALL_USERS}>
                    <Calendar />
                  </ProtectedRoute>
                }
              />

              {/* Finanças - Admin e Coordinator */}
              <Route
                path="finance"
                element={
                  <ProtectedRoute allowedRoles={PERMISSIONS.COORDINATOR_AND_ABOVE}>
                    <Finance />
                  </ProtectedRoute>
                }
              />

              {/* Membros - Apenas Admin */}
              <Route
                path="members"
                element={
                  <ProtectedRoute allowedRoles={PERMISSIONS.ADMIN_ONLY}>
                    <Members />
                  </ProtectedRoute>
                }
              />

              {/* Contribuições - Todos os usuários autenticados */}
              <Route
                path="contributions"
                element={
                  <ProtectedRoute allowedRoles={PERMISSIONS.ALL_USERS}>
                    <Contributions />
                  </ProtectedRoute>
                }
              />

              {/* Perfil - Todos os usuários autenticados */}
              <Route
                path="profile"
                element={
                  <ProtectedRoute allowedRoles={PERMISSIONS.ALL_USERS}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Usuários - Apenas Admin */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={PERMISSIONS.ADMIN_ONLY}>
                    <Users />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Rota de Não Autorizado */}
            <Route
              path="/unauthorized"
              element={
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100vh',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <h1>Acesso Negado</h1>
                  <p>Você não tem permissão para acessar esta página.</p>
                  <a href="/">Voltar ao Dashboard</a>
                </div>
              }
            />

            {/* Rota 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

