/**
 * Modal de login para a Área da Coordenação
 */
import React, { useEffect, useRef, useState } from 'react';
import logoVert from '../../assets/logotipo_jovens_vert.png';
import { useSwipeDown } from './useSwipeDown';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

type Mode = 'login' | 'forgot' | 'forgot-sent';

const LoginModal: React.FC<LoginModalProps> = ({
  open,
  onClose,
  onSuccess,
  signIn,
  resetPassword,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useSwipeDown(dialogRef, onClose);
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && mode === 'login') {
      // Pequeno delay para garantir que o dialog já abriu
      const t = setTimeout(() => emailInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open, mode]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
      setMode('login');
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      onSuccess();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      const msg  = (err as { message?: string })?.message ?? '';
      if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde alguns minutos e tente de novo.');
      } else if (
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential'
      ) {
        setError('E-mail ou senha incorretos.');
      } else if (msg) {
        // Mensagem do auth.service (ex: "Acesso restrito à liderança..." ou "aguarda aprovação")
        setError(msg);
      } else {
        setError('Não foi possível entrar. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Digite o e-mail para redefinir a senha.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setMode('forgot-sent');
    } catch {
      setError('Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="ag-dialog"
      aria-label="Área da coordenação"
      onCancel={(e) => { e.preventDefault(); onClose(); }}
    >
      <button className="ag-dialog-close" onClick={onClose} aria-label="Fechar">×</button>

      <div className="ag-login-wrap">
        <img src={logoVert} alt="Jovens Sta. Terezinha" className="ag-login-logo" />

        {mode === 'login' && (
          <>
            <h2 className="ag-login-title">Área da coordenação</h2>
            <p className="ag-login-sub">Entre com a conta autorizada para publicar na agenda.</p>

            <form className="ag-form" onSubmit={handleLogin} noValidate>
              <label className="ag-label">
                E-mail
                <input
                  ref={emailInputRef}
                  type="email"
                  className={`ag-input${error ? ' error' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoCapitalize="none"
                />
              </label>
              <label className="ag-label">
                Senha
                <input
                  type="password"
                  className={`ag-input${error ? ' error' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>

              {error && (
                <div role="status" aria-live="assertive" className="ag-status err">
                  {error}
                </div>
              )}

              <button type="submit" className="ag-btn" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <button className="ag-btn-link" onClick={() => { setMode('forgot'); setError(''); }}>
              Esqueci a senha
            </button>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h2 className="ag-login-title">Redefinir senha</h2>
            <p className="ag-login-sub">Digite o e-mail da conta e enviaremos um link.</p>

            <form className="ag-form" onSubmit={handleForgot} noValidate>
              <label className="ag-label">
                E-mail
                <input
                  type="email"
                  className={`ag-input${error ? ' error' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              {error && (
                <div role="status" aria-live="assertive" className="ag-status err">
                  {error}
                </div>
              )}

              <button type="submit" className="ag-btn" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link'}
              </button>
            </form>

            <button className="ag-btn-link" onClick={() => { setMode('login'); setError(''); }}>
              Voltar ao login
            </button>
          </>
        )}

        {mode === 'forgot-sent' && (
          <>
            <h2 className="ag-login-title">E-mail enviado</h2>
            <p className="ag-login-sub">
              Verifique sua caixa de entrada e siga as instruções para redefinir a senha.
            </p>
            <button className="ag-btn" style={{ marginTop: 16 }} onClick={() => setMode('login')}>
              Voltar ao login
            </button>
          </>
        )}
      </div>
    </dialog>
  );
};

export default LoginModal;
