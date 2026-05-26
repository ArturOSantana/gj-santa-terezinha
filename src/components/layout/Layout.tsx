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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  ManageAccounts as ManageAccountsIcon,
  Favorite as FavoriteIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { UserRole } from '../../types';
import brasaoGJ from '../../assets/brasao-gj.png';

const drawerWidth = 264;

const menuItemsByRole: Record<UserRole, Array<{
  text: string;
  icon: ReactElement;
  path: string;
}>> = {
  admin: [
    { text: 'Visão Geral', icon: <DashboardIcon />, path: '/' },
    { text: 'Calendário', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Finanças', icon: <MoneyIcon />, path: '/finance' },
    { text: 'Membros', icon: <PeopleIcon />, path: '/members' },
    { text: 'Contribuições', icon: <FavoriteIcon />, path: '/contributions' },
    { text: 'Boa Nova', icon: <CampaignIcon />, path: '/boanova' },
    { text: 'Usuários', icon: <ManageAccountsIcon />, path: '/users' },
  ],
  coordinator: [
    { text: 'Visão Geral', icon: <DashboardIcon />, path: '/' },
    { text: 'Calendário', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Finanças', icon: <MoneyIcon />, path: '/finance' },
    { text: 'Membros', icon: <PeopleIcon />, path: '/members' },
    { text: 'Contribuições', icon: <FavoriteIcon />, path: '/contributions' },
    { text: 'Boa Nova', icon: <CampaignIcon />, path: '/boanova' },
  ],
  member: [
    { text: 'Visão Geral', icon: <DashboardIcon />, path: '/' },
    { text: 'Calendário', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Contribuições', icon: <FavoriteIcon />, path: '/contributions' },
  ],
};

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = useMemo(() => {
    if (!user) return [];
    return menuItemsByRole[user.role] || [];
  }, [user]);

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
        bgcolor: '#1a4731',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          pointerEvents: 'none',
          background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px)',
        },
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(180deg, #1a4731 0%, #2d6b4a 100%)',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            pointerEvents: 'none',
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px)',
          },
        }}
      >
        <Box
          sx={{
            p: 1,
            border: '2px solid',
            borderColor: 'secondary.main',
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.1)',
            mb: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <img
            src={brasaoGJ}
            alt="Brasão GJ"
            style={{
              width: 80,
              height: 80,
              objectFit: 'contain',
            }}
          />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            zIndex: 1,
          }}
        >
          GJ Santa Terezinha
        </Typography>
      </Box>

      <List sx={{ pt: 2, px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                minHeight: 48,
                px: 2,
                py: 1.5,
                borderRadius: 1,
                border: '1px solid transparent',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(184, 134, 11, 0.3)',
                  transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(184, 134, 11, 0.15)',
                  borderLeftWidth: '4px',
                  borderLeftStyle: 'solid',
                  borderLeftColor: 'secondary.main',
                  background: 'linear-gradient(90deg, rgba(184, 134, 11, 0.2) 0%, rgba(184, 134, 11, 0.05) 100%)',
                  '& .MuiListItemIcon-root': {
                    color: 'secondary.main',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 700,
                    color: 'white',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(184, 134, 11, 0.2)',
                    transform: 'translateX(4px)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'rgba(255, 255, 255, 0.7)', transition: 'color 0.3s ease' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: '0.95rem',
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      color: location.pathname === item.path ? 'white' : 'rgba(255, 255, 255, 0.85)',
                    },
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          boxShadow: '0 2px 8px rgba(26, 71, 49, 0.08)',
          borderBottom: '1px solid',
          borderColor: 'rgba(26, 71, 49, 0.1)',
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 64, sm: 72 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <IconButton
            color="primary"
            aria-label="Abrir menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: 'none' },
              border: '1px solid',
              borderColor: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(26, 71, 49, 0.08)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontWeight: 700,
                color: 'primary.main',
                letterSpacing: '0.02em',
              }}
            >
              GJ Santa Terezinha
            </Typography>
            <Typography
              variant="body2"
              noWrap
              sx={{
                display: { xs: 'none', sm: 'block' },
                color: 'text.secondary',
                fontSize: '0.875rem',
              }}
            >
              Sistema de Gestão
            </Typography>
          </Box>

          <UserMenu />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundImage: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }} />
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2.5, sm: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

