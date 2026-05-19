
import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Tabs,
  Tab,
  Alert,
  Skeleton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import { UserCard } from '../../components/common/UserCard';
import { UserRoleModal } from '../../components/common/UserRoleModal';
import { User, UserRole } from '../../types';

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, loading, error, updateUserRole, deleteUser, searchUsers, filterByRole } = useUsers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Filtrar usuários por busca e role
  const filteredUsers = useMemo(() => {
    let result = users;

    // Filtrar por role
    result = filterByRole(selectedRole);

    // Filtrar por busca
    if (searchQuery.trim()) {
      result = searchUsers(searchQuery);
    }

    return result;
  }, [users, selectedRole, searchQuery, filterByRole, searchUsers]);

  // Contadores por role
  const roleCounts = useMemo(() => {
    return {
      all: users.length,
      admin: users.filter((u) => u.role === 'admin').length,
      coordinator: users.filter((u) => u.role === 'coordinator').length,
      member: users.filter((u) => u.role === 'member').length,
    };
  }, [users]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleRoleTabChange = (_event: React.SyntheticEvent, newValue: UserRole | 'all') => {
    setSelectedRole(newValue);
  };

  const handleEditRole = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveRole = async (userId: string, newRole: UserRole) => {
    await updateUserRole(userId, newRole);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Verificar se usuário é admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Você não tem permissão para acessar esta página.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Gerenciamento de Usuários
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Gerencie os níveis de acesso dos usuários do sistema
        </Typography>
      </Box>

      {/* Mensagem de Erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Stack spacing={2}>
          {/* Campo de Busca */}
          <TextField
            fullWidth
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={handleSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Tabs de Filtro por Role */}
          <Tabs
            value={selectedRole}
            onChange={handleRoleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={`Todos (${roleCounts.all})`}
              value="all"
            />
            <Tab
              label={`Administradores (${roleCounts.admin})`}
              value="admin"
            />
            <Tab
              label={`Coordenadores (${roleCounts.coordinator})`}
              value="coordinator"
            />
            <Tab
              label={`Membros (${roleCounts.member})`}
              value="member"
            />
          </Tabs>
        </Stack>
      </Paper>

      {/* Lista de Usuários */}
      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PeopleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum usuário encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? 'Tente ajustar os filtros de busca'
              : 'Não há usuários cadastrados no sistema'}
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEditRole={handleEditRole}
              onDelete={handleDeleteUser}
              canEdit={true}
              isCurrentUser={user.id === currentUser.uid}
            />
          ))}
        </Box>
      )}

      {/* Modal de Edição de Role */}
      <UserRoleModal
        open={modalOpen}
        user={selectedUser}
        onClose={handleModalClose}
        onSave={handleSaveRole}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Tem certeza que deseja deletar o usuário <strong>{userToDelete?.displayName}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;

