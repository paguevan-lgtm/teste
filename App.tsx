
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db, auth } from './firebase';
import { THEMES, INITIAL_SP_LIST, BAIRROS } from './constants';
import { Icons, Toast, ConfirmModal, CommandPalette, QuickCalculator } from './components/Shared';
import { TourGuide } from './components/Tour';
import { LoginScreen } from './pages/Login';
import { getTodayDate, getOperationalDate, getLousaDate, generateUniqueId, callGemini, getAvatarUrl, getBairroIdx, formatDisplayDate, dateAddDays, addMinutes } from './utils';
import { PaymentGate } from './components/PaymentGate';

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

    const loadOlderTrips = async () => {
        if (!db) return;
        const currentTrips = data.trips;
        if (currentTrips.length === 0) return;
        const sortedIds = currentTrips.map((t:any) => parseInt(t.id)).sort((a:number, b:number) => a - b);
        const minId = sortedIds[0];
        notify("Carregando histórico antigo...", "info");
        try {
            const snap = await db.ref('trips').orderByKey().endBefore(minId.toString()).limitToLast(200).once('value');
            const val = snap.val();
            if (val) {
                const newTrips = Object.keys(val).map(key => ({ id: key, ...val[key] }));
                setData((prev: any) => {
                    const existingIds = new Set(prev.trips.map((t:any) => t.id));
                    const uniqueNew = newTrips.filter((t:any) => !existingIds.has(t.id));
                    return { ...prev, trips: [...prev.trips, ...uniqueNew] };
                });
                notify(`${newTrips.length} viagens antigas carregadas.`, "success");
            } else {
                notify("Fim do histórico.", "info");
            }
        } catch (e) {
            console.error(e);
            notify("Erro ao buscar histórico.", "error");
        }
    };

    const changeTheme = (t: string) => { setThemeKey(t); if(user) { dbOp('update', 'preferences', { theme: t }); localStorage.setItem(`${user.username}_nexflow_theme`, t); } };

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

    useEffect(() => {
        if (!runTour) return;
        const step = TOUR_STEPS[tourStep];
        if (!step) return;
        if (step.view && step.view !== view) setView(step.view);
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            const isMenuTarget = step.target && step.target.includes('sidebar');
            setMenuOpen(!!isMenuTarget);
        }
    }, [tourStep, runTour]);

    useEffect(() => {
        fetch('https://ipwho.is/').then(r => r.json()).then(d => { if (d.success) setCurrentIp(d.ip); }).catch(e => console.error(e));
    }, []);

    useEffect(() => {
        if(auth) {
            const unsub = auth.onAuthStateChanged((u: any) => setIsFireConnected(!!u));
            if (isAuthenticated && !auth.currentUser) {
                auth.signInAnonymously().catch((e:any) => { if (e.code !== 'auth/configuration-not-found' && e.code !== 'auth/operation-not-allowed') console.error("Erro re-auth firebase:", e); });
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

    useEffect(() => {
        if (data.newsletter && data.newsletter.length > 0 && user) {
            const sortedNews = [...data.newsletter].sort((a:any, b:any) => b.timestamp - a.timestamp);
            const latest = sortedNews[0];
            const lastSeenId = localStorage.getItem(`last_news_seen_${user.username}`);
            if (lastSeenId !== latest.id) {
                setLatestNews(latest);
                setShowNewsModal(true);
            }
        }
    }, [data.newsletter, user]);

    const markNewsAsSeen = () => {
        if (latestNews && user) localStorage.setItem(`last_news_seen_${user.username}`, latestNews.id);
        setShowNewsModal(false);
    };

    useEffect(() => {
        const checkDates = () => {
            const newOp = getOperationalDate();
            const newLousa = getLousaDate();
            if (newOp !== currentOpDate) {
                setCurrentOpDate(newOp);
                if (analysisDate === currentOpDate) setAnalysisDate(newOp);
            }
            if (newLousa !== lousaDate) setLousaDate(newLousa);
        };
        const int = setInterval(checkDates, 60000);
        return () => clearInterval(int);
    }, [currentOpDate, lousaDate, analysisDate]);

    useEffect(() => {
        if(!db || !user) return; 
        const msgRef = db.ref('canned_messages_config/list');
        const msgCb = msgRef.on('value', (snap: any) => setCannedMessages(snap.val() || []));
        const driversRef = db.ref('drivers_table_list');
        const driversCb = driversRef.on('value', (snap: any) => setSpList(snap.val() || INITIAL_SP_LIST));
        const rotDateRef = db.ref('system_settings/rotation_base_date');
        const rotDateCb = rotDateRef.on('value', (snap: any) => { if (snap.val()) setRotationBaseDate(snap.val()); });
        const priceRef = db.ref('system_settings/price_per_passenger');
        const priceCb = priceRef.on('value', (snap: any) => { if (snap.val()) setPricePerPassenger(Number(snap.val())); });
        const madConfigRef = db.ref('madrugada_config/list');
        const madConfigCb = madConfigRef.on('value', (snap: any) => setMadrugadaList(snap.val() || []));
        const dailyRef = db.ref(`daily_tables/${currentOpDate}`);
        const dailyCb = dailyRef.on('value', (snap: any) => {
            const val = snap.val();
            if(val) {
                setTableStatus(val.status || {});
                setMadrugadaData(val.madrugada || {});
            } else {
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
        const labelsCb = labelsRef.on('value', (snap: any) => setIpLabels(snap.val() || {}));
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
    }, [db, user, isFireConnected, currentOpDate, lousaDate]);

    useEffect(() => {
        if (!db || !user) return;
        const smallNodes = ['passengers', 'drivers', 'notes', 'lostFound', 'blocked_ips', 'newsletter', 'users'];
        const unsubs = smallNodes.map(node => {
            const ref = db.ref(node);
            const callback = ref.on('value', (snapshot) => {
                const val = snapshot.val();
                const list = val ? Object.keys(val).map(key => ({ id: key, ...val[key] })) : [];
                if (['passengers', 'drivers'].includes(node)) {
                    list.sort((a:any, b:any) => parseInt(b.id) - parseInt(a.id));
                }
                setData((prev:any) => ({ ...prev, [node]: list }));
            });
            return () => ref.off('value', callback);
        });

        const tripsRef = db.ref('trips').orderByKey().limitToLast(300);
        const tripsCb = tripsRef.on('value', (snapshot: any) => {
            const val = snapshot.val();
            const list = val ? Object.keys(val).map(key => ({ id: key, ...val[key] })) : [];
            list.sort((a:any, b:any) => parseInt(b.id) - parseInt(a.id));
            setData((prev:any) => {
                const currentMap = new Map(prev.trips.map((t:any) => [t.id, t]));
                list.forEach((t:any) => currentMap.set(t.id, t));
                const mergedList = Array.from(currentMap.values()).sort((a:any, b:any) => parseInt(b.id) - parseInt(a.id));
                return { ...prev, trips: mergedList };
            });
        });

        return () => {
            unsubs.forEach(fn => fn());
            tripsRef.off('value', tripsCb);
        };
    }, [user, isFireConnected]);

    // --- MISSING HANDLERS IMPLEMENTATION ---

    const handleGlobalTouchStart = (e: any) => { globalTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const handleGlobalTouchEnd = (e: any) => { 
        const endX = e.changedTouches[0].clientX;
        const diffX = endX - globalTouchRef.current.x;
        if (diffX > 100 && !menuOpen) setMenuOpen(true);
        if (diffX < -100 && menuOpen) setMenuOpen(false);
    };
    
    const handleMenuDragStart = (e: any, index: number) => { setDraggedMenuIndex(index); e.dataTransfer.effectAllowed = "move"; };
    const handleMenuDragOver = (e: any) => { e.preventDefault(); };
    const handleMenuDrop = (e: any, dropIndex: number) => {
        if (draggedMenuIndex === null) return;
        const newOrder = [...orderedMenuItems];
        const [moved] = newOrder.splice(draggedMenuIndex, 1);
        newOrder.splice(dropIndex, 0, moved);
        setOrderedMenuItems(newOrder);
        setDraggedMenuIndex(null);
        dbOp('update', 'preferences', { menuOrder: newOrder.map(i => i.id) });
    };

    const del = (node: string, id: string) => { requestConfirm("Excluir item?", "Essa ação não pode ser desfeita.", () => { dbOp('delete', node, id); }); };
    
    const save = (type: string) => {
        if (type === 'passengers' && !formData.name) return notify("Nome obrigatório", "error");
        if (type === 'drivers' && !formData.name) return notify("Nome obrigatório", "error");
        if (type === 'lostFound' && !formData.description) return notify("Descrição obrigatória", "error");
        dbOp(formData.id ? 'update' : 'create', type, formData);
        setModal(null);
        setFormData({});
    };

    const saveExtraCharge = () => {
        if(!formData.value) return notify("Valor obrigatório", "error");
        const payload = { ...formData, isExtra: true, status: 'Finalizada', driverName: 'Extra / Externo', paymentStatus: 'Pendente' };
        dbOp('create', 'trips', payload);
        setModal(null);
        setFormData({});
    };

    const openEditTrip = (trip: any) => {
        const dr = data.drivers.find((d:any)=>d.id===trip.driverId); 
        setFormData({ ...trip });
        setEditingTripId(trip.id);
        setModal('trip');
        let pax = trip.passengersSnapshot || [];
        if(!pax.length && trip.passengerIds) pax = data.passengers.filter((p:any) => trip.passengerIds.includes(p.id));
        setSuggestedTrip({
            driver: dr || {name: trip.driverName || 'Desconhecido', capacity: 0},
            time: trip.time,
            date: trip.date,
            passengers: pax,
            occupancy: pax.reduce((a:any,b:any)=>a+(parseInt(b.passengerCount)||1), 0)
        });
    };

    const updateTripStatus = (id: string, status: string) => { dbOp('update', 'trips', { id, status }); };
    const duplicateTrip = (t: any) => {
        const newTrip = { ...t, id: null, date: getTodayDate(), status: 'Ativo', paymentStatus: 'Pendente' };
        delete newTrip.passengersSnapshot; 
        delete newTrip.pCountSnapshot;
        requestConfirm("Duplicar Viagem?", "Uma nova viagem será criada para hoje com os mesmos dados.", () => { dbOp('create', 'trips', newTrip); }, 'info');
    };

    const toggleMic = () => {
        if (isListening) { setIsListening(false); return; }
        setIsListening(true);
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return notify("Navegador sem suporte a voz.", "error");
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setAiInput((prev: string) => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };
        recognition.start();
    };

    const handleSmartCreate = async () => {
        if (!aiInput) return;
        setAiLoading(true);
        try {
            const prompt = `Analise o texto: "${aiInput}". Retorne um JSON com: action (passenger_create, trip_create), data (objeto com campos). Se passenger_create: name, neighborhood (padronize com: ${BAIRROS.join(', ')}), time, date (YYYY-MM-DD), payment, passengerCount. Use hoje como ${getTodayDate()}.`;
            const res = await callGemini(prompt, geminiKey);
            const jsonMatch = res.match(/\{[\s\S]*\}/);
            if(jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.action === 'passenger_create') {
                    dbOp('create', 'passengers', { ...parsed.data, status: 'Ativo' });
                    setAiModal(false);
                    setAiInput('');
                }
            }
        } catch (e) { notify("Erro na IA", "error"); } finally { setAiLoading(false); }
    };

    const getRotatedList = (dateStr: string) => {
        if (!spList.length) return [];
        const base = new Date(rotationBaseDate + 'T00:00:00');
        const current = new Date(dateStr + 'T00:00:00');
        const diffTime = current.getTime() - base.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const shift = diffDays % spList.length;
        if (shift === 0) return spList;
        return [...spList.slice(shift), ...spList.slice(0, shift)];
    };
    
    const getRotatedMadrugadaList = (dateStr: string) => { return spList.filter((d:any) => madrugadaList.includes(d.vaga)); };

    const saveDriverName = (vaga: string) => {
         const newList = spList.map((d:any) => d.vaga === vaga ? { ...d, name: tempName } : d);
         dbOp('update', 'drivers_table_list', newList); 
         setEditName(null);
    };

    const updateTableStatus = (vaga: string, status: string | null) => {
        if (status === null) db?.ref(`daily_tables/${analysisDate}/status/${vaga}`).remove();
        else dbOp('update', `daily_tables/${analysisDate}/status`, { [vaga]: status });
    };

    const confirmedTimes = useMemo(() => {
        const map: any = {};
        const activeTrips = data.trips.filter((t:any) => t.date === analysisDate && t.status !== 'Cancelada');
        activeTrips.forEach((t:any) => {
            const entry = spList.find((s:any) => s.name === t.driverName);
            if(entry) map[entry.vaga] = t.time;
        });
        return map;
    }, [data.trips, analysisDate, spList]);
    
    const isTimeExpired = (time: string) => {
        if (!time) return false;
        if (analysisDate !== getTodayDate()) return true;
        const now = new Date();
        const [h, m] = time.split(':').map(Number);
        const tDate = new Date(); tDate.setHours(h); tDate.setMinutes(m);
        return now > tDate;
    };

    const sendToLousaKeepConfirmed = (vaga: string) => {
        const item = { vaga, uid: generateUniqueId(), riscado: false };
        const newList = [...lousaOrder, item];
        dbOp('update', `daily_tables/${lousaDate}`, { lousaOrder: newList });
    };

    const handleLousaAction = (uid: string, action: string, vaga: string) => {
        let newList = [...lousaOrder];
        if (action === 'remove') newList = newList.filter(i => i.uid !== uid);
        if (action === 'remove_all') newList = newList.filter(i => i.vaga !== vaga);
        if (action === 'riscar') newList = newList.map(i => i.uid === uid ? { ...i, riscado: !i.riscado } : i);
        if (action === 'baixar') newList = newList.map(i => i.uid === uid ? { ...i, baixou: !i.baixou } : i);
        if (action === 'duplicate') {
             const idx = newList.findIndex(i => i.uid === uid);
             const item = newList[idx];
             newList.splice(idx + 1, 0, { ...item, uid: generateUniqueId() });
        }
        dbOp('update', `daily_tables/${lousaDate}`, { lousaOrder: newList });
    };

    const addNullLousaItem = () => {
         const newList = [...lousaOrder, { vaga: 'NULL', uid: generateUniqueId(), isNull: true }];
         dbOp('update', `daily_tables/${lousaDate}`, { lousaOrder: newList });
    };

    const startLousaTime = new Date(); startLousaTime.setHours(4,0,0,0); 

    const handleDragStart = (e: any, index: number) => { setDraggedItem({ index, listType: 'lousa' }); };
    const handleDrop = (e: any, dropIndex: number) => {
        if (!draggedItem || draggedItem.listType !== 'lousa') return;
        const newList = [...lousaOrder];
        const [moved] = newList.splice(draggedItem.index, 1);
        newList.splice(dropIndex, 0, moved);
        setLousaOrder(newList); 
        dbOp('update', `daily_tables/${lousaDate}`, { lousaOrder: newList });
        setDraggedItem(null);
    };
    
    const handleGeneralDragStart = (e: any, index: number) => { setDraggedItem({ index, listType: 'geral' }); };
    const handleGeneralDrop = (e: any, dropIndex: number) => {
        if (!draggedItem || draggedItem.listType !== 'geral') return;
        const newList = [...getRotatedList(currentOpDate)];
        const [moved] = newList.splice(draggedItem.index, 1);
        newList.splice(dropIndex, 0, moved);
        dbOp('update', 'drivers_table_list', newList);
        setDraggedItem(null);
    };

    const addMadrugadaVaga = () => { setModal('madrugadaVaga'); };
    const confirmAddMadrugadaVaga = () => {
        if (tempVagaMadrugada) {
            const newList = [...madrugadaList, tempVagaMadrugada];
            dbOp('update', 'madrugada_config/list', newList);
            setModal(null);
            setTempVagaMadrugada('');
        }
    };
    const removeMadrugadaVaga = (vaga: string) => { dbOp('update', 'madrugada_config/list', madrugadaList.filter((v:string) => v !== vaga)); };
    const toggleMadrugadaRiscado = (vaga: string) => {
         const current = madrugadaData[vaga] || {};
         if (!current.riscado) { setVagaToBlock(vaga); setModal('madrugadaBlock'); } 
         else { dbOp('update', `daily_tables/${currentOpDate}/madrugada/${vaga}`, { ...current, riscado: false, comment: '' }); }
    };
    const confirmMadrugadaBlock = () => {
         if (vagaToBlock) {
             const current = madrugadaData[vagaToBlock] || {};
             dbOp('update', `daily_tables/${currentOpDate}/madrugada/${vagaToBlock}`, { ...current, riscado: true, comment: tempJustification });
             setModal(null); setVagaToBlock(null); setTempJustification('');
         }
    };
    const openMadrugadaTrip = (vaga: string, date: string) => {
        const tripId = `mad_${date}_${vaga}`;
        const existing = data.trips.find((t:any) => t.id === tripId);
        if (existing) openEditTrip(existing);
        else {
             const sp = spList.find((s:any) => s.vaga === vaga);
             setFormData({ id: tripId, driverId: sp ? data.drivers.find((d:any)=>d.name===sp.name)?.id : '', driverName: sp ? sp.name : '', vaga: vaga, date: date, time: '04:00/04:45', isMadrugada: true, pCount: 0 });
             setModal('trip'); setSuggestedTrip(null);
        }
    };
    
    const handleMadrugadaDragStart = (e: any, index: number) => { setDraggedItem({ index, listType: 'madrugada' }); };
    const handleMadrugadaDrop = (e: any, dropIndex: number) => {
        if (!draggedItem || draggedItem.listType !== 'madrugada') return;
        const newList = [...madrugadaList];
        const [moved] = newList.splice(draggedItem.index, 1);
        newList.splice(dropIndex, 0, moved);
        dbOp('update', 'madrugada_config/list', newList);
        setDraggedItem(null);
    };

    const addCannedMessage = () => { dbOp('update', 'canned_messages_config/list', [...cannedMessages, { id: generateUniqueId(), title: 'Nova Mensagem', text: '' }]); };
    const updateCannedMessage = (id: string, field: string, val: string) => { dbOp('update', 'canned_messages_config/list', cannedMessages.map((m:any) => m.id === id ? { ...m, [field]: val } : m)); };
    const deleteCannedMessage = (id: string) => { dbOp('update', 'canned_messages_config/list', cannedMessages.filter((m:any) => m.id !== id)); };
    const handleCannedDragStart = (e: any, index: number) => { setDraggedItem({ index, listType: 'canned' }); };
    const handleCannedDrop = (e: any, dropIndex: number) => {
         if (!draggedItem || draggedItem.listType !== 'canned') return;
         const newList = [...cannedMessages];
         const [moved] = newList.splice(draggedItem.index, 1);
         newList.splice(dropIndex, 0, moved);
         dbOp('update', 'canned_messages_config/list', newList);
         setDraggedItem(null);
    };

    const handleTouchStart = (e: any, index: number, listType: string) => { setDraggedItem({ index, listType }); };
    const handleTouchMove = (e: any) => { e.preventDefault(); };
    const handleTouchEnd = (e: any, dropIndex: number, listType: string) => {
         if (dropIndex !== -1 && draggedItem && draggedItem.listType === listType) {
             if (listType === 'lousa') handleDrop(e, dropIndex);
             if (listType === 'geral') handleGeneralDrop(e, dropIndex);
             if (listType === 'madrugada') handleMadrugadaDrop(e, dropIndex);
             if (listType === 'canned') handleCannedDrop(e, dropIndex);
         }
         setDraggedItem(null);
    };

    const sendBillingMessage = (trip: any) => {
         const d = data.drivers.find((x:any) => x.name === trip.driverName);
         if (d && d.phone) {
             const msg = encodeURIComponent(`Olá ${d.name}, favor verificar o pagamento da viagem #${trip.id} de ${formatDisplayDate(trip.date)}.`);
             window.open(`https://wa.me/55${d.phone.replace(/\D/g,'')}?text=${msg}`, '_blank');
         } else { notify("Motorista sem telefone", "error"); }
    };

    const restartTour = () => { setRunTour(true); setTourStep(0); };
    const completeTour = () => { setRunTour(false); localStorage.setItem(`tour_seen_${user.username}`, 'true'); };
    const saveApiKey = (key: string) => { localStorage.setItem('nexflow_gemini_key', key); notify("Chave Salva!", "success"); };
    const blockIp = (ip: string) => { /* logic */ };
    const saveIpLabel = (ip: string, label: string) => { /* logic */ };
    
    const addById = () => {
        const p = data.passengers.find((x:any) => x.id.toString() === searchId);
        if (p) {
             setSuggestedTrip((prev:any) => ({ ...prev, passengers: [...prev.passengers, p], occupancy: prev.occupancy + (parseInt(p.passengerCount)||1) }));
             setSearchId('');
        } else { notify("Passageiro não encontrado", "error"); }
    };
    const autoFill = () => { notify("Auto-fill simulado.", "info"); };
    const removePax = (id: string) => {
        setSuggestedTrip((prev:any) => ({ ...prev, passengers: prev.passengers.filter((p:any) => p.id !== id), occupancy: prev.occupancy - (parseInt(prev.passengers.find((p:any)=>p.id===id)?.passengerCount)||1) }));
    };
    const confirmTrip = () => {
         const newTrip: any = { // Explicitly typed as any to allow dynamic assignment of properties
             driverId: formData.driverId || data.drivers.find((d:any)=>d.name===suggestedTrip.driver.name)?.id,
             driverName: suggestedTrip.driver.name,
             time: suggestedTrip.time,
             date: suggestedTrip.date,
             status: 'Ativo',
             paymentStatus: 'Pendente',
             passengerIds: suggestedTrip.passengers.map((p:any)=>p.id),
             passengersSnapshot: suggestedTrip.passengers,
             pCountSnapshot: suggestedTrip.occupancy,
             isMadrugada: !!formData.isMadrugada
         };
         if (editingTripId) newTrip.id = editingTripId;
         dbOp(editingTripId ? 'update' : 'create', 'trips', newTrip);
         setModal(null); setSuggestedTrip(null); setEditingTripId(null);
    };
    const simulate = () => {
        const dr = data.drivers.find((d:any)=>d.id === formData.driverId);
        setSuggestedTrip({ driver: dr || { name: 'Simulado', capacity: 15 }, time: formData.time, date: formData.date || getTodayDate(), passengers: [], occupancy: 0 });
    };

    if (isLoading) return <div id="loader" className="fixed inset-0 bg-black flex items-center justify-center"><div className="text-amber-500 font-bold">CARREGANDO...</div></div>;
    if (!isAuthenticated) return <LoginScreen />;

    return (
        <div className={`h-screen w-screen overflow-hidden ${theme.bg} ${theme.text} font-sans flex`} 
             onTouchStart={handleGlobalTouchStart} 
             onTouchEnd={handleGlobalTouchEnd}
             onContextMenu={(e) => { e.preventDefault(); setCmdOpen(true); }} 
        >
             <Toast message={notification.message} type={notification.type} visible={notification.visible} />
             <ConfirmModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={confirmState.onConfirm} onCancel={() => setConfirmState((prev:any) => ({ ...prev, isOpen: false }))} type={confirmState.type} theme={theme} />
             
             <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} theme={theme} actions={commandActions} />
             <QuickCalculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} theme={theme} />

             {/* WRAPPING THE ENTIRE APP CONTENT WITH THE SECURE PAYMENT GATE */}
             <PaymentGate user={user}>
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
                    <div className={`h-16 flex items-center justify-between px-4 md:px-8 border-b ${theme.border} bg-opacity-80 backdrop-blur-md z-30 flex-shrink-0`}>
                        <div className="flex items-center gap-4 flex-1">
                            <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 -ml-2"><Icons.Menu size={24} /></button>
                            <h2 className={`font-bold text-lg md:text-xl truncate ${['passengers', 'drivers', 'trips', 'achados', 'lostFound'].includes(view) && searchTerm ? 'hidden md:block' : 'block'}`}>{orderedMenuItems.find(i=>i.id===view)?.l || 'Bora de Van'}</h2>
                            {['passengers', 'drivers', 'trips', 'achados', 'lostFound'].includes(view) && (<div className="flex-1 max-w-md ml-auto md:ml-4"><div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center opacity-50"><Icons.Search size={16} /></div><input type="text" placeholder={`Pesquisar...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full ${theme.inner} border ${theme.border} rounded-xl py-2 pl-10 pr-4 text-sm outline-none ${theme.text}`}/>{searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center opacity-50"><Icons.X size={14} /></button>)}</div></div>)}
                        </div>
                        <div className="flex gap-2 ml-2">
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
                            {view === 'trips' && <Viagens data={data} theme={theme} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setModal={setModal} openEditTrip={openEditTrip} updateTripStatus={updateTripStatus} del={del} duplicateTrip={duplicateTrip} notify={notify} loadOlderTrips={loadOlderTrips} />}
                            {view === 'appointments' && <Agendamentos data={data} theme={theme} setFormData={setFormData} setModal={setModal} dbOp={dbOp} setSuggestedTrip={setSuggestedTrip} setEditingTripId={setEditingTripId} notify={notify} requestConfirm={requestConfirm} />}
                            
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
                                getRotatedMadrugadaList={getRotatedMadrugadaList}
                            />}
                            
                            {(view === 'financeiro' || view === 'billing') && <Financeiro data={data} theme={theme} pricePerPassenger={pricePerPassenger} billingData={(() => { 
                                const targetMonth = billingDate.getMonth(); 
                                const targetYear = billingDate.getFullYear(); 
                                const validTrips = data.trips.filter((t:any) => { 
                                    if (t.status === 'Cancelada' || !t.date) return false; 
                                    const [y, m, d] = t.date.split('-').map(Number); 
                                    return (m - 1) === targetMonth && y === targetYear; 
                                }); 
                                const groups:any = {}; 
                                let totalPending = 0; let totalPaid = 0; 
                                validTrips.forEach((t:any) => { 
                                    let value = 0; let pCount = 0; 
                                    if (t.isExtra) { value = parseFloat(t.value) || 0; pCount = 0; } 
                                    else if (t.isMadrugada) { 
                                        pCount = t.pCountSnapshot !== undefined ? parseInt(t.pCountSnapshot || 0) : parseInt(t.pCount || 0); 
                                        const unitPrice = t.ticketPrice !== undefined ? Number(t.ticketPrice) : 4; 
                                        value = pCount * unitPrice; 
                                    } else { 
                                        if (t.pCountSnapshot !== undefined && t.pCountSnapshot !== null) pCount = parseInt(t.pCountSnapshot || 0);
                                        else if (t.passengersSnapshot) pCount = t.passengersSnapshot.reduce((acc:number, p:any) => acc + parseInt(p.passengerCount || 1), 0);
                                        else pCount = data.passengers.filter((p:any) => (t.passengerIds||[]).includes(p.id)).reduce((a:number,b:any) => a + parseInt(b.passengerCount||1), 0);
                                        const unitPrice = t.ticketPrice !== undefined ? Number(t.ticketPrice) : 4; 
                                        value = pCount * unitPrice; 
                                        if (pCount === 0 && t.value) value = parseFloat(t.value); 
                                    } 
                                    const isPaid = t.paymentStatus === 'Pago'; 
                                    if (isPaid) totalPaid += value; else totalPending += value; 
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
             </PaymentGate>
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
