
import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { USERS_DB } from '../constants';
import { db } from '../firebase'; // Importar DB

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

    // 2. Função de Login (DB First, Fallback to Constant)
    const login = async (u: string, p: string, coords: any): Promise<boolean> => {
        try {
            let userData: User | null = null;

            // A. Verifica no Firebase Database
            if (db) {
                const snapshot = await db.ref('users').once('value');
                const users = snapshot.val();
                if (users) {
                    const foundKey = Object.keys(users).find(key => 
                        users[key].username.toLowerCase() === u.toLowerCase() && 
                        users[key].pass === p
                    );
                    if (foundKey) {
                        userData = { 
                            username: users[foundKey].username, 
                            role: users[foundKey].role 
                        };
                    }
                }
            }

            // B. Fallback para USERS_DB (Constante Local) se não achou no DB
            if (!userData && USERS_DB[u] && USERS_DB[u].pass === p) {
                userData = { username: u, role: USERS_DB[u].role };
            }

            if (userData) {
                // Persistência
                const expiry = Date.now() + 12 * 60 * 60 * 1000; // 12 horas
                localStorage.setItem('nexflow_session', JSON.stringify({ user: userData, expiry }));
                
                // --- LOGGING DE ACESSO COM GEOCODIFICAÇÃO ---
                // Executa em "background" para não travar a UI do login
                (async () => {
                    try {
                        const logData: any = {
                            username: userData.username,
                            timestamp: Date.now(),
                            ip: 'Detectando...',
                            device: navigator.userAgent
                        };

                        // 1. Obter IP Público
                        try {
                            const ipReq = await fetch('https://api.ipify.org?format=json');
                            const ipRes = await ipReq.json();
                            if (ipRes.ip) logData.ip = ipRes.ip;
                        } catch (e) {
                            console.warn("Falha ao obter IP", e);
                        }

                        // 2. Geocodificação Reversa (Coords -> Endereço)
                        if (coords && coords.latitude && coords.longitude) {
                            try {
                                // Usa Nominatim OpenStreetMap (Gratuito)
                                // User-Agent é obrigatório pela política de uso deles
                                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`;
                                const geoReq = await fetch(url, { 
                                    headers: { 'User-Agent': 'BoraDeVanApp/1.0 (contato@exemplo.com)' } 
                                });
                                const geoRes = await geoReq.json();

                                if (geoRes && geoRes.address) {
                                    logData.location = {
                                        exact_address: geoRes.address, // Contém suburb, city, state, etc.
                                        display_name: geoRes.display_name,
                                        coords: { lat: coords.latitude, lng: coords.longitude }
                                    };
                                } else {
                                    // Fallback se a API não retornar endereço mas tivermos coords
                                    logData.location = {
                                        coords: { lat: coords.latitude, lng: coords.longitude }
                                    };
                                }
                            } catch (e) {
                                console.warn("Erro na geocodificação:", e);
                                // Salva pelo menos as coordenadas cruas se der erro na API
                                logData.location = { coords: { lat: coords.latitude, lng: coords.longitude } };
                            }
                        }

                        // 3. Salvar no Firebase
                        if (db) {
                            await db.ref('access_timeline').push(logData);
                        }

                    } catch (err) {
                        console.error("Erro fatal no logging:", err);
                    }
                })();
                // ---------------------------------------------

                // Atualiza estado IMEDIATAMENTE
                setUser(userData);
                return true;
            }

        } catch (error) {
            console.error("Login error:", error);
        }
        
        return false;
    };

    // 3. Função de Logout
    const logout = () => {
        localStorage.removeItem('nexflow_session');
        setUser(null);
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
