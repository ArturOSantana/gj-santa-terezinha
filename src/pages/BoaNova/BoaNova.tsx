import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Alert,
} from '@mui/material';
import { WhatsApp, Email, History } from '@mui/icons-material';
import { RoleGuard } from '../../components/auth/RoleGuard';
import { PageHeader } from '../../components/common/PageHeader';
import { PERMISSIONS } from '../../utils/permissions';
import { WhatsAppBroadcast } from './components/WhatsAppBroadcast';
import { EmailBroadcast } from './components/EmailBroadcast';
import { BroadcastHistory } from './components/BroadcastHistory';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`boanova-tabpanel-${index}`}
      aria-labelledby={`boanova-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const BoaNova: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <RoleGuard roles={PERMISSIONS.COORDINATOR_AND_ABOVE}>
      <Container maxWidth="lg">
        <PageHeader
          title="Boa Nova"
        />

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Bem-vindo ao Boa Nova!</strong> Envie mensagens para os membros via WhatsApp ou E-mail.
            Apenas coordenadores e administradores têm acesso a esta funcionalidade.
          </Typography>
        </Alert>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              icon={<WhatsApp />}
              label="WhatsApp"
              id="boanova-tab-0"
              aria-controls="boanova-tabpanel-0"
            />
            <Tab
              icon={<Email />}
              label="E-mail"
              id="boanova-tab-1"
              aria-controls="boanova-tabpanel-1"
            />
            <Tab
              icon={<History />}
              label="Histórico"
              id="boanova-tab-2"
              aria-controls="boanova-tabpanel-2"
            />
          </Tabs>
        </Paper>

        <TabPanel value={activeTab} index={0}>
          <WhatsAppBroadcast />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <EmailBroadcast />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <BroadcastHistory />
        </TabPanel>
      </Container>
    </RoleGuard>
  );
};

// Made with Bob
