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

  // Hook customizado para gerenciar membros
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

  // Paginação
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(members.length / itemsPerPage);
  const paginatedMembers = members.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Reseta a página quando os filtros mudam
  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Cabeçalho */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Gestão de Membros
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie os membros do grupo e visualize estatísticas
            </Typography>
          </Box>
          {permissions.canCreateMember && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleNewMember}
              fullWidth={isMobile}
            >
              Novo Membro
            </Button>
          )}
        </Box>

        {/* Cards de Estatísticas */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
            mb: 4,
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

        {/* Filtros e Controles */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 3,
            borderRadius: 2,
            boxShadow: 1,
            mb: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          
          <Stack spacing={2}>
            {/* Busca */}
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

            {/* Filtros em linha */}
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
              {/* Filtro de Grupo */}
              <FormControl fullWidth>
                <InputLabel>Grupo</InputLabel>
                <Select
                  value={filters.group}
                  onChange={(e) => handleFilterChange({ group: e.target.value as any })}
                  label="Grupo"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="male">Rapazes</MenuItem>
                  <MenuItem value="female">Moças</MenuItem>
                </Select>
              </FormControl>

              {/* Filtro de Status */}
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

              {/* Filtro de Faixa Etária */}
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

            {/* Chips de filtros ativos */}
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
                    label={filters.group === 'male' ? 'Rapazes' : 'Moças'}
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

        {/* Contador de Resultados */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {members.length} {members.length === 1 ? 'membro encontrado' : 'membros encontrados'}
          </Typography>
          {totalPages > 1 && (
            <Typography variant="body2" color="text.secondary">
              Página {page} de {totalPages}
            </Typography>
          )}
        </Box>

        {/* Lista de Membros */}
        {paginatedMembers.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1,
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
                gap: 3,
                mb: 4,
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

            {/* Paginação */}
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

        {/* Modais */}
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
          events={events}
          canEdit={permissions.canEditMember}
        />
      </Box>
    </Container>
  );
};

export default Members;

