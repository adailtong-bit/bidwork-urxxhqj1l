import { create } from 'zustand'

type Language = 'pt' | 'en'

type Translations = {
  [key in Language]: {
    [key: string]: string
  }
}

const translations: Translations = {
  pt: {
    // General
    'app.title': 'BIDWORK',
    'search.placeholder': 'Buscar...',
    cancel: 'Cancelar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    confirm: 'Confirmar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',

    // Header & Sidebar
    'nav.dashboard': 'Dashboard',
    'nav.plans': 'Meus Planos',
    'nav.projects': 'Gestão de Obras',
    'nav.team': 'Equipe',
    'nav.settings': 'Configurações',
    'nav.finance': 'Finanças',
    'header.notifications': 'Notificações',
    'header.verified': 'Verificado',

    // Auth
    'auth.register.title': 'Criar conta BIDWORK',
    'auth.register.subtitle': 'Junte-se à nossa plataforma de serviços',
    'auth.login': 'Entrar',

    // Validation
    'val.required': 'Campo obrigatório',
    'val.email': 'Email inválido',
    'val.phone': 'Telefone inválido para o país selecionado',
    'val.zip': 'CEP/Zip Code inválido',

    // Team Manager
    'team.manager.title': 'Gestão de Equipe Técnica',
    'team.add': 'Adicionar Profissional',
    'team.remove': 'Remover Membro',
    'team.role': 'Função',
    'team.reallocate': 'Realocar Tarefas',
    'team.reallocate.desc':
      'Este membro possui tarefas pendentes. Selecione um substituto para assumir as responsabilidades e valores.',
    'team.substitute': 'Novo Responsável',
    'team.error.duplicate':
      'Este profissional já está na equipe deste projeto.',
    'team.added': 'Membro adicionado com sucesso.',
    'team.removed': 'Membro removido com sucesso.',
    'team.reallocated': 'Tarefas realocadas com sucesso.',

    // Project Detail
    'proj.detail.schedule': 'Cronograma',
    'proj.detail.partners': 'Parceiros',
    'proj.detail.finance': 'Financeiro',
    'proj.view.cards': 'Cards',
    'proj.view.table': 'Tabela',
    'proj.stage.tasks': 'Tarefas da Etapa',
    'proj.task.status': 'Status',
    'proj.task.progress': 'Progresso',
    'proj.import': 'Importar CSV',
    'proj.team.btn': 'Equipe Técnica',
  },
  en: {
    // General
    'app.title': 'BIDWORK',
    'search.placeholder': 'Search...',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',

    // Header & Sidebar
    'nav.dashboard': 'Dashboard',
    'nav.plans': 'My Plans',
    'nav.projects': 'Construction Management',
    'nav.team': 'Team',
    'nav.settings': 'Settings',
    'nav.finance': 'Finance',
    'header.notifications': 'Notifications',
    'header.verified': 'Verified',

    // Auth
    'auth.register.title': 'Create BIDWORK Account',
    'auth.register.subtitle': 'Join our services platform',
    'auth.login': 'Login',

    // Validation
    'val.required': 'Required field',
    'val.email': 'Invalid email',
    'val.phone': 'Invalid phone for selected country',
    'val.zip': 'Invalid Zip Code',

    // Team Manager
    'team.manager.title': 'Technical Team Management',
    'team.add': 'Add Professional',
    'team.remove': 'Remove Member',
    'team.role': 'Role',
    'team.reallocate': 'Reallocate Tasks',
    'team.reallocate.desc':
      'This member has pending tasks. Select a substitute to take over responsibilities and payments.',
    'team.substitute': 'New Responsible',
    'team.error.duplicate':
      'This professional is already in this project team.',
    'team.added': 'Member added successfully.',
    'team.removed': 'Member removed successfully.',
    'team.reallocated': 'Tasks reallocated successfully.',

    // Project Detail
    'proj.detail.schedule': 'Schedule',
    'proj.detail.partners': 'Partners',
    'proj.detail.finance': 'Finance',
    'proj.view.cards': 'Cards',
    'proj.view.table': 'Table',
    'proj.stage.tasks': 'Stage Tasks',
    'proj.task.status': 'Status',
    'proj.task.progress': 'Progress',
    'proj.import': 'Import CSV',
    'proj.team.btn': 'Technical Team',
  },
}

interface LanguageState {
  currentLanguage: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: 'pt',
  setLanguage: (lang) => set({ currentLanguage: lang }),
  t: (key) => {
    const lang = get().currentLanguage
    return translations[lang][key] || key
  },
}))
