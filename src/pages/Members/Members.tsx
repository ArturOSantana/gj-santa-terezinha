import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useMembers } from '../../hooks/useMembers';
import StatCard from '../../components/common/StatCard';
import MemberCard from '../../components/common/MemberCard';
import MemberFormModal from '../../components/common/MemberFormModal';
import MemberDetailsModal from '../../components/common/MemberDetailsModal';

const Members: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    members,
    allMembers,
    events,
    selectedMember,
    isFormOpen,
    isDetailsOpen,
    filters,
    stats,
    handleNewMember,
    handleEditMember,
    handleViewDetails,
    handleDeleteMember,
    handleSaveMember,
    handleFilterChange,
    setIsFormOpen,
    setIsDetailsOpen,
    permissions,
  } = useMembers();

  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(members.length / itemsPerPage);
  const paginatedMembers = members.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <Container maxWidth="xl" disableGutters>
      <Box sx={{ py: { xs: 1, sm: 2 }, display: 'grid', gap: 3 }}>
        <Box sx={{ pb: 2, borderBottom: '2px solid #1e1e1e' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Membros do Grupo
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: { xs: 2, sm: 3 },
            mb: 0,
          }}
        >
          <StatCard
            title="Total de Membros"
            value={stats.total}
            icon={<PeopleIcon />}
            color="primary"
          />
          <StatCard
            title="Membros Ativos"
            value={stats.active}
            icon={<PeopleIcon />}
            color="success"
          />
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          
          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Buscar por nome ou email..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }
              }}
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Grupo</InputLabel>
                <Select
                  value={filters.group}
                  onChange={(e) => handleFilterChange({ group: e.target.value as any })}
                  label="Grupo"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="male">Cavalheiros</MenuItem>
                  <MenuItem value="female">Santa Joana</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange({ status: e.target.value as any })}
                  label="Status"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="active">Ativos</MenuItem>
                  <MenuItem value="inactive">Inativos</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Faixa Etária</InputLabel>
                <Select
                  value={filters.ageRange}
                  onChange={(e) => handleFilterChange({ ageRange: e.target.value as any })}
                  label="Faixa Etária"
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="14-16">14-16 anos</MenuItem>
                  <MenuItem value="17-19">17-19 anos</MenuItem>
                  <MenuItem value="20-22">20-22 anos</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {(filters.search || filters.group !== 'all' || filters.status !== 'all' || filters.ageRange !== 'all') && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Filtros ativos:
                </Typography>
                {filters.search && (
                  <Chip
                    label={`Busca: "${filters.search}"`}
                    size="small"
                    onDelete={() => handleFilterChange({ search: '' })}
                  />
                )}
                {filters.group !== 'all' && (
                  <Chip
                    label={filters.group === 'male' ? 'Cavalheiros' : 'Santa Joana'}
                    size="small"
                    onDelete={() => handleFilterChange({ group: 'all' })}
                  />
                )}
                {filters.status !== 'all' && (
                  <Chip
                    label={filters.status === 'active' ? 'Ativos' : 'Inativos'}
                    size="small"
                    onDelete={() => handleFilterChange({ status: 'all' })}
                  />
                )}
                {filters.ageRange !== 'all' && (
                  <Chip
                    label={`${filters.ageRange} anos`}
                    size="small"
                    onDelete={() => handleFilterChange({ ageRange: 'all' })}
                  />
                )}
              </Box>
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {members.length} {members.length === 1 ? 'membro encontrado' : 'membros encontrados'}
          </Typography>
          {totalPages > 1 && (
            <Typography variant="body2" color="text.secondary">
              Página {page} de {totalPages}
            </Typography>
          )}
        </Box>

        {paginatedMembers.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum membro encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {filters.search || filters.group !== 'all' || filters.status !== 'all' || filters.ageRange !== 'all'
                ? 'Tente ajustar os filtros ou fazer uma nova busca'
                : 'Comece adicionando o primeiro membro do grupo'}
            </Typography>
            {!filters.search &&
              filters.group === 'all' &&
              filters.status === 'all' &&
              filters.ageRange === 'all' &&
              permissions.canCreateMember && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleNewMember}
                >
                  Adicionar Primeiro Membro
                </Button>
              )}
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: { xs: 2, sm: 3 },
                mb: 2,
              }}
            >
              {paginatedMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onEdit={handleEditMember}
                  onDelete={handleDeleteMember}
                  onViewDetails={handleViewDetails}
                  canEdit={permissions.canEditMember}
                  canDelete={permissions.canDeleteMember}
                />
              ))}
            </Box>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}

        <MemberFormModal
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
          }}
          onSave={handleSaveMember}
          member={selectedMember}
          readOnly={!permissions.canCreateMember && !permissions.canEditMember}
        />

        <MemberDetailsModal
          open={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onEdit={handleEditMember}
          member={selectedMember}
          canEdit={permissions.canEditMember}
        />
      </Box>
    </Container>
  );
};

export default Members;

