import { useState, useEffect, useMemo } from 'react';
import { Member, MemberStatus, Event, AttendanceStatus } from '../types';
import { mockMembers, mockEvents } from '../utils/mockData';

/**
 * Interface para os filtros de membros
 */
interface MemberFilters {
  search: string;
  group: 'all' | 'male' | 'female';
  status: 'all' | 'active' | 'inactive';
  ageRange: 'all' | '14-16' | '17-19' | '20-22';
}

/**
 * Interface para as estatísticas de membros
 */
interface MemberStats {
  total: number;
  active: number;
  averageAttendance: number;
}

/**
 * Custom Hook para gerenciar membros
 * Fornece funcionalidades CRUD, filtros e estatísticas
 */
export const useMembers = () => {
  // Estado dos membros
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  
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

  // Carrega dados mockados na inicialização
  useEffect(() => {
    setMembers(mockMembers);
    setEvents(mockEvents);
  }, []);

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
   */
  const getMemberAttendanceRate = (memberId: string): number => {
    const memberEvents = events.filter(event => 
      event.attendance && event.attendance[memberId]
    );
    
    if (memberEvents.length === 0) return 0;
    
    const presentCount = memberEvents.filter(event => 
      event.attendance[memberId] === AttendanceStatus.PRESENT
    ).length;
    
    return (presentCount / memberEvents.length) * 100;
  };

  /**
   * Filtra membros baseado nos filtros ativos
   */
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Filtro de busca
      const matchesSearch = 
        member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.email.toLowerCase().includes(filters.search.toLowerCase());
      
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
   * Cria um novo membro
   */
  const handleCreateMember = (memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMember: Member = {
      ...memberData,
      id: `member-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setMembers(prev => [...prev, newMember]);
    
    // TODO: Integração com Firebase
    // await addDoc(collection(db, 'members'), newMember);
    
    console.log('Membro criado:', newMember);
  };

  /**
   * Atualiza um membro existente
   */
  const handleUpdateMember = (id: string, memberData: Partial<Member>) => {
    setMembers(prev => 
      prev.map(member => 
        member.id === id 
          ? { ...member, ...memberData, updatedAt: new Date() }
          : member
      )
    );
    
    // TODO: Integração com Firebase
    // await updateDoc(doc(db, 'members', id), { ...memberData, updatedAt: new Date() });
    
    console.log('Membro atualizado:', id, memberData);
  };

  /**
   * Exclui um membro
   */
  const handleDeleteMember = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este membro?')) {
      setMembers(prev => prev.filter(member => member.id !== id));
      
      // TODO: Integração com Firebase
      // await deleteDoc(doc(db, 'members', id));
      
      console.log('Membro excluído:', id);
    }
  };

  /**
   * Atualiza os filtros
   */
  const handleFilterChange = (newFilters: Partial<MemberFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Registra presença de membros em um evento
   */
  const handleAttendance = (eventId: string, memberIds: string[]) => {
    setEvents(prev => 
      prev.map(event => {
        if (event.id === eventId) {
          const newAttendance: { [key: string]: AttendanceStatus } = {};
          
          // Marca presentes
          memberIds.forEach(memberId => {
            newAttendance[memberId] = AttendanceStatus.PRESENT;
          });
          
          // Marca ausentes (membros ativos que não estão na lista)
          members
            .filter(m => m.status === MemberStatus.ACTIVE && !memberIds.includes(m.id))
            .forEach(member => {
              newAttendance[member.id] = AttendanceStatus.ABSENT;
            });
          
          return {
            ...event,
            attendees: memberIds,
            attendance: newAttendance,
            updatedAt: new Date(),
          };
        }
        return event;
      })
    );
    
    // TODO: Integração com Firebase
    // await updateDoc(doc(db, 'events', eventId), {
    //   attendees: memberIds,
    //   attendance: newAttendance,
    //   updatedAt: new Date()
    // });
    
    console.log('Presença registrada:', eventId, memberIds);
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
  const handleSaveMember = (memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedMember) {
      handleUpdateMember(selectedMember.id, memberData);
    } else {
      handleCreateMember(memberData);
    }
  };

  return {
    // Dados
    members: filteredMembers,
    allMembers: members,
    events,
    selectedMember,
    
    // Estados dos modais
    isFormOpen,
    isDetailsOpen,
    isAttendanceOpen,
    
    // Filtros e estatísticas
    filters,
    stats,
    
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

// Made with Bob