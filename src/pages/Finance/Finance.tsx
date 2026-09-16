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
} from '@mui/material';
import {
  Add as AddIcon,
  AttachFile as FileIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { TerezinhaService } from '../../services/firestore.service';
import { Transaction, TransactionType, TransactionCategory } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';

export const FinancePage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openModal, setOpenModal] = useState(false);

  // Form
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.MEETING_SNACK);
  const [personName, setPersonName] = useState('');
  const [hasReceipt, setHasReceipt] = useState(false);

  const canCreate = user ? hasPermission(user.role, 'coordinator') : false;

  useEffect(() => {
    if (user) setPersonName(user.displayName || '');
    loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    const list = await TerezinhaService.getTransactions();
    setTransactions(list);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    await TerezinhaService.createTransaction({
      type,
      category,
      amount: Number(amount) || 0,
      description,
      date: new Date(),
      personName,
      hasReceipt,
    });

    setAmount('');
    setDescription('');
    setOpenModal(false);
    await loadTransactions();
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const rows = transactions.map((tx) => {
      const isIncome = tx.type === TransactionType.INCOME;
      return `<tr>
        <td>${new Date(tx.date).toLocaleDateString('pt-BR')}</td>
        <td>${tx.description}</td>
        <td>${tx.personName || 'Coordenação'}</td>
        <td style="color:${isIncome ? '#4f6b4f' : '#9a3450'};font-weight:700;">${isIncome ? '+' : '−'} R$ ${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td>${tx.hasReceipt ? '✔ OK' : '⚠ Pendente'}</td>
      </tr>`;
    }).join('');
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Extrato — GJ Santa Terezinha</title>
    <style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;color:#2a1420}h1{font-size:1.4rem}table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#241019;color:#f4e6e9;padding:8px 10px;text-align:left}td{padding:8px 10px;border-bottom:1px solid #e5e7eb}tfoot td{font-weight:700;background:#f7efdd}@media print{button{display:none}}</style>
    </head><body>
    <h1>Extrato do Caixa — GJ Santa Terezinha</h1>
    <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
    <table><thead><tr><th>Data</th><th>Descrição</th><th>Responsável</th><th>Valor</th><th>Comprovante</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="3">Saldo Final</td><td style="color:${balance >= 0 ? '#4f6b4f' : '#9a3450'}">R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td></td></tr></tfoot>
    </table>
    <br/><button onclick="window.print()">Imprimir / Salvar PDF</button>
    </body></html>`);
    printWindow.document.close();
  };

  const totalIncome = transactions.filter((t) => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const withoutReceipt = transactions.filter((t) => t.type === TransactionType.EXPENSE && !t.hasReceipt).reduce((acc, t) => acc + t.amount, 0);
  const withoutReceiptCount = transactions.filter((t) => t.type === TransactionType.EXPENSE && !t.hasReceipt).length;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#f4e6e9' }}>
            Caixa & Tesouraria
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {canCreate && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportPDF}
              sx={{ borderColor: '#d3a34c', color: '#d3a34c', fontWeight: 700, textTransform: 'none' }}
            >
              Exportar PDF
            </Button>
          )}
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenModal(true)}
              sx={{ bgcolor: '#c15c71', color: '#fff', '&:hover': { bgcolor: '#9a3450' }, fontWeight: 700 }}
            >
              Novo Lançamento
            </Button>
          )}
        </Box>
      </Box>

      {/* Cartões de Resumo */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ p: 2.5, bgcolor: '#f7efdd', color: '#2a1420', borderRadius: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
            <Typography variant="caption" sx={{ color: '#4a3227', fontWeight: 700 }}>SALDO ATUAL</Typography>
            <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontVariantNumeric: 'tabular-nums', my: 0.5 }}>
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: balance >= 0 ? '#7fa176' : '#c15c71', fontWeight: 700 }}>
              ● {balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ p: 2.5, bgcolor: '#f7efdd', color: '#2a1420', borderRadius: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
            <Typography variant="caption" sx={{ color: '#4f6b4f', fontWeight: 700 }}>TOTAL ENTRADAS</Typography>
            <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#4f6b4f', fontVariantNumeric: 'tabular-nums', my: 0.5 }}>
              + R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: '#4a3227' }}>Total de receitas registradas</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ p: 2.5, bgcolor: '#f7efdd', color: '#2a1420', borderRadius: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', border: withoutReceipt > 0 ? '2px solid #c15c71' : 'none' }}>
            <Typography variant="caption" sx={{ color: '#c15c71', fontWeight: 700 }}>SEM COMPROVANTE</Typography>
            <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#c15c71', fontVariantNumeric: 'tabular-nums', my: 0.5 }}>
              R$ {withoutReceipt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              {withoutReceiptCount > 0 ? (
                <>
                  <WarningIcon sx={{ fontSize: 13, color: '#9a3450' }} />
                  <Typography variant="caption" sx={{ color: '#9a3450', fontWeight: 700 }}>
                    {`${withoutReceiptCount} despesa${withoutReceiptCount > 1 ? 's' : ''} pendente${withoutReceiptCount > 1 ? 's' : ''} de nota`}
                  </Typography>
                </>
              ) : (
                <>
                  <CheckIcon sx={{ fontSize: 13, color: '#4f6b4f' }} />
                  <Typography variant="caption" sx={{ color: '#4f6b4f', fontWeight: 700 }}>
                    Todas com comprovante
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Livro Caixa / Tabela de Lançamentos */}
      <Box sx={{ bgcolor: '#f7efdd', color: '#2a1420', p: 3, borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
        <Typography variant="subtitle1" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, mb: 2 }}>
          Extrato Detalhado do Caixa
        </Typography>

        {transactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5, color: '#4a3227' }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Nenhuma transação registrada no caixa.
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b5347' }}>
              Utilize o botão &quot;Novo Lançamento&quot; para registrar entradas e saídas.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {transactions.map((tx) => {
              const isIncome = tx.type === TransactionType.INCOME;
              return (
                <Box
                  key={tx.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(107, 83, 71, 0.12)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: isIncome ? '#efe2c4' : '#f4e6e9',
                        color: isIncome ? '#4f6b4f' : '#9a3450',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                      }}
                    >
                      {isIncome ? '+' : '−'}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2a1420' }}>
                        {tx.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4a3227' }}>
                        {new Date(tx.date).toLocaleDateString('pt-BR')} • {tx.personName || 'Coordenação'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {tx.hasReceipt ? (
                      <Chip icon={<CheckIcon sx={{ fontSize: 14 }} />} label="Comprovante OK" size="small" sx={{ bgcolor: '#efe2c4', color: '#4f6b4f', fontWeight: 700, fontSize: '0.7rem' }} />
                    ) : (
                      <Chip icon={<WarningIcon sx={{ fontSize: 14 }} />} label="Sem Comprovante" size="small" sx={{ bgcolor: '#f4e6e9', color: '#c15c71', fontWeight: 700, fontSize: '0.7rem' }} />
                    )}

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: '"Fraunces", serif',
                        fontWeight: 700,
                        color: isIncome ? '#4f6b4f' : '#9a3450',
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: 90,
                        textAlign: 'right',
                      }}
                    >
                      {isIncome ? '+' : '−'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Modal Lançamento */}
      {canCreate && (
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}>
          <form onSubmit={handleCreate}>
            <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>Novo Lançamento no Caixa</DialogTitle>
            <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant={type === TransactionType.EXPENSE ? 'contained' : 'outlined'}
                  onClick={() => setType(TransactionType.EXPENSE)}
                  sx={{ bgcolor: type === TransactionType.EXPENSE ? '#c15c71' : 'transparent', color: type === TransactionType.EXPENSE ? '#fff' : '#c15c71' }}
                >
                  Saída / Despesa
                </Button>
                <Button
                  fullWidth
                  variant={type === TransactionType.INCOME ? 'contained' : 'outlined'}
                  onClick={() => setType(TransactionType.INCOME)}
                  sx={{ bgcolor: type === TransactionType.INCOME ? '#7fa176' : 'transparent', color: type === TransactionType.INCOME ? '#fff' : '#7fa176' }}
                >
                  Entrada / Receita
                </Button>
              </Box>
              <TextField label="Valor (R$)" required fullWidth type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
              <TextField label="Descrição" required fullWidth value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Material da formação" />
              <TextField label="Responsável" fullWidth value={personName} onChange={(e) => setPersonName(e.target.value)} />
              <Button
                variant="outlined"
                component="label"
                startIcon={hasReceipt ? <CheckIcon sx={{ color: '#4f6b4f' }} /> : <FileIcon />}
                sx={{ borderColor: '#4a3227', color: '#2a1420' }}
                onClick={() => setHasReceipt(true)}
              >
                {hasReceipt ? 'Comprovante anexado (foto/PDF)' : 'Anexar Foto do Comprovante'}
              </Button>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOpenModal(false)} sx={{ color: '#4a3227' }}>Cancelar</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700 }}>Salvar Lançamento</Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
};

export default FinancePage;
