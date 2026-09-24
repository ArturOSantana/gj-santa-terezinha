
import { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  Tabs,
  Tab,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  PeopleAlt as PeopleAltIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  EditNote as EditNoteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import { UserRoleModal, AddUserModal } from '../../components/common';
import { User, UserRole } from '../../types';
import { EmptyState, PageHeader, StatCard, UserCard } from '../../components/common';

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, loading, error, createUser, updateUserRole, deleteUser, filterByRole } = useUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    let result = filterByRole(selectedRole);

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((user) => {
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        return name.includes(query) || email.includes(query);
      });
    }

    return result;
  }, [selectedRole, searchQuery, filterByRole]);

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
    setRoleModalOpen(true);
  };

  const handleRoleModalClose = () => {
    setRoleModalOpen(false);
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

  const handleAddUser = () => {
    setAddUserModalOpen(true);
  };

  const handleAddUserSubmit = async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    await createUser(data);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="error">
          Você não tem permissão para acessar esta página.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Gerenciar Usuários"
        action={(
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleAddUser}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              borderRadius: 2.75,
              px: 2.5,
            }}
          >
            Adicionar Usuário
          </Button>
        )}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Total de usuários"
            value={roleCounts.all}
            icon={<PeopleAltIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Admins"
            value={roleCounts.admin}
            icon={<AdminPanelSettingsIcon />}
            color="error"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Editores"
            value={roleCounts.coordinator}
            icon={<EditNoteIcon />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 12, lg: 3 }}>
          <StatCard
            title="Visualizadores"
            value={roleCounts.member}
            icon={<VisibilityIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: { xs: 3, md: 3.5 },
          bgcolor: '#f7efdd',
          border: '1px solid rgba(211, 163, 76, 0.3)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <TextField
              fullWidth
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#ffffff',
                  color: '#2a1420',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(211, 163, 76, 0.35)' },
                  '&:hover fieldset': { borderColor: '#c15c71' },
                  '&.Mui-focused fieldset': { borderColor: '#c15c71' },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#8a6b75' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              select
              fullWidth
              label="Filtrar perfil"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as UserRole | 'all')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#ffffff',
                  color: '#2a1420',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(211, 163, 76, 0.35)' },
                  '&:hover fieldset': { borderColor: '#c15c71' },
                  '&.Mui-focused fieldset': { borderColor: '#c15c71' },
                },
                '& .MuiInputLabel-root': { color: '#6b5347' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#c15c71' },
              }}
            >
              <MenuItem value="all">Todos os perfis</MenuItem>
              <MenuItem value="admin">Administradores</MenuItem>
              <MenuItem value="coordinator">Editores</MenuItem>
              <MenuItem value="member">Visualizadores</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Tabs
              value={selectedRole}
              onChange={handleRoleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 44,
                borderBottom: '1px solid rgba(211, 163, 76, 0.2)',
                '& .MuiTab-root': {
                  minHeight: 44,
                  textTransform: 'none',
                  fontWeight: 700,
                  color: '#6b5347',
                  '&.Mui-selected': {
                    color: '#c15c71',
                  },
                },
                '& .MuiTabs-indicator': {
                  bgcolor: '#c15c71',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab label={`Todos (${roleCounts.all})`} value="all" />
              <Tab label={`Administradores (${roleCounts.admin})`} value="admin" />
              <Tab label={`Editores (${roleCounts.coordinator})`} value="coordinator" />
              <Tab label={`Visualizadores (${roleCounts.member})`} value="member" />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredUsers.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 3, md: 4 },
            bgcolor: '#f7efdd',
            color: '#2a1420',
            border: '1px solid rgba(211, 163, 76, 0.3)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
          }}
        >
          <EmptyState
            title="Nenhum usuário encontrado"
            description={
              searchQuery || selectedRole !== 'all'
                ? 'Ajuste os filtros para encontrar usuários cadastrados.'
                : 'Adicione o primeiro usuário do sistema para começar o controle de acesso.'
            }
            action={
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleAddUser}
                sx={{
                  bgcolor: '#c15c71',
                  color: '#ffffff',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#9a3450' },
                }}
              >
                Adicionar Usuário
              </Button>
            }
          />
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {filteredUsers.map((user) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
              <UserCard
                user={user}
                onEditRole={handleEditRole}
                onDelete={handleDeleteUser}
                canEdit={true}
                isCurrentUser={user.id === currentUser.uid}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && filteredUsers.length > 0 && (
        <Typography variant="body2" sx={{ color: '#caa2ae', mt: 2.5, fontWeight: 500 }}>
          Exibindo {filteredUsers.length} usuário(s) com os filtros atuais.
        </Typography>
      )}

      <UserRoleModal
        open={roleModalOpen}
        user={selectedUser}
        onClose={handleRoleModalClose}
        onSave={handleSaveRole}
      />

      <AddUserModal
        open={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onAddUser={handleAddUserSubmit}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            bgcolor: '#f7efdd',
            color: '#2a1420',
            borderRadius: 3,
            border: '1px solid rgba(211, 163, 76, 0.3)',
          },
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ color: '#4a3227' }}>
            Tem certeza que deseja deletar o usuário <strong>{userToDelete?.name}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCancelDelete} sx={{ color: '#4a3227' }}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus sx={{ fontWeight: 700 }}>
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;

