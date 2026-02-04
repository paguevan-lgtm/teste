import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db, auth } from './firebase';
import { THEMES, INITIAL_SP_LIST, BAIRROS } from './constants';
import { Icons, Toast, ConfirmModal, CommandPalette, QuickCalculator } from './components/Shared';
import { TourGuide } from './components/Tour';
import { LoginScreen } from './pages/Login';
import { getTodayDate, getOperationalDate, getLousaDate, generateUniqueId, callGemini, getAvatarUrl, getBairroIdx, formatDisplayDate, dateAddDays, addMinutes } from './utils';

// Context Auth
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import { Sidebar } from './components/Sidebar';
import { GlobalModals } from './components/GlobalModals';

// Pages
import Dashboard from './pages/Dashboard';
import Passageiros from './pages/Passageiros';
import Motoristas from './pages/Motoristas';
import Viagens from './pages/Viagens';
import Agendamentos from './pages/Agendamentos';
import Tabela from './pages/Tabela';
import Financeiro from './pages/Financeiro';
import Achados from './pages/Achados';
import Configuracoes from './pages/Configuracoes';
import GerenciarUsuarios from './pages/GerenciarUsuarios';

// Componente Interno que consome o Contexto
const AppContent = () => {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    
    // Estados Globais
    const [isFireConnected, setIsFireConnected] = useState(false);
    const [view, setView] = useState('dashboard');
    const [menuOpen, setMenuOpen] = useState(false);
    const [data, setData] = useState<any>({ passengers: [], drivers: [], trips: [], notes: [], lostFound: [], blocked_ips: [], newsletter: [], users: [] });
    const [currentIp, setCurrentIp] = useState(''); 
    
    // Estados Específicos
    const [spList, setSpList] = useState(INITIAL_SP_LIST);
    const [rotationBaseDate, setRotationBaseDate] = useState('2026-01-29'); // Data base padrão
    const [tableStatus, setTableStatus] = useState<any>({}); 
    const [lousaOrder, setLousaOrder] = useState<any[]>([]); 
    // generalOrder removido pois agora modificamos a spList diretamente
    const [editName, setEditName] = useState(null);
    const [tempName, setTempName] = useState('');
    const [tableTab, setTableTab] = useState('geral'); 
    
    const [currentOpDate, setCurrentOpDate] = useState(getOperationalDate());
    const [lousaDate, setLousaDate] = useState(getLousaDate());
    const [analysisDate, setAnalysisDate] = useState(getOperationalDate());
    
    const [madrugadaData, setMadrugadaData] = useState<any>({}); 
    const [madrugadaList, setMadrugadaList] = useState<string[]>([]); 
    const [tempVagaMadrugada, setTempVagaMadrugada] = useState(''); 
    
    const [cannedMessages, setCannedMessages] = useState<any[]>([]);
    const [tempJustification, setTempJustification] = useState('');
    const [vagaToBlock, setVagaToBlock] = useState<string|null>(null);
    
    const [themeKey, setThemeKey] = useState('default');
    const [geminiKey, setGeminiKey] = useState(localStorage.getItem('nexflow_gemini_key') || '');
    
    const [ipHistory, setIpHistory] = useState<any[]>([]);
    const [ipLabels, setIpLabels] = useState<any>({});
    
    const theme = useMemo(() => THEMES[themeKey] || THEMES.default, [themeKey]);
    const [billingDate, setBillingDate] = useState(new Date());
    const [pricePerPassenger, setPricePerPassenger] = useState(4);

    // Modais e Formulários
    const [modal, setModal] = useState<string|null>(null); 
    const [aiModal, setAiModal] = useState(false);
    const [showNewsModal, setShowNewsModal] = useState(false); // Modal de Novidades
    const [latestNews, setLatestNews] = useState<any>(null); // Última novidade para exibir

    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [suggestedTrip, setSuggestedTrip] = useState<any>(null);
    const [searchId, setSearchId] = useState('');
    const [editingTripId, setEditingTripId] = useState<string|null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Ativo');
    
    const [ipReason, setIpReason] = useState('');
    const [ipToBlock, setIpToBlock] = useState('');
    const [draggedItem, setDraggedItem] = useState<any>(null); 
    const [draggedMenuIndex, setDraggedMenuIndex] = useState<number|null>(null);
    const [uiTicker, setUiTicker] = useState(0);

    // Premium Utils
    const [cmdOpen, setCmdOpen] = useState(false);
    const [calcOpen, setCalcOpen] = useState(false);

    // Notificações e Confirmações
    const [notification, setNotification] = useState({ message: '', type: 'info', visible: false });
    const [confirmState, setConfirmState] = useState<any>({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'danger' });

    // Tour
    const [runTour, setRunTour] = useState(false);
    const [tourStep, setTourStep] = useState(0);

    const DEFAULT_MENU_ITEMS = useMemo(() => [
        {id:'dashboard',l:'Dashboard',i:Icons.Home}, 
        {id:'appointments', l:'Agendamentos', i:Icons.Calendar}, 
        {id:'passengers',l:'Passageiros',i:Icons.Users}, 
        {id:'table', l: 'Tabela', i: Icons.List}, 
        {id:'drivers',l:'Motoristas',i:Icons.Van}, 
        {id:'trips',l:'Viagens',i:Icons.Map}, 
        {id:'billing', l:'Cobrança', i:Icons.Dollar}, 
        {id:'lostFound', l:'Achados e Perdidos', i:Icons.Box}
    ], []);

    const [orderedMenuItems, setOrderedMenuItems] = useState(DEFAULT_MENU_ITEMS);

    const TOUR_STEPS = [
        { title: "Bem-vindo ao Bora de Van! 🚐", content: "Prepare-se para transformar a gestão do seu transporte. Este tour rápido vai te mostrar os superpoderes do sistema em poucos segundos!", target: null },
        { title: "Menu Inteligente", content: "Aqui você navega entre as áreas. Segure e arraste os ícones para organizar a ordem como preferir!", target: "#sidebar-nav, #mobile-sidebar", placement: 'right' },
        { title: "Dashboard & Resumo", content: "Tenha uma visão geral imediata de quantos passageiros e viagens você tem em historico. Acompanhe gráficos de pagamento e bairros.", target: "#dashboard-stats", placement: 'bottom' },
        { title: "Cadastro Mágico com IA ✨", content: "Não perca tempo digitando! Clique aqui, fale ou escreva algo como 'João vai pro Boqueirão as 18h' e nossa IA preenche tudo sozinha.", target: "#btn-magic-create", view: "dashboard", placement: 'top' },
        { title: "Agendamentos", content: "Visualize seu calendário mensal. Aqui ficam os passageiros que têm horário fixo mas ainda não foram alocados em viagens.", target: "#menu-btn-appointments", view: "appointments", placement: 'right' },
        { title: "Lista de Passageiros", content: "Seu banco de dados completo. Pesquise, edite, ligue ou veja detalhes expandindo o card. Use os filtros no topo para facilitar.", target: "#menu-btn-passengers", view: "passengers", placement: 'right' },
        { title: "Tabela e Lousa", content: "Gerencie a fila de motoristas. Na aba 'Geral' você vê a rodagem, em 'Confirmados' quem já tem horário, e na 'Lousa' a fila de espera.", target: "#menu-btn-table", view: "table", placement: 'right' },
        { title: "Abas da Operação", content: "Deslize ou clique para alternar entre Tabela Geral, Confirmados, Lousa e Madrugada. Tudo sincronizado em tempo real.", target: "#table-tabs", placement: 'bottom' },
        { title: "Gestão de Viagens", content: "Aqui acontecem as viagens. Crie novas, finalize, cancele ou mande a lista para o motorista no WhatsApp com um clique.", target: "#menu-btn-trips", view: "trips", placement: 'right' },
        { title: "Histórico Completo", content: "Nesta aba você também acessa o histórico. Gere relatórios mensais completos em TXT clicando no botão 'Resumo'.", target: "#history-section", view: "trips" },
        { title: "Financeiro & Cobrança 💰", content: "Controle quem te deve! O sistema calcula automaticamente o valor por passageiro (configurável). Marque como Pago/Pendente e cobre no Zap.", target: "#menu-btn-billing", view: "billing", placement: 'right' },
        { title: "Achados e Perdidos 📦", content: "Registre objetos esquecidos nas vans para manter o controle e devolver aos passageiros facilmente.", target: "#menu-btn-lostFound", view: "lostFound", placement: 'right' },
        { title: "Você está pronto! 🚀", content: "Isso é tudo por enquanto. Explore, clique e organize seu transporte. Se precisar rever este tour, vá em Configurações.", target: null }
    ];

    const timerRef = useRef<any>(null);
    const touchStartPos = useRef({ x: 0, y: 0 });
    const globalTouchRef = useRef({ x: 0, y: 0 });

    // --- LOGIC EXTRACTED HELPERS ---
    const notify = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setNotification({ message: msg, type, visible: true });
        setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 3000);
    };

    const requestConfirm = (title: string, message: string, action: () => void, type: 'danger' | 'info' = 'danger') => {
        setConfirmState({ isOpen: true, title, message, onConfirm: () => { action(); setConfirmState((prev:any) => ({ ...prev, isOpen: false })); }, type });
    };

    const getNextId = (col: string) => { 
        const list = data[col] || []; 
        if (list.length === 0) return "1"; 
        if (col === 'notes' || col === 'lostFound' || col === 'blocked_ips' || col === 'newsletter' || col === 'users') return Date.now().toString(); 
        
        const max = list.reduce((acc:number, item:any) => {
            const idNum = parseInt(item.id);
            return !isNaN(idNum) ? Math.max(acc, idNum) : acc;
        }, 0);
        
        return (max + 1).toString(); 
    };

    // Helper específico para Viagens para garantir sequencial sem falhas
    const generateNextTripId = () => {
        const trips = data.trips || [];
        const max = trips.reduce((acc: number, t: any) => {
            const idNum = parseInt(t.id);
            return !isNaN(idNum) ? Math.max(acc, idNum) : acc;
        }, 0);
        return (max + 1).toString();
    };

    const dbOp = async (type: string, node: string, payload: any) => {
        if(!db) return notify("Sem conexão DB.", "error");
        try {
            let ref;
            if (node === 'preferences') ref = db.ref(`user_data/${user.username}/preferences`);
            else ref = db.ref(node);

            if (type === 'create') {
                const nextId = (node === 'passengers' || node === 'drivers' || node === 'trips') ? getNextId(node) : (payload.id || Date.now().toString());
                const finalId = payload.id && (node === 'trips' || node === 'newsletter' || node === 'users') ? payload.id : nextId;
                await ref.child(finalId).set({ ...payload, id: finalId, createdAt: new Date().toISOString() });
                if (node !== 'notes') notify("Salvo com sucesso!", "success");
            } else if (type === 'update') {
                if (payload.id) await ref.child(payload.id).update(payload);
                else await ref.update(payload);
                if (node !== 'preferences') notify("Atualizado!", "success");
            } else if (type === 'delete') {
                await ref.child(payload).remove();
                notify("Excluído.", "info");
            }
        } catch(e: any) { notify("Erro ao salvar: " + e.message, "error"); }
    };

    const changeTheme = (t: string) => { setThemeKey(t); if(user) { dbOp('update', 'preferences', { theme: t }); localStorage.setItem(`${user.username}_nexflow_theme`, t); } };

    // --- EFEITOS E LOGICA ---

    // GLOBAL SHORTCUTS
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setCmdOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const commandActions = useMemo(() => [
        { label: 'Ir para Dashboard', icon: <Icons.Home size={18}/>, action: () => setView('dashboard'), shortcut: 'D' },
        { label: 'Nova Viagem', icon: <Icons.Plus size={18}/>, action: () => { setSuggestedTrip(null); setEditingTripId(null); setModal('trip'); }, color: 'green-400' },
        { label: 'Novo Passageiro', icon: <Icons.Users size={18}/>, action: () => { setFormData({neighborhood:BAIRROS[0],status:'Ativo',payment:'Dinheiro',passengerCount:1, luggageCount:0, date:getTodayDate(), time: ''}); setModal('passenger'); }, color: 'blue-400' },
        { label: 'Calculadora Rápida', icon: <Icons.Calculator size={18}/>, action: () => setCalcOpen(true), color: 'yellow-400' },
        { label: 'Tabela de Motoristas', icon: <Icons.List size={18}/>, action: () => setView('table') },
        { label: 'Financeiro', icon: <Icons.Dollar size={18}/>, action: () => setView('billing') },
        { label: 'Cadastro Mágico (IA)', icon: <Icons.Stars size={18}/>, action: () => setAiModal(true), color: 'purple-400' },
        { label: 'Mudar Tema: Padrão', icon: <Icons.Settings size={18}/>, action: () => changeTheme('default') },
        { label: 'Mudar Tema: Escuro', icon: <Icons.Moon size={18}/>, action: () => changeTheme('dark') },
    ], [setView, setModal, setFormData, setAiModal, changeTheme]);

    useEffect(() => { setSearchTerm(''); }, [view]);

    // Tour Effect: Controla abertura de menus/abas durante o tour
    useEffect(() => {
        if (!runTour) return;
        const step = TOUR_STEPS[tourStep];
        if (!step) return;

        // Se o passo tiver uma 'view' associada, muda a tela automaticamente
        if (step.view && step.view !== view) {
            setView(step.view);
        }

        // Se estiver no mobile e o alvo for o menu, abre o menu
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            const isMenuTarget = step.target && step.target.includes('sidebar');
            setMenuOpen(!!isMenuTarget);
        }
    }, [tourStep, runTour]);

    useEffect(() => {
        fetch('https://ipwho.is/')
            .then(r => r.json())
            .then(d => {
                if (d.success) setCurrentIp(d.ip);
                else fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d2 => setCurrentIp(d2.ip)).catch(e => console.error("Erro IP Fallback:", e));
            })
            .catch(e => console.error("Erro IP Geo:", e));
    }, []);

    useEffect(() => {
        if(auth) {
            const unsub = auth.onAuthStateChanged((u: any) => {
                setIsFireConnected(!!u);
            });
            if (isAuthenticated && !auth.currentUser) {
                // Tenta autenticação anônima, mas ignora erro se não configurado
                auth.signInAnonymously().catch((e:any) => {
                    // Ignora erros específicos de configuração ausente (auth/configuration-not-found)
                    // ou operação não permitida (auth/operation-not-allowed) para não sujar o console
                    if (e.code !== 'auth/configuration-not-found' && e.code !== 'auth/operation-not-allowed') {
                        console.error("Erro re-auth firebase:", e);
                    }
                });
            }
            return () => unsub();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (user) {
            const savedTheme = localStorage.getItem(`${user.username}_nexflow_theme`);
            if(savedTheme) setThemeKey(savedTheme);

            const tourSeen = localStorage.getItem(`tour_seen_${user.username}`);
            if (!tourSeen) setTimeout(() => setRunTour(true), 1500);
        }
    }, [user]);

    // Lógica para verificar Novidades
    useEffect(() => {
        if (data.newsletter && data.newsletter.length > 0 && user) {
            // Ordena para pegar a mais recente
            const sortedNews = [...data.newsletter].sort((a:any, b:any) => b.timestamp - a.timestamp);
            const latest = sortedNews[0];
            
            const lastSeenId = localStorage.getItem(`last_news_seen_${user.username}`);
            
            // Se o ID da última notícia for diferente do visto, mostra o modal
            if (lastSeenId !== latest.id) {
                setLatestNews(latest);
                setShowNewsModal(true);
            }
        }
    }, [data.newsletter, user]);

    const markNewsAsSeen = () => {
        if (latestNews && user) {
            localStorage.setItem(`last_news_seen_${user.username}`, latestNews.id);
        }
        setShowNewsModal(false);
    };

    // Effect to auto-update dates
    useEffect(() => {
        const checkDates = () => {
            const newOp = getOperationalDate();
            const newLousa = getLousaDate();
            if (newOp !== currentOpDate) {
                setCurrentOpDate(newOp);
                // Reseta a data de análise para a nova data operacional se estivermos vendo "hoje"
                if (analysisDate === currentOpDate) setAnalysisDate(newOp);
            }
            if (newLousa !== lousaDate) setLousaDate(newLousa);
        };
        // Checa a cada minuto se virou o dia (03:00)
        const int = setInterval(checkDates, 60000);
        return () => clearInterval(int);
    }, [currentOpDate, lousaDate, analysisDate]);

    useEffect(() => {
        // CORREÇÃO: Removemos isFireConnected para permitir leitura se o DB for publico ou auth estiver lento
        if(!db || !user) return; 
        
        const msgRef = db.ref('canned_messages_config/list');
        const msgCb = msgRef.on('value', (snap: any) => {
            const val = snap.val();
            let list = [];
            if (Array.isArray(val)) list = val.filter(Boolean); 
            else if (val && typeof val === 'object') list = Object.values(val);
            setCannedMessages(list);
        });

        // Ouve a lista global de motoristas
        const driversRef = db.ref('drivers_table_list');
        const driversCb = driversRef.on('value', (snap: any) => {
            const val = snap.val();
            if(val) {
                setSpList(val);
            } else {
                db.ref('drivers_table_list').set(INITIAL_SP_LIST);
                setSpList(INITIAL_SP_LIST);
            }
        });

        // Ouve a Data Base de Rotação
        const rotDateRef = db.ref('system_settings/rotation_base_date');
        const rotDateCb = rotDateRef.on('value', (snap: any) => {
            const val = snap.val();
            if (val) setRotationBaseDate(val);
        });

        const priceRef = db.ref('system_settings/price_per_passenger');
        const priceCb = priceRef.on('value', (snap: any) => {
            if (snap.val()) setPricePerPassenger(Number(snap.val()));
        });

        const madConfigRef = db.ref('madrugada_config/list');
        const madConfigCb = madConfigRef.on('value', (snap: any) => {
            const val = snap.val();
            // CORREÇÃO: Não usar valores padrão se o banco retornar null (lista vazia)
            setMadrugadaList(val || []);
        });

        const dailyRef = db.ref(`daily_tables/${currentOpDate}`);
        const dailyCb = dailyRef.on('value', (snap: any) => {
            const val = snap.val();
            if(val) {
                setTableStatus(val.status || {});
                setMadrugadaData(val.madrugada || {});
            } else {
                // Se o dia virou (03:00) e não tem dados, reseta o estado
                setTableStatus({});
                setMadrugadaData({});
            }
        });

        const lousaRef = db.ref(`daily_tables/${lousaDate}/lousaOrder`);
        const lousaCb = lousaRef.on('value', (snap: any) => {
            const val = snap.val();
            if (val) {
                let rawLousa = val || [];
                const cleanLousa = rawLousa.map((item:any) => {
                    if (typeof item === 'string') return { vaga: item, uid: generateUniqueId(), riscado: false };
                    return item;
                });
                setLousaOrder(cleanLousa);
            } else {
                // Reseta lousa se o dia virou
                setLousaOrder([]);
            }
        });

        const logRef = db.ref('access_timeline');
        const logCb = logRef.limitToLast(50).on('value', (snap: any) => {
            const val = snap.val();
            const list = val ? Object.keys(val).map(k => ({ id: k, ...val[k] })).reverse() : [];
            setIpHistory(list);
        });

        const labelsRef = db.ref('ip_labels');
        const labelsCb = labelsRef.on('value', (snap: any) => {
            setIpLabels(snap.val() || {});
        });

        const savedMenuRef = db.ref(`user_data/${user.username}/preferences/menuOrder`); 
        const savedMenuCb = savedMenuRef.on('value', (snap: any) => { 
            const savedOrder = snap.val(); 
            if (savedOrder && Array.isArray(savedOrder)) { 
                const reordered = savedOrder.map(id => DEFAULT_MENU_ITEMS.find(i => i.id === id)).filter(Boolean); 
                const missing = DEFAULT_MENU_ITEMS.filter(i => !savedOrder.includes(i.id)); 
                setOrderedMenuItems([...reordered, ...missing]); 
            } 
        });

        return () => { 
            msgRef.off('value', msgCb); 
            driversRef.off('value', driversCb); 
            rotDateRef.off('value', rotDateCb);
            priceRef.off('value', priceCb);
            madConfigRef.off('value', madConfigCb); 
            dailyRef.off('value', dailyCb);
            lousaRef.off('value', lousaCb);
            logRef.off('value', logCb);
            labelsRef.off('value', labelsCb);
            savedMenuRef.off('value', savedMenuCb);
        }
    }, [db, user, isFireConnected, currentOpDate, lousaDate]); // mantem isFireConnected para trigger, mas remove do if

    useEffect(() => {
        // CORREÇÃO: Removemos isFireConnected do check
        if (!db || !user) return;
        // Adicionado 'users' na lista de nodes
        const nodes = ['passengers', 'drivers', 'trips', 'notes', 'lostFound', 'blocked_ips', 'newsletter', 'users'];
        const unsubs = nodes.map(node => {
            const ref = db.ref(node);
            const callback = ref.on('value', (snapshot) => {
                const val = snapshot.val();
                const list = val ? Object.keys(val).map(key => ({ id: key, ...val[key] })) : [];
                if (['passengers', 'drivers', 'trips'].includes(node)) {
                    list.sort((a:any, b:any) => parseInt(b.id) - parseInt(a.id));
                }
                setData((prev:any) => ({ ...prev, [node]: list }));
            });
            return () => ref.off('value', callback);
        });
        return () => unsubs.forEach(fn => fn());
    }, [user, isFireConnected]); // Trigger se conectar

    // --- FUNÇÕES ---

    const getRotatedList = (dateStr: string) => {
        if (!spList || spList.length === 0) return [];
        // Usa a data base dinâmica (vinda do Firebase) ou o fallback
        const start = new Date(`${rotationBaseDate}T00:00:00`).getTime(); 
        const current = new Date(dateStr + 'T00:00:00').getTime();
        const diff = Math.floor((current - start) / (86400000));
        const len = spList.length;
        const mod = ((diff % len) + len) % len;
        return [...spList.slice(mod), ...spList.slice(0, mod)];
    };

    // NOVA FUNÇÃO: Rotação independente da Madrugada
    const getRotatedMadrugadaList = (dateStr: string) => {
        if (!madrugadaList || madrugadaList.length === 0) return [];

        const start = new Date(`${rotationBaseDate}T00:00:00`).getTime(); 
        const current = new Date(dateStr + 'T00:00:00').getTime();
        const diff = Math.floor((current - start) / (86400000));
        
        // Aplica rotação APENAS na lista de vagas da madrugada
        const len = madrugadaList.length;
        const mod = ((diff % len) + len) % len;
        const rotatedVagas = [...madrugadaList.slice(mod), ...madrugadaList.slice(0, mod)];

        // Mapeia os IDs rotacionados para os objetos completos de motorista
        return rotatedVagas.map((vagaId: string) => {
            return spList.find((sp:any) => sp.vaga === vagaId) || { vaga: vagaId, name: 'Desconhecido' };
        });
    };

    const getTableTimes = () => {
        const list = getRotatedList(currentOpDate); 
        const confirmedTimes: any = {}; 
        let confirmCount = 0;
        
        // Base time is 06:00 of the CURRENT OPERATIONAL DATE
        const [y, m, d] = currentOpDate.split('-').map(Number);
        let lastConfirmTime = new Date(y, m - 1, d, 6, 0, 0); 

        list.forEach((driver:any) => {
            if (tableStatus[driver.vaga] === 'confirmed') {
                const time = new Date(lastConfirmTime.getTime() + confirmCount * 30 * 60000);
                confirmedTimes[driver.vaga] = time.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', hour12: false});
                confirmCount++;
            }
        });

        const startLousaTime = new Date(lastConfirmTime.getTime() + confirmCount * 30 * 60000);
        return { confirmedTimes, startLousaTime };
    };

    const isTimeExpired = (timeStr: string) => {
        if(!timeStr) return false;
        const now = new Date();
        const [h, m] = timeStr.split(':').map(Number);
        const confirmedDate = new Date();
        confirmedDate.setHours(h, m, 0, 0);
        let diff = now.getTime() - confirmedDate.getTime();
        if (diff < -12 * 60 * 60 * 1000) diff += 24 * 60 * 60 * 1000; 
        return diff > 30 * 60000;
    };

    const { confirmedTimes, startLousaTime } = getTableTimes();
    
    // Ticker para forçar atualização das viagens temporárias
    useEffect(() => {
        const interval = setInterval(() => setUiTicker(prev => prev + 1), 15000);
        return () => clearInterval(interval);
    }, []);

    // LÓGICA DE VIAGEM TEMPORÁRIA
    useEffect(() => {
        // CORREÇÃO: Removido !isFireConnected para permitir funcionamento com DB público
        if (!db || !user) return; 

        const manageTempTrips = () => {
            const now = new Date();
            const { confirmedTimes, startLousaTime } = getTableTimes();
            
            const activeSlotsMap = new Map();

            getRotatedList(currentOpDate).forEach((driver:any) => {
                if (tableStatus[driver.vaga] === 'confirmed') {
                    activeSlotsMap.set(driver.vaga, { 
                        vaga: driver.vaga, 
                        time: confirmedTimes[driver.vaga] 
                    });
                }
            });

            let lousaIndex = 0;
            lousaOrder.forEach((item:any) => {
                // If 'baixou', it doesn't consume time, just moves to end.
                if (item.baixou) return;

                if (!item.riscado && !item.isNull) {
                    const t = new Date(startLousaTime.getTime() + lousaIndex * 30 * 60000);
                    const timeStr = t.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', hour12: false});
                    activeSlotsMap.set(item.vaga, { 
                        vaga: item.vaga, 
                        time: timeStr 
                    });
                }
                
                // Increment logic:
                // Normal items increment time.
                // 'isNull' (Skipped slots) ALSO increment time.
                // 'riscado' does NOT increment time (next person takes slot immediately).
                if (item.isNull || !item.riscado) {
                    lousaIndex++;
                }
            });

            const activeSlots = Array.from(activeSlotsMap.values());

            // CALCULA O PRÓXIMO ID SEQUENCIAL (INTEIRO)
            let currentMaxId = data.trips.reduce((max: number, t: any) => {
                if (t.id && /^\d+$/.test(t.id)) {
                    const idNum = parseInt(t.id);
                    return Math.max(max, idNum);
                }
                return max;
            }, 0);

            // 1. ITERATE ACTIVE SLOTS TO CREATE TRIPS IF IN WINDOW
            activeSlots.forEach((slot:any) => {
                if (!slot.time) return;
                
                const [h, m] = slot.time.split(':').map(Number);
                
                // Construct Date strictly based on Operational Date
                const [yOp, mOp, dOp] = currentOpDate.split('-').map(Number);
                const slotDate = new Date(yOp, mOp - 1, dOp, h, m, 0);

                // Logic: If slot hour is small (e.g. 0, 1, 2, 3, 4) AND OpDate starts at 6, it's the next day.
                if (h < 5) {
                    slotDate.setDate(slotDate.getDate() + 1);
                }

                const diffMinutes = (now.getTime() - slotDate.getTime()) / 60000;

                // --- CRIAÇÃO DA VIAGEM TEMPORÁRIA ---
                // Janela Rígida: Cria APENAS quando chegar a hora (0 min) e mantém por 45 min.
                if (diffMinutes >= 0 && diffMinutes <= 45) {
                    
                    const driverSp = spList.find((d:any) => d.vaga === slot.vaga);
                    const driverDb = driverSp ? data.drivers.find((d:any) => d.name.toLowerCase() === driverSp.name.toLowerCase()) : null;
                    
                    if (!driverDb) return;

                    const slotDateStr = [
                        slotDate.getFullYear(),
                        String(slotDate.getMonth() + 1).padStart(2, '0'),
                        String(slotDate.getDate()).padStart(2, '0')
                    ].join('-');

                    // CORREÇÃO: Calcular Data Final da Viagem ANTES de checar existência
                    const tripTime = addMinutes(slot.time, 60);
                    const [sH] = slot.time.split(':').map(Number);
                    const [tH] = tripTime.split(':').map(Number);
                    
                    let finalTripDate = slotDateStr;
                    // Se a viagem cruzar a meia noite (Ex: Slot 23:30 -> Trip 00:30), a data avança
                    if (tH < sH) {
                         finalTripDate = dateAddDays(slotDateStr, 1);
                    }

                    // Check if trip exists for THIS driver on THIS *FINAL* date
                    const exists = data.trips.some((t:any) => 
                        t.driverId === driverDb.id && 
                        t.date === finalTripDate && // Usar a data CALCULADA, não a data do slot
                        (t.isTemp || t.status !== 'Cancelada')
                    );

                    if (!exists) {
                        currentMaxId++;
                        const nextId = currentMaxId.toString();

                        const newTrip = {
                            id: nextId, 
                            driverId: driverDb.id,
                            driverName: driverDb.name,
                            time: tripTime, 
                            date: finalTripDate,
                            passengerIds: [],
                            status: 'Em andamento',
                            isTemp: true,
                            vaga: slot.vaga
                        };
                        db.ref('trips').child(newTrip.id).set(newTrip);
                    }
                }
            });

            // 2. CLEANUP: REMOVE EXPIRED OR INVALID TEMP TRIPS
            data.trips.forEach((t:any) => {
                if (t.isTemp && t.status !== 'Finalizada') {
                    
                    const activeSlot = activeSlots.find((s:any) => s.vaga === t.vaga);

                    if (!activeSlot) {
                        // Only remove if it's strictly the same operational date context
                        if (t.date === getTodayDate() || t.date === currentOpDate) {
                             db.ref('trips').child(t.id).remove();
                        }
                        return;
                    }

                    // Recalculate slot time to check expiration
                    const [h, m] = activeSlot.time.split(':').map(Number);
                    const [yOp, mOp, dOp] = currentOpDate.split('-').map(Number);
                    const slotDate = new Date(yOp, mOp - 1, dOp, h, m, 0);
                    
                    if (h < 5) slotDate.setDate(slotDate.getDate() + 1);
                    
                    const diff = (now.getTime() - slotDate.getTime()) / 60000;
                    
                    // Expiration: Delete exactly after 45 minutes OR if time is invalid (< 0)
                    if (diff > 45 || diff < 0) {
                        db.ref('trips').child(t.id).remove();
                    } else {
                        // Update trip time if slot time changed (keeps it sync with +60 rule)
                        const correctTripTime = addMinutes(activeSlot.time, 60);
                        if (t.time !== correctTripTime) {
                             db.ref('trips').child(t.id).update({ time: correctTripTime });
                        }
                    }
                }
            });
        };

        manageTempTrips();

    }, [uiTicker, data.trips, tableStatus, lousaOrder, spList, data.drivers, currentOpDate, rotationBaseDate]);

    // ... (rest of the file remains unchanged)
    
    // Função de Tour Restart / Complete
    const restartTour = () => { 
        setTourStep(0); 
        setView('dashboard'); 
        setRunTour(true); 
        if(user) localStorage.removeItem(`tour_seen_${user.username}`);
    };

    const completeTour = () => {
        setRunTour(false);
        setTourStep(0);
        setView('dashboard');
        if(user) localStorage.setItem(`tour_seen_${user.username}`, 'true');
    };
    
    const saveApiKey = (k: string) => { setGeminiKey(k); localStorage.setItem('nexflow_gemini_key', k); notify("API Key salva!", "success"); };
    const blockIp = () => { if(!ipToBlock) return notify('Digite um IP', 'error'); dbOp('create', 'blocked_ips', { ip: ipToBlock, reason: ipReason || 'Manual', blockedBy: user.username }); setIpToBlock(''); setIpReason(''); notify('IP Bloqueado!', "success"); };
    const saveIpLabel = (ip: string, label: string) => { if(!ip) return; const safeIp = ip.replace(/\./g, '_'); db.ref(`ip_labels/${safeIp}`).set(label); };
    
    const del = (col: string, id: string) => {
        if (col === 'trips') {
            const trip = data.trips.find((t:any) => t.id === id);
            
            if (trip) {
                // Mensagem personalizada baseada no status
                const msg = trip.status === 'Finalizada' 
                    ? 'Os passageiros voltarão para a lista de Agendamentos (Pendentes).' 
                    : 'Tem certeza que deseja excluir esta viagem?';

                requestConfirm('Excluir viagem?', msg, () => {
                    // 1. Libera passageiros se a viagem foi finalizada (volta para pendente)
                    if (trip.status === 'Finalizada' && trip.passengerIds && Array.isArray(trip.passengerIds)) {
                        trip.passengerIds.forEach((pid:string) => {
                            db.ref(`passengers/${pid}`).update({ 
                                time: trip.time, 
                                date: trip.date 
                            });
                        });
                    }

                    // 2. Limpa dados da Madrugada na Tabela (CORREÇÃO SOLICITADA)
                    // Zera horário e quantidade independentemente do status da viagem
                    if (trip.isMadrugada) { 
                        const sp = spList.find((s:any) => s.name === trip.driverName); 
                        if (sp) {
                            db.ref(`daily_tables/${trip.date}/madrugada/${sp.vaga}`).update({ time: null, qtd: null }); 
                        }
                    }

                    // 3. Deleta a viagem
                    dbOp('delete', col, id);
                });
                return;
            }
        }
        requestConfirm('Excluir item?', 'Tem certeza que deseja remover este item permanentemente?', () => dbOp('delete', col, id));
    };

    const saveDriverName = (vaga: string) => { if(!tempName.trim()) return; const newList = spList.map((d:any) => d.vaga === vaga ? { ...d, name: tempName } : d); db.ref('drivers_table_list').set(newList); setEditName(null); notify("Nome salvo!", "success"); };
    
    const addCannedMessage = () => { const newMsg = { id: generateUniqueId(), title: 'Nova Mensagem', text: '' }; const newList = [...cannedMessages, newMsg]; db.ref('canned_messages_config/list').set(newList); };
    const updateCannedMessage = (id:string, field:string, value:any) => { const newList = cannedMessages.map((m:any) => m.id === id ? { ...m, [field]: value } : m); db.ref('canned_messages_config/list').set(newList); };
    const deleteCannedMessage = (id:string) => { requestConfirm('Excluir mensagem?', 'Esta mensagem será removida da lista.', () => { const newList = cannedMessages.filter((m:any) => m.id !== id); db.ref('canned_messages_config/list').set(newList); }); };
    const handleCannedDragStart = (e:any, index:number) => { e.dataTransfer.setData("cannedIndex", index); };
    const handleCannedDrop = (e:any, dropIndex:number) => { const dragIndex = parseInt(e.dataTransfer.getData("cannedIndex")); if (isNaN(dragIndex) || dragIndex === dropIndex) return; const newList = [...cannedMessages]; const [removed] = newList.splice(dragIndex, 1); newList.splice(dropIndex, 0, removed); db.ref('canned_messages_config/list').set(newList); };

    // FUNÇÕES DE D&D PARA A TABELA GERAL (COM PROPAGAÇÃO)
    const handleGeneralDragStart = (e: any, index: number) => {
        setDraggedItem({ index, listType: 'geral' });
    };

    const handleGeneralDrop = (e: any, dropIndex: number) => {
        if (!draggedItem || draggedItem.listType !== 'geral') return;
        const dragIndex = draggedItem.index;
        if (dragIndex === dropIndex) return;
        let currentList = getRotatedList(currentOpDate);
        const newList = [...currentList];
        const [removed] = newList.splice(dragIndex, 1);
        newList.splice(dropIndex, 0, removed);
        db.ref('drivers_table_list').set(newList);
        db.ref('system_settings/rotation_base_date').set(currentOpDate);
        if (data.trips && data.trips.length > 0) { const tempTripsToDelete = data.trips.filter((t:any) => t.isTemp && t.date === currentOpDate); tempTripsToDelete.forEach((t:any) => { db.ref(`trips/${t.id}`).remove(); }); }
        setDraggedItem(null);
    };

    const saveExtraCharge = () => {
        if (!formData.value || !formData.date) return notify("Valor e Data são obrigatórios.", "error");
        
        // Garante ID Sequencial
        const nextId = generateNextTripId();

        const payload = {
            id: formData.id || nextId,
            isExtra: true,
            driverName: 'Carro Extra',
            extraPhone: formData.phone,
            value: formData.value,
            date: formData.date,
            time: '12:00',
            notes: formData.notes,
            paymentStatus: 'Pendente',
            status: 'Finalizada',
            pCount: 0
        };
        dbOp(payload.id ? 'update' : 'create', 'trips', payload);
        setModal(null);
    };

    const save = async (collection: string) => {
        try {
            if (collection === 'passengers') {
                if (!formData.name || !formData.neighborhood) return notify("Nome e Bairro obrigatórios", "error");
                const payload = { ...formData, date: formData.date || getTodayDate() };
                await dbOp(formData.id ? 'update' : 'create', 'passengers', payload);
            } else if (collection === 'drivers') {
                if (!formData.name) return notify("Nome obrigatório", "error");
                await dbOp(formData.id ? 'update' : 'create', 'drivers', formData);
            } else if (collection === 'lostFound') {
                if (!formData.description) return notify("Descrição obrigatória", "error");
                await dbOp(formData.id ? 'update' : 'create', 'lostFound', formData);
            }
            setModal(null);
            setFormData({});
        } catch (e: any) {
            notify("Erro ao salvar: " + e.message, "error");
        }
    };

    const handleSmartCreate = async () => {
        if(!aiInput.trim()) return notify("Diga algo!", "error");
        if(!geminiKey) return notify("Configure a API Key nas configurações para usar o Cadastro Mágico.", "error");
        setAiLoading(true);
        try {
            const bairros = BAIRROS.join(',');
            const prompt = `Analise este texto: "${aiInput}". Extraia um JSON ESTRITAMENTE VÁLIDO (sem markdown, sem crases) com: name, phone, neighborhood (escolha o mais próximo de: ${bairros}), address, reference, passengerCount (número, padrão 1), luggageCount (número de malas, padrão 0), payment (Escolha EXATAMENTE um: "Dinheiro", "Pix" ou "Cartão"), time (HH:mm). Se faltar info, use null. Exemplo de saída: {"name": "João", ...}`;
            
            const res = await callGemini(prompt, geminiKey);
            
            if (!res) throw new Error("A IA não retornou nada. Verifique sua chave API.");

            const cleanJson = res.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(cleanJson);

            const validPayments = ['Dinheiro', 'Pix', 'Cartão'];
            let finalPayment = 'Dinheiro';
            
            if (json.payment) {
                const found = validPayments.find(p => p.toLowerCase() === json.payment.toLowerCase());
                if (found) finalPayment = found;
            }

            setFormData({
                ...json,
                payment: finalPayment, 
                luggageCount: json.luggageCount || 0, 
                status: 'Ativo', 
                date: getTodayDate()
            });
            
            setAiModal(false); 
            setModal('passenger'); 
            setAiInput('');
        } catch(e: any) { 
            notify("Erro IA: " + e.message, "error"); 
            console.error(e); 
        }
        finally { setAiLoading(false); }
    };

    const toggleMic = () => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return notify("Seu navegador não suporta reconhecimento de voz.", "error");
        if (isListening) { if (timerRef.current) timerRef.current.stop(); setIsListening(false); return; }
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR'; recognition.continuous = false; recognition.interimResults = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e:any) => { setAiInput((prev:string) => (prev ? prev + ' ' : '') + e.results[0][0].transcript); setIsListening(false); };
        recognition.onerror = (e:any) => { console.error("Erro voz:", e); setIsListening(false); };
        recognition.onend = () => setIsListening(false);
        recognition.start(); timerRef.current = recognition;
    };

    const simulate = () => {
        if (!formData.driverId) return notify("Selecione um motorista", "error");
        
        const dr = data.drivers.find((d:any) => d.id === formData.driverId);
        const driverCapacity = dr && dr.capacity ? parseInt(dr.capacity, 10) : 15;

        if (formData.isMadrugada) {
             setSuggestedTrip({ driver: dr || { name: 'Desconhecido', capacity: 15 }, time: formData.time, passengers: [], occupancy: 0, date: formData.date || getTodayDate() });
             return;
        }
        
        const time = formData.time;
        if (!time) return notify("Selecione um horário", "error");

        let tripDate = formData.date || getTodayDate();
        let tripTime = time;

        // 0. Identificar passageiros já alocados neste dia
        const occupiedPaxIds = new Set();
        data.trips.forEach((t:any) => {
            if (t.date === tripDate && t.status !== 'Cancelada') {
                if (t.passengerIds && Array.isArray(t.passengerIds)) {
                    t.passengerIds.forEach((pid:string) => occupiedPaxIds.add(pid));
                }
            }
        });

        // 1. Filtrar Candidatos
        const candidates = data.passengers.filter((p:any) => {
            return p.status === 'Ativo' && 
                   p.date === tripDate && 
                   p.time === tripTime &&
                   !occupiedPaxIds.has(p.id); // FILTRO NOVO
        });

        if (candidates.length === 0) return notify("Nenhum passageiro disponível para este horário.", "info");

        // 2. Encontrar a "Âncora" (Foco da rota)
        // Lógica: A maior família (passengerCount). Desempate pelo início da cidade.
        const anchor = [...candidates].sort((a:any, b:any) => {
            const countA = parseInt(a.passengerCount || 1);
            const countB = parseInt(b.passengerCount || 1);
            if (countB !== countA) return countB - countA; // Maior grupo primeiro
            return getBairroIdx(a.neighborhood) - getBairroIdx(b.neighborhood); // Menor índice geográfico
        })[0];

        const anchorIdx = getBairroIdx(anchor.neighborhood);

        // 3. Ordenar candidatos baseado na proximidade da Âncora
        // Critérios: Mesmo endereço > Mesmo Bairro > Bairro Vizinho > Tamanho do grupo
        candidates.sort((a:any, b:any) => {
            // Prioridade 1: Mesmo Endereço Exato
            const sameAddrA = a.address && anchor.address && a.address.trim().toLowerCase() === anchor.address.trim().toLowerCase();
            const sameAddrB = b.address && anchor.address && b.address.trim().toLowerCase() === anchor.address.trim().toLowerCase();
            
            if (sameAddrA && !sameAddrB) return -1;
            if (!sameAddrA && sameAddrB) return 1;

            // Prioridade 2: Proximidade do Bairro (Diferença de índice)
            const idxA = getBairroIdx(a.neighborhood);
            const idxB = getBairroIdx(b.neighborhood);
            const distA = Math.abs(idxA - anchorIdx);
            const distB = Math.abs(idxB - anchorIdx);

            if (distA !== distB) return distA - distB; // Quanto menor a distância, melhor

            // Prioridade 3: Tamanho do grupo (Maiores primeiro para encher logo)
            const countA = parseInt(a.passengerCount || 1);
            const countB = parseInt(b.passengerCount || 1);
            return countB - countA;
        });

        // 4. Preencher a Van (Bucket Fill)
        const selectedPassengers = [];
        let currentOccupancy = 0;

        for (const pax of candidates) {
            const pCount = parseInt(pax.passengerCount || 1, 10);
            if (currentOccupancy + pCount <= driverCapacity) {
                selectedPassengers.push(pax);
                currentOccupancy += pCount;
            }
        }

        setSuggestedTrip({
            driver: dr,
            time: tripTime,
            passengers: selectedPassengers,
            occupancy: currentOccupancy,
            date: tripDate
        });
        
        if (selectedPassengers.length < candidates.length) {
            notify(`Limite de ${driverCapacity} lugares atingido. Priorizando rota da maior família.`, "info");
        } else if (selectedPassengers.length > 0) {
            notify(`${selectedPassengers.length} grupos adicionados.`, "success");
        }
    };
    
    const addById = () => {
        if (!searchId || !suggestedTrip) return;
        const p = data.passengers.find((x:any) => x.id === searchId);
        if (!p) return notify("Passageiro não encontrado", "error");
        if (suggestedTrip.passengers.some((x:any) => x.id === p.id)) return notify("Já está na lista atual", "info");
        
        const paxCount = parseInt(p.passengerCount || 1, 10);
        const currentCap = suggestedTrip.driver.capacity ? parseInt(suggestedTrip.driver.capacity, 10) : 15;

        // Check overlap
        const isOccupied = data.trips.some((t:any) => 
            t.date === suggestedTrip.date && 
            t.status !== 'Cancelada' && 
            t.passengerIds && 
            t.passengerIds.includes(p.id)
        );

        if (isOccupied) return notify(`Passageiro já está em outra viagem no dia ${formatDisplayDate(suggestedTrip.date)}!`, "error");
        
        if (suggestedTrip.occupancy + paxCount > currentCap) {
            return notify(`Capacidade excedida! Restam ${currentCap - suggestedTrip.occupancy} lugares.`, "error");
        }

        const newPax = [...suggestedTrip.passengers, p].sort((a,b)=>getBairroIdx(a.neighborhood)-getBairroIdx(b.neighborhood));
        const newOcc = suggestedTrip.occupancy + paxCount;
        
        setSuggestedTrip({ ...suggestedTrip, passengers: newPax, occupancy: newOcc });
        setSearchId('');
    };
    
    const autoFill = () => { simulate(); };
    
    const removePax = (pid: string) => {
        if (!suggestedTrip) return;
        const newPax = suggestedTrip.passengers.filter((p:any) => p.id !== pid);
        const newOcc = suggestedTrip.occupancy - parseInt(suggestedTrip.passengers.find((x:any)=>x.id===pid)?.passengerCount || 1);
        setSuggestedTrip({ ...suggestedTrip, passengers: newPax, occupancy: newOcc });
    };
    
    const confirmTrip = () => {
        if (!suggestedTrip) return;
        
        let tripId = editingTripId;
        
        // Se for nova viagem (não edição), gera ID sequencial
        if (!tripId) {
            tripId = generateNextTripId();
        }

        const finalTime = formData.time || suggestedTrip.time;
        if (!finalTime) return notify("Horário é obrigatório.", "error");

        const finalDate = formData.date || suggestedTrip.date || getTodayDate();

        // 1. Prepara lista de passageiros para salvar (Independente se é Madrugada ou não)
        // Isso corrige o problema de duplicidade, pois o addById checa se o passageiro já existe em passengerIds
        const passengerIdsToSave = suggestedTrip.passengers.map((p:any) => p.id);
        const passengersSnapshotToSave = suggestedTrip.passengers;

        const payload: any = {
            id: tripId,
            driverId: suggestedTrip.driver.id,
            driverName: suggestedTrip.driver.name,
            date: finalDate,
            time: finalTime,
            status: 'Em andamento',
            isMadrugada: !!formData.isMadrugada, 
            isTemp: false,
            passengerIds: passengerIdsToSave,
            passengersSnapshot: passengersSnapshotToSave
        };

        if (formData.isMadrugada) {
             const sp = spList.find((s:any) => s.name === suggestedTrip.driver.name);
             if (sp) {
                 db.ref(`daily_tables/${finalDate}/madrugada/${sp.vaga}`).update({
                     time: finalTime,
                     qtd: suggestedTrip.occupancy || 0
                 });
                 payload.vaga = sp.vaga;
                 payload.pCountSnapshot = suggestedTrip.occupancy || 0;
             }
        } 
        
        // Atualiza status do passageiro no banco (histórico de última viagem)
        suggestedTrip.passengers.forEach((p:any) => {
            db.ref(`passengers/${p.id}`).update({ time: finalTime, date: finalDate });
        });
        
        payload.ticketPrice = pricePerPassenger;

        dbOp(editingTripId ? 'update' : 'create', 'trips', payload);
        
        setModal(null);
        setSuggestedTrip(null);
        setEditingTripId(null);
    };
    
    const openEditTrip = (t:any) => {
        const dr = data.drivers.find((d:any)=>d.id===t.driverId); 
        let pax = []; let occ = 0;
        
        // Tenta carregar passageiros reais primeiro (Snapshot ou Live ID)
        if (t.passengersSnapshot && t.passengersSnapshot.length > 0) {
            pax = t.passengersSnapshot;
            occ = pax.reduce((a:any,b:any)=>a+parseInt(b.passengerCount||1),0);
        } else if (t.passengerIds && t.passengerIds.length > 0) {
            pax = data.passengers.filter((p:any)=>(t.passengerIds||[]).includes(p.id));
            occ = pax.reduce((a:any,b:any)=>a+parseInt(b.passengerCount||1),0);
        } else if (t.isMadrugada && (t.pCountSnapshot || t.pCount)) {
            // Fallback APENAS se não houver registro de passageiros reais (Legado)
            occ = parseInt(t.pCountSnapshot || t.pCount || 0); 
            for(let i=0; i<occ; i++) pax.push({ id: `dummy_${i}`, name: 'Passageiro Madrugada', neighborhood: 'Madrugada', passengerCount: 1 });
        }
        
        setFormData({ 
            driverId: t.driverId, 
            time: t.time, 
            date: t.date, 
            isMadrugada: !!t.isMadrugada 
        }); 
        
        setEditingTripId(t.id);
        setSuggestedTrip({ 
            driver: dr || {name: t.driverName || 'Desconhecido', capacity: 0}, 
            time: t.time, 
            passengers: pax, 
            occupancy: occ, 
            date: t.date 
        });
        setModal('trip');
    };
    
    const updateTripStatus = (id: string, status: string) => {
        dbOp('update', 'trips', { id, status });
        const trip = data.trips.find((t:any) => t.id === id);
        if (trip && status === 'Finalizada') {
            if (!trip.passengersSnapshot && trip.passengerIds) {
                const pax = data.passengers.filter((p:any) => trip.passengerIds.includes(p.id));
                db.ref(`trips/${id}`).update({ passengersSnapshot: pax });
            }
        }
    };

    const duplicateTrip = (t: any) => {
        // Garante ID Sequencial
        const newId = generateNextTripId();
        
        const newTrip = {
            ...t,
            id: newId, 
            date: getTodayDate(),
            status: 'Em andamento',
            passengerIds: t.passengerIds || [],
            passengersSnapshot: null,
            pCountSnapshot: null,
            isMadrugada: !!t.isMadrugada, // FIX: Force boolean
            isTemp: false
        };
        
        // CLEANUP: Ensure no undefined values
        Object.keys(newTrip).forEach(key => newTrip[key] === undefined && delete newTrip[key]);
        
        delete newTrip.createdAt;
        dbOp('create', 'trips', newTrip);
        notify('Viagem duplicada para hoje!', 'success');
    };

    const updateTableStatus = (vaga: string, status: string | null) => {
        const newStatus = { ...tableStatus };
        if (status) newStatus[vaga] = status; else delete newStatus[vaga];
        let newLousa = [...lousaOrder];
        if (status === 'lousa') {
            const exists = newLousa.some((i:any) => i.vaga === vaga);
            if (!exists) newLousa.push({ vaga, uid: generateUniqueId(), riscado: false });
        } else if (status === 'confirmed') {
            newLousa = newLousa.filter((i:any) => i.vaga !== vaga);
        } else {
            newLousa = newLousa.filter((i:any) => i.vaga !== vaga);
        }
        db.ref(`daily_tables/${currentOpDate}`).update({ status: newStatus, lousaOrder: newLousa });
    };

    const sendToLousaKeepConfirmed = (vaga: string) => {
        let newLousa = [...lousaOrder];
        const exists = newLousa.some((i:any) => i.vaga === vaga);
        if (!exists) {
            newLousa.push({ vaga, uid: generateUniqueId(), riscado: false });
            db.ref(`daily_tables/${lousaDate}/lousaOrder`).set(newLousa);
            notify("Adicionado à lousa!", "success");
        }
    };

    const removeTempTrip = (vaga: string) => {
        const driverSp = spList.find((d:any) => d.vaga === vaga);
        if (!driverSp) return;
        const trip = data.trips.find((t:any) => 
            t.isTemp && 
            t.date === getTodayDate() && 
            (t.driverName === driverSp.name || t.vaga === vaga)
        );
        if (trip) db.ref(`trips/${trip.id}`).remove();
    };

    const addNullLousaItem = () => {
        const newItem = { vaga: 'NULL', uid: generateUniqueId(), riscado: false, isNull: true };
        const newOrder = [...lousaOrder, newItem];
        db.ref(`daily_tables/${lousaDate}/lousaOrder`).set(newOrder);
    };

    const handleLousaAction = (uid: string | null, action: string, vagaRef: string | null = null) => {
        let newLousa = [...lousaOrder];
        const itemIndex = newLousa.findIndex((i:any) => i.uid === uid);
        if (itemIndex === -1 && action !== 'duplicate' && action !== 'remove_all') return;
        if (itemIndex > -1) newLousa[itemIndex] = { ...newLousa[itemIndex] };

        if (action === 'riscar') {
            const newRiscadoState = !newLousa[itemIndex].riscado;
            newLousa[itemIndex].riscado = newRiscadoState;
        } else if (action === 'remove') {
            const itemToRemove = newLousa[itemIndex];
            if(itemToRemove) removeTempTrip(itemToRemove.vaga);
            newLousa.splice(itemIndex, 1);
            const vRef = vagaRef || itemToRemove?.vaga;
            if (vRef) {
                const stillExists = newLousa.some((i:any) => i.vaga === vRef);
                if (!stillExists) db.ref(`daily_tables/${currentOpDate}/status/${vRef}`).remove();
            }
        } else if (action === 'remove_all') {
            if (vagaRef) {
                removeTempTrip(vagaRef);
                newLousa = newLousa.filter((i:any) => i.vaga !== vagaRef);
                db.ref(`daily_tables/${currentOpDate}/status/${vagaRef}`).remove();
            }
        } else if (action === 'duplicate') {
            if (itemIndex > -1) {
                const original = newLousa[itemIndex];
                newLousa.push({ vaga: original.vaga, uid: generateUniqueId(), riscado: false });
            } else if (vagaRef) {
                 newLousa.push({ vaga: vagaRef, uid: generateUniqueId(), riscado: false });
            }
        } else if (action === 'baixar') {
            // Marca como baixou (não conta mais no horário)
            newLousa[itemIndex].baixou = true;
            // Remove a viagem temporária que estava "pendurada" nessa vaga
            removeTempTrip(newLousa[itemIndex].vaga);
            // Cria uma nova entrada limpa no final da fila
            newLousa.push({ vaga: newLousa[itemIndex].vaga, uid: generateUniqueId(), riscado: false });
            newLousa.push({ vaga: newLousa[itemIndex].vaga, uid: generateUniqueId(), riscado: false });
        }
        
        db.ref(`daily_tables/${lousaDate}/lousaOrder`).set(newLousa);
    };

    const handleDragStart = (e: any, index: number) => {
        setDraggedItem({ index, listType: 'lousa' });
    };

    const handleDrop = (e: any, dropIndex: number) => {
        if (!draggedItem || draggedItem.listType !== 'lousa') return;
        const dragIndex = draggedItem.index;
        if (dragIndex === dropIndex) return;
        
        const newOrder = [...lousaOrder];
        const [removed] = newOrder.splice(dragIndex, 1);
        newOrder.splice(dropIndex, 0, removed);
        
        db.ref(`daily_tables/${lousaDate}/lousaOrder`).set(newOrder);
        setDraggedItem(null);
    };

    const addMadrugadaVaga = () => {
        setTempVagaMadrugada('');
        setModal('madrugadaVaga');
    };

    const confirmAddMadrugadaVaga = () => {
        if (!tempVagaMadrugada) return;
        if (!madrugadaList.includes(tempVagaMadrugada)) {
            const newList = [...madrugadaList, tempVagaMadrugada];
            db.ref('madrugada_config/list').set(newList);
            notify("Vaga adicionada!", "success");
        }
        setModal(null);
    };

    const removeMadrugadaVaga = (vaga: string) => {
        requestConfirm("Remover esta vaga da madrugada?", "Ela sairá da lista da madrugada permanentemente.", () => {
            const newList = madrugadaList.filter((v: string) => v !== vaga);
            db.ref('madrugada_config/list').set(newList);
        });
    };

    const toggleMadrugadaRiscado = (vaga: string) => {
        const currentData = madrugadaData[vaga] || {};
        if (currentData.riscado) {
             db.ref(`daily_tables/${currentOpDate}/madrugada/${vaga}`).update({ riscado: false, comment: null });
        } else {
            setVagaToBlock(vaga);
            setTempJustification('');
            setModal('madrugadaBlock');
        }
    };

    const confirmMadrugadaBlock = () => {
        if (!vagaToBlock) return;
        db.ref(`daily_tables/${currentOpDate}/madrugada/${vagaToBlock}`).update({ 
            riscado: true, 
            comment: tempJustification 
        });
        setModal(null);
        setVagaToBlock(null);
    };

    const openMadrugadaTrip = (vaga: string, date: string) => {
        const sp = spList.find((s:any) => s.vaga === vaga);
        if (!sp) return notify("Vaga não encontrada na lista geral", "error");
        
        const driver = data.drivers.find((d:any) => d.name === sp.name);
        
        // BUSCA A VIAGEM PELOS ATRIBUTOS, NÃO PELO ID
        const existingTrip = data.trips.find((t:any) => 
            t.isMadrugada && 
            t.date === date && 
            t.vaga === vaga && 
            t.status !== 'Cancelada' // Ignora canceladas para permitir recriar
        );
        
        if (existingTrip) {
            openEditTrip(existingTrip);
        } else {
            setFormData({ 
                isMadrugada: true, 
                driverId: driver ? driver.id : '', 
                time: '', // Vazio para forçar a escolha no modal
                date: date 
            });
            setSuggestedTrip(null); // Nulo para abrir o formulário de configuração, não o resumo
            setEditingTripId(null);
            setModal('trip');
        }
    };

    const sendBillingMessage = (trip: any) => {
        const d = data.drivers.find((x:any) => x.id === trip.driverId);
        if (!d || !d.phone) return notify("Motorista sem telefone", "error");
        const msg = `Olá ${d.name}, referente à viagem #${trip.id} do dia ${formatDisplayDate(trip.date)} às ${trip.time}. Valor: R$ ${trip.value},00. Status: ${trip.isPaid ? 'PAGO' : 'PENDENTE'}.`;
        window.open(`https://wa.me/55${d.phone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleMadrugadaDragStart = (e:any, i:number) => e.dataTransfer.setData("madIndex", i);
    
    // CORREÇÃO: Lógica de Drag and Drop com Rodagem Automática
    const handleMadrugadaDrop = (e:any, dropIndex:number) => { 
        const dragIndex = parseInt(e.dataTransfer.getData("madIndex")); 
        if (isNaN(dragIndex) || dragIndex === dropIndex) return; 
        
        // Usa a lista filtrada/rodada para identificar quem está sendo movido
        // madrugadaOrderedList é derivada da currentRotatedList
        const currentRotatedList = getRotatedList(currentOpDate);
        const madrugadaOrderedList = currentRotatedList.filter((d:any) => madrugadaList.includes(d.vaga));

        const draggedItem = madrugadaOrderedList[dragIndex];
        const targetItem = madrugadaOrderedList[dropIndex];

        if (!draggedItem || !targetItem) return;

        // Precisamos encontrar os índices reais na lista MESTRA (spList)
        // para trocar suas posições originais. Como a rodagem é cíclica,
        // trocar na lista mestra troca na visualização rodada também.
        const mainDragIdx = spList.findIndex((x:any) => x.vaga === draggedItem.vaga);
        const mainDropIdx = spList.findIndex((x:any) => x.vaga === targetItem.vaga);

        if (mainDragIdx === -1 || mainDropIdx === -1) return;

        const newList = [...spList];
        // Swap simples
        const temp = newList[mainDragIdx];
        newList[mainDragIdx] = newList[mainDropIdx];
        newList[mainDropIdx] = temp;

        db.ref('drivers_table_list').set(newList);
        // Não resetamos a data base, pois queremos manter a rodagem fluida, apenas alterando a ordem relativa
    };

    const handleGlobalTouchStart = (e:any) => { if(view==='table'||menuOpen)return; globalTouchRef.current={x:e.touches[0].clientX,y:e.touches[0].clientY}; };
    const handleGlobalTouchEnd = (e:any) => { if(view==='table'||draggedItem||menuOpen)return; const dx=e.changedTouches[0].clientX-globalTouchRef.current.x; if(dx>80) setMenuOpen(true); };
    const handleMenuDragStart = (e:any, i:number) => { setDraggedMenuIndex(i); e.dataTransfer.effectAllowed = "move"; };
    const handleMenuDragOver = (e:any) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
    const handleMenuDrop = (e:any, i:number) => { e.preventDefault(); if (draggedMenuIndex === null || draggedMenuIndex === i) return; const newItems = [...orderedMenuItems]; const [movedItem] = newItems.splice(draggedMenuIndex, 1); newItems.splice(i, 0, movedItem); setOrderedMenuItems(newItems); setDraggedMenuIndex(null); if (user) { db.ref(`user_data/${user.username}/preferences/menuOrder`).set(newItems.map(i => i.id)); } };
    const handleTouchStart = (e:any, i:number, t:string) => { touchStartPos.current={x:e.touches[0].clientX,y:e.touches[0].clientY}; timerRef.current=setTimeout(()=>{setDraggedItem({index:i,listType:t}); if(navigator.vibrate)navigator.vibrate(50);},800); };
    const handleTouchMove = (e:any) => { if(!draggedItem && Math.abs(e.touches[0].clientX-touchStartPos.current.x)>5) clearTimeout(timerRef.current); };
    const handleTouchEnd = (e:any) => { clearTimeout(timerRef.current); setDraggedItem(null); };

    if (isLoading) return <div id="loader" className="fixed inset-0 bg-black flex items-center justify-center"><div className="text-amber-500 font-bold">CARREGANDO...</div></div>;
    if (!isAuthenticated) return <LoginScreen />;

    // ... (Main Render with updated props)
    return (
        <div className={`h-screen w-screen overflow-hidden ${theme.bg} ${theme.text} font-sans flex`} 
             onTouchStart={handleGlobalTouchStart} 
             onTouchEnd={handleGlobalTouchEnd}
             onContextMenu={(e) => { e.preventDefault(); setCmdOpen(true); }} // ACESSO RÁPIDO (BOTÃO DIREITO)
        >
             <Toast message={notification.message} type={notification.type} visible={notification.visible} />
             <ConfirmModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={confirmState.onConfirm} onCancel={() => setConfirmState((prev:any) => ({ ...prev, isOpen: false }))} type={confirmState.type} theme={theme} />
             
             {/* Premium Utilities */}
             <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} theme={theme} actions={commandActions} />
             <QuickCalculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} theme={theme} />

             <Sidebar 
                theme={theme} 
                view={view} 
                setView={setView} 
                menuOpen={menuOpen} 
                setMenuOpen={setMenuOpen} 
                user={user} 
                orderedMenuItems={orderedMenuItems}
                handleMenuDragStart={handleMenuDragStart}
                handleMenuDragOver={handleMenuDragOver}
                handleMenuDrop={handleMenuDrop}
                draggedMenuIndex={draggedMenuIndex}
             />

             <div className={`flex-1 flex flex-col h-full min-w-0 ${theme.contentBg || 'bg-black/20'}`}>
                {/* Header */}
                <div className={`h-16 flex items-center justify-between px-4 md:px-8 border-b ${theme.border} bg-opacity-80 backdrop-blur-md z-30 flex-shrink-0`}>
                    <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 -ml-2"><Icons.Menu size={24} /></button>
                        <h2 className={`font-bold text-lg md:text-xl truncate ${['passengers', 'drivers', 'trips', 'achados', 'lostFound'].includes(view) && searchTerm ? 'hidden md:block' : 'block'}`}>{orderedMenuItems.find(i=>i.id===view)?.l || 'Bora de Van'}</h2>
                        {['passengers', 'drivers', 'trips', 'achados', 'lostFound'].includes(view) && (<div className="flex-1 max-w-md ml-auto md:ml-4"><div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center opacity-50"><Icons.Search size={16} /></div><input type="text" placeholder={`Pesquisar...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full ${theme.inner} border ${theme.border} rounded-xl py-2 pl-10 pr-4 text-sm outline-none ${theme.text}`}/>{searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center opacity-50"><Icons.X size={14} /></button>)}</div></div>)}
                    </div>
                    <div className="flex gap-2 ml-2">
                        {/* Command Trigger */}
                        <button onClick={() => setCmdOpen(true)} className={`p-2.5 rounded-xl ${theme.ghost || 'bg-white/5 hover:bg-white/10 text-white/50'} hidden md:flex items-center gap-2 text-xs font-bold border ${theme.divider || 'border-white/5'} mr-2`} title="Command Palette">
                            <Icons.Command size={14} /> <span className="opacity-50">CTRL+K</span>
                        </button>

                        {view !== 'lostFound' && view !== 'trips' && view !== 'dashboard' && view !== 'settings' && view !== 'billing' && <button onClick={()=>setFilterStatus(filterStatus==='Ativo'?'Todos':'Ativo')} className={`p-2 rounded-lg ${filterStatus==='Ativo'?theme.accent:'opacity-50'}`}><Icons.Refresh size={20}/></button>}
                        <button onClick={()=>{ if(view==='passengers') { setFormData({neighborhood:BAIRROS[0],status:'Ativo',payment:'Dinheiro',passengerCount:1, luggageCount:0, date:getTodayDate(), time: ''}); setModal('passenger'); } else if(view==='trips') { setSuggestedTrip(null); setEditingTripId(null); setModal('trip'); } else if(view==='lostFound') { setFormData({date: getTodayDate(), status: 'Pendente'}); setModal('lostFound'); } else if(view==='drivers') { setFormData({status: 'Ativo'}); setModal('driver'); } else { setSuggestedTrip(null); setEditingTripId(null); setModal('trip'); } }} className={`${theme.primary} p-2.5 rounded-xl shadow-lg active:scale-95`}><Icons.Plus/></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative">
                    <div className="max-w-6xl mx-auto pb-20">
                        {view === 'dashboard' && <Dashboard data={data} theme={theme} setView={setView} onOpenModal={(t:string)=>{ if(t==='newPax'){ setFormData({neighborhood:BAIRROS[0],status:'Ativo',payment:'Dinheiro',passengerCount:1, luggageCount: 0, date: getTodayDate(), time: ''}); setModal('passenger'); } else { setModal('trip'); setFormData({}); } }} dbOp={dbOp} setAiModal={setAiModal} user={user} notify={notify} />}
                        {view === 'passengers' && <Passageiros data={data} theme={theme} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setFormData={setFormData} setModal={setModal} del={del} notify={notify} />}
                        {view === 'drivers' && <Motoristas data={data} theme={theme} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setFormData={setFormData} setModal={setModal} del={del} notify={notify} />}
                        {view === 'trips' && <Viagens data={data} theme={theme} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setModal={setModal} openEditTrip={openEditTrip} updateTripStatus={updateTripStatus} del={del} duplicateTrip={duplicateTrip} notify={notify} />}
                        {view === 'appointments' && <Agendamentos data={data} theme={theme} setFormData={setFormData} setModal={setModal} dbOp={dbOp} setSuggestedTrip={setSuggestedTrip} setEditingTripId={setEditingTripId} notify={notify} requestConfirm={requestConfirm} />}
                        
                        {/* Tabela Recebe Função para Calcular Listas Futuras */}
                        {view === 'table' && <Tabela 
                            data={data} theme={theme} tableTab={tableTab} setTableTab={setTableTab} 
                            currentOpDate={currentOpDate} getTodayDate={getTodayDate} analysisDate={analysisDate} setAnalysisDate={setAnalysisDate} 
                            analysisRotatedList={getRotatedList(analysisDate)} tableStatus={tableStatus} 
                            editName={editName} tempName={tempName} setEditName={setEditName} setTempName={setTempName} saveDriverName={saveDriverName} 
                            updateTableStatus={updateTableStatus} currentRotatedList={getRotatedList(currentOpDate)} confirmedTimes={confirmedTimes} isTimeExpired={isTimeExpired} 
                            lousaOrder={lousaOrder} sendToLousaKeepConfirmed={sendToLousaKeepConfirmed} handleLousaAction={handleLousaAction} startLousaTime={startLousaTime} 
                            draggedItem={draggedItem} handleDragStart={handleDragStart} handleDrop={handleDrop} handleTouchStart={handleTouchStart} handleTouchMove={handleTouchMove} handleTouchEnd={handleTouchEnd} 
                            addMadrugadaVaga={addMadrugadaVaga} madrugadaList={madrugadaList} handleMadrugadaDragStart={handleMadrugadaDragStart} handleMadrugadaDrop={handleMadrugadaDrop} removeMadrugadaVaga={removeMadrugadaVaga} toggleMadrugadaRiscado={toggleMadrugadaRiscado} spList={spList} madrugadaData={madrugadaData} openMadrugadaTrip={openMadrugadaTrip} 
                            cannedMessages={cannedMessages} addCannedMessage={addCannedMessage} updateCannedMessage={updateCannedMessage} deleteCannedMessage={deleteCannedMessage} handleCannedDragStart={handleCannedDragStart} handleCannedDrop={handleCannedDrop} handleGeneralDragStart={handleGeneralDragStart} handleGeneralDrop={handleGeneralDrop} 
                            addNullLousaItem={addNullLousaItem} notify={notify} 
                            getRotatedList={getRotatedList} 
                            getRotatedMadrugadaList={getRotatedMadrugadaList} // Nova prop
                        />}
                        
                        {(view === 'financeiro' || view === 'billing') && <Financeiro data={data} theme={theme} pricePerPassenger={pricePerPassenger} billingData={(() => { 
                            const targetMonth = billingDate.getMonth(); 
                            const targetYear = billingDate.getFullYear(); 
                            
                            const validTrips = data.trips.filter((t:any) => { 
                                // Inclui "Cancelada" apenas para filtrar fora, aceita "Em andamento" e "Finalizada"
                                if (t.status === 'Cancelada' || !t.date) return false; 
                                const [y, m, d] = t.date.split('-').map(Number); 
                                return (m - 1) === targetMonth && y === targetYear; 
                            }); 
                            
                            const groups:any = {}; 
                            let totalPending = 0; 
                            let totalPaid = 0; 
                            
                            validTrips.forEach((t:any) => { 
                                let value = 0; 
                                let pCount = 0; 
                                
                                if (t.isExtra) { 
                                    value = parseFloat(t.value) || 0; 
                                    pCount = 0; 
                                } else if (t.isMadrugada) { 
                                    pCount = t.pCountSnapshot !== undefined ? parseInt(t.pCountSnapshot || 0) : parseInt(t.pCount || 0); 
                                    // Força 4 reais se não tiver preço salvo
                                    const unitPrice = t.ticketPrice !== undefined ? Number(t.ticketPrice) : 4; 
                                    value = pCount * unitPrice; 
                                } else { 
                                    // Lógica para Viagens Normais (Finalizada ou Em Andamento)
                                    if (t.pCountSnapshot !== undefined && t.pCountSnapshot !== null) {
                                        pCount = parseInt(t.pCountSnapshot || 0);
                                    } else if (t.passengersSnapshot) {
                                        pCount = t.passengersSnapshot.reduce((acc:number, p:any) => acc + parseInt(p.passengerCount || 1), 0);
                                    } else {
                                        // Cálculo em tempo real para "Em andamento"
                                        pCount = data.passengers.filter((p:any) => (t.passengerIds||[]).includes(p.id)).reduce((a:number,b:any) => a + parseInt(b.passengerCount||1), 0);
                                    }
                                    
                                    // Força 4 reais se não tiver preço salvo
                                    const unitPrice = t.ticketPrice !== undefined ? Number(t.ticketPrice) : 4; 
                                    value = pCount * unitPrice; 
                                    
                                    // Caso legado manual
                                    if (pCount === 0 && t.value) value = parseFloat(t.value); 
                                } 
                                
                                const isPaid = t.paymentStatus === 'Pago'; 
                                if (isPaid) totalPaid += value; 
                                else totalPending += value; 
                                
                                const dateKey = t.date; 
                                if (!groups[dateKey]) groups[dateKey] = { date: dateKey, trips: [], totalValue: 0 }; 
                                groups[dateKey].trips.push({ ...t, pCount, value, isPaid }); 
                                groups[dateKey].totalValue += value; 
                            }); 
                            
                            const sortedGroups = Object.values(groups).sort((a:any, b:any) => b.date.localeCompare(a.date)); 
                            sortedGroups.forEach((g:any) => g.trips.sort((a:any, b:any) => (b.time || '').localeCompare(a.time || ''))); 
                            
                            return { groups: sortedGroups, summary: { pending: totalPending, paid: totalPaid, total: totalPending + totalPaid } }; 
                        })()} billingDate={billingDate} prevBillingMonth={()=>setBillingDate(new Date(billingDate.getFullYear(), billingDate.getMonth()-1, 1))} nextBillingMonth={()=>setBillingDate(new Date(billingDate.getFullYear(), billingDate.getMonth()+1, 1))} togglePaymentStatus={(trip:any) => dbOp('update', 'trips', { id: trip.id, paymentStatus: trip.paymentStatus === 'Pago' ? 'Pendente' : 'Pago' })} sendBillingMessage={sendBillingMessage} del={del} setFormData={setFormData} setModal={setModal} openEditTrip={openEditTrip} user={user} notify={notify} />}
                        {view === 'achados' && <Achados data={data} theme={theme} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setModal={setModal} dbOp={dbOp} del={del} notify={notify} />}
                        {view === 'lostFound' && <Achados data={data} theme={theme} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setModal={setModal} dbOp={dbOp} del={del} notify={notify} />}
                        {view === 'settings' && <Configuracoes user={user} theme={theme} restartTour={restartTour} setAiModal={setAiModal} geminiKey={geminiKey} setGeminiKey={setGeminiKey} saveApiKey={saveApiKey} ipToBlock={ipToBlock} setIpToBlock={setIpToBlock} blockIp={blockIp} data={data} del={del} ipHistory={ipHistory} ipLabels={ipLabels} saveIpLabel={saveIpLabel} changeTheme={changeTheme} themeKey={themeKey} dbOp={dbOp} pricePerPassenger={pricePerPassenger} notify={notify} requestConfirm={requestConfirm} setView={setView} />}
                        {view === 'manageUsers' && <GerenciarUsuarios data={data} theme={theme} setView={setView} dbOp={dbOp} notify={notify} user={user} />}
                    </div>
                </div>
            </div>

            <GlobalModals
                modal={modal} setModal={setModal}
                aiModal={aiModal} setAiModal={setAiModal}
                aiInput={aiInput} setAiInput={setAiInput}
                isListening={isListening} toggleMic={toggleMic} handleSmartCreate={handleSmartCreate} aiLoading={aiLoading}
                theme={theme} themeKey={themeKey}
                formData={formData} setFormData={setFormData}
                suggestedTrip={suggestedTrip} setSuggestedTrip={setSuggestedTrip}
                searchId={searchId} setSearchId={setSearchId}
                addById={addById} autoFill={autoFill} removePax={removePax} confirmTrip={confirmTrip} simulate={simulate}
                save={save} saveExtraCharge={saveExtraCharge}
                data={data} spList={spList} madrugadaList={madrugadaList}
                tempVagaMadrugada={tempVagaMadrugada} setTempVagaMadrugada={setTempVagaMadrugada} confirmAddMadrugadaVaga={confirmAddMadrugadaVaga}
                vagaToBlock={vagaToBlock} tempJustification={tempJustification} setTempJustification={setTempJustification} confirmMadrugadaBlock={confirmMadrugadaBlock}
                showNewsModal={showNewsModal} latestNews={latestNews} markNewsAsSeen={markNewsAsSeen}
            />
            
            {runTour && (
                <TourGuide steps={TOUR_STEPS} currentStep={tourStep} onNext={() => setTourStep(prev => prev + 1)} onPrev={() => setTourStep(prev => prev - 1)} onClose={completeTour} theme={theme} />
            )}
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
