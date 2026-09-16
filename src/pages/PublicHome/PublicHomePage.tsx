import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Container,
  CircularProgress,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  ConfirmationNumber as EventIcon,
  QrCode2 as QrIcon,
  LocationOn as LocationIcon,
  Share as ShareIcon,
  Lock as LockIcon,
  ArrowForward as ArrowIcon,
  Church as ChurchIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TerezinhaService } from '../../services/firestore.service';
import { GoogleCalendarService } from '../../services/googleCalendar.service';
import { Event, PublicPageConfig, DEFAULT_PUBLIC_PAGE_CONFIG, PublicCard } from '../../types';

export const PublicHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<PublicPageConfig>({ ...DEFAULT_PUBLIC_PAGE_CONFIG });
  const [customCards, setCustomCards] = useState<PublicCard[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [firestoreEvents, cfg, cards] = await Promise.all([
          TerezinhaService.getEvents(),
          TerezinhaService.getPublicPageConfig(),
          TerezinhaService.getPublicCards(),
        ]);
        setConfig(cfg);
        setCustomCards(cards.filter((c) => c.visible));

        let googleEvents: any[] = [];
        try {
          googleEvents = await GoogleCalendarService.fetchEvents();
        } catch (error) {
          console.error('Erro ao buscar eventos do Google Calendar:', error);
        }

        const publicFirestore = firestoreEvents.filter((e) => e.isPublic);
        const publicGoogle = googleEvents.map((ge, index) => ({
          ...ge,
          id: ge.id || `google-${index}-${Date.now()}`,
          isPublic: true,
          date: new Date(ge.date),
        }));

        const merged = [...publicFirestore, ...publicGoogle];
        const seen = new Set<string>();
        const uniqueEvents = merged.filter((e) => {
          if (seen.has(e.id)) return false;
          seen.add(e.id);
          return true;
        });

        setEvents(uniqueEvents);
      } catch (error) {
        console.error('Erro ao carregar eventos na home:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const retreatEvent = events.find((e) => e.category === 'retreat' && e.isPublic) || null;
  const featuredCustomCard = !retreatEvent && customCards.length > 0 ? customCards[0] : null;
  const remainingCustomCards = retreatEvent ? customCards : customCards.slice(1);

  const now = new Date();
  const nextEvents = events
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const handleShareGroup = () => {
    const text = `${config.shareMessage}\n${window.location.origin}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const { sections } = config;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#241019',
        color: '#f4e6e9',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Topo / Navbar Pública */}
      <Box
        sx={{
          borderBottom: '1px solid rgba(211, 163, 76, 0.2)',
          bgcolor: '#2f1522',
          py: 1.5,
          px: { xs: 2, sm: 4 },
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38, height: 38, borderRadius: '10px',
                bgcolor: 'rgba(193, 92, 113, 0.2)',
                border: '1px solid rgba(193, 92, 113, 0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChurchIcon sx={{ color: '#c15c71', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: { xs: '1rem', sm: '1.2rem' }, color: '#f4e6e9', lineHeight: 1.1 }}
              >
                Santa Terezinha
              </Typography>
              <Typography variant="caption" sx={{ color: '#caa2ae', fontSize: '0.72rem', display: 'block' }}>
                Grupo de Jovens • Paróquia Santa Terezinha
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            startIcon={<LockIcon sx={{ fontSize: 14 }} />}
            onClick={() => navigate('/login')}
            sx={{
              color: '#d3a34c', borderColor: 'rgba(211, 163, 76, 0.4)',
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'none',
              px: 1.8, py: 0.6, borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(211, 163, 76, 0.1)', borderColor: '#d3a34c' },
            }}
            variant="outlined"
          >
            Área da Liderança →
          </Button>
        </Container>
      </Box>

      {/* Hero Section */}
      {sections.hero && (
        <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6 }, flexGrow: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 }, maxWidth: 680, mx: 'auto' }}>
            {config.heroQuote && (
              <Chip
                icon={<FavoriteIcon sx={{ fontSize: '14px !important', color: '#c15c71 !important' }} />}
                label={config.heroQuote}
                size="small"
                sx={{
                  bgcolor: 'rgba(193, 92, 113, 0.2)', color: '#f4e6e9',
                  border: '1px solid rgba(193, 92, 113, 0.4)', fontWeight: 700, mb: 2,
                }}
              />
            )}
            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700,
                fontSize: { xs: '2.2rem', sm: '3.2rem' }, lineHeight: 1.1, color: '#ffffff', mb: 2,
              }}
            >
              {config.heroTitle}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#caa2ae', fontSize: { xs: '1rem', sm: '1.15rem' }, lineHeight: 1.6, mb: 3.5 }}
            >
              {config.heroSubtitle}
            </Typography>

            {/* Ações Rápidas Públicas */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
              {retreatEvent && sections.retreat_highlight ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<EventIcon />}
                  onClick={() => navigate(`/p/${retreatEvent.publicSlug || retreatEvent.id}`)}
                  sx={{
                    bgcolor: '#c15c71', color: '#fff', fontWeight: 800,
                    px: 3, py: 1.2, borderRadius: 2, '&:hover': { bgcolor: '#9a3450' },
                  }}
                >
                  {retreatEvent.title}
                </Button>
              ) : featuredCustomCard && sections.retreat_highlight ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<EventIcon />}
                  onClick={() => {
                    if (featuredCustomCard.openInNewTab) {
                      window.open(featuredCustomCard.externalUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      window.location.href = featuredCustomCard.externalUrl;
                    }
                  }}
                  sx={{
                    bgcolor: '#c15c71', color: '#fff', fontWeight: 800,
                    px: 3, py: 1.2, borderRadius: 2, '&:hover': { bgcolor: '#9a3450' },
                  }}
                >
                  {featuredCustomCard.buttonLabel || featuredCustomCard.title}
                </Button>
              ) : null}
              {config.showCalendarButton && sections.public_calendar_link && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CalendarIcon />}
                  onClick={() => navigate('/p/agenda')}
                  sx={{
                    borderColor: '#d3a34c', color: '#d3a34c', fontWeight: 700, px: 2.5, borderRadius: 2,
                    '&:hover': { borderColor: '#f7efdd', color: '#f7efdd', bgcolor: 'rgba(211, 163, 76, 0.1)' },
                  }}
                >
                  Ver Calendário
                </Button>
              )}
              {config.showCheckinButton && sections.checkin_link && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<QrIcon />}
                  onClick={() => navigate('/p/checkin')}
                  sx={{
                    borderColor: 'rgba(202, 162, 174, 0.4)', color: '#f4e6e9', fontWeight: 700, px: 2.5, borderRadius: 2,
                    '&:hover': { borderColor: '#f4e6e9', bgcolor: 'rgba(255, 255, 255, 0.05)' },
                  }}
                >
                  Check-in no Encontro
                </Button>
              )}
            </Box>
          </Box>

          {/* Grade de Destaques */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#c15c71' }} />
            </Box>
          ) : (
            <Grid container spacing={3.5}>
              {/* Card de Destaque: Retiro */}
              {sections.retreat_highlight && (
                <Grid size={{ xs: 12, md: sections.next_events ? 6 : 12 }}>
                  {retreatEvent ? (
                    <Box
                      sx={{
                        bgcolor: '#f7efdd', color: '#2a1420', borderRadius: '16px',
                        p: { xs: 3, sm: 4 }, boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                        border: '1px solid rgba(211, 163, 76, 0.3)', height: '100%',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Chip
                            label="INSCRIÇÕES ABERTAS"
                            size="small"
                            sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}
                          />
                          {retreatEvent.price ? (
                            <Typography variant="caption" sx={{ color: '#7fa176', fontWeight: 800 }}>
                              R$ {retreatEvent.price.toFixed(2).replace('.', ',')} • Vagas Limitadas
                            </Typography>
                          ) : null}
                        </Box>

                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700,
                            fontSize: { xs: '1.6rem', sm: '2rem' }, color: '#2a1420', lineHeight: 1.15, mb: 1,
                          }}
                        >
                          {retreatEvent.title}
                        </Typography>
                        {retreatEvent.themeVerse && (
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#6b5347', mb: 2 }}>
                            {retreatEvent.themeVerse}
                          </Typography>
                        )}
                        {retreatEvent.description && (
                          <Typography variant="body2" sx={{ color: '#2a1420', lineHeight: 1.5, mb: 3 }}>
                            {retreatEvent.description}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon sx={{ fontSize: 18, color: '#c15c71' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2a1420' }}>
                              {new Date(retreatEvent.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                              {retreatEvent.endDate
                                ? ` a ${new Date(retreatEvent.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`
                                : ''}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon sx={{ fontSize: 18, color: '#c15c71' }} />
                            <Typography variant="body2" sx={{ color: '#6b5347' }}>
                              {retreatEvent.location}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        endIcon={<ArrowIcon />}
                        onClick={() => navigate(`/p/${retreatEvent.publicSlug || retreatEvent.id}`)}
                        sx={{
                          bgcolor: '#2a1420', color: '#f7efdd', fontWeight: 800,
                          py: 1.4, borderRadius: 2, '&:hover': { bgcolor: '#421a30' },
                        }}
                      >
                        Garantir Minha Vaga (Sem Login)
                      </Button>
                    </Box>
                  ) : featuredCustomCard ? (
                    (() => {
                      const isHighlight = featuredCustomCard.style === 'highlight';
                      const isDark = featuredCustomCard.style === 'dark';
                      const bgColor = isHighlight ? '#f7efdd' : isDark ? '#2f1522' : 'rgba(247, 239, 221, 0.05)';
                      const textColor = isHighlight ? '#2a1420' : '#f4e6e9';
                      const borderColor = isHighlight
                        ? 'rgba(211, 163, 76, 0.3)'
                        : isDark
                        ? 'rgba(211, 163, 76, 0.2)'
                        : 'rgba(211, 163, 76, 0.35)';
                      const subtitleColor = isHighlight ? '#6b5347' : '#caa2ae';
                      const metaColor = isHighlight ? '#4a3227' : '#caa2ae';
                      const btnBg = isHighlight ? '#2a1420' : '#c15c71';
                      const btnHover = isHighlight ? '#421a30' : '#9a3450';
                      const btnText = '#f7efdd';

                      return (
                        <Box
                          sx={{
                            bgcolor: bgColor,
                            color: textColor,
                            borderRadius: '16px',
                            p: { xs: 3, sm: 4 },
                            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                            border: `1px solid ${borderColor}`,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                              {featuredCustomCard.badge ? (
                                <Chip
                                  label={featuredCustomCard.badge}
                                  size="small"
                                  sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}
                                />
                              ) : <Box />}
                              {featuredCustomCard.priceText && (
                                <Typography variant="caption" sx={{ color: '#7fa176', fontWeight: 800 }}>
                                  {featuredCustomCard.priceText}
                                </Typography>
                              )}
                            </Box>

                            <Typography
                              variant="h4"
                              sx={{
                                fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700,
                                fontSize: { xs: '1.6rem', sm: '2rem' }, color: textColor, lineHeight: 1.15, mb: 1,
                              }}
                            >
                              {featuredCustomCard.title}
                            </Typography>
                            {featuredCustomCard.verse && (
                              <Typography variant="body2" sx={{ fontStyle: 'italic', color: subtitleColor, mb: 2 }}>
                                {featuredCustomCard.verse}
                              </Typography>
                            )}
                            {featuredCustomCard.description && (
                              <Typography variant="body2" sx={{ color: metaColor, lineHeight: 1.5, mb: 3 }}>
                                {featuredCustomCard.description}
                              </Typography>
                            )}

                            {(featuredCustomCard.dateText || featuredCustomCard.location) && (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                                {featuredCustomCard.dateText && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarIcon sx={{ fontSize: 18, color: '#c15c71' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: textColor }}>
                                      {featuredCustomCard.dateText}
                                    </Typography>
                                  </Box>
                                )}
                                {featuredCustomCard.location && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationIcon sx={{ fontSize: 18, color: '#c15c71' }} />
                                    <Typography variant="body2" sx={{ color: subtitleColor }}>
                                      {featuredCustomCard.location}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            )}
                          </Box>

                          <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            endIcon={<ArrowIcon />}
                            onClick={() => {
                              if (featuredCustomCard.openInNewTab) {
                                window.open(featuredCustomCard.externalUrl, '_blank', 'noopener,noreferrer');
                              } else {
                                window.location.href = featuredCustomCard.externalUrl;
                              }
                            }}
                            sx={{
                              bgcolor: btnBg, color: btnText, fontWeight: 800,
                              py: 1.4, borderRadius: 2, '&:hover': { bgcolor: btnHover },
                            }}
                          >
                            {featuredCustomCard.buttonLabel || 'Saiba Mais'}
                          </Button>
                        </Box>
                      );
                    })()
                  ) : (
                    <Box
                      sx={{
                        bgcolor: '#f7efdd', color: '#2a1420', borderRadius: '16px',
                        p: { xs: 3, sm: 4 }, boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                        border: '1px solid rgba(211, 163, 76, 0.3)', height: '100%',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: 48, height: 48, borderRadius: '50%',
                          bgcolor: 'rgba(193, 92, 113, 0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5,
                        }}
                      >
                        <ChurchIcon sx={{ color: '#c15c71', fontSize: 28 }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, mb: 1 }}>
                        Bem-vindo ao GJ Santa Terezinha!
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4a3227', lineHeight: 1.6 }}>
                        Acompanhe a agenda de encontros e fique de olho nas inscrições para os próximos retiros e eventos.
                      </Typography>
                    </Box>
                  )}
                </Grid>
              )}

              {/* Lista de Próximos Encontros */}
              {sections.next_events && (
                <Grid size={{ xs: 12, md: sections.retreat_highlight ? 6 : 12 }}>
                  <Box
                    sx={{
                      bgcolor: '#2f1522', borderRadius: '16px', p: { xs: 3, sm: 4 },
                      border: '1px solid rgba(211, 163, 76, 0.2)', height: '100%',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                        <Typography variant="h5" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#f4e6e9' }}>
                          Próximos Encontros
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => navigate('/p/agenda')}
                          sx={{ color: '#d3a34c', fontWeight: 700, fontSize: '0.75rem', textTransform: 'none' }}
                        >
                          Ver todos →
                        </Button>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {nextEvents.length === 0 ? (
                          <Typography variant="body2" sx={{ color: '#caa2ae' }}>
                            Nenhum evento agendado no momento.
                          </Typography>
                        ) : nextEvents.map((evt) => (
                          <Box
                            key={evt.id}
                            sx={{
                              p: 2, borderRadius: 2, bgcolor: 'rgba(244, 230, 233, 0.05)',
                              border: '1px solid rgba(211, 163, 76, 0.15)',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}
                          >
                            <Box>
                              <Typography variant="caption" sx={{ color: '#d3a34c', fontWeight: 700, display: 'block' }}>
                                {new Date(evt.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()} • {evt.startTime || '19:00'}
                              </Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f4e6e9' }}>
                                {evt.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#caa2ae' }}>
                                {evt.location?.split('—')[0] || 'Paróquia Santa Terezinha'}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => navigate(`/p/${evt.publicSlug || evt.id}`)}
                              sx={{
                                borderColor: 'rgba(211, 163, 76, 0.3)', color: '#f4e6e9',
                                fontSize: '0.72rem', fontWeight: 700, borderRadius: 1.5,
                                '&:hover': { borderColor: '#d3a34c', bgcolor: 'rgba(211, 163, 76, 0.1)' },
                              }}
                            >
                              Ver Detalhes
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Botão Compartilhar WhatsApp */}
                    {sections.share_whatsapp && config.showShareButton && (
                      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(211, 163, 76, 0.15)' }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<ShareIcon />}
                          onClick={handleShareGroup}
                          sx={{
                            borderColor: '#7fa176', color: '#7fa176', fontWeight: 700, py: 1, borderRadius: 2,
                            '&:hover': { borderColor: '#a3c99b', color: '#a3c99b', bgcolor: 'rgba(127, 161, 118, 0.1)' },
                          }}
                        >
                          {config.shareButtonText}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </Container>
      )}

      {/* Cards Customizados do ADM */}
      {sections.custom_cards && remainingCustomCards.length > 0 && (
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
          <Grid container spacing={3}>
            {remainingCustomCards.map((card) => {
              const isHighlight = card.style === 'highlight';
              const isDark = card.style === 'dark';

              const bgColor = isHighlight ? '#f7efdd' : isDark ? '#2f1522' : 'transparent';
              const textColor = isHighlight ? '#2a1420' : '#f4e6e9';
              const borderColor = isHighlight
                ? 'rgba(211, 163, 76, 0.3)'
                : isDark
                ? 'rgba(211, 163, 76, 0.2)'
                : 'rgba(211, 163, 76, 0.35)';
              const subtitleColor = isHighlight ? '#6b5347' : '#caa2ae';
              const metaColor = isHighlight ? '#4a3227' : '#caa2ae';
              const btnBg = isHighlight ? '#2a1420' : '#c15c71';
              const btnHover = isHighlight ? '#421a30' : '#9a3450';
              const btnText = '#f7efdd';

              return (
                <Grid key={card.id} size={{ xs: 12, md: 6, lg: 4 }}>
                  <Box
                    sx={{
                      bgcolor: bgColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '16px',
                      p: { xs: 3, sm: 3.5 },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isHighlight || isDark ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
                    }}
                  >
                    <Box>
                      {card.badge && (
                        <Chip
                          label={card.badge} size="small"
                          sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 800, fontSize: '0.7rem', mb: 1.5 }}
                        />
                      )}
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700,
                          fontSize: { xs: '1.4rem', sm: '1.6rem' }, lineHeight: 1.2,
                          color: textColor, mb: 1,
                        }}
                      >
                        {card.title}
                      </Typography>
                      {card.verse && (
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: subtitleColor, mb: 1.5 }}>
                          {card.verse}
                        </Typography>
                      )}
                      {card.description && (
                        <Typography variant="body2" sx={{ color: metaColor, lineHeight: 1.55, mb: 2 }}>
                          {card.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 2.5 }}>
                        {card.dateText && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon sx={{ fontSize: 16, color: '#c15c71' }} />
                            <Typography variant="body2" sx={{ color: textColor, fontWeight: 600, fontSize: '0.88rem' }}>
                              {card.dateText}
                            </Typography>
                          </Box>
                        )}
                        {card.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon sx={{ fontSize: 16, color: '#c15c71' }} />
                            <Typography variant="body2" sx={{ color: metaColor, fontSize: '0.85rem' }}>
                              {card.location}
                            </Typography>
                          </Box>
                        )}
                        {card.priceText && (
                          <Typography variant="body2" sx={{ color: '#7fa176', fontWeight: 700, fontSize: '0.88rem' }}>
                            💰 {card.priceText}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Button
                      fullWidth variant="contained" size="large"
                      endIcon={<ArrowIcon />}
                      onClick={() => {
                        if (card.openInNewTab) {
                          window.open(card.externalUrl, '_blank', 'noopener,noreferrer');
                        } else {
                          window.location.href = card.externalUrl;
                        }
                      }}
                      sx={{
                        bgcolor: btnBg, color: btnText, fontWeight: 800,
                        py: 1.3, borderRadius: 2, '&:hover': { bgcolor: btnHover },
                      }}
                    >
                      {card.buttonLabel}
                    </Button>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      )}

      {/* Rodapé */}
      <Box sx={{ borderTop: '1px solid rgba(211, 163, 76, 0.15)', bgcolor: '#1d0b14', py: 3, px: 2, textAlign: 'center' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#caa2ae' }}>
            © {new Date().getFullYear()} {config.footerText}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button size="small" onClick={() => navigate('/p/agenda')} sx={{ color: '#caa2ae', fontSize: '0.75rem', textTransform: 'none' }}>
              Agenda
            </Button>
            {retreatEvent && sections.retreat_highlight && (
              <Button size="small" onClick={() => navigate(`/p/${retreatEvent.publicSlug || retreatEvent.id}`)} sx={{ color: '#caa2ae', fontSize: '0.75rem', textTransform: 'none' }}>
                Inscrições
              </Button>
            )}
            <Button size="small" onClick={() => navigate('/login')} sx={{ color: '#d3a34c', fontSize: '0.75rem', fontWeight: 700, textTransform: 'none' }}>
              Área da Coordenação
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicHomePage;
