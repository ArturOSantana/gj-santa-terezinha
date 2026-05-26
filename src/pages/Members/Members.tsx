import React, { useMemo, useState } from 'react';
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
  Paper,
  Grid,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Cake as CakeIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { getMonth } from 'date-fns';
import { useMembers } from '../../hooks/useMembers';
import StatCard from '../../components/common/StatCard';
import MemberCard from '../../components/common/MemberCard';
import MemberFormModal from '../../components/common/MemberFormModal';
import MemberDetailsModal from '../../components/common/MemberDetailsModal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

const Members: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    members,
    allMembers,
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

  const memberInsights = useMemo(() => {
    const maleCount = allMembers.filter((member) => member.gender === 'male').length;
    const femaleCount = allMembers.filter((member) => member.gender === 'female').length;
    const birthdayCount = allMembers.filter(
      (member) => member.birthDate && getMonth(new Date(member.birthDate)) === getMonth(new Date())
    ).length;

    return { maleCount, femaleCount, birthdayCount };
  }, [allMembers]);

  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  const hasActiveFilters =
    !!filters.search ||
    filters.group !== 'all' ||
    filters.status !== 'all' ||
    filters.ageRange !== 'all';

  const actionButton = permissions.canCreateMember ? (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={handleNewMember}
      sx={{
        px: 2.25,
        py: 1.15,
        borderRadius: 2.5,
        boxShadow: '0 10px 24px rgba(26, 71, 49, 0.16)',
      }}
    >
      Adicionar Membro
    </Button>
  ) : null;

  return (
    <Container maxWidth="xl" disableGutters>
      <Box sx={{
        py: { xs: 1.5, sm: 2.5 },
        display: 'grid',
        gap: { xs: 2.5, md: 3.5 },
        overflowX: 'hidden',
        maxWidth: '100%',
        px: { xs: 2, sm: 3 },
      }}>
        <PageHeader
          title="Membros do Grupo"
          action={actionButton}
        />

        <Grid container columnSpacing={{ xs: 2, md: 3 }} rowSpacing={{ xs: 2, md: 2.5 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard
              title="Total de membros"
              value={stats.total}
              icon={<PeopleIcon />}
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ mt: { md: 1.25 } }}>
              <StatCard
                title="Cavalheiros"
                value={memberInsights.maleCount}
                icon={<MaleIcon />}
                color="info"
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <StatCard
              title="Santa Joana"
              value={memberInsights.femaleCount}
              icon={<FemaleIcon />}
              color="secondary"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <Box sx={{ mt: { md: 2 } }}>
              <StatCard
                title="Aniversariantes"
                value={memberInsights.birthdayCount}
                icon={<CakeIcon />}
                color="warning"
              />
            </Box>
          </Grid>
        </Grid>

        <Paper
          sx={{
            p: { xs: 2, md: 2.75 },
            borderRadius: 3.5,
            background: 'linear-gradient(135deg, rgba(26,71,49,0.03) 0%, rgba(212,175,55,0.08) 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              right: -24,
              top: -24,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: alpha(theme.palette.secondary.main, 0.08),
            },
          }}
        >
          <Stack spacing={2.25} sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Filtros e busca
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Combine critérios para encontrar perfis com mais rapidez.
                </Typography>
              </Box>
              <Chip
                icon={<TuneIcon />}
                label={hasActiveFilters ? 'Filtros personalizados ativos' : 'Visualização completa'}
                sx={{
                  bgcolor: hasActiveFilters ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.warning.main, 0.14),
                  color: hasActiveFilters ? 'primary.main' : '#8a6116',
                  fontWeight: 700,
                }}
              />
            </Box>

            <TextField
              fullWidth
              placeholder="Buscar por nome ou email..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: 'background.paper',
                },
              }}
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
                  md: '1.15fr 1fr 0.9fr',
                },
                gap: { xs: 1.5, md: 2 },
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Grupo</InputLabel>
                <Select
                  value={filters.group}
                  onChange={(e) => handleFilterChange({ group: e.target.value as any })}
                  label="Grupo"
                  sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}
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
                  sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}
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
                  sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="14-16">14-16 anos</MenuItem>
                  <MenuItem value="17-19">17-19 anos</MenuItem>
                  <MenuItem value="20-22">20-22 anos</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {hasActiveFilters && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                  Filtros ativos:
                </Typography>
                {filters.search && (
                  <Chip
                    label={`Busca: "${filters.search}"`}
                    size="small"
                    onDelete={() => handleFilterChange({ search: '' })}
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12) }}
                  />
                )}
                {filters.group !== 'all' && (
                  <Chip
                    label={filters.group === 'male' ? 'Cavalheiros' : 'Santa Joana'}
                    size="small"
                    onDelete={() => handleFilterChange({ group: 'all' })}
                    sx={{ bgcolor: alpha(theme.palette.info.main, 0.12) }}
                  />
                )}
                {filters.status !== 'all' && (
                  <Chip
                    label={filters.status === 'active' ? 'Ativos' : 'Inativos'}
                    size="small"
                    onDelete={() => handleFilterChange({ status: 'all' })}
                    sx={{ bgcolor: alpha(theme.palette.success.main, 0.12) }}
                  />
                )}
                {filters.ageRange !== 'all' && (
                  <Chip
                    label={`${filters.ageRange} anos`}
                    size="small"
                    onDelete={() => handleFilterChange({ ageRange: 'all' })}
                    sx={{ bgcolor: alpha(theme.palette.warning.main, 0.12) }}
                  />
                )}
              </Box>
            )}
          </Stack>
        </Paper>

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
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Chip
              label={`${stats.active} ativos`}
              size="small"
              sx={{ bgcolor: alpha(theme.palette.success.main, 0.12), color: 'success.main', fontWeight: 700 }}
            />
            {totalPages > 1 && (
              <Typography variant="body2" color="text.secondary">
                Página {page} de {totalPages}
              </Typography>
            )}
          </Stack>
        </Box>

        {paginatedMembers.length === 0 ? (
          <Paper sx={{ borderRadius: 3.5, p: { xs: 1, md: 2 } }}>
            <EmptyState
              title="Nenhum membro encontrado"
              description={
                hasActiveFilters
                  ? 'Tente ajustar os filtros ou fazer uma nova busca para encontrar os perfis desejados.'
                  : 'Comece adicionando o primeiro membro para montar o cadastro da comunidade.'
              }
              action={
                !hasActiveFilters && permissions.canCreateMember ? (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNewMember}
                    sx={{ borderRadius: 2.5, px: 2.5 }}
                  >
                    Adicionar Primeiro Membro
                  </Button>
                ) : undefined
              }
            />
          </Paper>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                  xl: 'repeat(4, minmax(0, 1fr))',
                },
                gap: { xs: 2, md: 2.75 },
                alignItems: 'start',
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              {paginatedMembers.map((member, index) => (
                <Box
                  key={member.id}
                  sx={{
                    transform: {
                      md: index % 3 === 1 ? 'translateY(18px)' : index % 4 === 3 ? 'translateY(8px)' : 'none',
                    },
                    maxWidth: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <MemberCard
                    member={member}
                    onEdit={handleEditMember}
                    onDelete={handleDeleteMember}
                    onViewDetails={handleViewDetails}
                    canEdit={permissions.canEditMember}
                    canDelete={permissions.canDeleteMember}
                  />
                </Box>
              ))}
            </Box>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4.5 }}>
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

