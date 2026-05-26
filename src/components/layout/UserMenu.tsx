
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

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
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
        sx={{
          p: 0.5,
        }}
      >
        {user.photoURL ? (
          <Avatar
            src={user.photoURL}
            alt={user.displayName || 'Usuário'}
            sx={{
              width: 40,
              height: 40,
              border: '2px solid',
              borderColor: 'secondary.main',
              boxShadow: '0 2px 8px rgba(26, 71, 49, 0.15)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'secondary.light',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(26, 71, 49, 0.25)',
              },
            }}
          />
        ) : (
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              border: '2px solid',
              borderColor: 'secondary.main',
              boxShadow: '0 2px 8px rgba(26, 71, 49, 0.15)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'secondary.light',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(26, 71, 49, 0.25)',
              },
            }}
          >
            <AccountCircle />
          </Avatar>
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
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              minWidth: 240,
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(26, 71, 49, 0.15)',
              border: '1px solid',
              borderColor: 'rgba(26, 71, 49, 0.1)',
              overflow: 'visible',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                borderLeft: '1px solid',
                borderTop: '1px solid',
                borderColor: 'rgba(26, 71, 49, 0.1)',
              },
            },
          },
        }}
      >
        <Box sx={{ px: 2.5, py: 2, minWidth: 240 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {user.displayName || 'Usuário'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {user.email}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 1,
              px: 1,
              py: 0.5,
              bgcolor: 'rgba(26, 71, 49, 0.05)',
              borderRadius: 1,
            }}
          >
            <Box sx={{ color: 'secondary.main', display: 'flex', alignItems: 'center' }}>
              {getRoleIcon()}
            </Box>
            <Typography variant="caption" sx={{ ml: 1, fontWeight: 600, color: 'text.primary' }}>
              {getRoleLabel()}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem
          onClick={handleProfile}
          sx={{
            mx: 1,
            borderRadius: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(26, 71, 49, 0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Meu Perfil</Typography>
        </MenuItem>
        
        <MenuItem
          onClick={handleClose}
          sx={{
            mx: 1,
            borderRadius: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(26, 71, 49, 0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <Settings fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Configurações</Typography>
        </MenuItem>
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem
          onClick={handleLogout}
          sx={{
            mx: 1,
            mb: 1,
            borderRadius: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(178, 58, 72, 0.08)',
              '& .MuiListItemIcon-root': {
                color: 'error.main',
              },
              '& .MuiTypography-root': {
                color: 'error.main',
              },
            },
          }}
        >
          <ListItemIcon sx={{ color: 'text.secondary', transition: 'color 0.2s ease' }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" sx={{ transition: 'color 0.2s ease' }}>Sair</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

