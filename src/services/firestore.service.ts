import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Person,
  PersonStatus,
  Event,
  EventRegistration,
  Task,
  TaskStatus,
  ScheduleAssignment,
  ScheduleStatus,
  AttendanceRecord,
  Meeting,
  GroupDocument,
  Transaction,
  TransactionType,
  DashboardStats,
  PublicPageConfig,
  DEFAULT_PUBLIC_PAGE_CONFIG,
  PublicCard,
} from '../types';
import { logAuditEvent } from './audit.service';

// Helpers para conversão de Timestamps do Firestore
const toDateSafe = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val.toDate === 'function') return val.toDate();
  if (typeof val === 'string' || typeof val === 'number') return new Date(val);
  return new Date();
};

export const TerezinhaService = {
  // ==========================================================================
  // DASHBOARD
  // ==========================================================================
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const people = await this.getPeople();
      const events = await this.getEvents();
      const transactions = await this.getTransactions();
      const tasks = await this.getTasks();

      const totalPeople = people.length;
      const activePeople = people.filter((p) => p.status === PersonStatus.ACTIVE).length;
      const newPeople = people.filter((p) => p.status === PersonStatus.NEW).length;
      const awayPeople = people.filter((p) => p.status === PersonStatus.AWAY).length;

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const upcomingSorted = events
        .filter((e) => new Date(e.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const nextEvent = upcomingSorted[0] || null;

      const totalIncome = transactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((acc, t) => acc + (t.amountCents ? t.amountCents / 100 : t.amount), 0);

      const totalExpense = transactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((acc, t) => acc + (t.amountCents ? t.amountCents / 100 : t.amount), 0);

      const balance = totalIncome - totalExpense;

      const pendingTasksCount = tasks.filter((t) => t.status !== TaskStatus.COMPLETED).length;

      const expensesWithoutReceiptTotal = transactions
        .filter((t) => t.type === TransactionType.EXPENSE && !t.hasReceipt)
        .reduce((acc, t) => acc + (t.amountCents ? t.amountCents / 100 : t.amount), 0);

      const retreatEvent = events.find((e) => e.category === 'retreat');
      let retreatRegistrationsCount = 0;
      let retreatTarget = 40;

      if (retreatEvent) {
        retreatTarget = retreatEvent.maxParticipants || 40;
        const regs = await this.getRegistrationsByEvent(retreatEvent.id);
        retreatRegistrationsCount = regs.length;
      }

      return {
        totalPeople,
        activePeople,
        newPeople,
        awayPeople,
        nextEvent,
        balance,
        pendingTasksCount,
        expensesWithoutReceiptTotal,
        retreatRegistrationsCount,
        retreatTarget,
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas do dashboard:', error);
      throw error;
    }
  },

  // ==========================================================================
  // PESSOAS / JOVENS (People)
  // ==========================================================================
  async getPeople(): Promise<Person[]> {
    try {
      const q = query(collection(db, 'people'), orderBy('name', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          ...d,
          birthDate: d.birthDate ? toDateSafe(d.birthDate) : undefined,
          createdAt: toDateSafe(d.createdAt),
          updatedAt: toDateSafe(d.updatedAt),
        } as Person;
      });
    } catch (error) {
      console.error('Erro ao listar pessoas:', error);
      return [];
    }
  },

  async getPersonById(id: string): Promise<Person | null> {
    try {
      const docRef = doc(db, 'people', id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      const d = snap.data();
      return {
        id: snap.id,
        ...d,
        birthDate: d.birthDate ? toDateSafe(d.birthDate) : undefined,
        createdAt: toDateSafe(d.createdAt),
        updatedAt: toDateSafe(d.updatedAt),
      } as Person;
    } catch (error) {
      console.error(`Erro ao buscar pessoa ${id}:`, error);
      return null;
    }
  },

  async createPerson(person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person> {
    try {
      const now = serverTimestamp();
      const payload: any = {
        ...person,
        createdAt: now,
        updatedAt: now,
      };
      if (person.birthDate) {
        payload.birthDate = Timestamp.fromDate(new Date(person.birthDate));
      }

      const docRef = await addDoc(collection(db, 'people'), payload);
      await logAuditEvent('create', 'people', docRef.id, { name: person.name });

      return {
        ...person,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Erro ao criar pessoa:', error);
      throw error;
    }
  },

  async updatePerson(id: string, updates: Partial<Person>): Promise<void> {
    try {
      const payload: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      if (updates.birthDate) {
        payload.birthDate = Timestamp.fromDate(new Date(updates.birthDate));
      }

      await updateDoc(doc(db, 'people', id), payload);
      await logAuditEvent('update', 'people', id, updates);
    } catch (error) {
      console.error(`Erro ao atualizar pessoa ${id}:`, error);
      throw error;
    }
  },

  async deletePerson(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'people', id));
      await logAuditEvent('delete', 'people', id);
    } catch (error) {
      console.error(`Erro ao excluir pessoa ${id}:`, error);
      throw error;
    }
  },

  // ==========================================================================
  // EVENTOS (Events)
  // ==========================================================================
  async getEvents(): Promise<Event[]> {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          ...d,
          date: toDateSafe(d.date),
          endDate: d.endDate ? toDateSafe(d.endDate) : undefined,
          createdAt: toDateSafe(d.createdAt),
          updatedAt: toDateSafe(d.updatedAt),
          registrationSource: d.registrationSource
            ? {
                ...d.registrationSource,
                lastSyncedAt: d.registrationSource.lastSyncedAt
                  ? toDateSafe(d.registrationSource.lastSyncedAt)
                  : undefined,
              }
            : undefined,
        } as Event;
      });
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      return [];
    }
  },

  async getEventBySlug(slug: string): Promise<Event | null> {
    try {
      // Tentar busca por publicSlug
      const q = query(collection(db, 'events'), where('publicSlug', '==', slug), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0].data();
        return {
          id: snap.docs[0].id,
          ...d,
          date: toDateSafe(d.date),
          endDate: d.endDate ? toDateSafe(d.endDate) : undefined,
          createdAt: toDateSafe(d.createdAt),
          updatedAt: toDateSafe(d.updatedAt),
        } as Event;
      }

      // Fallback: tentar busca por id direto
      const docRef = doc(db, 'events', slug);
      const byIdSnap = await getDoc(docRef);
      if (byIdSnap.exists()) {
        const d = byIdSnap.data();
        return {
          id: byIdSnap.id,
          ...d,
          date: toDateSafe(d.date),
          endDate: d.endDate ? toDateSafe(d.endDate) : undefined,
          createdAt: toDateSafe(d.createdAt),
          updatedAt: toDateSafe(d.updatedAt),
        } as Event;
      }

      return null;
    } catch (error) {
      console.error(`Erro ao buscar evento ${slug}:`, error);
      return null;
    }
  },

  async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    try {
      const now = serverTimestamp();
      const rawPayload: any = {
        ...event,
        date: Timestamp.fromDate(new Date(event.date)),
        endDate: event.endDate ? Timestamp.fromDate(new Date(event.endDate)) : null,
        createdAt: now,
        updatedAt: now,
      };
      // Firestore rejeita campos com valor undefined
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([, v]) => v !== undefined)
      );

      const docRef = await addDoc(collection(db, 'events'), payload);
      await logAuditEvent('create', 'events', docRef.id, { title: event.title });

      return {
        ...event,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    try {
      const rawPayload: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      if (updates.date) {
        rawPayload.date = Timestamp.fromDate(new Date(updates.date));
      }
      if (updates.endDate) {
        rawPayload.endDate = Timestamp.fromDate(new Date(updates.endDate));
      }
      // Firestore rejeita campos com valor undefined
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([, v]) => v !== undefined)
      );

      await updateDoc(doc(db, 'events', id), payload);
      await logAuditEvent('update', 'events', id, updates);
    } catch (error) {
      console.error(`Erro ao atualizar evento ${id}:`, error);
      throw error;
    }
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'events', id));
      await logAuditEvent('delete', 'events', id, {});
    } catch (error) {
      console.error(`Erro ao excluir evento ${id}:`, error);
      throw error;
    }
  },

  async toggleChecklistItem(eventId: string, itemId: string): Promise<void> {
    try {
      const event = await this.getEventBySlug(eventId);
      if (!event) return;

      const checklist = (event.checklist || []).map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );

      await this.updateEvent(eventId, { checklist });
    } catch (error) {
      console.error(`Erro ao alterar checklist do evento ${eventId}:`, error);
      throw error;
    }
  },

  // ==========================================================================
  // INSCRIÇÕES (Event Registrations)
  // ==========================================================================
  async getRegistrationsByEvent(eventId: string): Promise<EventRegistration[]> {
    try {
      const q = query(
        collection(db, `events/${eventId}/registrations`),
        orderBy('registeredAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map((dSnap) => {
        const d = dSnap.data();
        return {
          id: dSnap.id,
          ...d,
          registeredAt: toDateSafe(d.registeredAt),
          birthDate: d.birthDate ? toDateSafe(d.birthDate) : undefined,
        } as EventRegistration;
      });
    } catch (error) {
      console.error(`Erro ao listar inscrições do evento ${eventId}:`, error);
      return [];
    }
  },

  async createRegistration(
    registration: Omit<EventRegistration, 'id' | 'registeredAt'>
  ): Promise<EventRegistration> {
    try {
      const now = serverTimestamp();
      const payload: any = {
        ...registration,
        registeredAt: now,
      };
      if (registration.birthDate) {
        payload.birthDate = Timestamp.fromDate(new Date(registration.birthDate));
      }

      const docRef = await addDoc(
        collection(db, `events/${registration.eventId}/registrations`),
        payload
      );

      return {
        ...registration,
        id: docRef.id,
        registeredAt: new Date(),
      };
    } catch (error) {
      console.error('Erro ao cadastrar inscrição:', error);
      throw error;
    }
  },

  async syncGoogleSheets(eventId: string): Promise<{ syncedCount: number; lastSyncedAt: Date }> {
    try {
      const now = new Date();
      await updateDoc(doc(db, 'events', eventId), {
        'registrationSource.lastSyncedAt': Timestamp.fromDate(now),
        updatedAt: serverTimestamp(),
      });
      const regs = await this.getRegistrationsByEvent(eventId);
      return { syncedCount: regs.length, lastSyncedAt: now };
    } catch (error) {
      console.error(`Erro ao sincronizar planilha do evento ${eventId}:`, error);
      throw error;
    }
  },

  // ==========================================================================
  // TAREFAS (Tasks)
  // ==========================================================================
  async getTasks(): Promise<Task[]> {
    try {
      const q = query(collection(db, 'tasks'), orderBy('dueDate', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map((dSnap) => {
        const d = dSnap.data();
        return {
          id: dSnap.id,
          ...d,
          dueDate: toDateSafe(d.dueDate),
          createdAt: toDateSafe(d.createdAt),
          updatedAt: toDateSafe(d.updatedAt),
        } as Task;
      });
    } catch (error) {
      console.error('Erro ao listar tarefas:', error);
      return [];
    }
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const now = serverTimestamp();
      const payload: any = {
        ...task,
        dueDate: Timestamp.fromDate(new Date(task.dueDate)),
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'tasks'), payload);
      await logAuditEvent('create', 'tasks', docRef.id, { title: task.title });

      return {
        ...task,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      await logAuditEvent('delete', 'tasks', id);
    } catch (error) {
      console.error(`Erro ao excluir tarefa ${id}:`, error);
      throw error;
    }
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    try {
      await updateDoc(doc(db, 'tasks', id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Erro ao atualizar status da tarefa ${id}:`, error);
      throw error;
    }
  },

  // ==========================================================================
  // ESCALAS (Schedules)
  // ==========================================================================
  async getSchedules(eventId?: string): Promise<ScheduleAssignment[]> {
    try {
      const collRef = collection(db, 'schedules');
      const q = eventId
        ? query(collRef, where('eventId', '==', eventId))
        : query(collRef, orderBy('eventDate', 'asc'));

      const snap = await getDocs(q);
      return snap.docs.map((dSnap) => {
        const d = dSnap.data();
        return {
          id: dSnap.id,
          ...d,
          eventDate: toDateSafe(d.eventDate),
          updatedAt: toDateSafe(d.updatedAt),
        } as ScheduleAssignment;
      });
    } catch (error) {
      console.error('Erro ao listar escalas:', error);
      return [];
    }
  },

  async createSchedule(
    schedule: Omit<ScheduleAssignment, 'id' | 'updatedAt'>
  ): Promise<ScheduleAssignment> {
    try {
      const now = serverTimestamp();
      // Token expira em 7 dias
      const tokenExpiresAt = schedule.publicToken
        ? Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        : null;

      const payload: any = {
        ...schedule,
        eventDate: Timestamp.fromDate(new Date(schedule.eventDate)),
        updatedAt: now,
        tokenUsed: false,
        ...(tokenExpiresAt ? { tokenExpiresAt } : {}),
      };

      const docRef = await addDoc(collection(db, 'schedules'), payload);
      return {
        ...schedule,
        id: docRef.id,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Erro ao criar escala:', error);
      throw error;
    }
  },

  async updateScheduleStatus(id: string, status: ScheduleStatus): Promise<void> {
    try {
      await updateDoc(doc(db, 'schedules', id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Erro ao atualizar escala ${id}:`, error);
      throw error;
    }
  },

  async getScheduleByPublicToken(token: string): Promise<ScheduleAssignment | null> {
    try {
      const q = query(
        collection(db, 'schedules'),
        where('publicToken', '==', token),
        limit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const schedDoc = snap.docs[0];
      const data = schedDoc.data();
      return {
        id: schedDoc.id,
        ...data,
        eventDate: toDateSafe(data.eventDate),
        updatedAt: toDateSafe(data.updatedAt),
      } as ScheduleAssignment;
    } catch (error) {
      console.error('Erro ao buscar escala por token:', error);
      return null;
    }
  },

  async respondSchedulePublicToken(
    token: string,
    status: ScheduleStatus
  ): Promise<ScheduleAssignment | null> {
    try {
      const q = query(
        collection(db, 'schedules'),
        where('publicToken', '==', token),
        limit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;

      const schedDoc = snap.docs[0];
      const data = schedDoc.data();

      // Verificar se o token já foi usado
      if (data.tokenUsed === true) {
        console.warn('Token de escala já utilizado:', token);
        return null;
      }

      // Verificar se o token não expirou
      if (data.tokenExpiresAt) {
        const expiry: Date = toDateSafe(data.tokenExpiresAt);
        if (expiry < new Date()) {
          console.warn('Token de escala expirado:', token);
          return null;
        }
      }

      await updateDoc(schedDoc.ref, {
        status,
        tokenUsed: true,
        updatedAt: serverTimestamp(),
      });

      return {
        id: schedDoc.id,
        ...data,
        status,
        tokenUsed: true,
        eventDate: toDateSafe(data.eventDate),
        updatedAt: new Date(),
      } as ScheduleAssignment;
    } catch (error) {
      console.error('Erro ao responder escala com token:', error);
      return null;
    }
  },

  // ==========================================================================
  // TESOURARIA / CAIXA (Transactions)
  // ==========================================================================
  async getTransactions(): Promise<Transaction[]> {
    try {
      const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((dSnap) => {
        const d = dSnap.data();
        const amount = d.amountCents !== undefined ? d.amountCents / 100 : d.amount || 0;
        return {
          id: dSnap.id,
          ...d,
          amount,
          amountCents: d.amountCents !== undefined ? d.amountCents : Math.round(amount * 100),
          date: toDateSafe(d.date),
          createdAt: toDateSafe(d.createdAt),
          updatedAt: toDateSafe(d.updatedAt),
        } as Transaction;
      });
    } catch (error) {
      console.error('Erro ao listar transações:', error);
      return [];
    }
  },

  async createTransaction(
    tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction> {
    try {
      const now = serverTimestamp();
      const amountCents = tx.amountCents ?? Math.round(tx.amount * 100);
      const payload: any = {
        ...tx,
        amount: tx.amount,
        amountCents,
        date: Timestamp.fromDate(new Date(tx.date)),
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'transactions'), payload);
      await logAuditEvent('create', 'transactions', docRef.id, {
        description: tx.description,
        amountCents,
        type: tx.type,
      });

      return {
        ...tx,
        id: docRef.id,
        amountCents,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw error;
    }
  },

  // ==========================================================================
  // REUNIÕES (Meetings)
  // ==========================================================================
  async getMeetings(): Promise<Meeting[]> {
    try {
      const q = query(collection(db, 'meetings'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((dSnap) => {
        const d = dSnap.data();
        return {
          id: dSnap.id,
          ...d,
          date: toDateSafe(d.date),
          createdAt: toDateSafe(d.createdAt),
        } as Meeting;
      });
    } catch (error) {
      console.error('Erro ao listar reuniões:', error);
      return [];
    }
  },

  async createMeeting(meeting: Omit<Meeting, 'id' | 'createdAt'>): Promise<Meeting> {
    try {
      const now = serverTimestamp();
      const payload: any = {
        ...meeting,
        date: Timestamp.fromDate(new Date(meeting.date)),
        createdAt: now,
      };

      const docRef = await addDoc(collection(db, 'meetings'), payload);
      await logAuditEvent('create', 'meetings', docRef.id, { title: meeting.title });

      return {
        ...meeting,
        id: docRef.id,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Erro ao criar ata de reunião:', error);
      throw error;
    }
  },

  // ==========================================================================
  // DOCUMENTOS (Documents)
  // ==========================================================================
  async getDocuments(): Promise<GroupDocument[]> {
    try {
      const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((dSnap) => {
        const d = dSnap.data();
        return {
          id: dSnap.id,
          ...d,
          createdAt: toDateSafe(d.createdAt),
        } as GroupDocument;
      });
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      return [];
    }
  },

  async createDocument(
    docItem: Omit<GroupDocument, 'id' | 'createdAt'>
  ): Promise<GroupDocument> {
    try {
      const now = serverTimestamp();
      const payload: any = {
        ...docItem,
        createdAt: now,
      };

      const docRef = await addDoc(collection(db, 'documents'), payload);
      await logAuditEvent('create', 'documents', docRef.id, { title: docItem.title });

      return {
        ...docItem,
        id: docRef.id,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Erro ao cadastrar documento:', error);
      throw error;
    }
  },

  // ==========================================================================
  // PRESENÇAS (Attendance)
  // ==========================================================================
  async getAttendanceRecords(eventId?: string): Promise<AttendanceRecord[]> {
    try {
      const collRef = collection(db, 'attendances');
      const q = eventId
        ? query(collRef, where('eventId', '==', eventId))
        : query(collRef, orderBy('checkedInAt', 'desc'));

      const snap = await getDocs(q);
      return snap.docs.map((dSnap) => {
        const d = dSnap.data();
        return {
          id: dSnap.id,
          ...d,
          eventDate: toDateSafe(d.eventDate),
          checkedInAt: toDateSafe(d.checkedInAt),
        } as AttendanceRecord;
      });
    } catch (error) {
      console.error('Erro ao listar registros de presença:', error);
      return [];
    }
  },

  async registerAttendance(
    record: Omit<AttendanceRecord, 'id' | 'checkedInAt'>
  ): Promise<AttendanceRecord> {
    try {
      const now = serverTimestamp();
      const payload: any = {
        ...record,
        eventDate: Timestamp.fromDate(new Date(record.eventDate)),
        checkedInAt: now,
      };

      const docRef = await addDoc(collection(db, 'attendances'), payload);
      return {
        ...record,
        id: docRef.id,
        checkedInAt: new Date(),
      };
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      throw error;
    }
  },

  // ==========================================================================
  // CONFIGURAÇÃO DA PÁGINA PÚBLICA
  // ==========================================================================
  async getPublicPageConfig(): Promise<PublicPageConfig> {
    try {
      const docRef = doc(db, 'settings', 'publicPage');
      const snap = await getDoc(docRef);
      if (!snap.exists()) return { ...DEFAULT_PUBLIC_PAGE_CONFIG };
      const d = snap.data();
      return {
        ...DEFAULT_PUBLIC_PAGE_CONFIG,
        ...d,
        updatedAt: d.updatedAt ? toDateSafe(d.updatedAt) : new Date(),
      } as PublicPageConfig;
    } catch (error) {
      console.error('Erro ao carregar configuração da página pública:', error);
      return { ...DEFAULT_PUBLIC_PAGE_CONFIG };
    }
  },

  async savePublicPageConfig(
    config: Omit<PublicPageConfig, 'updatedAt'>,
    updatedByName?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'settings', 'publicPage');
      await setDoc(docRef, {
        ...config,
        updatedByName: updatedByName || '',
        updatedAt: serverTimestamp(),
      });
      await logAuditEvent('update', 'settings', 'publicPage', { updatedByName });
    } catch (error) {
      console.error('Erro ao salvar configuração da página pública:', error);
      throw error;
    }
  },

  // ==========================================================================
  // CARDS CUSTOMIZADOS DA PÁGINA PÚBLICA
  // ==========================================================================
  async getPublicCards(): Promise<PublicCard[]> {
    try {
      const q = query(collection(db, 'publicCards'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: toDateSafe(d.data().createdAt),
        updatedAt: toDateSafe(d.data().updatedAt),
      })) as PublicCard[];
    } catch (error) {
      console.error('Erro ao listar cards públicos:', error);
      return [];
    }
  },

  async createPublicCard(
    card: Omit<PublicCard, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PublicCard> {
    try {
      const now = serverTimestamp();
      const ref = await addDoc(collection(db, 'publicCards'), {
        ...card,
        createdAt: now,
        updatedAt: now,
      });
      await logAuditEvent('create', 'publicCards', ref.id, { title: card.title });
      return {
        ...card,
        id: ref.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Erro ao criar card público:', error);
      throw error;
    }
  },

  async updatePublicCard(
    id: string,
    updates: Partial<Omit<PublicCard, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'publicCards', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      await logAuditEvent('update', 'publicCards', id, updates);
    } catch (error) {
      console.error(`Erro ao atualizar card ${id}:`, error);
      throw error;
    }
  },

  async deletePublicCard(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'publicCards', id));
      await logAuditEvent('delete', 'publicCards', id);
    } catch (error) {
      console.error(`Erro ao excluir card ${id}:`, error);
      throw error;
    }
  },

};

// Aliases para manter compatibilidade com hooks legados
export const firestoreService = {
  /**
   * Listener em tempo real para transações (retorna unsubscribe).
   */
  getTransactions(
    _role: string,
    callback: (transactions: Transaction[]) => void
  ): () => void {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((dSnap) => {
        const d = dSnap.data();
        const amount = d.amountCents !== undefined ? d.amountCents / 100 : d.amount || 0;
        return {
          id: dSnap.id,
          ...d,
          amount,
          amountCents: d.amountCents !== undefined ? d.amountCents : Math.round(amount * 100),
          date: toDateSafe(d.date),
          createdAt: toDateSafe(d.createdAt),
          updatedAt: toDateSafe(d.updatedAt),
        } as Transaction;
      });
      callback(list);
    });
  },

  async createTransaction(
    tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Transaction> {
    return TerezinhaService.createTransaction(tx);
  },

  async updateTransaction(
    id: string,
    tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    const now = serverTimestamp();
    const amountCents = tx.amountCents ?? Math.round(tx.amount * 100);
    await updateDoc(doc(db, 'transactions', id), {
      ...tx,
      amountCents,
      date: Timestamp.fromDate(new Date(tx.date)),
      updatedAt: now,
    });
    await logAuditEvent('update', 'transactions', id, {
      description: tx.description,
      amountCents,
      type: tx.type,
    });
  },

  async deleteTransaction(id: string): Promise<void> {
    await deleteDoc(doc(db, 'transactions', id));
    await logAuditEvent('delete', 'transactions', id, {});
  },

  /**
   * Listener em tempo real para membros/pessoas.
   */
  getMembers(
    _role: string,
    callback: (members: Person[]) => void
  ): () => void {
    const q = query(collection(db, 'people'), orderBy('name', 'asc'));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((dSnap) => {
        const d = dSnap.data();
        return {
          id: dSnap.id,
          ...d,
          birthDate: toDateSafe(d.birthDate),
          createdAt: toDateSafe(d.createdAt),
          updatedAt: toDateSafe(d.updatedAt),
        } as Person;
      });
      callback(list);
    });
  },

  /**
   * Listener em tempo real para eventos.
   */
  getEvents(
    _role: string,
    callback: (events: Event[]) => void
  ): () => void {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((dSnap) => {
        const d = dSnap.data();
        return {
          id: dSnap.id,
          ...d,
          date: toDateSafe(d.date),
          createdAt: toDateSafe(d.createdAt),
          updatedAt: toDateSafe(d.updatedAt),
        } as Event;
      });
      callback(list);
    });
  },
};
export const MembersService = {
  getAll: () => TerezinhaService.getPeople(),
  getById: (id: string) => TerezinhaService.getPersonById(id),
  create: (p: any) => TerezinhaService.createPerson(p),
  update: (id: string, u: any) => TerezinhaService.updatePerson(id, u),
  delete: (id: string) => TerezinhaService.deletePerson(id),
};
export const EventsService = {
  getAll: () => TerezinhaService.getEvents(),
  getById: (id: string) => TerezinhaService.getEventBySlug(id),
  create: (e: any) => TerezinhaService.createEvent(e),
  update: (id: string, u: any) => TerezinhaService.updateEvent(id, u),
  delete: (id: string) => deleteDoc(doc(db, 'events', id)),
};
export const TransactionsService = {
  getAll: () => TerezinhaService.getTransactions(),
  create: (t: any) => TerezinhaService.createTransaction(t),
};

export const UsersService = {
  /**
   * Busca todos os usuários (somente admin).
   */
  async getAllUsers(callerRole: string): Promise<import('../types').User[]> {
    if (callerRole !== 'admin') throw new Error('Apenas administradores podem listar usuários');
    const snap = await getDocs(query(collection(db, 'users'), orderBy('name', 'asc')));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: toDateSafe(data.createdAt),
        updatedAt: toDateSafe(data.updatedAt),
      } as import('../types').User;
    });
  },

  /**
   * Listener em tempo real para a coleção users (somente admin).
   */
  onSnapshot(
    callerRole: string,
    callback: (users: import('../types').User[]) => void
  ): () => void {
    if (callerRole !== 'admin') {
      callback([]);
      return () => {};
    }
    const q = query(collection(db, 'users'), orderBy('name', 'asc'));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: toDateSafe(data.createdAt),
          updatedAt: toDateSafe(data.updatedAt),
        } as import('../types').User;
      });
      callback(list);
    });
  },

  /**
   * Atualiza o role de um usuário (somente admin).
   */
  async updateUserRole(
    userId: string,
    newRole: import('../types').UserRole,
    callerRole: string
  ): Promise<void> {
    if (callerRole !== 'admin') throw new Error('Apenas administradores podem alterar roles');
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: serverTimestamp(),
    });
    await logAuditEvent('update', 'users', userId, { role: newRole });
  },

  /**
   * Remove um usuário do Firestore (somente admin).
   * Nota: remove apenas o documento — a conta Firebase Auth permanece.
   */
  async delete(userId: string, callerRole: string, callerUid: string): Promise<void> {
    if (callerRole !== 'admin') throw new Error('Apenas administradores podem remover usuários');
    if (userId === callerUid) throw new Error('Você não pode remover sua própria conta');
    await deleteDoc(doc(db, 'users', userId));
    await logAuditEvent('delete', 'users', userId, {});
  },
};
