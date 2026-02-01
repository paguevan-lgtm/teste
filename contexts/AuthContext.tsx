import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { USERS_DB } from '../constants';

// Tipagem do Usuário
interface User {
    username: string;
    role: string;
}

// Tipagem do Contexto
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (u: string, p: string, coords: any) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Leitura inicial do token ao carregar a página
    useEffect(() => {
        const loadSession = () => {
            try {
                const savedSession = localStorage.getItem('nexflow_session');
                if (savedSession) {
                    const parsed = JSON.parse(savedSession);
                    const now = Date.now();
                    
                    // Verifica expiração (12 horas)
                    if (parsed.expiry && now < parsed.expiry) {
                        setUser(parsed.user);
                    } else {
                        localStorage.removeItem('nexflow_session');
                    }
                }
            } catch (error) {
                console.error("Erro ao restaurar sessão:", error);
                localStorage.removeItem('nexflow_session');
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
    }, []);

    // 2. Função de Login
    const login = async (u: string, p: string, coords: any): Promise<boolean> => {
        // Simulação de validação (substitua por chamada real à API se necessário)
        // Aqui usamos o USERS_DB local conforme seu código original
        if (USERS_DB[u] && USERS_DB[u].pass === p) {
            const userData: User = { username: u, role: USERS_DB[u].role };
            
            // Persistência
            const expiry = Date.now() + 12 * 60 * 60 * 1000; // 12 horas
            localStorage.setItem('nexflow_session', JSON.stringify({ user: userData, expiry }));
            
            // Atualiza estado IMEDIATAMENTE
            setUser(userData);
            return true;
        }
        return false;
    };

    // 3. Função de Logout
    const logout = () => {
        localStorage.removeItem('nexflow_session');
        setUser(null);
        // Opcional: Limpar temas específicos ou manter
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
