import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { TerezinhaService } from '../../services/firestore.service';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';

export const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [assignedToName, setAssignedToName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.HIGH);

  const canCreate = user ? hasPermission(user.role, 'coordinator') : false;
  const canToggle = user ? hasPermission(user.role, 'leader') : false;

  useEffect(() => {
    if (user) setAssignedToName(user.displayName || '');
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    const list = await TerezinhaService.getTasks();
    setTasks(list);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await TerezinhaService.deleteTask(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    await loadTasks();
  };

  const handleToggle = async (task: Task) => {
    if (!canToggle) return;
    const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    await TerezinhaService.updateTaskStatus(task.id, newStatus);
    await loadTasks();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await TerezinhaService.createTask({
      title,
      assignedToName: assignedToName || user?.displayName || '',
      assignedToId: user?.uid,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 86400000 * 3),
      priority,
      status: TaskStatus.PENDING,
    });

    setTitle('');
    setOpenModal(false);
    await loadTasks();
  };

  const pendingTasks = tasks.filter((t) => t.status !== TaskStatus.COMPLETED);
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#f4e6e9' }}>
            Tarefas da Coordenação
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#c15c71', color: '#fff', '&:hover': { bgcolor: '#9a3450' }, fontWeight: 700 }}
          >
            Nova Tarefa
          </Button>
        )}
      </Box>

      {/* Seção Pendentes */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ color: '#d3a34c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
          Pendentes ({pendingTasks.length})
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {pendingTasks.map((t) => {
            const isLate = new Date(t.dueDate) < new Date();
            return (
              <Box
                key={t.id}
                onClick={() => canToggle && handleToggle(t)}
                sx={{
                  bgcolor: '#f7efdd',
                  color: '#2a1420',
                  p: 2,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: isLate ? '2px solid #c15c71' : '1px solid rgba(211, 163, 76, 0.2)',
                  cursor: canToggle ? 'pointer' : 'default',
                  '&:hover': canToggle ? { bgcolor: '#efe2c4' } : {},
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Checkbox checked={false} disabled={!canToggle} sx={{ color: '#4a3227', '&.Mui-checked': { color: '#7fa176' } }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2a1420' }}>
                      {t.title}
                    </Typography>
                    {t.description && (
                      <Typography variant="caption" sx={{ color: '#4a3227', display: 'block' }}>
                        {t.description}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {isLate && (
                    <Chip
                      icon={<WarningIcon sx={{ fontSize: 14 }} />}
                      label="Atrasada"
                      size="small"
                      sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  )}
                  {t.assignedToName && (
                    <Chip label={t.assignedToName} size="small" sx={{ bgcolor: '#efe2c4', color: '#4a3227', fontWeight: 600 }} />
                  )}
                  <Typography variant="caption" sx={{ color: '#4a3227', fontWeight: 600 }}>
                    Prazo: {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                  </Typography>
                  {canCreate && (
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(t); }}
                      title="Excluir tarefa"
                      sx={{ color: '#4a3227', '&:hover': { color: '#c15c71' } }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Seção Concluídas */}
      {completedTasks.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#7fa176', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
            Concluídas ({completedTasks.length})
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {completedTasks.map((t) => (
              <Box
                key={t.id}
                onClick={() => canToggle && handleToggle(t)}
                sx={{
                  bgcolor: '#2f1522',
                  color: '#e2cad2',
                  p: 1.5,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: canToggle ? 'pointer' : 'default',
                  opacity: 0.8,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Checkbox checked={true} disabled={!canToggle} sx={{ color: '#7fa176', '&.Mui-checked': { color: '#7fa176' } }} />
                  <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#e2cad2' }}>
                    {t.title}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#e2cad2' }}>
                  {t.assignedToName}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Modal Confirmação de Exclusão */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>Excluir Tarefa?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Tem certeza que deseja excluir <strong>"{deleteTarget?.title}"</strong>? Esta ação não pode ser desfeita.
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

      {/* Modal Criar Tarefa */}
      {canCreate && (
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}>
          <form onSubmit={handleCreate}>
            <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>Nova Tarefa da Liderança</DialogTitle>
            <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="O que precisa ser feito?" required fullWidth value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Comprar materiais para a formação" />
              <TextField label="Responsável" fullWidth value={assignedToName} onChange={(e) => setAssignedToName(e.target.value)} placeholder="Nome do responsável" />
              <TextField label="Prazo limite" type="date" InputLabelProps={{ shrink: true }} fullWidth value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <TextField label="Prioridade" select fullWidth value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                <MenuItem value={TaskPriority.LOW}>Baixa</MenuItem>
                <MenuItem value={TaskPriority.MEDIUM}>Média</MenuItem>
                <MenuItem value={TaskPriority.HIGH}>Alta</MenuItem>
                <MenuItem value={TaskPriority.URGENT}>Urgente</MenuItem>
              </TextField>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOpenModal(false)} sx={{ color: '#4a3227' }}>Cancelar</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700 }}>Salvar Tarefa</Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
};

export default TasksPage;
