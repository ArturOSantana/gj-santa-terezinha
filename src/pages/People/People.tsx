import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { TerezinhaService } from '../../services/firestore.service';
import { Person, PersonStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';

export const PeoplePage = () => {
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [openModal, setOpenModal] = useState(false);

  // Modal de detalhes
  const [detailPerson, setDetailPerson] = useState<Person | null>(null);

  // Modal de confirmação de exclusão
  const [deleteTarget, setDeleteTarget] = useState<Person | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal de edição
  const [editTarget, setEditTarget] = useState<Person | null>(null);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRoles, setEditRoles] = useState('');
  const [editGuardianName, setEditGuardianName] = useState('');
  const [editGuardianPhone, setEditGuardianPhone] = useState('');
  const [editStatus, setEditStatus] = useState<PersonStatus>(PersonStatus.ACTIVE);
  const [editNotes, setEditNotes] = useState('');
  const [editDietary, setEditDietary] = useState('');

  const canCreate = user ? hasPermission(user.role, 'coordinator') : false;

  // Form (cadastro)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState('Participante');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    const list = await TerezinhaService.getPeople();
    setPeople(list);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    await TerezinhaService.createPerson({
      name,
      phone,
      status: PersonStatus.ACTIVE,
      rolesInGroup: [roles],
      guardianName,
      guardianPhone,
    });

    setName('');
    setPhone('');
    setOpenModal(false);
    await loadPeople();
  };

  const openEdit = (p: Person) => {
    setEditTarget(p);
    setEditName(p.name);
    setEditPhone(p.phone || '');
    setEditRoles((p.rolesInGroup || []).join(', '));
    setEditGuardianName(p.guardianName || '');
    setEditGuardianPhone(p.guardianPhone || '');
    setEditStatus(p.status);
    setEditNotes(p.notes || '');
    setEditDietary(p.dietaryRestrictions || '');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editName) return;
    setSaving(true);
    await TerezinhaService.updatePerson(editTarget.id, {
      name: editName,
      phone: editPhone,
      rolesInGroup: editRoles.split(',').map((r) => r.trim()).filter(Boolean),
      guardianName: editGuardianName,
      guardianPhone: editGuardianPhone,
      status: editStatus,
      notes: editNotes,
      dietaryRestrictions: editDietary,
    });
    setSaving(false);
    setEditTarget(null);
    await loadPeople();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await TerezinhaService.deletePerson(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    await loadPeople();
  };

  const filtered = people.filter((p) => {
    if (filter === 'active') return p.status === PersonStatus.ACTIVE;
    if (filter === 'new') return p.status === PersonStatus.NEW;
    if (filter === 'away') return p.status === PersonStatus.AWAY;
    return true;
  });

  const statusLabel = (s: PersonStatus) => {
    if (s === PersonStatus.ACTIVE) return 'Ativo';
    if (s === PersonStatus.NEW) return 'Novo';
    if (s === PersonStatus.AWAY) return 'Afastado';
    return 'Alumni';
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#f4e6e9' }}>
            Jovens & Pessoas
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#c15c71', color: '#fff', '&:hover': { bgcolor: '#9a3450' }, fontWeight: 700 }}
          >
            Cadastrar Jovem
          </Button>
        )}
      </Box>

      {/* Filtros Pastorais */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Chip
          label={`Todos (${people.length})`}
          onClick={() => setFilter('all')}
          sx={{
            bgcolor: filter === 'all' ? '#d3a34c' : '#2f1522',
            color: filter === 'all' ? '#241019' : '#e2cad2',
            fontWeight: 700,
          }}
        />
        <Chip
          label={`Ativos (${people.filter((p) => p.status === PersonStatus.ACTIVE).length})`}
          onClick={() => setFilter('active')}
          sx={{
            bgcolor: filter === 'active' ? '#7fa176' : '#2f1522',
            color: filter === 'active' ? '#ffffff' : '#e2cad2',
            fontWeight: 700,
          }}
        />
        <Chip
          label={`Novos / Recém-chegados (${people.filter((p) => p.status === PersonStatus.NEW).length})`}
          onClick={() => setFilter('new')}
          sx={{
            bgcolor: filter === 'new' ? '#d3a34c' : '#2f1522',
            color: filter === 'new' ? '#241019' : '#e2cad2',
            fontWeight: 700,
          }}
        />
        <Chip
          icon={<WarningIcon sx={{ fontSize: 14 }} />}
          label={`Afastados +30d (${people.filter((p) => p.status === PersonStatus.AWAY).length}) — Procurar`}
          onClick={() => setFilter('away')}
          sx={{
            bgcolor: filter === 'away' ? '#c15c71' : '#2f1522',
            color: filter === 'away' ? '#ffffff' : '#e2cad2',
            fontWeight: 700,
          }}
        />
      </Box>

      {/* Grid de Pessoas / Cards de Papel */}
      <Grid container spacing={2}>
        {filtered.map((p) => {
          const isAway = p.status === PersonStatus.AWAY;
          return (
            <Grid key={p.id} size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  bgcolor: '#f7efdd',
                  color: '#2a1420',
                  p: 2.5,
                  borderRadius: '14px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  border: isAway ? '2px solid #c15c71' : '1px solid rgba(211, 163, 76, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 140,
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#2a1420' }}>
                      {p.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip
                        label={statusLabel(p.status)}
                        size="small"
                        sx={{
                          bgcolor: p.status === PersonStatus.ACTIVE ? '#7fa176' : p.status === PersonStatus.AWAY ? '#c15c71' : '#efe2c4',
                          color: p.status === PersonStatus.ACTIVE || p.status === PersonStatus.AWAY ? '#fff' : '#2a1420',
                          fontWeight: 700,
                          fontSize: '0.68rem',
                        }}
                      />
                      {/* Botão Ver Detalhes */}
                      <IconButton
                        size="small"
                        onClick={() => setDetailPerson(p)}
                        title="Ver detalhes"
                        sx={{ color: '#4a3227', '&:hover': { color: '#c15c71' } }}
                      >
                        <InfoIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      {/* Botões Editar / Excluir (só coordenadores) */}
                      {canCreate && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => openEdit(p)}
                            title="Editar jovem"
                            sx={{ color: '#4a3227', '&:hover': { color: '#3b82d4' } }}
                          >
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(p)}
                            title="Excluir jovem"
                            sx={{ color: '#4a3227', '&:hover': { color: '#c15c71' } }}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#4a3227', mt: 0.5 }}>
                    {p.phone || 'Sem telefone'} • {p.parish || 'Santa Terezinha'}
                  </Typography>

                  {p.rolesInGroup && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                      {p.rolesInGroup.map((r, i) => (
                        <Chip key={i} label={r} size="small" sx={{ bgcolor: '#efe2c4', color: '#4a3227', fontSize: '0.68rem' }} />
                      ))}
                    </Box>
                  )}
                </Box>

                <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid rgba(107, 83, 71, 0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    {isAway && <WarningIcon sx={{ fontSize: 14, color: '#c15c71' }} />}
                    <Typography variant="caption" sx={{ color: isAway ? '#c15c71' : '#4a3227', fontWeight: isAway ? 600 : 400 }}>
                      {isAway ? 'Não aparece há 30 dias' : 'Ativo no grupo'}
                    </Typography>
                  </Box>
                  {isAway && (
                    <Button
                      size="small"
                      onClick={() => window.open(`https://api.whatsapp.com/send?phone=${p.phone ? p.phone.replace(/\D/g, '') : ''}&text=${encodeURIComponent(`Olá ${p.name}! Sentimos sua falta nos encontros do GJ Santa Terezinha. Como você está?`)}`, '_blank')}
                      sx={{ color: '#9a3450', fontWeight: 700, fontSize: '0.75rem', p: 0 }}
                    >
                      Mandar WhatsApp →
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Modal Cadastro de Pessoa */}
      {canCreate && (
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}>
          <form onSubmit={handleCreate}>
            <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>Cadastrar Jovem / Pessoa</DialogTitle>
            <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Nome Completo" required fullWidth value={name} onChange={(e) => setName(e.target.value)} />
              <TextField label="WhatsApp" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
              <TextField label="Pastoral / Ministério / Equipe" fullWidth value={roles} onChange={(e) => setRoles(e.target.value)} placeholder="Ex: Música, Liturgia, Crisma..." />
              <TextField label="Nome do Responsável (se menor)" fullWidth value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
              <TextField label="WhatsApp do Responsável" fullWidth value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} />
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOpenModal(false)} sx={{ color: '#4a3227' }}>Cancelar</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700 }}>Salvar Jovem</Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      {/* Modal Ver Detalhes do Jovem */}
      <Dialog
        open={!!detailPerson}
        onClose={() => setDetailPerson(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}
      >
        {detailPerson && (
          <>
            <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {detailPerson.name}
              <Chip
                label={statusLabel(detailPerson.status)}
                size="small"
                sx={{
                  bgcolor: detailPerson.status === PersonStatus.ACTIVE ? '#7fa176' : detailPerson.status === PersonStatus.AWAY ? '#c15c71' : '#efe2c4',
                  color: detailPerson.status === PersonStatus.ACTIVE || detailPerson.status === PersonStatus.AWAY ? '#fff' : '#2a1420',
                  fontWeight: 700,
                }}
              />
            </DialogTitle>
            <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#9a3450', fontWeight: 700, textTransform: 'uppercase' }}>Contato</Typography>
                <Typography variant="body2" sx={{ color: '#2a1420' }}>
                  {detailPerson.phone ? (
                    <a href={`https://api.whatsapp.com/send?phone=${detailPerson.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#4f6b4f', fontWeight: 700 }}>
                      {detailPerson.phone}
                    </a>
                  ) : 'Não informado'}
                </Typography>
                {detailPerson.email && (
                  <Typography variant="body2" sx={{ color: '#2a1420' }}>{detailPerson.email}</Typography>
                )}
              </Box>

              {detailPerson.rolesInGroup && detailPerson.rolesInGroup.length > 0 && (
                <>
                  <Divider sx={{ borderColor: 'rgba(107, 83, 71, 0.15)' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9a3450', fontWeight: 700, textTransform: 'uppercase' }}>Pastoral / Ministério</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                      {detailPerson.rolesInGroup.map((r, i) => (
                        <Chip key={i} label={r} size="small" sx={{ bgcolor: '#efe2c4', color: '#4a3227', fontWeight: 700 }} />
                      ))}
                    </Box>
                  </Box>
                </>
              )}

              {detailPerson.parish && (
                <>
                  <Divider sx={{ borderColor: 'rgba(107, 83, 71, 0.15)' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9a3450', fontWeight: 700, textTransform: 'uppercase' }}>Paróquia</Typography>
                    <Typography variant="body2" sx={{ color: '#2a1420' }}>{detailPerson.parish}</Typography>
                  </Box>
                </>
              )}

              {detailPerson.birthDate && (
                <>
                  <Divider sx={{ borderColor: 'rgba(107, 83, 71, 0.15)' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9a3450', fontWeight: 700, textTransform: 'uppercase' }}>Data de Nascimento</Typography>
                    <Typography variant="body2" sx={{ color: '#2a1420' }}>
                      {new Date(detailPerson.birthDate).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                </>
              )}

              {(detailPerson.guardianName || detailPerson.guardianPhone) && (
                <>
                  <Divider sx={{ borderColor: 'rgba(107, 83, 71, 0.15)' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9a3450', fontWeight: 700, textTransform: 'uppercase' }}>Responsável</Typography>
                    <Typography variant="body2" sx={{ color: '#2a1420' }}>
                      {detailPerson.guardianName || '—'}
                      {detailPerson.guardianPhone && ` • ${detailPerson.guardianPhone}`}
                    </Typography>
                  </Box>
                </>
              )}

              {detailPerson.emergencyContact && (
                <>
                  <Divider sx={{ borderColor: 'rgba(107, 83, 71, 0.15)' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9a3450', fontWeight: 700, textTransform: 'uppercase' }}>Contato de Emergência</Typography>
                    <Typography variant="body2" sx={{ color: '#2a1420' }}>
                      {detailPerson.emergencyContact.name} ({detailPerson.emergencyContact.relationship}) • {detailPerson.emergencyContact.phone}
                    </Typography>
                  </Box>
                </>
              )}

              {detailPerson.dietaryRestrictions && (
                <>
                  <Divider sx={{ borderColor: 'rgba(107, 83, 71, 0.15)' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WarningIcon sx={{ fontSize: 16, color: '#c15c71' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#c15c71', fontWeight: 700, textTransform: 'uppercase' }}>Restrições Alimentares</Typography>
                      <Typography variant="body2" sx={{ color: '#2a1420' }}>{detailPerson.dietaryRestrictions}</Typography>
                    </Box>
                  </Box>
                </>
              )}

              {detailPerson.notes && (
                <>
                  <Divider sx={{ borderColor: 'rgba(107, 83, 71, 0.15)' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9a3450', fontWeight: 700, textTransform: 'uppercase' }}>Observações</Typography>
                    <Typography variant="body2" sx={{ color: '#2a1420' }}>{detailPerson.notes}</Typography>
                  </Box>
                </>
              )}

              <Divider sx={{ borderColor: 'rgba(107, 83, 71, 0.15)' }} />
              <Typography variant="caption" sx={{ color: '#9a3450' }}>
                Cadastrado em: {detailPerson.createdAt ? new Date(detailPerson.createdAt).toLocaleDateString('pt-BR') : '—'}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              {canCreate && (
                <>
                  <Button
                    onClick={() => { setDetailPerson(null); setDeleteTarget(detailPerson); }}
                    startIcon={<DeleteIcon />}
                    sx={{ color: '#c15c71', fontWeight: 700 }}
                  >
                    Excluir
                  </Button>
                  <Button
                    onClick={() => { const p = detailPerson; setDetailPerson(null); openEdit(p!); }}
                    startIcon={<EditIcon />}
                    sx={{ color: '#3b82d4', fontWeight: 700 }}
                  >
                    Editar
                  </Button>
                </>
              )}
              <Button
                onClick={() => setDetailPerson(null)}
                variant="contained"
                sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700 }}
              >
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal Edição de Jovem */}
      {canCreate && (
        <Dialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}
        >
          <form onSubmit={handleEdit}>
            <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>Editar Jovem</DialogTitle>
            <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Nome Completo" required fullWidth value={editName} onChange={(e) => setEditName(e.target.value)} />
              <TextField label="WhatsApp" fullWidth value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="(11) 99999-9999" />
              <TextField label="Pastoral / Ministério / Equipe" fullWidth value={editRoles} onChange={(e) => setEditRoles(e.target.value)} placeholder="Música, Liturgia, Crisma..." helperText="Separe por vírgula para múltiplos" />
              <TextField
                select
                label="Status"
                fullWidth
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as PersonStatus)}
              >
                <MenuItem value={PersonStatus.ACTIVE}>Ativo</MenuItem>
                <MenuItem value={PersonStatus.NEW}>Novo / Recém-chegado</MenuItem>
                <MenuItem value={PersonStatus.AWAY}>Afastado</MenuItem>
              </TextField>
              <TextField label="Nome do Responsável (se menor)" fullWidth value={editGuardianName} onChange={(e) => setEditGuardianName(e.target.value)} />
              <TextField label="WhatsApp do Responsável" fullWidth value={editGuardianPhone} onChange={(e) => setEditGuardianPhone(e.target.value)} />
              <TextField label="Restrições Alimentares" fullWidth value={editDietary} onChange={(e) => setEditDietary(e.target.value)} />
              <TextField label="Observações" fullWidth multiline rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setEditTarget(null)} sx={{ color: '#4a3227' }}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={saving} sx={{ bgcolor: '#3b82d4', color: '#fff', fontWeight: 700 }}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      {/* Modal Confirmação de Exclusão */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>Excluir Jovem?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Tem certeza que deseja excluir <strong>{deleteTarget?.name}</strong>? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: '#4a3227' }}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={deleting}
            onClick={handleDelete}
            sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700 }}
          >
            {deleting ? 'Excluindo...' : 'Sim, Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PeoplePage;
