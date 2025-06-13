
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // App general
    'app.title': 'Chat App',
    
    // Authentication
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.pleaseLogin': 'Please log in to see users',
    'auth.pleaseLoginToChat': 'Please log in to chat',
    'auth.needAuthentication': 'You need to be authenticated to use the chat',
    
    // Chat interface
    'chat.placeholder': 'Type a message...',
    'chat.send': 'Send',
    'chat.unknownUser': 'Unknown User',
    
    // Sidebar
    'sidebar.chats': 'Chats',
    'sidebar.rooms': 'Rooms',
    'sidebar.createRoom': 'Create Room',
    'sidebar.settings': 'Settings',
    'sidebar.logout': 'Logout',
    'sidebar.noUsers': 'No users available',
    'sidebar.noRooms': 'No rooms available',
    
    // Search
    'search.placeholder': 'Search users and rooms...',
    'search.noUsersFound': 'No users found',
    'search.noRoomsFound': 'No rooms found',
    
    // Settings
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
    
    // Room
    'room.create': 'Create New Room',
    'room.name': 'Room Name',
    'room.description': 'Description (Optional)',
    'room.creating': 'Creating...',
    'room.private': 'Private room',
    
    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    
    // Status
    'status.online': 'Online',
    'status.lastSeenRecently': 'Last seen recently',
    
    // Time
    'time.justNow': 'Just now',
    'time.hours': 'h',
    'time.days': 'd',
    
    // Welcome
    'welcome.title': 'Welcome to Chat App',
    'welcome.selectChat': 'Select a conversation to start chatting',
    'welcome.browseUsers': 'Browse Users & Rooms',
    
    // Actions
    'actions.refresh': 'Refresh',
    'actions.changePhoto': 'Change Photo',
    'actions.uploading': 'Uploading...',
    
    // File types
    'file.image': 'Image',
    'file.video': 'Video',
    'file.attachment': 'File',
    
    // Errors
    'error.title': 'Error',
    'error.loadMessages': 'Failed to load messages',
    'error.sendMessage': 'Failed to send message',
    'error.loadUsers': 'Failed to load users',
    'error.uploadPhoto': 'Failed to upload profile photo',
    'error.updateSettings': 'Failed to update settings',
    'error.createRoom': 'Failed to create room',
    
    // Success messages
    'success.photoUpdated': 'Profile photo updated successfully!',
    'success.settingsUpdated': 'Settings updated successfully!',
    'success.roomCreated': 'Room created successfully!',
    'success.loggedOut': 'You have been successfully logged out',
    'success.fileUploaded': 'File uploaded successfully!'
  },
  es: {
    // App general
    'app.title': 'App de Chat',
    
    // Authentication
    'auth.login': 'Iniciar Sesión',
    'auth.signup': 'Registrarse',
    'auth.pleaseLogin': 'Por favor inicia sesión para ver usuarios',
    'auth.pleaseLoginToChat': 'Por favor inicia sesión para chatear',
    'auth.needAuthentication': 'Necesitas estar autenticado para usar el chat',
    
    // Chat interface
    'chat.placeholder': 'Escribe un mensaje...',
    'chat.send': 'Enviar',
    'chat.unknownUser': 'Usuario Desconocido',
    
    // Sidebar
    'sidebar.chats': 'Chats',
    'sidebar.rooms': 'Salas',
    'sidebar.createRoom': 'Crear Sala',
    'sidebar.settings': 'Configuración',
    'sidebar.logout': 'Cerrar Sesión',
    'sidebar.noUsers': 'No hay usuarios disponibles',
    'sidebar.noRooms': 'No hay salas disponibles',
    
    // Search
    'search.placeholder': 'Buscar usuarios y salas...',
    'search.noUsersFound': 'No se encontraron usuarios',
    'search.noRoomsFound': 'No se encontraron salas',
    
    // Settings
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
    
    // Room
    'room.create': 'Crear Nueva Sala',
    'room.name': 'Nombre de la Sala',
    'room.description': 'Descripción (Opcional)',
    'room.creating': 'Creando...',
    'room.private': 'Sala privada',
    
    // Theme
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    
    // Status
    'status.online': 'En línea',
    'status.lastSeenRecently': 'Visto recientemente',
    
    // Time
    'time.justNow': 'Ahora mismo',
    'time.hours': 'h',
    'time.days': 'd',
    
    // Welcome
    'welcome.title': 'Bienvenido a Chat App',
    'welcome.selectChat': 'Selecciona una conversación para empezar a chatear',
    'welcome.browseUsers': 'Explorar Usuarios y Salas',
    
    // Actions
    'actions.refresh': 'Actualizar',
    'actions.changePhoto': 'Cambiar Foto',
    'actions.uploading': 'Subiendo...',
    
    // File types
    'file.image': 'Imagen',
    'file.video': 'Video',
    'file.attachment': 'Archivo',
    
    // Errors
    'error.title': 'Error',
    'error.loadMessages': 'Error al cargar mensajes',
    'error.sendMessage': 'Error al enviar mensaje',
    'error.loadUsers': 'Error al cargar usuarios',
    'error.uploadPhoto': 'Error al subir foto de perfil',
    'error.updateSettings': 'Error al actualizar configuración',
    'error.createRoom': 'Error al crear sala',
    
    // Success messages
    'success.photoUpdated': '¡Foto de perfil actualizada exitosamente!',
    'success.settingsUpdated': '¡Configuración actualizada exitosamente!',
    'success.roomCreated': '¡Sala creada exitosamente!',
    'success.loggedOut': 'Has cerrado sesión exitosamente',
    'success.fileUploaded': '¡Archivo subido exitosamente!'
  },
  fr: {
    // App general
    'app.title': 'App de Chat',
    
    // Authentication
    'auth.login': 'Connexion',
    'auth.signup': 'S\'inscrire',
    'auth.pleaseLogin': 'Veuillez vous connecter pour voir les utilisateurs',
    'auth.pleaseLoginToChat': 'Veuillez vous connecter pour chatter',
    'auth.needAuthentication': 'Vous devez être authentifié pour utiliser le chat',
    
    // Chat interface
    'chat.placeholder': 'Tapez un message...',
    'chat.send': 'Envoyer',
    'chat.unknownUser': 'Utilisateur Inconnu',
    
    // Sidebar
    'sidebar.chats': 'Discussions',
    'sidebar.rooms': 'Salles',
    'sidebar.createRoom': 'Créer une Salle',
    'sidebar.settings': 'Paramètres',
    'sidebar.logout': 'Déconnexion',
    'sidebar.noUsers': 'Aucun utilisateur disponible',
    'sidebar.noRooms': 'Aucune salle disponible',
    
    // Search
    'search.placeholder': 'Rechercher utilisateurs et salles...',
    'search.noUsersFound': 'Aucun utilisateur trouvé',
    'search.noRoomsFound': 'Aucune salle trouvée',
    
    // Settings
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
    
    // Room
    'room.create': 'Créer une Nouvelle Salle',
    'room.name': 'Nom de la Salle',
    'room.description': 'Description (Optionnel)',
    'room.creating': 'Création...',
    'room.private': 'Salle privée',
    
    // Theme
    'theme.light': 'Clair',
    'theme.dark': 'Sombre',
    
    // Status
    'status.online': 'En ligne',
    'status.lastSeenRecently': 'Vu récemment',
    
    // Time
    'time.justNow': 'À l\'instant',
    'time.hours': 'h',
    'time.days': 'j',
    
    // Welcome
    'welcome.title': 'Bienvenue dans Chat App',
    'welcome.selectChat': 'Sélectionnez une conversation pour commencer à chatter',
    'welcome.browseUsers': 'Parcourir Utilisateurs et Salles',
    
    // Actions
    'actions.refresh': 'Actualiser',
    'actions.changePhoto': 'Changer la Photo',
    'actions.uploading': 'Téléchargement...',
    
    // File types
    'file.image': 'Image',
    'file.video': 'Vidéo',
    'file.attachment': 'Fichier',
    
    // Errors
    'error.title': 'Erreur',
    'error.loadMessages': 'Échec du chargement des messages',
    'error.sendMessage': 'Échec de l\'envoi du message',
    'error.loadUsers': 'Échec du chargement des utilisateurs',
    'error.uploadPhoto': 'Échec du téléchargement de la photo de profil',
    'error.updateSettings': 'Échec de la mise à jour des paramètres',
    'error.createRoom': 'Échec de la création de la salle',
    
    // Success messages
    'success.photoUpdated': 'Photo de profil mise à jour avec succès!',
    'success.settingsUpdated': 'Paramètres mis à jour avec succès!',
    'success.roomCreated': 'Salle créée avec succès!',
    'success.loggedOut': 'Vous avez été déconnecté avec succès',
    'success.fileUploaded': 'Fichier téléchargé avec succès!'
  },
  de: {
    // App general
    'app.title': 'Chat App',
    
    // Authentication
    'auth.login': 'Anmelden',
    'auth.signup': 'Registrieren',
    'auth.pleaseLogin': 'Bitte melden Sie sich an, um Benutzer zu sehen',
    'auth.pleaseLoginToChat': 'Bitte melden Sie sich an, um zu chatten',
    'auth.needAuthentication': 'Sie müssen authentifiziert sein, um den Chat zu verwenden',
    
    // Chat interface
    'chat.placeholder': 'Nachricht eingeben...',
    'chat.send': 'Senden',
    'chat.unknownUser': 'Unbekannter Benutzer',
    
    // Sidebar
    'sidebar.chats': 'Chats',
    'sidebar.rooms': 'Räume',
    'sidebar.createRoom': 'Raum Erstellen',
    'sidebar.settings': 'Einstellungen',
    'sidebar.logout': 'Abmelden',
    'sidebar.noUsers': 'Keine Benutzer verfügbar',
    'sidebar.noRooms': 'Keine Räume verfügbar',
    
    // Search
    'search.placeholder': 'Benutzer und Räume suchen...',
    'search.noUsersFound': 'Keine Benutzer gefunden',
    'search.noRoomsFound': 'Keine Räume gefunden',
    
    // Settings
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
    
    // Room
    'room.create': 'Neuen Raum Erstellen',
    'room.name': 'Raumname',
    'room.description': 'Beschreibung (Optional)',
    'room.creating': 'Erstellen...',
    'room.private': 'Privater Raum',
    
    // Theme
    'theme.light': 'Hell',
    'theme.dark': 'Dunkel',
    
    // Status
    'status.online': 'Online',
    'status.lastSeenRecently': 'Kürzlich gesehen',
    
    // Time
    'time.justNow': 'Gerade eben',
    'time.hours': 'h',
    'time.days': 'T',
    
    // Welcome
    'welcome.title': 'Willkommen bei Chat App',
    'welcome.selectChat': 'Wählen Sie eine Unterhaltung aus, um zu chatten',
    'welcome.browseUsers': 'Benutzer und Räume durchsuchen',
    
    // Actions
    'actions.refresh': 'Aktualisieren',
    'actions.changePhoto': 'Foto Ändern',
    'actions.uploading': 'Hochladen...',
    
    // File types
    'file.image': 'Bild',
    'file.video': 'Video',
    'file.attachment': 'Datei',
    
    // Errors
    'error.title': 'Fehler',
    'error.loadMessages': 'Nachrichten konnten nicht geladen werden',
    'error.sendMessage': 'Nachricht konnte nicht gesendet werden',
    'error.loadUsers': 'Benutzer konnten nicht geladen werden',
    'error.uploadPhoto': 'Profilbild konnte nicht hochgeladen werden',
    'error.updateSettings': 'Einstellungen konnten nicht aktualisiert werden',
    'error.createRoom': 'Raum konnte nicht erstellt werden',
    
    // Success messages
    'success.photoUpdated': 'Profilbild erfolgreich aktualisiert!',
    'success.settingsUpdated': 'Einstellungen erfolgreich aktualisiert!',
    'success.roomCreated': 'Raum erfolgreich erstellt!',
    'success.loggedOut': 'Sie wurden erfolgreich abgemeldet',
    'success.fileUploaded': 'Datei erfolgreich hochgeladen!'
  },
  it: {
    // App general
    'app.title': 'App Chat',
    
    // Authentication
    'auth.login': 'Accedi',
    'auth.signup': 'Registrati',
    'auth.pleaseLogin': 'Effettua il login per vedere gli utenti',
    'auth.pleaseLoginToChat': 'Effettua il login per chattare',
    'auth.needAuthentication': 'Devi essere autenticato per usare la chat',
    
    // Chat interface
    'chat.placeholder': 'Scrivi un messaggio...',
    'chat.send': 'Invia',
    'chat.unknownUser': 'Utente Sconosciuto',
    
    // Sidebar
    'sidebar.chats': 'Chat',
    'sidebar.rooms': 'Stanze',
    'sidebar.createRoom': 'Crea Stanza',
    'sidebar.settings': 'Impostazioni',
    'sidebar.logout': 'Disconnetti',
    'sidebar.noUsers': 'Nessun utente disponibile',
    'sidebar.noRooms': 'Nessuna stanza disponibile',
    
    // Search
    'search.placeholder': 'Cerca utenti e stanze...',
    'search.noUsersFound': 'Nessun utente trovato',
    'search.noRoomsFound': 'Nessuna stanza trovata',
    
    // Settings
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
    
    // Room
    'room.create': 'Crea Nuova Stanza',
    'room.name': 'Nome Stanza',
    'room.description': 'Descrizione (Opzionale)',
    'room.creating': 'Creando...',
    'room.private': 'Stanza privata',
    
    // Theme
    'theme.light': 'Chiaro',
    'theme.dark': 'Scuro',
    
    // Status
    'status.online': 'Online',
    'status.lastSeenRecently': 'Visto di recente',
    
    // Time
    'time.justNow': 'Proprio ora',
    'time.hours': 'h',
    'time.days': 'g',
    
    // Welcome
    'welcome.title': 'Benvenuto in Chat App',
    'welcome.selectChat': 'Seleziona una conversazione per iniziare a chattare',
    'welcome.browseUsers': 'Sfoglia Utenti e Stanze',
    
    // Actions
    'actions.refresh': 'Aggiorna',
    'actions.changePhoto': 'Cambia Foto',
    'actions.uploading': 'Caricamento...',
    
    // File types
    'file.image': 'Immagine',
    'file.video': 'Video',
    'file.attachment': 'File',
    
    // Errors
    'error.title': 'Errore',
    'error.loadMessages': 'Impossibile caricare i messaggi',
    'error.sendMessage': 'Impossibile inviare il messaggio',
    'error.loadUsers': 'Impossibile caricare gli utenti',
    'error.uploadPhoto': 'Impossibile caricare la foto del profilo',
    'error.updateSettings': 'Impossibile aggiornare le impostazioni',
    'error.createRoom': 'Impossibile creare la stanza',
    
    // Success messages
    'success.photoUpdated': 'Foto del profilo aggiornata con successo!',
    'success.settingsUpdated': 'Impostazioni aggiornate con successo!',
    'success.roomCreated': 'Stanza creata con successo!',
    'success.loggedOut': 'Disconnessione avvenuta con successo',
    'success.fileUploaded': 'File caricato con successo!'
  },
  pt: {
    // App general
    'app.title': 'App de Chat',
    
    // Authentication
    'auth.login': 'Entrar',
    'auth.signup': 'Cadastrar',
    'auth.pleaseLogin': 'Por favor, faça login para ver os usuários',
    'auth.pleaseLoginToChat': 'Por favor, faça login para conversar',
    'auth.needAuthentication': 'Você precisa estar autenticado para usar o chat',
    
    // Chat interface
    'chat.placeholder': 'Digite uma mensagem...',
    'chat.send': 'Enviar',
    'chat.unknownUser': 'Usuário Desconhecido',
    
    // Sidebar
    'sidebar.chats': 'Conversas',
    'sidebar.rooms': 'Salas',
    'sidebar.createRoom': 'Criar Sala',
    'sidebar.settings': 'Configurações',
    'sidebar.logout': 'Sair',
    'sidebar.noUsers': 'Nenhum usuário disponível',
    'sidebar.noRooms': 'Nenhuma sala disponível',
    
    // Search
    'search.placeholder': 'Buscar usuários e salas...',
    'search.noUsersFound': 'Nenhum usuário encontrado',
    'search.noRoomsFound': 'Nenhuma sala encontrada',
    
    // Settings
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
    
    // Room
    'room.create': 'Criar Nova Sala',
    'room.name': 'Nome da Sala',
    'room.description': 'Descrição (Opcional)',
    'room.creating': 'Criando...',
    'room.private': 'Sala privada',
    
    // Theme
    'theme.light': 'Claro',
    'theme.dark': 'Escuro',
    
    // Status
    'status.online': 'Online',
    'status.lastSeenRecently': 'Visto recentemente',
    
    // Time
    'time.justNow': 'Agora mesmo',
    'time.hours': 'h',
    'time.days': 'd',
    
    // Welcome
    'welcome.title': 'Bem-vindo ao Chat App',
    'welcome.selectChat': 'Selecione uma conversa para começar a conversar',
    'welcome.browseUsers': 'Navegar por Usuários e Salas',
    
    // Actions
    'actions.refresh': 'Atualizar',
    'actions.changePhoto': 'Alterar Foto',
    'actions.uploading': 'Enviando...',
    
    // File types
    'file.image': 'Imagem',
    'file.video': 'Vídeo',
    'file.attachment': 'Arquivo',
    
    // Errors
    'error.title': 'Erro',
    'error.loadMessages': 'Falha ao carregar mensagens',
    'error.sendMessage': 'Falha ao enviar mensagem',
    'error.loadUsers': 'Falha ao carregar usuários',
    'error.uploadPhoto': 'Falha ao carregar foto do perfil',
    'error.updateSettings': 'Falha ao atualizar configurações',
    'error.createRoom': 'Falha ao criar sala',
    
    // Success messages
    'success.photoUpdated': 'Foto do perfil atualizada com sucesso!',
    'success.settingsUpdated': 'Configurações atualizadas com sucesso!',
    'success.roomCreated': 'Sala criada com sucesso!',
    'success.loggedOut': 'Você foi desconectado com sucesso',
    'success.fileUploaded': 'Arquivo enviado com sucesso!'
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
