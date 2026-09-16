import { useState, useMemo, ReactElement } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  ConfirmationNumber as EventsIcon,
  People as PeopleIcon,
  CheckCircle as AttendanceIcon,
  Groups as TeamsIcon,
  AccountBalanceWallet as FinanceIcon,
  FormatListNumbered as TasksIcon,
  Description as MeetingsIcon,
  FolderOpen as DocumentsIcon,
  BarChart as ReportsIcon,
  OpenInNew as ExternalIcon,
  Church as ChurchIcon,
  TuneRounded as PublicPageIcon,
  ManageAccounts as UsersIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { UserMenu } from './UserMenu';

const drawerWidth = 260;

const menuItems = [
  { text: 'Início', icon: <HomeIcon />, path: '/admin', adminOnly: false },
  { text: 'Agenda', icon: <CalendarIcon />, path: '/admin/calendar', adminOnly: false },
  { text: 'Eventos', icon: <EventsIcon />, path: '/admin/events', adminOnly: false },
  { text: 'Jovens', icon: <PeopleIcon />, path: '/admin/people', adminOnly: false },
  { text: 'Presenças', icon: <AttendanceIcon />, path: '/admin/attendance', adminOnly: false },
  { text: 'Equipes & Escalas', icon: <TeamsIcon />, path: '/admin/schedules', adminOnly: false },
  { text: 'Financeiro', icon: <FinanceIcon />, path: '/admin/finance', adminOnly: false },
  { text: 'Tarefas', icon: <TasksIcon />, path: '/admin/tasks', adminOnly: false },
  { text: 'Reuniões', icon: <MeetingsIcon />, path: '/admin/meetings', adminOnly: false },
  { text: 'Documentos', icon: <DocumentsIcon />, path: '/admin/documents', adminOnly: false },
  { text: 'Relatórios', icon: <ReportsIcon />, path: '/admin/reports', adminOnly: false },
  { text: 'Usuários', icon: <UsersIcon />, path: '/admin/users', adminOnly: true },
  { text: 'Página Pública', icon: <PublicPageIcon />, path: '/admin/public-page', adminOnly: true },
];

export const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#241019',
        borderRight: '1px solid rgba(211, 163, 76, 0.15)',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(211, 163, 76, 0.12)',
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: 'rgba(193, 92, 113, 0.2)',
            border: '1px solid rgba(193, 92, 113, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ChurchIcon sx={{ color: '#c15c71', fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#f4e6e9',
              lineHeight: 1.1,
            }}
          >
            GJ Santa Terezinha
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#e2cad2',
              fontSize: '0.75rem',
              display: 'block',
              mt: 0.2,
            }}
          >
            Painel da Coordenação
          </Typography>
        </Box>
      </Box>


      {/* Menu Principal */}
      <List sx={{ pt: 1.5, px: 1.5, flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.filter((item) => !item.adminOnly || user?.role === 'admin').map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  minHeight: 40,
                  px: 1.5,
                  py: 0.8,
                  borderRadius: '8px',
                  position: 'relative',
                  transition: 'all 0.18s ease',
                  bgcolor: isActive ? '#2f1522' : 'transparent',
                  borderLeft: isActive ? '3px solid #d3a34c' : '3px solid transparent',
                  '&:hover': {
                    bgcolor: '#2f1522',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: isActive ? '#d3a34c' : '#e2cad2',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.88rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#f4e6e9' : '#e2cad2',
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer Info Paróquia */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(211, 163, 76, 0.1)',
          bgcolor: '#1d0b14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: '#e2cad2', display: 'block', fontWeight: 600 }}>
            GJ Santa Terezinha
          </Typography>
          <Typography variant="caption" sx={{ color: '#7fa176', fontSize: '0.7rem' }}>
            ● Google Agenda Conectado
          </Typography>
        </Box>
        <Chip label="v2.0" size="small" sx={{ bgcolor: 'rgba(211, 163, 76, 0.15)', color: '#d3a34c', height: 20, fontSize: '0.65rem' }} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#241019' }}>
      <CssBaseline />

      {/* TopBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#241019',
          borderBottom: '1px solid rgba(211, 163, 76, 0.15)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 58, sm: 64 }, px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: '#e2cad2' }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: '#f4e6e9',
                display: { xs: 'none', md: 'block' },
                fontSize: '0.9rem',
              }}
            >
              Paróquia Santa Terezinha
            </Typography>
          </Box>

          {/* Links Públicos rápidos para WhatsApp */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5, mr: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => window.open('/p/agenda', '_blank')}
              endIcon={<ExternalIcon sx={{ fontSize: 14 }} />}
              sx={{
                borderColor: 'rgba(211, 163, 76, 0.3)',
                color: '#d3a34c',
                fontSize: '0.75rem',
                textTransform: 'none',
              }}
            >
              Agenda Pública
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => window.open('/', '_blank')}
              endIcon={<ExternalIcon sx={{ fontSize: 14 }} />}
              sx={{
                borderColor: 'rgba(193, 92, 113, 0.4)',
                color: '#f4e6e9',
                bgcolor: 'rgba(193, 92, 113, 0.15)',
                fontSize: '0.75rem',
                textTransform: 'none',
              }}
            >
              Página Pública
            </Button>
          </Box>

          <UserMenu />
        </Toolbar>
      </AppBar>

      {/* Drawers */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Container */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#241019',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 58, sm: 64 } }} />
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
