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
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DocIcon,
  Folder as FolderIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { TerezinhaService } from '../../services/firestore.service';
import { GroupDocument } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';

export const DocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<GroupDocument[]>([]);
  const [openModal, setOpenModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Retiro' | 'Financeiro' | 'Coordenação' | 'Formação' | 'Outros'>('Retiro');
  const [url, setUrl] = useState('');

  const canCreate = user ? hasPermission(user.role, 'leader') : false;

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    const list = await TerezinhaService.getDocuments();
    setDocuments(list);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await TerezinhaService.createDocument({
      title,
      category,
      fileType: 'pdf',
      url: url || '#',
      size: '–',
      isPublic: true,
      uploadedByName: user?.displayName || '',
    });

    setTitle('');
    setUrl('');
    setOpenModal(false);
    await loadDocs();
  };

  const categories = ['Retiro', 'Financeiro', 'Coordenação', 'Formação'] as const;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#f4e6e9' }}>
            Documentos do Grupo
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#c15c71', color: '#fff', '&:hover': { bgcolor: '#9a3450' }, fontWeight: 700 }}
          >
            Novo Documento
          </Button>
        )}
      </Box>

      {/* Seções por Categoria (estilo mini-drive pastoral) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {categories.map((cat) => {
          const docsInCat = documents.filter((d) => d.category === cat);
          return (
            <Box
              key={cat}
              sx={{
                bgcolor: '#f7efdd',
                color: '#2a1420',
                p: 3,
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '1px solid rgba(211, 163, 76, 0.25)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FolderIcon sx={{ color: '#d3a34c', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#2a1420' }}>
                  {cat}
                </Typography>
                <Chip label={`${docsInCat.length} arquivos`} size="small" sx={{ bgcolor: '#efe2c4', color: '#4a3227', fontSize: '0.7rem', fontWeight: 700 }} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {docsInCat.map((d) => (
                  <Box
                    key={d.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(107, 83, 71, 0.12)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <DocIcon sx={{ color: '#c15c71', fontSize: 20 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2a1420' }}>
                          {d.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#4a3227' }}>
                          {d.size || 'PDF'} • Enviado por {d.uploadedByName} em {new Date(d.createdAt).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => alert(`Baixando: ${d.title}`)}
                        sx={{ color: '#4f6b4f', fontWeight: 700, textTransform: 'none' }}
                      >
                        Baixar
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Modal Adicionar Documento */}
      {canCreate && (
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}>
          <form onSubmit={handleCreate}>
            <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>Adicionar Documento / Link</DialogTitle>
            <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Título do Documento" required fullWidth value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Termo de Autorização Menores.pdf" />
              <TextField label="Pasta / Categoria" select fullWidth value={category} onChange={(e) => setCategory(e.target.value as any)}>
                <option value="Retiro">Retiro</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Coordenação">Coordenação</option>
                <option value="Formação">Formação</option>
              </TextField>
              <TextField label="Link ou Arquivo (URL)" fullWidth value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOpenModal(false)} sx={{ color: '#4a3227' }}>Cancelar</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700 }}>Salvar Documento</Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
};

export default DocumentsPage;
