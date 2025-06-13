
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    'chat.placeholder': 'Type a message...',
    'chat.send': 'Send',
    'sidebar.chats': 'Chats',
    'sidebar.rooms': 'Rooms',
    'sidebar.createRoom': 'Create Room',
    'sidebar.settings': 'Settings',
    'sidebar.logout': 'Logout',
    'settings.title': 'Settings',
    'settings.profilePhoto': 'Profile Photo',
    'settings.displayName': 'Display Name',
    'settings.username': 'Username',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.wallpaper': 'Chat Wallpaper',
    'settings.onlineStatus': 'Show as online',
    'settings.save': 'Save Changes',
    'settings.cancel': 'Cancel',
    'settings.saving': 'Saving...',
    'room.create': 'Create New Room',
    'room.name': 'Room Name',
    'room.description': 'Description (Optional)',
    'room.creating': 'Creating...',
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'theme.light': 'Light',
    'theme.dark': 'Dark'
  },
  es: {
    'chat.placeholder': 'Escribe un mensaje...',
    'chat.send': 'Enviar',
    'sidebar.chats': 'Chats',
    'sidebar.rooms': 'Salas',
    'sidebar.createRoom': 'Crear Sala',
    'sidebar.settings': 'Configuración',
    'sidebar.logout': 'Cerrar Sesión',
    'settings.title': 'Configuración',
    'settings.profilePhoto': 'Foto de Perfil',
    'settings.displayName': 'Nombre a Mostrar',
    'settings.username': 'Nombre de Usuario',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.wallpaper': 'Fondo de Chat',
    'settings.onlineStatus': 'Mostrar como en línea',
    'settings.save': 'Guardar Cambios',
    'settings.cancel': 'Cancelar',
    'settings.saving': 'Guardando...',
    'room.create': 'Crear Nueva Sala',
    'room.name': 'Nombre de la Sala',
    'room.description': 'Descripción (Opcional)',
    'room.creating': 'Creando...',
    'auth.login': 'Iniciar Sesión',
    'auth.signup': 'Registrarse',
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro'
  },
  fr: {
    'chat.placeholder': 'Tapez un message...',
    'chat.send': 'Envoyer',
    'sidebar.chats': 'Discussions',
    'sidebar.rooms': 'Salles',
    'sidebar.createRoom': 'Créer une Salle',
    'sidebar.settings': 'Paramètres',
    'sidebar.logout': 'Déconnexion',
    'settings.title': 'Paramètres',
    'settings.profilePhoto': 'Photo de Profil',
    'settings.displayName': 'Nom d\'Affichage',
    'settings.username': 'Nom d\'Utilisateur',
    'settings.language': 'Langue',
    'settings.theme': 'Thème',
    'settings.wallpaper': 'Fond de Chat',
    'settings.onlineStatus': 'Afficher comme en ligne',
    'settings.save': 'Enregistrer',
    'settings.cancel': 'Annuler',
    'settings.saving': 'Enregistrement...',
    'room.create': 'Créer une Nouvelle Salle',
    'room.name': 'Nom de la Salle',
    'room.description': 'Description (Optionnel)',
    'room.creating': 'Création...',
    'auth.login': 'Connexion',
    'auth.signup': 'S\'inscrire',
    'theme.light': 'Clair',
    'theme.dark': 'Sombre'
  },
  de: {
    'chat.placeholder': 'Nachricht eingeben...',
    'chat.send': 'Senden',
    'sidebar.chats': 'Chats',
    'sidebar.rooms': 'Räume',
    'sidebar.createRoom': 'Raum Erstellen',
    'sidebar.settings': 'Einstellungen',
    'sidebar.logout': 'Abmelden',
    'settings.title': 'Einstellungen',
    'settings.profilePhoto': 'Profilbild',
    'settings.displayName': 'Anzeigename',
    'settings.username': 'Benutzername',
    'settings.language': 'Sprache',
    'settings.theme': 'Theme',
    'settings.wallpaper': 'Chat-Hintergrund',
    'settings.onlineStatus': 'Als online anzeigen',
    'settings.save': 'Änderungen Speichern',
    'settings.cancel': 'Abbrechen',
    'settings.saving': 'Speichern...',
    'room.create': 'Neuen Raum Erstellen',
    'room.name': 'Raumname',
    'room.description': 'Beschreibung (Optional)',
    'room.creating': 'Erstellen...',
    'auth.login': 'Anmelden',
    'auth.signup': 'Registrieren',
    'theme.light': 'Hell',
    'theme.dark': 'Dunkel'
  },
  it: {
    'chat.placeholder': 'Scrivi un messaggio...',
    'chat.send': 'Invia',
    'sidebar.chats': 'Chat',
    'sidebar.rooms': 'Stanze',
    'sidebar.createRoom': 'Crea Stanza',
    'sidebar.settings': 'Impostazioni',
    'sidebar.logout': 'Disconnetti',
    'settings.title': 'Impostazioni',
    'settings.profilePhoto': 'Foto Profilo',
    'settings.displayName': 'Nome Visualizzato',
    'settings.username': 'Nome Utente',
    'settings.language': 'Lingua',
    'settings.theme': 'Tema',
    'settings.wallpaper': 'Sfondo Chat',
    'settings.onlineStatus': 'Mostra come online',
    'settings.save': 'Salva Modifiche',
    'settings.cancel': 'Annulla',
    'settings.saving': 'Salvando...',
    'room.create': 'Crea Nuova Stanza',
    'room.name': 'Nome Stanza',
    'room.description': 'Descrizione (Opzionale)',
    'room.creating': 'Creando...',
    'auth.login': 'Accedi',
    'auth.signup': 'Registrati',
    'theme.light': 'Chiaro',
    'theme.dark': 'Scuro'
  },
  pt: {
    'chat.placeholder': 'Digite uma mensagem...',
    'chat.send': 'Enviar',
    'sidebar.chats': 'Conversas',
    'sidebar.rooms': 'Salas',
    'sidebar.createRoom': 'Criar Sala',
    'sidebar.settings': 'Configurações',
    'sidebar.logout': 'Sair',
    'settings.title': 'Configurações',
    'settings.profilePhoto': 'Foto do Perfil',
    'settings.displayName': 'Nome de Exibição',
    'settings.username': 'Nome de Usuário',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.wallpaper': 'Papel de Parede do Chat',
    'settings.onlineStatus': 'Mostrar como online',
    'settings.save': 'Salvar Alterações',
    'settings.cancel': 'Cancelar',
    'settings.saving': 'Salvando...',
    'room.create': 'Criar Nova Sala',
    'room.name': 'Nome da Sala',
    'room.description': 'Descrição (Opcional)',
    'room.creating': 'Criando...',
    'auth.login': 'Entrar',
    'auth.signup': 'Cadastrar',
    'theme.light': 'Claro',
    'theme.dark': 'Escuro'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: string;
}

export function LanguageProvider({ children, initialLanguage = 'en' }: LanguageProviderProps) {
  const [language, setLanguage] = useState(initialLanguage);

  const t = (key: string): string => {
    const translation = translations[language as keyof typeof translations]?.[key as keyof typeof translations['en']];
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
