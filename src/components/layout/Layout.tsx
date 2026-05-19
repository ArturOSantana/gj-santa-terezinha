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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { UserRole } from '../../types';
import brasaoGJ from '../../assets/brasao-gj.png';

const drawerWidth = 260;

const menuItemsByRole: Record<UserRole, Array<{
  text: string;
  icon: ReactElement;
  path: string;
}>> = {
  admin: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Calendário', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Finanças', icon: <MoneyIcon />, path: '/finance' },
    { text: 'Membros', icon: <PeopleIcon />, path: '/members' },
    { text: 'Contribuições', icon: <FavoriteIcon />, path: '/contributions' },
    { text: 'Usuários', icon: <ManageAccountsIcon />, path: '/users' },
  ],
  coordinator: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Calendário', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Finanças', icon: <MoneyIcon />, path: '/finance' },
    { text: 'Contribuições', icon: <FavoriteIcon />, path: '/contributions' },
  ],
  member: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
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
    <Box>
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <img
          src={brasaoGJ}
          alt="Brasão GJ"
          style={{
            width: '70px',
            height: '70px',
            marginBottom: '8px',
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          GJ Santa Terezinha
        </Typography>
      </Box>
      <List sx={{ pt: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'rgba(44, 95, 45, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(44, 95, 45, 0.12)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* AppBar - Cabeçalho */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            GJ Santa Terezinha
          </Typography>
          <UserMenu />
        </Toolbar>
      </AppBar>

      {/* Drawer - Menu Lateral */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;

