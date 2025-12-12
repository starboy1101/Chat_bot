import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface NavigationState {
  activeChatId: string | null;
  sidebarVisible: boolean;
  userMenuOpen: boolean;
  searchQuery: string;
  isMobile: boolean;
  sidebarCollapsed: boolean;
  isDarkMode: boolean;
  refreshTrigger: number; 
  mobileSidebarOpen: boolean;
}

type NavigationAction =
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'REFRESH_CHAT_LIST' }
  | { type: 'SET_SIDEBAR_VISIBLE'; payload: boolean }
  | { type: 'TOGGLE_USER_MENU' }
  | { type: 'SET_USER_MENU_OPEN'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_IS_MOBILE'; payload: boolean }
  | { type: 'TOGGLE_MOBILE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; payload: boolean };

  
interface NavigationContextType {
  state: NavigationState;
  dispatch: React.Dispatch<NavigationAction>;
  actions: {
    setActiveChat: (chatId: string | null) => void;
    toggleSidebar: () => void;
    setSidebarVisible: (visible: boolean) => void;
    toggleUserMenu: () => void;
    setUserMenuOpen: (open: boolean) => void;
    setSearchQuery: (query: string) => void;
    setIsMobile: (isMobile: boolean) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleTheme: () => void;
    setTheme: (isDark: boolean) => void;
    toggleMobileSidebar: () => void;
  };
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const savedChatId = sessionStorage.getItem("activeChatId");

const initialState: NavigationState = {
  activeChatId: savedChatId ? savedChatId : null,
  sidebarVisible: true,
  userMenuOpen: false,
  searchQuery: '',
  isMobile: false,
  sidebarCollapsed: false,
  refreshTrigger: 0,
  isDarkMode: false,
  mobileSidebarOpen: false,
};

function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChatId: action.payload };
    
    case 'TOGGLE_SIDEBAR':
      return { 
        ...state, 
        sidebarCollapsed: !state.sidebarCollapsed
      };

    case 'TOGGLE_MOBILE_SIDEBAR':
      return {
        ...state,
        mobileSidebarOpen: !state.mobileSidebarOpen
      };
 

    case 'SET_SIDEBAR_VISIBLE':
      return { ...state, sidebarVisible: action.payload };

    case "REFRESH_CHAT_LIST":
      return { ...state, refreshTrigger: state.refreshTrigger + 1 };

    case 'TOGGLE_USER_MENU':
      return { ...state, userMenuOpen: !state.userMenuOpen };
    
    case 'SET_USER_MENU_OPEN':
      return { ...state, userMenuOpen: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_IS_MOBILE':
      return { 
        ...state, 
        isMobile: action.payload
      };
    
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    
    case 'TOGGLE_THEME':
      return { ...state, isDarkMode: !state.isDarkMode };
    
    case 'SET_THEME':
      return { ...state, isDarkMode: action.payload };
    
    default:
      return state;
  }
}

interface NavigationStateProviderProps {
  children: React.ReactNode;
}

export const NavigationStateProvider = ({ children }: NavigationStateProviderProps) => {
  const [state, dispatch] = useReducer(navigationReducer, initialState);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let isDarkMode = false;
    if (savedTheme) {
      isDarkMode = savedTheme === 'dark';
    } else {
      isDarkMode = systemPrefersDark;
    }
    
    dispatch({ type: 'SET_THEME', payload: isDarkMode });
    
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      dispatch({ type: 'SET_IS_MOBILE', payload: isMobile });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update theme in localStorage and document class
  useEffect(() => {
    localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
    
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  // Action creators
  const actions = {
    setActiveChat: (chatId: string | null) => {
      dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });

      if (chatId) {
        sessionStorage.setItem('activeChatId', chatId);
      } else {
        sessionStorage.removeItem('activeChatId');
      }
    },
    
    toggleSidebar: () => 
      dispatch({ type: 'TOGGLE_SIDEBAR' }),

    toggleMobileSidebar: () => 
      dispatch({ type: 'TOGGLE_MOBILE_SIDEBAR' }),

    refreshChatList: () => 
      dispatch({ type: 'REFRESH_CHAT_LIST' }),

    setSidebarVisible: (visible: boolean) => 
      dispatch({ type: 'SET_SIDEBAR_VISIBLE', payload: visible }),
    
    toggleUserMenu: () => 
      dispatch({ type: 'TOGGLE_USER_MENU' }),
    
    setUserMenuOpen: (open: boolean) => 
      dispatch({ type: 'SET_USER_MENU_OPEN', payload: open }),
    
    setSearchQuery: (query: string) => 
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    
    setIsMobile: (isMobile: boolean) => 
      dispatch({ type: 'SET_IS_MOBILE', payload: isMobile }),
    
    setSidebarCollapsed: (collapsed: boolean) => 
      dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed }),
    
    toggleTheme: () => 
      dispatch({ type: 'TOGGLE_THEME' }),
    
    setTheme: (isDark: boolean) => 
      dispatch({ type: 'SET_THEME', payload: isDark }),
  };

  const contextValue: NavigationContextType = {
    state,
    dispatch,
    actions,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationStateProvider');
  }
  return context;
};

export default NavigationStateProvider;