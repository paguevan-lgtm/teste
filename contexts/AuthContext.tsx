
import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { USERS_DB } from '../constants';
import { db, auth } from '../firebase';
import { getDeviceFingerprint, parseUserAgent } from '../utils';

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

    // 1. Leitura inicial do token e Auth Anônima
    useEffect(() => {
        const initAuth = async () => {
            // Restore Session
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

            // Firebase Anonymous Auth (Necessário para as Regras de Segurança)
            if (auth) {
                auth.onAuthStateChanged((u: any) => {
                    if (!u) {
                        auth.signInAnonymously().catch((e: any) => {
                            // Ignora erros de configuração se ainda não estiver ativado no console
                            if(e.code !== 'auth/configuration-not-found' && e.code !== 'auth/operation-not-allowed') {
                                console.error("Firebase Auth Error:", e);
                            }
                        });
                    }
                });
            }
        };

        initAuth();
    }, []);

    // 2. Função de Login (DB First, Fallback to Constant)
    const login = async (u: string, p: string, coords: any): Promise<boolean> => {
        try {
            // --- SECURITY CHECK (FINGERPRINT) ---
            const deviceId = await getDeviceFingerprint();
            
            // Verifica se está na lista de bloqueados
            if (db) {
                const blockedSnap = await db.ref(`blocked_devices/${deviceId}`).once('value');
                if (blockedSnap.exists()) {
                    alert('Este dispositivo foi bloqueado pelo administrador. Entre em contato.');
                    return false;
                }
            }
            // ------------------------------------

            let userData: User | null = null;

            // Garantir Auth Anônima antes de ler o DB (caso o useEffect não tenha terminado)
            if (auth && !auth.currentUser) {
                try { await auth.signInAnonymously(); } catch(e) {}
            }

            // A. Verifica no Firebase Database
            if (db) {
                try {
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
                } catch (dbError) {
                    console.error("Erro leitura login (DB):", dbError);
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
                
                // --- LOGGING DE ACESSO COM GEOCODIFICAÇÃO E FINGERPRINT ---
                (async () => {
                    try {
                        const logData: any = {
                            username: userData.username,
                            timestamp: Date.now(),
                            ip: 'Detectando...',
                            device: navigator.userAgent,
                            deviceId: deviceId, // SAVING FINGERPRINT ID
                            deviceInfo: parseUserAgent(navigator.userAgent)
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
                                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`;
                                const geoReq = await fetch(url, { headers: { 'User-Agent': 'BoraDeVanApp/1.0' } });
                                const geoRes = await geoReq.json();

                                if (geoRes && geoRes.address) {
                                    logData.location = {
                                        exact_address: geoRes.address, 
                                        display_name: geoRes.display_name,
                                        coords: { lat: coords.latitude, lng: coords.longitude }
                                    };
                                } else {
                                    logData.location = { coords: { lat: coords.latitude, lng: coords.longitude } };
                                }
                            } catch (e) {
                                logData.location = { coords: { lat: coords.latitude, lng: coords.longitude } };
                            }
                        }

                        if (db) await db.ref('access_timeline').push(logData);

                    } catch (err) {
                        console.error("Erro fatal no logging:", err);
                    }
                })();
                // ---------------------------------------------

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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
