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
    { text: 'Usuários', icon: <ManageAccountsIcon />, path: '/users' },
  ],
  coordinator: [
    { text: 'Visão Geral', icon: <DashboardIcon />, path: '/' },
    { text: 'Calendário', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Finanças', icon: <MoneyIcon />, path: '/finance' },
    { text: 'Membros', icon: <PeopleIcon />, path: '/members' },
    { text: 'Contribuições', icon: <FavoriteIcon />, path: '/contributions' },
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
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderBottom: '2px solid',
          borderColor: '#1e1e1e',
          backgroundColor: '#1f4d3a',
          color: 'white',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            mb: 1.25,
            bgcolor: '#f7f2e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #1e1e1e',
          }}
        >
          <img
            src={brasaoGJ}
            alt="Brasão GJ"
            style={{
              width: '58px',
              height: '58px',
              objectFit: 'contain',
            }}
          />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'left' }}>
          GJ Santa Terezinha
        </Typography>
      </Box>

      <List sx={{ pt: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                minHeight: 46,
                px: 1.25,
                border: '1px solid transparent',
                '&:hover': {
                  bgcolor: '#e4ddcf',
                  borderColor: '#1e1e1e',
                },
                '&.Mui-selected': {
                  bgcolor: '#d8cfbe',
                  color: '#1e1e1e',
                  borderColor: '#1e1e1e',
                  '& .MuiListItemIcon-root': {
                    color: '#1e1e1e',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 700,
                  },
                  '&:hover': {
                    bgcolor: '#d8cfbe',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: location.pathname === item.path ? 700 : 500,
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
          borderBottom: '2px solid',
          borderColor: '#1e1e1e',
          bgcolor: '#ece7dc',
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
              mr: 1.5,
              display: { sm: 'none' },
              border: '1px solid',
              borderColor: '#1e1e1e',
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontSize: { xs: '1rem', sm: '1.15rem' }, fontWeight: 700, color: 'text.primary' }}
            >
              GJ Santa Terezinha
            </Typography>
            <Typography
              variant="body2"
              noWrap
              sx={{ display: { xs: 'none', sm: 'block' }, color: 'text.secondary' }}
            >
              Administração e acompanhamento do grupo
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
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }} />
        <Box
          sx={{
            px: { xs: 1.5, sm: 3, md: 4 },
            py: { xs: 2, sm: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

