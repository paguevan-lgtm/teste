
import React, { useState, useEffect } from 'react';
import { Icons, Input, Button } from '../components/Shared';
import { THEMES } from '../constants';
import { getAvatarUrl, generateUniqueId, getTodayDate, compressImage, parseUserAgent } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

export default function Configuracoes({ user, theme, restartTour, setAiModal, geminiKey, setGeminiKey, saveApiKey, ipToBlock, setIpToBlock, blockIp, data, del, ipHistory, ipLabels, saveIpLabel, changeTheme, themeKey, dbOp, notify, requestConfirm, setView }: any) {
    const { logout } = useAuth();
    
    // States for Newsletter
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [newsImage, setNewsImage] = useState<string|null>(null);
    const [securityTab, setSecurityTab] = useState('timeline'); // timeline | blocked
    const [daysRemaining, setDaysRemaining] = useState<number|null>(null);

    const isAdmin = user.username === 'Breno';

    // Fetch Subscription Status
    useEffect(() => {
        if(!db) return;
        const subRef = db.ref('system_settings/subscription');
        subRef.on('value', (snap: any) => {
            const val = snap.val();
            if (val && val.expiry) {
                const now = Date.now();
                if (val.expiry > now) {
                    const diffTime = Math.abs(val.expiry - now);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    setDaysRemaining(diffDays);
                } else {
                    setDaysRemaining(0);
                }
            } else {
                setDaysRemaining(0);
            }
        });
        return () => subRef.off();
    }, []);

    const handleLogoutClick = () => {
        requestConfirm("Deseja realmente sair?", "Você terá que fazer login novamente.", () => {
            logout();
        });
    };

    const handleImageUpload = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setNewsImage(compressed);
            } catch (err) {
                notify("Erro ao processar imagem", "error");
            }
        }
    };

    const handlePaste = async (e: any) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    const compressed = await compressImage(file);
                    setNewsImage(compressed);
                    e.preventDefault(); 
                }
                break;
            }
        }
    };

    const handlePostNews = () => {
        if(!newsTitle || !newsContent) return notify("Título e conteúdo são obrigatórios.", "error");
        
        const payload = {
            id: generateUniqueId(),
            title: newsTitle,
            content: newsContent,
            date: getTodayDate(),
            author: user.username,
            image: newsImage || null,
            timestamp: Date.now()
        };

        dbOp('create', 'newsletter', payload);
        setNewsTitle('');
        setNewsContent('');
        setNewsImage(null);
        notify("Novidade publicada com sucesso!", "success");
    };

    const handleExportData = () => {
        try {
            const backup = {
                passengers: data.passengers || [],
                drivers: data.drivers || [],
                trips: data.trips || [],
                generatedAt: new Date().toISOString(),
                exportedBy: user.username
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_boradevan_${getTodayDate()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            notify("Backup gerado com sucesso!", "success");
        } catch (e) {
            notify("Erro ao gerar backup.", "error");
        }
    };

    const banDevice = (deviceId: string, reason: string) => {
        if (!deviceId) return;
        requestConfirm("Banir Dispositivo?", "Este aparelho não conseguirá mais fazer login, mesmo trocando de navegador ou aba anônima. Se estiver logado, cairá imediatamente.", () => {
            dbOp('update', `blocked_devices/${deviceId}`, { 
                reason, 
                blockedBy: user.username,
                blockedAt: Date.now()
            });
        });
    };

    const unbanDevice = (deviceId: string) => {
        requestConfirm("Desbloquear?", "O aparelho voltará a ter acesso.", () => {
            dbOp('delete', 'blocked_devices', deviceId);
        });
    };

    // Admin Controls for System Lock
    const toggleSystemLock = (action: 'block' | 'unlock') => {
        if (!isAdmin) return;
        
        if (action === 'block') {
            requestConfirm("BLOQUEAR SISTEMA?", "Todos os usuários (exceto você) perderão o acesso imediatamente e verão a tela de pagamento.", () => {
                dbOp('update', 'system_settings/subscription', {
                    expiry: 0, // Force expire
                    status: 'expired',
                    updatedBy: user.username
                });
                notify("Sistema Bloqueado!", "success");
            });
        } else {
            const newExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 dias
            dbOp('update', 'system_settings/subscription', {
                expiry: newExpiry,
                status: 'active',
                updatedBy: user.username
            });
            notify("Sistema Liberado por 30 dias!", "success");
        }
    };

    const [blockedList, setBlockedList] = useState<any[]>([]);
    
    // Fetch Blocked Devices (Admin Only)
    useEffect(() => {
        if (!isAdmin || !dbOp) return;
        // @ts-ignore
        import('../firebase').then(({ db }) => {
            if(db) {
                // Blocked Devices
                const ref = db.ref('blocked_devices');
                ref.on('value', (snap:any) => {
                    const val = snap.val();
                    const list = val ? Object.keys(val).map(k => ({ id: k, ...val[k] })) : [];
                    setBlockedList(list);
                });

                return () => { ref.off(); };
            }
        });
    }, [isAdmin]);


    return (
        <div className="space-y-6 pb-20">
            
            {/* 1. PERFIL HEADER */}
            <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 border ${theme.border} shadow-2xl group stagger-in d-1`}>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-90"></div>
                {/* CORREÇÃO VISUAL: Ícone reposicionado com valores negativos para efeito de watermark */}
                <div className={`absolute -top-6 -right-6 p-0 opacity-10 transform rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 pointer-events-none`}>
                    <Icons.Settings size={180} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-orange-600 shadow-lg">
                                <img src={getAvatarUrl(user.username)} alt="User" className="w-full h-full rounded-full bg-slate-950 object-cover" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-slate-900 rounded-full"></div>
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{user.username}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                                    {user.role}
                                </span>
                                <span className="text-xs opacity-50">•</span>
                                <span className="text-xs opacity-50">Online agora</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        {/* SUBSCRIPTION STATUS WIDGET */}
                        <div className="bg-black/30 border border-white/10 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm">
                            <div className={`p-2 rounded-lg ${daysRemaining && daysRemaining > 5 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                <Icons.Clock size={20}/>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Renovação em</div>
                                <div className="text-lg font-black text-white">{daysRemaining !== null ? `${daysRemaining} dias` : '--'}</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {user.role === 'admin' && (
                                <button 
                                    onClick={() => setView('manageUsers')}
                                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-xl flex items-center gap-2 font-bold transition-all active:scale-95 text-sm"
                                >
                                    <Icons.Users size={18}/> Gerenciar Usuários
                                </button>
                            )}
                            <button onClick={handleLogoutClick} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-5 py-3 rounded-xl flex items-center gap-2 font-bold transition-all active:scale-95 text-sm">
                                <Icons.LogOut size={18}/> Sair
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. GRID DE CONFIGURAÇÕES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 stagger-in d-2">
                
                {/* COLUNA ESQUERDA (Maior) - Temas e Atualizações */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* SELETOR DE TEMAS */}
                    <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} shadow-lg`}>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Icons.Stars className="text-amber-400"/> Aparência e Tema
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(THEMES).map(([key, t]: any) => (
                                <button 
                                    key={key} 
                                    onClick={() => changeTheme(key)} 
                                    className={`relative group overflow-hidden rounded-xl border transition-all duration-300 ${themeKey === key ? 'border-amber-500 ring-2 ring-amber-500/20 scale-[1.02]' : 'border-white/10 hover:border-white/30'}`}
                                >
                                    <div className={`h-16 w-full ${t.bg} flex items-center justify-center relative`}>
                                        <div className={`w-8 h-8 rounded-full ${t.primary} shadow-lg flex items-center justify-center`}>
                                            {themeKey === key && <Icons.Check size={14} className="text-white"/>}
                                        </div>
                                    </div>
                                    <div className="py-2 px-3 bg-black/20 text-center">
                                        <span className="text-xs font-bold opacity-80">{t.name.split(' ')[0]}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* NEWSLETTER / NOVIDADES */}
                    <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} shadow-lg`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Icons.Bell className="text-blue-400"/> Novidades do Sistema</h3>
                        </div>
                        
                        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                            {data.newsletter && data.newsletter.length > 0 ? (
                                data.newsletter.sort((a:any,b:any) => b.timestamp - a.timestamp).map((news:any) => (
                                    <div key={news.id} className="bg-white/5 p-4 rounded-xl border border-white/5 relative hover:bg-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-base text-white">{news.title}</h4>
                                            <span className="text-[10px] opacity-50 bg-black/30 px-2 py-1 rounded border border-white/5">{news.date}</span>
                                        </div>
                                        {news.image && (
                                            <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
                                                <img src={news.image} alt="Anexo" className="w-full h-auto object-cover max-h-48" />
                                            </div>
                                        )}
                                        <p className="text-sm opacity-70 whitespace-pre-wrap leading-relaxed">{news.content}</p>
                                        {isAdmin && (
                                            <button onClick={()=>del('newsletter', news.id)} className="absolute bottom-2 right-2 text-red-400 opacity-20 hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded transition-all"><Icons.Trash size={14}/></button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 opacity-30 text-sm border-2 border-dashed border-white/10 rounded-xl">
                                    Nenhuma novidade registrada.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* COLUNA DIREITA (Menor) - IA, Tutorial e Ferramentas */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* SYSTEM LOCK CONTROLS (Admin Only) */}
                    {isAdmin && (
                        <div className={`${theme.card} p-6 rounded-2xl border border-red-500/30 bg-red-900/5 shadow-lg`}>
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-200"><Icons.Lock size={20}/> Controle de Acesso</h3>
                            <p className="text-xs opacity-60 mb-4 leading-relaxed">
                                Gerencie o bloqueio geral do sistema. Você (Admin) sempre terá acesso.
                            </p>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => toggleSystemLock('block')} 
                                    className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Icons.Lock size={16}/> Bloquear Sistema Agora
                                </button>
                                <button 
                                    onClick={() => toggleSystemLock('unlock')} 
                                    className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Icons.CheckCircle size={16}/> Liberar (30 Dias)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* IA CONFIG */}
                    <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} shadow-lg`}>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Icons.Stars className="text-purple-400"/> Inteligência Artificial</h3>
                        <p className="text-xs opacity-60 mb-4 leading-relaxed">
                            Configure sua chave do Google Gemini para habilitar o <strong>Cadastro Mágico</strong> e automações de voz.
                        </p>
                        <div className="space-y-3">
                            <input 
                                type="password" 
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-colors" 
                                placeholder="Cole sua API Key aqui..." 
                                value={geminiKey} 
                                onChange={(e:any)=>setGeminiKey(e.target.value)} 
                            />
                            <button onClick={()=>saveApiKey(geminiKey)} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 transition-all active:scale-95">
                                Salvar Chave API
                            </button>
                        </div>
                    </div>

                    {/* DADOS DO SISTEMA */}
                    <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} shadow-lg`}>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Icons.Shield className="text-green-400"/> Dados do Sistema</h3>
                        <p className="text-xs opacity-60 mb-4 leading-relaxed">
                            Baixe um backup completo das suas viagens e passageiros para segurança.
                        </p>
                        <button 
                            onClick={handleExportData} 
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Icons.Download size={16}/> Exportar Backup
                        </button>
                    </div>

                    {/* TUTORIAL */}
                    <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} shadow-lg relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Icons.Map size={100} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 relative z-10">Precisa de ajuda?</h3>
                        <p className="text-xs opacity-60 mb-4 leading-relaxed relative z-10">
                            Reveja o tour guiado para descobrir todas as funcionalidades do sistema passo a passo.
                        </p>
                        <button 
                            onClick={() => { localStorage.removeItem(`tour_seen_${user.username}`); restartTour(); }} 
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl text-sm font-bold transition-all active:scale-95 relative z-10 flex items-center justify-center gap-2"
                        >
                            <Icons.Refresh size={16}/> Reiniciar Tour
                        </button>
                    </div>

                </div>
            </div>

            {/* 3. ZONA ADMINISTRATIVA (BRENO ONLY) */}
            {isAdmin && (
                <div className={`mt-8 ${theme.card} rounded-3xl border border-red-500/20 overflow-hidden stagger-in d-3`}>
                    <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center gap-3">
                        <div className="bg-red-500/20 p-2 rounded-lg text-red-400">
                            <Icons.Shield size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-200">Painel de Segurança & Avisos</h3>
                            <p className="text-xs text-red-300/60">Controle total e Auditoria</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Postar Novidade */}
                        <div>
                            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                                <Icons.Message size={14}/> Publicar Aviso
                            </h4>
                            <div className="space-y-3">
                                <Input theme={theme} placeholder="Título da Novidade" value={newsTitle} onChange={(e:any)=>setNewsTitle(e.target.value)} />
                                <div className="relative">
                                    <textarea 
                                        className="w-full h-32 bg-black/20 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-white/30 resize-none text-sm"
                                        placeholder="Descreva as atualizações... (Cole print aqui)"
                                        value={newsContent}
                                        onChange={(e)=>setNewsContent(e.target.value)}
                                        onPaste={handlePaste}
                                    />
                                    {/* Upload Button overlay or separate */}
                                    <div className="absolute bottom-3 right-3">
                                        <input type="file" id="news-img-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        <label htmlFor="news-img-upload" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer text-white transition-colors flex items-center justify-center">
                                            <Icons.Image size={16}/>
                                        </label>
                                    </div>
                                </div>
                                
                                {newsImage && (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10 group">
                                        <img src={newsImage} alt="Preview" className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => setNewsImage(null)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <Icons.X size={14}/>
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <Button theme={theme} onClick={handlePostNews} size="sm" icon={Icons.Send} variant="success">Publicar</Button>
                                </div>
                            </div>
                        </div>

                        {/* Fingerprint Security Panel */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex gap-2">
                                    <button onClick={()=>setSecurityTab('timeline')} className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${securityTab==='timeline' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>Acessos</button>
                                    <button onClick={()=>setSecurityTab('blocked')} className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${securityTab==='blocked' ? 'bg-red-500/20 text-red-300' : 'text-white/40 hover:text-white'}`}>Bloqueados</button>
                                </div>
                            </div>

                            {/* TIMELINE */}
                            {securityTab === 'timeline' && (
                                <div className="bg-black/20 rounded-xl border border-white/5 max-h-80 overflow-y-auto custom-scrollbar p-1">
                                    {ipHistory.map((log:any) => { 
                                        const uaInfo = log.deviceInfo || parseUserAgent(log.device || '');
                                        const gpuInfo = log.deviceInfo?.gpu || '';
                                        const isBanned = blockedList.some(b => b.id === log.deviceId);

                                        let locationStr = 'Local Desconhecido';
                                        if (log.location?.exact_address) {
                                            const addr = log.location.exact_address;
                                            const bairro = addr.suburb || addr.neighbourhood || addr.city_district || '';
                                            const cidade = addr.city || addr.town || addr.village || '';
                                            locationStr = `${bairro ? bairro + ', ' : ''}${cidade}`;
                                        }

                                        return (
                                            <div key={log.id} className="p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${isBanned ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                        <span className="text-xs font-bold text-white">{log.username}</span>
                                                        <span className="text-[10px] opacity-40">{new Date(log.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    {!isBanned && log.deviceId && (
                                                        <button 
                                                            onClick={()=>banDevice(log.deviceId, 'Banido pelo Admin')} 
                                                            className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                                        >
                                                            Banir
                                                        </button>
                                                    )}
                                                    {isBanned && <span className="text-[10px] text-red-500 font-bold uppercase">Banido</span>}
                                                </div>
                                                
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/50">
                                                        {uaInfo.device === 'Desktop' ? <Icons.Laptop size={16}/> : <Icons.Smartphone size={16}/>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs text-white/80 font-bold truncate">{uaInfo.browser} ({uaInfo.os})</div>
                                                        {gpuInfo && <div className="text-[9px] text-white/30 truncate mt-0.5 font-mono">{gpuInfo}</div>}
                                                        <div className="text-[10px] text-white/40 truncate flex gap-2 mt-0.5">
                                                            <span>{locationStr}</span>
                                                            <span className="opacity-50">•</span>
                                                            <span className="font-mono text-white/30" title={log.deviceId}>{log.deviceId?.substring(0,8)}...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ); 
                                    })}
                                </div>
                            )}

                            {/* BLOCKED LIST */}
                            {securityTab === 'blocked' && (
                                <div className="bg-black/20 rounded-xl border border-white/5 max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-2">
                                    {blockedList.length > 0 ? blockedList.map((dev:any) => (
                                        <div key={dev.id} className="bg-red-900/10 border border-red-500/20 p-3 rounded-lg flex justify-between items-center">
                                            <div>
                                                <div className="text-xs font-bold text-red-200 flex items-center gap-2">
                                                    <Icons.Fingerprint size={14}/> ID: {dev.id.substring(0,12)}...
                                                </div>
                                                <div className="text-[10px] text-red-400/60 mt-1">Motivo: {dev.reason || 'Sem motivo'}</div>
                                                <div className="text-[10px] text-red-400/40">Em: {new Date(dev.blockedAt).toLocaleDateString()}</div>
                                            </div>
                                            <button onClick={()=>unbanDevice(dev.id)} className="p-2 bg-white/5 rounded hover:bg-white/10 text-white/70" title="Desbloquear"><Icons.Check size={16}/></button>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 opacity-30 text-xs">Nenhum dispositivo bloqueado.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
