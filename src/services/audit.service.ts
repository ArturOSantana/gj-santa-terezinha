import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { AuditLog } from '../types';

export const logAuditEvent = async (
  action: string,
  entity: string,
  entityId: string,
  details?: Record<string, any>
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    const now = new Date();

    const logEntry: Omit<AuditLog, 'id'> = {
      actorUserId: currentUser?.uid || 'anonymous_or_system',
      actorName: currentUser?.displayName || currentUser?.email || 'Sistema / Convidado',
      action,
      entity,
      entityId,
      details: details || {},
      createdAt: now,
    };

    await addDoc(collection(db, 'audit_logs'), {
      ...logEntry,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Não foi possível gravar log de auditoria no Firestore:', error);
  }
};

export const getRecentAuditLogs = async (maxLogs: number = 50): Promise<AuditLog[]> => {
  try {
    const q = query(
      collection(db, 'audit_logs'),
      orderBy('createdAt', 'desc'),
      limit(maxLogs)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
    })) as AuditLog[];
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return [];
  }
};
