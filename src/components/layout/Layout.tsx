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
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <img
          src={brasaoGJ}
          alt="Brasão GJ"
          style={{
            width: '80px',
            height: '80px',
            marginBottom: '12px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
          Grupo de Jovens
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          Santa Terezinha
        </Typography>
      </Box>
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'white' : 'primary.main',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: location.pathname === item.path ? 600 : 400,
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            GJ Santa Terezinha - Sistema de Gestão
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

