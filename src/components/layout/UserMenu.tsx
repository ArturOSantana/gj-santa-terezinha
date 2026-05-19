
import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  Logout,
  AdminPanelSettings,
  SupervisorAccount,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
    handleClose();
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminPanelSettings fontSize="small" />;
      case 'coordinator':
        return <SupervisorAccount fontSize="small" />;
      case 'member':
        return <Person fontSize="small" />;
      default:
        return <Person fontSize="small" />;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Administrador';
      case 'coordinator':
        return 'Coordenador';
      case 'member':
        return 'Membro';
      default:
        return 'Usuário';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="conta do usuário"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        {user.photoURL ? (
          <Avatar
            src={user.photoURL}
            alt={user.displayName || 'Usuário'}
            sx={{ width: 32, height: 32 }}
          />
        ) : (
          <AccountCircle />
        )}
      </IconButton>
      
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user.displayName || 'Usuário'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            {getRoleIcon()}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              {getRoleLabel()}
            </Typography>
          </Box>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Meu Perfil
        </MenuItem>
        
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Configurações
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </Box>
  );
};

