import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  Save as SaveIcon,
  OpenInNew as PreviewIcon,
  Refresh as ResetIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibleIcon,
  VisibilityOff as HiddenIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { TerezinhaService } from '../../services/firestore.service';
import {
  PublicPageConfig,
  PublicPageSection,
  DEFAULT_PUBLIC_PAGE_CONFIG,
  PublicCard,
  PublicCardStyle,
  EMPTY_PUBLIC_CARD,
} from '../../types';

// ============================================================================
// CONSTANTES DE EXIBIÇÃO
// ============================================================================

const SECTION_LABELS: Record<PublicPageSection, string> = {
  hero: 'Seção Hero (título + subtítulo + botões)',
  retreat_highlight: 'Destaque do Retiro (card principal)',
  next_events: 'Próximos Encontros (lista lateral)',
  share_whatsapp: 'Botão Compartilhar no WhatsApp',
  public_calendar_link: 'Botão "Ver Calendário"',
  checkin_link: 'Botão "Check-in no Encontro"',
  custom_cards: 'Cards Customizados (retiro, atividades, etc.)',
};

const SECTION_DESCRIPTIONS: Record<PublicPageSection, string> = {
  hero: 'Bloco central com título do grupo, subtítulo e botões de ação rápida.',
  retreat_highlight: 'Card em destaque com o próximo retiro aberto para inscrições.',
  next_events: 'Lista dos 3 próximos eventos públicos.',
  share_whatsapp: 'Botão verde para convidar amigos pelo WhatsApp.',
  public_calendar_link: 'Botão dourado que leva para /p/agenda.',
  checkin_link: 'Botão que leva para /p/checkin.',
  custom_cards: 'Cards que você cria manualmente com link externo de cadastro (Google Forms, WhatsApp, etc.).',
};

const STYLE_LABELS: Record<PublicCardStyle, string> = {
  highlight: '✨ Destaque (fundo claro, chamativo)',
  dark: '🌙 Escuro (fundo escuro, elegante)',
  minimal: '◻ Minimalista (borda, sem fundo colorido)',
};

// ============================================================================
// ESTILOS COMPARTILHADOS
// ============================================================================

const cardSx = {
  bgcolor: '#2f1522',
  border: '1px solid rgba(211, 163, 76, 0.2)',
  borderRadius: '14px',
  color: '#f4e6e9',
};

const labelSx = { color: '#f4e6e9', fontSize: '0.92rem', fontWeight: 600 };
const captionSx = { color: '#caa2ae', fontSize: '0.78rem' };
const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#f4e6e9',
    bgcolor: 'rgba(244, 230, 233, 0.05)',
    '& fieldset': { borderColor: 'rgba(211, 163, 76, 0.25)' },
    '&:hover fieldset': { borderColor: 'rgba(211, 163, 76, 0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#d3a34c' },
  },
  '& .MuiInputLabel-root': { color: '#caa2ae' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#d3a34c' },
};

const dialogInputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#2a1420',
    '& fieldset': { borderColor: 'rgba(107, 83, 71, 0.35)' },
    '&:hover fieldset': { borderColor: '#c15c71' },
    '&.Mui-focused fieldset': { borderColor: '#c15c71' },
  },
  '& .MuiInputLabel-root': { color: '#6b5347' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#c15c71' },
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const PublicHomeConfigPage: React.FC = () => {
  const { user } = useAuth();

  // --- Config geral ---
  const [config, setConfig] = useState<PublicPageConfig>({ ...DEFAULT_PUBLIC_PAGE_CONFIG });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Cards customizados ---
  const [cards, setCards] = useState<PublicCard[]>([]);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PublicCard | null>(null);
  const [cardForm, setCardForm] = useState<Omit<PublicCard, 'id' | 'createdAt' | 'updatedAt'>>(
    { ...EMPTY_PUBLIC_CARD }
  );
  const [cardSaving, setCardSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --- Carregar dados ---
  useEffect(() => {
    Promise.all([
      TerezinhaService.getPublicPageConfig(),
      TerezinhaService.getPublicCards(),
    ]).then(([cfg, cds]) => {
      setConfig(cfg);
      setCards(cds);
    }).finally(() => setLoading(false));
  }, []);

  // ============================================================================
  // HANDLERS — CONFIG GERAL
  // ============================================================================

  const handleSectionToggle = (section: PublicPageSection) => {
    setConfig((prev) => ({
      ...prev,
      sections: { ...prev.sections, [section]: !prev.sections[section] },
    }));
  };

  const handleField = (field: keyof PublicPageConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { updatedAt, ...rest } = config;
      await TerezinhaService.savePublicPageConfig(rest, user?.displayName || 'ADM');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_PUBLIC_PAGE_CONFIG });
  };

  // ============================================================================
  // HANDLERS — CARDS CUSTOMIZADOS
  // ============================================================================

  const openNewCard = () => {
    setEditingCard(null);
    setCardForm({ ...EMPTY_PUBLIC_CARD, order: cards.length });
    setCardDialogOpen(true);
  };

  const openEditCard = (card: PublicCard) => {
    setEditingCard(card);
    const { id, createdAt, updatedAt, ...rest } = card;
    setCardForm(rest);
    setCardDialogOpen(true);
  };

  const handleCardFormField = (
    field: keyof Omit<PublicCard, 'id' | 'createdAt' | 'updatedAt'>,
    value: string | boolean | number
  ) => {
    setCardForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCard = async () => {
    if (!cardForm.title.trim() || !cardForm.buttonLabel.trim() || !cardForm.externalUrl.trim()) return;
    setCardSaving(true);
    try {
      if (editingCard) {
        await TerezinhaService.updatePublicCard(editingCard.id, cardForm);
        setCards((prev) =>
          prev.map((c) =>
            c.id === editingCard.id ? { ...c, ...cardForm, updatedAt: new Date() } : c
          )
        );
      } else {
        const created = await TerezinhaService.createPublicCard(cardForm);
        setCards((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      }
      setCardDialogOpen(false);
    } catch {
      // erro silencioso — o service já loga
    } finally {
      setCardSaving(false);
    }
  };

  const handleToggleCardVisibility = async (card: PublicCard) => {
    const newVisible = !card.visible;
    await TerezinhaService.updatePublicCard(card.id, { visible: newVisible });
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, visible: newVisible } : c)));
  };

  const handleMoveCard = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= cards.length) return;

    const updated = [...cards];
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];

    // Atualiza ordem localmente e no Firestore
    const withOrder = updated.map((c, i) => ({ ...c, order: i }));
    setCards(withOrder);
    await Promise.all([
      TerezinhaService.updatePublicCard(withOrder[index].id, { order: withOrder[index].order }),
      TerezinhaService.updatePublicCard(withOrder[swapIndex].id, { order: withOrder[swapIndex].order }),
    ]);
  };

  const handleDeleteCard = async (id: string) => {
    await TerezinhaService.deletePublicCard(id);
    setCards((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirmId(null);
  };

  // ============================================================================
  // LOADING
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#c15c71' }} />
      </Box>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ maxWidth: 920, mx: 'auto' }}>

      {/* ------------------------------------------------------------------ */}
      {/* CABEÇALHO                                                           */}
      {/* ------------------------------------------------------------------ */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, color: '#f4e6e9', mb: 0.5 }}
          >
            Página Pública
          </Typography>
          <Typography variant="body2" sx={{ color: '#caa2ae' }}>
            Personalize o que aparece em{' '}
            <Box component="a" href="/" target="_blank" sx={{ color: '#d3a34c', textDecoration: 'underline' }}>
              {window.location.origin}/
            </Box>
            {' '}para os jovens e visitantes.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined" startIcon={<PreviewIcon />}
            onClick={() => window.open('/', '_blank')}
            sx={{ borderColor: 'rgba(211, 163, 76, 0.4)', color: '#d3a34c', textTransform: 'none', fontWeight: 700, '&:hover': { borderColor: '#d3a34c', bgcolor: 'rgba(211, 163, 76, 0.1)' } }}
          >
            Ver Página
          </Button>
          <Button
            variant="outlined" startIcon={<ResetIcon />} onClick={handleReset}
            sx={{ borderColor: 'rgba(193, 92, 113, 0.4)', color: '#f4e6e9', textTransform: 'none', fontWeight: 700, '&:hover': { borderColor: '#c15c71', bgcolor: 'rgba(193, 92, 113, 0.1)' } }}
          >
            Restaurar Padrões
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
            onClick={handleSave} disabled={saving}
            sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#9a3450' }, '&:disabled': { bgcolor: 'rgba(193, 92, 113, 0.5)' } }}
          >
            {saving ? 'Salvando…' : 'Salvar Alterações'}
          </Button>
        </Box>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(127, 161, 118, 0.15)', color: '#a3c99b', border: '1px solid rgba(127, 161, 118, 0.3)' }}>
          Configurações salvas com sucesso!
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>

        {/* ------------------------------------------------------------------ */}
        {/* SEÇÕES VISÍVEIS                                                      */}
        {/* ------------------------------------------------------------------ */}
        <Grid size={{ xs: 12 }}>
          <Card sx={cardSx}>
            <CardHeader
              title={<Typography variant="h6" sx={{ color: '#f4e6e9', fontWeight: 700, fontSize: '1rem' }}>Seções Visíveis</Typography>}
              subheader={<Typography variant="caption" sx={captionSx}>Ative ou desative blocos inteiros da página pública.</Typography>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(Object.keys(SECTION_LABELS) as PublicPageSection[]).map((section) => (
                  <Box
                    key={section}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 1.5, borderRadius: 2,
                      bgcolor: config.sections[section] ? 'rgba(127, 161, 118, 0.08)' : 'rgba(244, 230, 233, 0.03)',
                      border: `1px solid ${config.sections[section] ? 'rgba(127, 161, 118, 0.25)' : 'rgba(244, 230, 233, 0.06)'}`,
                    }}
                  >
                    <Box>
                      <Typography sx={labelSx}>{SECTION_LABELS[section]}</Typography>
                      <Typography sx={captionSx}>{SECTION_DESCRIPTIONS[section]}</Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.sections[section]}
                          onChange={() => handleSectionToggle(section)}
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#7fa176' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#7fa176' } }}
                        />
                      }
                      label={
                        <Chip
                          label={config.sections[section] ? 'Visível' : 'Oculto'} size="small"
                          sx={{ bgcolor: config.sections[section] ? 'rgba(127, 161, 118, 0.2)' : 'rgba(193, 92, 113, 0.2)', color: config.sections[section] ? '#a3c99b' : '#e8a0ae', fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      }
                      labelPlacement="start" sx={{ ml: 0, gap: 1 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ------------------------------------------------------------------ */}
        {/* CARDS CUSTOMIZADOS                                                  */}
        {/* ------------------------------------------------------------------ */}
        <Grid size={{ xs: 12 }}>
          <Card sx={cardSx}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#f4e6e9', fontWeight: 700, fontSize: '1rem' }}>
                      Cards Customizados
                    </Typography>
                    <Typography variant="caption" sx={captionSx}>
                      Crie cards para retiros, atividades e eventos com link externo de cadastro (Google Forms, WhatsApp, site, etc.).
                    </Typography>
                  </Box>
                  <Button
                    variant="contained" size="small" startIcon={<AddIcon />}
                    onClick={openNewCard}
                    sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#9a3450' } }}
                  >
                    Novo Card
                  </Button>
                </Box>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              {cards.length === 0 ? (
                <Box
                  sx={{
                    border: '2px dashed rgba(211, 163, 76, 0.2)', borderRadius: 3,
                    p: 4, textAlign: 'center',
                  }}
                >
                  <Typography sx={{ color: '#caa2ae', mb: 1.5 }}>
                    Nenhum card criado ainda.
                  </Typography>
                  <Button
                    variant="outlined" startIcon={<AddIcon />} onClick={openNewCard}
                    sx={{ borderColor: '#d3a34c', color: '#d3a34c', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: 'rgba(211, 163, 76, 0.1)' } }}
                  >
                    Criar primeiro card
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {cards.map((card, index) => (
                    <Box
                      key={card.id}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        p: 2, borderRadius: 2,
                        bgcolor: card.visible ? 'rgba(244, 230, 233, 0.04)' : 'rgba(244, 230, 233, 0.01)',
                        border: `1px solid ${card.visible ? 'rgba(211, 163, 76, 0.2)' : 'rgba(244, 230, 233, 0.07)'}`,
                        opacity: card.visible ? 1 : 0.55,
                      }}
                    >
                      {/* Setas de reordenação */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        <IconButton size="small" onClick={() => handleMoveCard(index, 'up')} disabled={index === 0}
                          sx={{ color: '#caa2ae', p: 0.3, '&:disabled': { opacity: 0.2 } }}>
                          <UpIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleMoveCard(index, 'down')} disabled={index === cards.length - 1}
                          sx={{ color: '#caa2ae', p: 0.3, '&:disabled': { opacity: 0.2 } }}>
                          <DownIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>

                      {/* Informações */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography sx={{ color: '#f4e6e9', fontWeight: 700, fontSize: '0.9rem' }}>
                            {card.title}
                          </Typography>
                          {card.badge && (
                            <Chip label={card.badge} size="small"
                              sx={{ bgcolor: 'rgba(193, 92, 113, 0.25)', color: '#e8a0ae', fontSize: '0.68rem', fontWeight: 700, height: 18 }}
                            />
                          )}
                          <Chip
                            label={card.style === 'highlight' ? 'Destaque' : card.style === 'dark' ? 'Escuro' : 'Minimalista'}
                            size="small"
                            sx={{ bgcolor: 'rgba(211, 163, 76, 0.12)', color: '#d3a34c', fontSize: '0.68rem', height: 18 }}
                          />
                        </Box>
                        {card.dateText && (
                          <Typography sx={{ ...captionSx, mt: 0.3 }}>📅 {card.dateText}{card.location ? ` • 📍 ${card.location}` : ''}</Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                          <LinkIcon sx={{ fontSize: 12, color: '#7fa176' }} />
                          <Typography sx={{ color: '#7fa176', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                            {card.externalUrl}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Ações */}
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        <Tooltip title={card.visible ? 'Ocultar da página' : 'Exibir na página'}>
                          <IconButton size="small" onClick={() => handleToggleCardVisibility(card)}
                            sx={{ color: card.visible ? '#7fa176' : '#caa2ae' }}>
                            {card.visible ? <VisibleIcon sx={{ fontSize: 18 }} /> : <HiddenIcon sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar card">
                          <IconButton size="small" onClick={() => openEditCard(card)} sx={{ color: '#d3a34c' }}>
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir card">
                          <IconButton size="small" onClick={() => setDeleteConfirmId(card.id)} sx={{ color: '#c15c71' }}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ------------------------------------------------------------------ */}
        {/* TEXTOS DO HERO                                                       */}
        {/* ------------------------------------------------------------------ */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={cardSx}>
            <CardHeader
              title={<Typography variant="h6" sx={{ color: '#f4e6e9', fontWeight: 700, fontSize: '1rem' }}>Textos do Hero</Typography>}
              subheader={<Typography variant="caption" sx={captionSx}>Título principal, subtítulo e citação da seção de abertura.</Typography>}
              sx={{ pb: 0 }}
            />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField label="Citação / Versículo (chip acima do título)" value={config.heroQuote}
                onChange={(e) => handleField('heroQuote', e.target.value)} fullWidth size="small" sx={inputSx} />
              <TextField label="Título Principal" value={config.heroTitle}
                onChange={(e) => handleField('heroTitle', e.target.value)} fullWidth size="small" sx={inputSx} />
              <TextField label="Subtítulo / Descrição" value={config.heroSubtitle}
                onChange={(e) => handleField('heroSubtitle', e.target.value)} fullWidth multiline minRows={3} size="small" sx={inputSx} />
            </CardContent>
          </Card>
        </Grid>

        {/* ------------------------------------------------------------------ */}
        {/* BOTÕES DE AÇÃO RÁPIDA                                               */}
        {/* ------------------------------------------------------------------ */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={cardSx}>
            <CardHeader
              title={<Typography variant="h6" sx={{ color: '#f4e6e9', fontWeight: 700, fontSize: '1rem' }}>Botões de Ação Rápida</Typography>}
              subheader={<Typography variant="caption" sx={captionSx}>Botões exibidos na área hero da página pública.</Typography>}
              sx={{ pb: 0 }}
            />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { field: 'showCalendarButton' as const, label: 'Botão "Ver Calendário"' },
                { field: 'showCheckinButton' as const, label: 'Botão "Check-in no Encontro"' },
                { field: 'showShareButton' as const, label: 'Botão Compartilhar WhatsApp' },
              ].map(({ field, label }) => (
                <FormControlLabel key={field}
                  control={
                    <Switch checked={config[field] as boolean}
                      onChange={() => handleField(field, !config[field])}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#7fa176' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#7fa176' } }}
                    />
                  }
                  label={<Typography sx={{ ...labelSx, fontSize: '0.86rem' }}>{label}</Typography>}
                  sx={{ ml: 0, justifyContent: 'space-between', flexDirection: 'row-reverse' }}
                />
              ))}
              <Divider sx={{ borderColor: 'rgba(211, 163, 76, 0.15)', my: 0.5 }} />
              <TextField label="Texto do botão de compartilhamento" value={config.shareButtonText}
                onChange={(e) => handleField('shareButtonText', e.target.value)} fullWidth size="small" sx={inputSx} />
            </CardContent>
          </Card>
        </Grid>

        {/* ------------------------------------------------------------------ */}
        {/* MENSAGEM WHATSAPP                                                   */}
        {/* ------------------------------------------------------------------ */}
        <Grid size={{ xs: 12 }}>
          <Card sx={cardSx}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ color: '#f4e6e9', fontWeight: 700, fontSize: '1rem' }}>Mensagem do Convite WhatsApp</Typography>
                  <Tooltip title="O link da página pública é adicionado automaticamente no final da mensagem.">
                    <IconButton size="small" sx={{ color: '#caa2ae' }}><InfoIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Box>
              }
              subheader={<Typography variant="caption" sx={captionSx}>Texto enviado ao clicar em "Convidar amigo". O link do site é adicionado automaticamente.</Typography>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <TextField value={config.shareMessage}
                onChange={(e) => handleField('shareMessage', e.target.value)}
                fullWidth multiline minRows={3} size="small" sx={inputSx}
                helperText={<Typography component="span" sx={{ color: '#7fa176', fontSize: '0.75rem' }}>Pré-visualização: {config.shareMessage}\n{window.location.origin}/</Typography>}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ------------------------------------------------------------------ */}
        {/* RODAPÉ                                                               */}
        {/* ------------------------------------------------------------------ */}
        <Grid size={{ xs: 12 }}>
          <Card sx={cardSx}>
            <CardHeader
              title={<Typography variant="h6" sx={{ color: '#f4e6e9', fontWeight: 700, fontSize: '1rem' }}>Rodapé</Typography>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <TextField label="Texto do Copyright / Rodapé" value={config.footerText}
                onChange={(e) => handleField('footerText', e.target.value)} fullWidth size="small" sx={inputSx}
                helperText={<Typography component="span" sx={{ color: '#caa2ae', fontSize: '0.75rem' }}>Aparece como: © {new Date().getFullYear()} {config.footerText}</Typography>}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Última atualização */}
        {config.updatedByName && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" sx={{ ...captionSx, display: 'block', textAlign: 'right' }}>
              Última atualização por <strong>{config.updatedByName}</strong> em{' '}
              {config.updatedAt instanceof Date
                ? config.updatedAt.toLocaleString('pt-BR')
                : new Date(config.updatedAt).toLocaleString('pt-BR')}
            </Typography>
          </Grid>
        )}

        {/* Botão salvar rodapé */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
            <Button
              variant="contained" size="large"
              startIcon={saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SaveIcon />}
              onClick={handleSave} disabled={saving}
              sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 800, textTransform: 'none', px: 4, '&:hover': { bgcolor: '#9a3450' } }}
            >
              {saving ? 'Salvando…' : 'Salvar Alterações'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* ================================================================== */}
      {/* DIALOG — CRIAR / EDITAR CARD                                        */}
      {/* ================================================================== */}
      <Dialog
        open={cardDialogOpen}
        onClose={() => setCardDialogOpen(false)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, borderBottom: '1px solid rgba(107, 83, 71, 0.2)' }}>
          {editingCard ? '✏️ Editar Card' : '✨ Novo Card Público'}
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#6b5347', bgcolor: 'rgba(193, 92, 113, 0.08)', p: 1.5, borderRadius: 2, display: 'block' }}>
            Este card aparecerá na página pública para os jovens. O botão abrirá o link externo que você definir (Google Forms, WhatsApp, site, etc.).
          </Typography>

          {/* Título */}
          <TextField label="Título do Card *" required fullWidth size="small"
            value={cardForm.title} onChange={(e) => handleCardFormField('title', e.target.value)}
            placeholder="Ex: Retiro FIAT 2026" sx={dialogInputSx}
          />

          {/* Badge */}
          <TextField label="Etiqueta / Badge (opcional)" fullWidth size="small"
            value={cardForm.badge || ''} onChange={(e) => handleCardFormField('badge', e.target.value)}
            placeholder="Ex: INSCRIÇÕES ABERTAS • EM BREVE • VAGAS LIMITADAS" sx={dialogInputSx}
          />

          {/* Versículo */}
          <TextField label="Versículo / Subtítulo em itálico (opcional)" fullWidth size="small"
            value={cardForm.verse || ''} onChange={(e) => handleCardFormField('verse', e.target.value)}
            placeholder='Ex: "Faça-se em mim segundo a tua palavra"' sx={dialogInputSx}
          />

          {/* Descrição */}
          <TextField label="Descrição (opcional)" fullWidth multiline minRows={2} size="small"
            value={cardForm.description || ''} onChange={(e) => handleCardFormField('description', e.target.value)}
            placeholder="Uma breve descrição do evento ou atividade..." sx={dialogInputSx}
          />

          {/* Data + Local */}
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Data (texto livre)" fullWidth size="small"
                value={cardForm.dateText || ''} onChange={(e) => handleCardFormField('dateText', e.target.value)}
                placeholder="Ex: 14 a 16 de Fev" sx={dialogInputSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Local" fullWidth size="small"
                value={cardForm.location || ''} onChange={(e) => handleCardFormField('location', e.target.value)}
                placeholder="Ex: Casa de Retiro São João" sx={dialogInputSx}
              />
            </Grid>
          </Grid>

          {/* Valor */}
          <TextField label="Valor (texto livre, opcional)" fullWidth size="small"
            value={cardForm.priceText || ''} onChange={(e) => handleCardFormField('priceText', e.target.value)}
            placeholder="Ex: R$ 80,00 • Vagas Limitadas" sx={dialogInputSx}
          />

          <Divider sx={{ borderColor: 'rgba(107, 83, 71, 0.2)' }} />

          {/* Botão */}
          <TextField label="Texto do Botão de Ação *" required fullWidth size="small"
            value={cardForm.buttonLabel} onChange={(e) => handleCardFormField('buttonLabel', e.target.value)}
            placeholder="Ex: Quero me inscrever" sx={dialogInputSx}
          />

          {/* URL */}
          <TextField
            label="Link do Cadastro Externo *" required fullWidth size="small"
            value={cardForm.externalUrl} onChange={(e) => handleCardFormField('externalUrl', e.target.value)}
            placeholder="https://forms.gle/... ou https://wa.me/..."
            helperText="Pode ser Google Forms, WhatsApp, site, qualquer URL."
            sx={dialogInputSx}
          />

          {/* Abrir em nova aba */}
          <FormControlLabel
            control={
              <Switch
                checked={cardForm.openInNewTab}
                onChange={() => handleCardFormField('openInNewTab', !cardForm.openInNewTab)}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#c15c71' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#c15c71' } }}
              />
            }
            label={<Typography sx={{ color: '#4a3227', fontSize: '0.88rem' }}>Abrir link em nova aba</Typography>}
          />

          {/* Estilo */}
          <FormControl size="small" fullWidth>
            <InputLabel sx={{ color: '#6b5347', '&.Mui-focused': { color: '#c15c71' } }}>Estilo Visual do Card</InputLabel>
            <Select
              value={cardForm.style}
              label="Estilo Visual do Card"
              onChange={(e) => handleCardFormField('style', e.target.value as PublicCardStyle)}
              sx={{ color: '#2a1420', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(107, 83, 71, 0.35)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c15c71' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#c15c71' } }}
            >
              {(Object.keys(STYLE_LABELS) as PublicCardStyle[]).map((s) => (
                <MenuItem key={s} value={s}>{STYLE_LABELS[s]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Visível */}
          <FormControlLabel
            control={
              <Switch
                checked={cardForm.visible}
                onChange={() => handleCardFormField('visible', !cardForm.visible)}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#7fa176' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#7fa176' } }}
              />
            }
            label={<Typography sx={{ color: '#4a3227', fontSize: '0.88rem' }}>Exibir na página pública agora</Typography>}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(107, 83, 71, 0.2)', gap: 1 }}>
          <Button onClick={() => setCardDialogOpen(false)} sx={{ color: '#4a3227', textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCard}
            disabled={cardSaving || !cardForm.title.trim() || !cardForm.buttonLabel.trim() || !cardForm.externalUrl.trim()}
            sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700, textTransform: 'none', px: 3, '&:hover': { bgcolor: '#9a3450' } }}
          >
            {cardSaving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : editingCard ? 'Salvar Alterações' : 'Criar Card'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================================================================== */}
      {/* DIALOG — CONFIRMAR EXCLUSÃO                                          */}
      {/* ================================================================== */}
      <Dialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>
          Excluir Card?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#4a3227' }}>
            Esta ação não pode ser desfeita. O card será removido permanentemente da página pública.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteConfirmId(null)} sx={{ color: '#4a3227', textTransform: 'none' }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => deleteConfirmId && handleDeleteCard(deleteConfirmId)}
            sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#9a3450' } }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default PublicHomeConfigPage;
