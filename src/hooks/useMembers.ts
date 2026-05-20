import { useState, useEffect, useMemo } from 'react';
import { Member, MemberStatus, Event } from '../types';
import { firestoreService } from '../services/firestore.service';
import { useAuth } from '../contexts/AuthContext';
import { canCreate, canDelete, canEdit } from '../utils/permissions';

interface MemberFilters {
  search: string;
  group: 'all' | 'male' | 'female';
  status: 'all' | 'active' | 'inactive';
  ageRange: 'all' | '14-16' | '17-19' | '20-22';
}

interface MemberStats {
  total: number;
  active: number;
  averageAttendance: number;
}

export const useMembers = () => {
  const { user } = useAuth();
  
  // Estado dos membros e eventos
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado dos modais
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  
  // Estado dos filtros
  const [filters, setFilters] = useState<MemberFilters>({
    search: '',
    group: 'all',
    status: 'all',
    ageRange: 'all',
  });

  // Configura listeners em tempo real para membros e eventos
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribeMembers: (() => void) | undefined;
    let unsubscribeEvents: (() => void) | undefined;

    try {
      unsubscribeMembers = firestoreService.getMembers(user.role, (updatedMembers) => {
        setMembers(updatedMembers);
      });

      unsubscribeEvents = firestoreService.getEvents(user.role, (updatedEvents) => {
        setEvents(updatedEvents);
        setLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      setLoading(false);
    }

    return () => {
      unsubscribeMembers?.();
      unsubscribeEvents?.();
    };
  }, [user]);

  /**
   * Calcula a idade a partir da data de nascimento
   */
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  /**
   * Calcula a taxa de presença de um membro
   * NOTA: Funcionalidade de presença foi removida
   */
  const getMemberAttendanceRate = (memberId: string): number => {
    return 0; // Funcionalidade removida
  };

  /**
   * Filtra membros baseado nos filtros ativos
   */
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const memberName = typeof member.name === 'string' ? member.name : '';
      const memberEmail = typeof member.email === 'string' ? member.email : '';

      // Filtro de busca
      const matchesSearch =
        memberName.toLowerCase().includes(filters.search.toLowerCase()) ||
        memberEmail.toLowerCase().includes(filters.search.toLowerCase());
      
      // Filtro de grupo (gênero)
      const matchesGroup = 
        filters.group === 'all' || member.gender === filters.group;
      
      // Filtro de status
      const matchesStatus = 
        filters.status === 'all' || member.status === filters.status;
      
      // Filtro de faixa etária
      let matchesAge = true;
      if (filters.ageRange !== 'all') {
        const age = calculateAge(member.birthDate);
        switch (filters.ageRange) {
          case '14-16':
            matchesAge = age >= 14 && age <= 16;
            break;
          case '17-19':
            matchesAge = age >= 17 && age <= 19;
            break;
          case '20-22':
            matchesAge = age >= 20 && age <= 22;
            break;
        }
      }
      
      return matchesSearch && matchesGroup && matchesStatus && matchesAge;
    });
  }, [members, filters]);

  /**
   * Calcula estatísticas dos membros
   */
  const stats = useMemo((): MemberStats => {
    const activeMembers = members.filter(m => m.status === MemberStatus.ACTIVE);
    
    // Calcula taxa média de presença
    let totalAttendanceRate = 0;
    let membersWithEvents = 0;
    
    activeMembers.forEach(member => {
      const rate = getMemberAttendanceRate(member.id);
      if (rate > 0) {
        totalAttendanceRate += rate;
        membersWithEvents++;
      }
    });
    
    const averageAttendance = membersWithEvents > 0 
      ? totalAttendanceRate / membersWithEvents 
      : 0;
    
    return {
      total: members.length,
      active: activeMembers.length,
      averageAttendance: Math.round(averageAttendance * 10) / 10,
    };
  }, [members, events]);

  /**
   * Cria um novo membro no Firestore
   */
  const handleCreateMember = async (memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);
      if (!canCreate(user.role, 'member')) {
        throw new Error('Usuário não tem permissão para criar membros');
      }

      await firestoreService.createMember(memberData, user.role);
      console.log('Membro criado com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar membro';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Atualiza um membro existente no Firestore
   */
  const handleUpdateMember = async (id: string, memberData: Partial<Member>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);
      if (!canEdit(user.role, 'member')) {
        throw new Error('Usuário não tem permissão para editar membros');
      }

      await firestoreService.updateMember(id, memberData, user.role);
      console.log('Membro atualizado com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar membro';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Exclui um membro do Firestore
   */
  const handleDeleteMember = async (id: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    if (window.confirm('Tem certeza que deseja excluir este membro?')) {
      try {
        setError(null);
        if (!canDelete(user.role, 'member')) {
          throw new Error('Usuário não tem permissão para excluir membros');
        }

        await firestoreService.deleteMember(id, user.role);
        console.log('Membro excluído com sucesso');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir membro';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    }
  };

  /**
   * Atualiza os filtros
   */
  const handleFilterChange = (newFilters: Partial<MemberFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Registra presença de membros em um evento no Firestore
   * NOTA: Funcionalidade de presença foi removida
   */
  const handleAttendance = async (eventId: string, memberIds: string[]) => {
    console.warn('Funcionalidade de presença foi removida');
    return;
  };

  /**
   * Abre o formulário para criar novo membro
   */
  const handleNewMember = () => {
    setSelectedMember(null);
    setIsFormOpen(true);
  };

  /**
   * Abre o formulário para editar membro
   */
  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsFormOpen(true);
  };

  /**
   * Abre o modal de detalhes do membro
   */
  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setIsDetailsOpen(true);
  };

  /**
   * Salva membro (cria ou atualiza)
   */
  const handleSaveMember = async (memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedMember) {
      await handleUpdateMember(selectedMember.id, memberData);
    } else {
      await handleCreateMember(memberData);
    }
  };

  const permissions = useMemo(
    () => ({
      canCreateMember: !!user && canCreate(user.role, 'member'),
      canEditMember: !!user && canEdit(user.role, 'member'),
      canDeleteMember: !!user && canDelete(user.role, 'member'),
      canManageAttendance: !!user && canEdit(user.role, 'event'),
    }),
    [user]
  );

  return {
    // Dados
    members: filteredMembers,
    allMembers: members,
    events,
    selectedMember,
    loading,
    error,
    
    // Estados dos modais
    isFormOpen,
    isDetailsOpen,
    isAttendanceOpen,
    
    // Filtros e estatísticas
    filters,
    stats,
    permissions,
    
    // Funções CRUD
    handleCreateMember,
    handleUpdateMember,
    handleDeleteMember,
    handleSaveMember,
    
    // Funções de UI
    handleNewMember,
    handleEditMember,
    handleViewDetails,
    handleFilterChange,
    handleAttendance,
    
    // Setters dos modais
    setIsFormOpen,
    setIsDetailsOpen,
    setIsAttendanceOpen,
    setSelectedMember,
    
    // Funções auxiliares
    getMemberAttendanceRate,
    calculateAge,
  };
};

