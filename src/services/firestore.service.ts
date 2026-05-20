
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
  onSnapshot,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Member,
  Event,
  Transaction,
  User,
  UserRole,
  MemberStatus,
  TransactionType,
} from '../types';
import {
  canCreate,
  canEdit,
  canDelete,
  canView,
} from '../utils/permissions';

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

type FirestoreDate = Timestamp | Date;

interface FirestoreMember extends Omit<Member, 'birthDate' | 'joinDate' | 'createdAt' | 'updatedAt'> {
  birthDate: FirestoreDate;
  joinDate: FirestoreDate;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

interface FirestoreEvent extends Omit<Event, 'date' | 'createdAt' | 'updatedAt'> {
  date: FirestoreDate;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

interface FirestoreTransaction extends Omit<Transaction, 'date' | 'createdAt' | 'updatedAt'> {
  date: FirestoreDate;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

interface FirestoreUser extends Omit<User, 'birthDate' | 'joinDate' | 'createdAt' | 'updatedAt' | 'lastLogin'> {
  birthDate: FirestoreDate;
  joinDate: FirestoreDate;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
  lastLogin?: FirestoreDate;
}

// ============================================================================
// CONVERSORES DE DATA
// ============================================================================

const timestampToDate = (timestamp: FirestoreDate): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// ============================================================================
// CONVERSORES DE DOCUMENTOS
// ============================================================================

const convertFirestoreMember = (data: FirestoreMember): Member => ({
  ...data,
  birthDate: timestampToDate(data.birthDate),
  joinDate: timestampToDate(data.joinDate),
  createdAt: timestampToDate(data.createdAt),
  updatedAt: timestampToDate(data.updatedAt),
});

const convertFirestoreEvent = (data: FirestoreEvent): Event => ({
  ...data,
  date: timestampToDate(data.date),
  createdAt: timestampToDate(data.createdAt),
  updatedAt: timestampToDate(data.updatedAt),
});

const convertFirestoreTransaction = (data: FirestoreTransaction): Transaction => ({
  ...data,
  date: timestampToDate(data.date),
  createdAt: timestampToDate(data.createdAt),
  updatedAt: timestampToDate(data.updatedAt),
});

const convertFirestoreUser = (data: FirestoreUser): User => ({
  ...data,
  birthDate: timestampToDate(data.birthDate),
  joinDate: timestampToDate(data.joinDate),
  createdAt: timestampToDate(data.createdAt),
  updatedAt: timestampToDate(data.updatedAt),
  lastLogin: data.lastLogin ? timestampToDate(data.lastLogin) : undefined,
});

// ============================================================================
// VALIDAÇÃO DE PERMISSÕES
// ============================================================================

const validateCreate = (userRole: UserRole, resourceType: 'member' | 'event' | 'transaction'): void => {
  if (!canCreate(userRole, resourceType)) {
    throw new Error(`Usuário não tem permissão para criar ${resourceType}`);
  }
};

const validateEdit = (userRole: UserRole, resourceType: 'member' | 'event' | 'transaction'): void => {
  if (!canEdit(userRole, resourceType)) {
    throw new Error(`Usuário não tem permissão para editar ${resourceType}`);
  }
};

const validateDelete = (userRole: UserRole, resourceType: 'member' | 'event' | 'transaction'): void => {
  if (!canDelete(userRole, resourceType)) {
    throw new Error(`Usuário não tem permissão para deletar ${resourceType}`);
  }
};

const validateView = (userRole: UserRole, resourceType: 'member' | 'event' | 'transaction' | 'finance'): void => {
  if (!canView(userRole, resourceType)) {
    throw new Error(`Usuário não tem permissão para visualizar ${resourceType}`);
  }
};

// ============================================================================
// SERVIÇO DE MEMBROS
// ============================================================================

export const MembersService = {
  /**
   * Buscar todos os membros
   */
  async getAll(userRole: UserRole): Promise<Member[]> {
    validateView(userRole, 'member');
    
    const membersRef = collection(db, 'members');
    const q = query(membersRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreMember;
      return convertFirestoreMember({ ...data, id: doc.id });
    });
  },

  /**
   * Buscar membro por ID
   */
  async getById(id: string, userRole: UserRole): Promise<Member | null> {
    validateView(userRole, 'member');
    
    const memberRef = doc(db, 'members', id);
    const snapshot = await getDoc(memberRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data() as FirestoreMember;
    return convertFirestoreMember({ ...data, id: snapshot.id });
  },

  /**
   * Criar novo membro
   */
  async create(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>, userRole: UserRole): Promise<string> {
    validateCreate(userRole, 'member');
    
    const now = Timestamp.now();
    const data: Omit<FirestoreMember, 'id'> = {
      ...memberData,
      birthDate: dateToTimestamp(memberData.birthDate),
      joinDate: dateToTimestamp(memberData.joinDate),
      createdAt: now,
      updatedAt: now,
    };
    
    const membersRef = collection(db, 'members');
    const docRef = await addDoc(membersRef, data);
    return docRef.id;
  },

  /**
   * Atualizar membro
   */
  async update(id: string, memberData: Partial<Member>, userRole: UserRole): Promise<void> {
    validateEdit(userRole, 'member');
    
    const memberRef = doc(db, 'members', id);
    const updateData: Partial<FirestoreMember> = {
      ...memberData,
      updatedAt: Timestamp.now(),
    };
    
    if (memberData.birthDate) {
      updateData.birthDate = dateToTimestamp(memberData.birthDate);
    }
    if (memberData.joinDate) {
      updateData.joinDate = dateToTimestamp(memberData.joinDate);
    }
    
    await updateDoc(memberRef, updateData as DocumentData);
  },

  /**
   * Deletar membro
   */
  async delete(id: string, userRole: UserRole): Promise<void> {
    validateDelete(userRole, 'member');
    
    const memberRef = doc(db, 'members', id);
    await deleteDoc(memberRef);
  },

  /**
   * Listener em tempo real para membros
   */
  onSnapshot(userRole: UserRole, callback: (members: Member[]) => void): () => void {
    validateView(userRole, 'member');
    
    const membersRef = collection(db, 'members');
    const q = query(membersRef, orderBy('name', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreMember;
        return convertFirestoreMember({ ...data, id: doc.id });
      });
      callback(members);
    });
  },

  /**
   * Buscar membros ativos
   */
  async getActive(userRole: UserRole): Promise<Member[]> {
    validateView(userRole, 'member');
    
    const membersRef = collection(db, 'members');
    const q = query(
      membersRef,
      where('status', '==', MemberStatus.ACTIVE),
      orderBy('name', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreMember;
      return convertFirestoreMember({ ...data, id: doc.id });
    });
  },
};

// ============================================================================
// SERVIÇO DE EVENTOS
// ============================================================================

export const EventsService = {
  /**
   * Buscar todos os eventos
   */
  async getAll(userRole: UserRole): Promise<Event[]> {
    validateView(userRole, 'event');
    
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreEvent;
      return convertFirestoreEvent({ ...data, id: doc.id });
    });
  },

  /**
   * Buscar evento por ID
   */
  async getById(id: string, userRole: UserRole): Promise<Event | null> {
    validateView(userRole, 'event');
    
    const eventRef = doc(db, 'events', id);
    const snapshot = await getDoc(eventRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data() as FirestoreEvent;
    return convertFirestoreEvent({ ...data, id: snapshot.id });
  },

  /**
   * Criar novo evento
   */
  async create(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>, userRole: UserRole): Promise<string> {
    validateCreate(userRole, 'event');
    
    const now = Timestamp.now();
    const data: Omit<FirestoreEvent, 'id'> = {
      ...eventData,
      date: dateToTimestamp(eventData.date),
      createdAt: now,
      updatedAt: now,
    };
    
    const eventsRef = collection(db, 'events');
    const docRef = await addDoc(eventsRef, data);
    return docRef.id;
  },

  /**
   * Atualizar evento
   */
  async update(id: string, eventData: Partial<Event>, userRole: UserRole): Promise<void> {
    validateEdit(userRole, 'event');
    
    const eventRef = doc(db, 'events', id);
    const updateData: Partial<FirestoreEvent> = {
      ...eventData,
      updatedAt: Timestamp.now(),
    };
    
    if (eventData.date) {
      updateData.date = dateToTimestamp(eventData.date);
    }
    
    await updateDoc(eventRef, updateData as DocumentData);
  },

  /**
   * Deletar evento
   */
  async delete(id: string, userRole: UserRole): Promise<void> {
    validateDelete(userRole, 'event');
    
    const eventRef = doc(db, 'events', id);
    await deleteDoc(eventRef);
  },

  /**
   * Listener em tempo real para eventos
   */
  onSnapshot(userRole: UserRole, callback: (events: Event[]) => void): () => void {
    validateView(userRole, 'event');
    
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreEvent;
        return convertFirestoreEvent({ ...data, id: doc.id });
      });
      callback(events);
    });
  },

  /**
   * Buscar eventos futuros
   */
  async getUpcoming(userRole: UserRole): Promise<Event[]> {
    validateView(userRole, 'event');
    
    const now = Timestamp.now();
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('date', '>=', now),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreEvent;
      return convertFirestoreEvent({ ...data, id: doc.id });
    });
  },

  /**
   * Buscar eventos por período
   */
  async getByDateRange(startDate: Date, endDate: Date, userRole: UserRole): Promise<Event[]> {
    validateView(userRole, 'event');
    
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('date', '>=', dateToTimestamp(startDate)),
      where('date', '<=', dateToTimestamp(endDate)),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreEvent;
      return convertFirestoreEvent({ ...data, id: doc.id });
    });
  },
};

// ============================================================================
// SERVIÇO DE TRANSAÇÕES
// ============================================================================

export const TransactionsService = {
  /**
   * Buscar todas as transações
   */
  async getAll(userRole: UserRole): Promise<Transaction[]> {
    validateView(userRole, 'finance');
    
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreTransaction;
      return convertFirestoreTransaction({ ...data, id: doc.id });
    });
  },

  /**
   * Buscar transação por ID
   */
  async getById(id: string, userRole: UserRole): Promise<Transaction | null> {
    validateView(userRole, 'finance');
    
    const transactionRef = doc(db, 'transactions', id);
    const snapshot = await getDoc(transactionRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data() as FirestoreTransaction;
    return convertFirestoreTransaction({ ...data, id: snapshot.id });
  },

  /**
   * Criar nova transação
   */
  async create(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, userRole: UserRole): Promise<string> {
    if (userRole !== 'admin') {
      throw new Error('Usuário não tem permissão para criar transaction');
    }
    
    const now = Timestamp.now();
    const data: Omit<FirestoreTransaction, 'id'> = {
      ...transactionData,
      date: dateToTimestamp(transactionData.date),
      createdAt: now,
      updatedAt: now,
    };
    
    const transactionsRef = collection(db, 'transactions');
    const docRef = await addDoc(transactionsRef, data);
    return docRef.id;
  },

  /**
   * Atualizar transação
   */
  async update(id: string, transactionData: Partial<Transaction>, userRole: UserRole): Promise<void> {
    if (userRole !== 'admin') {
      throw new Error('Usuário não tem permissão para editar transaction');
    }
    
    const transactionRef = doc(db, 'transactions', id);
    const updateData: Partial<FirestoreTransaction> = {
      ...transactionData,
      updatedAt: Timestamp.now(),
    };
    
    if (transactionData.date) {
      updateData.date = dateToTimestamp(transactionData.date);
    }
    
    await updateDoc(transactionRef, updateData as DocumentData);
  },

  /**
   * Deletar transação
   */
  async delete(id: string, userRole: UserRole): Promise<void> {
    if (userRole !== 'admin') {
      throw new Error('Usuário não tem permissão para deletar transaction');
    }
    
    const transactionRef = doc(db, 'transactions', id);
    await deleteDoc(transactionRef);
  },

  /**
   * Listener em tempo real para transações
   */
  onSnapshot(userRole: UserRole, callback: (transactions: Transaction[]) => void): () => void {
    validateView(userRole, 'finance');
    
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreTransaction;
        return convertFirestoreTransaction({ ...data, id: doc.id });
      });
      callback(transactions);
    });
  },

  /**
   * Buscar transações por período
   */
  async getByDateRange(startDate: Date, endDate: Date, userRole: UserRole): Promise<Transaction[]> {
    validateView(userRole, 'finance');
    
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('date', '>=', dateToTimestamp(startDate)),
      where('date', '<=', dateToTimestamp(endDate)),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreTransaction;
      return convertFirestoreTransaction({ ...data, id: doc.id });
    });
  },

  /**
   * Buscar transações por tipo
   */
  async getByType(type: TransactionType, userRole: UserRole): Promise<Transaction[]> {
    validateView(userRole, 'finance');
    
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('type', '==', type),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreTransaction;
      return convertFirestoreTransaction({ ...data, id: doc.id });
    });
  },

  /**
   * Calcular saldo total
   */
  async getBalance(userRole: UserRole): Promise<number> {
    validateView(userRole, 'finance');
    
    const transactions = await this.getAll(userRole);
    
    return transactions.reduce((balance, transaction) => {
      if (transaction.type === TransactionType.INCOME) {
        return balance + transaction.amount;
      } else {
        return balance - transaction.amount;
      }
    }, 0);
  },
};

// ============================================================================
// SERVIÇO DE USUÁRIOS
// ============================================================================

export const UsersService = {
  /**
   * Buscar todos os usuários (membros)
   * CORRIGIDO: Agora usa a coleção 'members' como fonte canônica
   */
  async getAllUsers(currentUserRole: UserRole): Promise<User[]> {
    // Validação: apenas admin pode listar todos os usuários
    if (currentUserRole !== 'admin') {
      console.warn('⚠️ Tentativa de listar usuários sem permissão de admin');
      throw new Error('Apenas administradores podem listar todos os usuários');
    }
    
    try {
      const membersRef = collection(db, 'members');
      const q = query(membersRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreMember;
        return convertFirestoreMember({ ...data, id: doc.id });
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  /**
   * Listener em tempo real para usuários (membros)
   * CORRIGIDO: Agora usa a coleção 'members' como fonte canônica
   */
  onSnapshot(currentUserRole: UserRole, callback: (users: User[]) => void): () => void {
    // Validação: apenas admin pode observar mudanças em usuários
    if (currentUserRole !== 'admin') {
      console.warn('⚠️ Tentativa de observar usuários sem permissão de admin');
      throw new Error('Apenas administradores podem observar mudanças em usuários');
    }
    
    const membersRef = collection(db, 'members');
    const q = query(membersRef, orderBy('name', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreMember;
        return convertFirestoreMember({ ...data, id: doc.id });
      });
      callback(users);
    });
  },

  /**
   * Criar documento de usuário (membro)
   * CORRIGIDO: Agora usa a coleção 'members' como fonte canônica
   */
  async createUser(userId: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'> & Partial<Pick<User, 'lastLogin'>>): Promise<void> {
    const now = Timestamp.now();
    const data = {
      id: userId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      birthDate: dateToTimestamp(userData.birthDate),
      gender: userData.gender,
      joinDate: dateToTimestamp(userData.joinDate),
      status: userData.status,
      role: userData.role,
      photoUrl: userData.photoUrl,
      address: userData.address,
      emergencyContact: userData.emergencyContact,
      notes: userData.notes,
      createdAt: now,
      updatedAt: now,
      lastLogin: userData.lastLogin ? dateToTimestamp(userData.lastLogin) : now,
    };

    const memberRef = doc(db, 'members', userId);
    await setDoc(memberRef, data as DocumentData);
  },

  /**
   * Buscar usuário (membro)
   * CORRIGIDO: Agora usa a coleção 'members' como fonte canônica
   */
  async getUser(userId: string): Promise<User | null> {
    const memberRef = doc(db, 'members', userId);
    const snapshot = await getDoc(memberRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as FirestoreMember;
    return convertFirestoreMember({ ...data, id: snapshot.id });
  },

  /**
   * Atualizar usuário (membro)
   * CORRIGIDO: Agora usa a coleção 'members' como fonte canônica
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    const memberRef = doc(db, 'members', userId);
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    // Copiar campos simples
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.phone !== undefined) updateData.phone = userData.phone;
    if (userData.gender !== undefined) updateData.gender = userData.gender;
    if (userData.status !== undefined) updateData.status = userData.status;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.photoUrl !== undefined) updateData.photoUrl = userData.photoUrl;
    if (userData.address !== undefined) updateData.address = userData.address;
    if (userData.emergencyContact !== undefined) updateData.emergencyContact = userData.emergencyContact;
    if (userData.notes !== undefined) updateData.notes = userData.notes;

    // Converter datas
    if (userData.birthDate) {
      updateData.birthDate = dateToTimestamp(userData.birthDate);
    }

    if (userData.joinDate) {
      updateData.joinDate = dateToTimestamp(userData.joinDate);
    }

    if (userData.lastLogin) {
      updateData.lastLogin = dateToTimestamp(userData.lastLogin);
    }

    await updateDoc(memberRef, updateData as DocumentData);
  },

  /**
   * Buscar role do usuário (membro)
   * CORRIGIDO: Agora usa a coleção 'members' como fonte canônica
   */
  async getUserRole(userId: string): Promise<UserRole | null> {
    const user = await this.getUser(userId);
    return user?.role ?? null;
  },

  /**
   * Atualizar role do usuário (apenas admin)
   * CORRIGIDO: Agora usa a coleção 'members' como fonte canônica
   */
  async updateUserRole(userId: string, role: UserRole, currentUserRole: UserRole): Promise<void> {
    if (currentUserRole !== 'admin') {
      throw new Error('Apenas administradores podem alterar roles');
    }

    const memberRef = doc(db, 'members', userId);
    await updateDoc(memberRef, {
      role,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Deletar usuário (apenas admin)
   * CORRIGIDO: Agora usa a coleção 'members' como fonte canônica
   */
  async deleteUser(userId: string, currentUserRole: UserRole, currentUserId: string): Promise<void> {
    if (currentUserRole !== 'admin') {
      throw new Error('Apenas administradores podem deletar usuários');
    }

    if (userId === currentUserId) {
      throw new Error('Você não pode deletar sua própria conta');
    }

    const memberRef = doc(db, 'members', userId);
    await deleteDoc(memberRef);
  },

  /**
   * Compatibilidade com API anterior
   */
  async getById(id: string): Promise<User | null> {
    return this.getUser(id);
  },

  async create(userData: Omit<User, 'createdAt' | 'lastLogin'>): Promise<void> {
    const { id, ...rest } = userData;
    await this.createUser(id, rest);
  },

  async update(id: string, userData: Partial<User>): Promise<void> {
    await this.updateUser(id, userData);
  },

  async updateLastLogin(id: string): Promise<void> {
    await this.updateUser(id, { lastLogin: new Date() });
  },

  async delete(id: string, adminRole: UserRole, adminId: string): Promise<void> {
    await this.deleteUser(id, adminRole, adminId);
  },
  
  async updateRole(id: string, role: UserRole, adminRole: UserRole): Promise<void> {
    await this.updateUserRole(id, role, adminRole);
  },
};

export const firestoreService = {
  createUser: UsersService.createUser.bind(UsersService),
  getUser: UsersService.getUser.bind(UsersService),
  updateUser: UsersService.updateUser.bind(UsersService),
  getUserRole: UsersService.getUserRole.bind(UsersService),
  updateUserRole: UsersService.updateUserRole.bind(UsersService),

  getMembers: MembersService.onSnapshot.bind(MembersService),
  getMember: MembersService.getById.bind(MembersService),
  createMember: MembersService.create.bind(MembersService),
  updateMember: MembersService.update.bind(MembersService),
  deleteMember: MembersService.delete.bind(MembersService),

  getEvents: EventsService.onSnapshot.bind(EventsService),
  getEvent: EventsService.getById.bind(EventsService),
  createEvent: EventsService.create.bind(EventsService),
  updateEvent: EventsService.update.bind(EventsService),
  deleteEvent: EventsService.delete.bind(EventsService),

  getTransactions: TransactionsService.onSnapshot.bind(TransactionsService),
  getTransaction: TransactionsService.getById.bind(TransactionsService),
  createTransaction: TransactionsService.create.bind(TransactionsService),
  updateTransaction: TransactionsService.update.bind(TransactionsService),
  deleteTransaction: TransactionsService.delete.bind(TransactionsService),
};

export default firestoreService;

