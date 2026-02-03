
import React, { useState } from 'react';
import { Icons, Input, Button } from '../components/Shared';
import { THEMES } from '../constants';
import { getAvatarUrl, generateUniqueId, getTodayDate } from '../utils';
import { useAuth } from '../contexts/AuthContext';

export default function Configuracoes({ user, theme, restartTour, setAiModal, geminiKey, setGeminiKey, saveApiKey, ipToBlock, setIpToBlock, blockIp, data, del, ipHistory, ipLabels, saveIpLabel, changeTheme, themeKey, dbOp, notify, requestConfirm, setView }: any) {
    const { logout } = useAuth();
    
    // States for Newsletter
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [showNewsHistory, setShowNewsHistory] = useState(false);

    const handleLogoutClick = () => {
        requestConfirm("Deseja realmente sair?", "Você terá que fazer login novamente.", () => {
            logout();
        });
    };

    const handlePostNews = () => {
        if(!newsTitle || !newsContent) return notify("Título e conteúdo são obrigatórios.", "error");
        
        const payload = {
            id: generateUniqueId(),
            title: newsTitle,
            content: newsContent,
            date: getTodayDate(),
            author: user.username,
            timestamp: Date.now()
        };

        dbOp('create', 'newsletter', payload);
        setNewsTitle('');
        setNewsContent('');
        notify("Novidade publicada com sucesso!", "success");
    };

    return (
        <div className="space-y-6">
            <div className={`${theme.card} p-6 ${theme.radius} border ${theme.border} flex flex-col md:flex-row md:items-center justify-between gap-6 stagger-in d-1 premium-card`}> 
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-700 overflow-hidden border-2 border-white/20"> 
                        <img src={getAvatarUrl(user.username)} alt="User" className="w-full h-full" /> 
                    </div> 
                    <div> 
                        <h3 className="text-xl font-bold">{user.username}</h3> 
                        <p className="opacity-60 text-sm capitalize">{user.role}</p> 
                    </div> 
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {/* BOTÃO GERENCIAR USUÁRIOS (Admin Only) */}
                    {user.role === 'admin' && (
                        <button 
                            onClick={() => setView('manageUsers')}
                            className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all active:scale-95"
                        >
                            <Icons.Users size={18}/> Gerenciar Usuários
                        </button>
                    )}

                    <button onClick={handleLogoutClick} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-xl border border-red-500/30 flex items-center gap-2 font-bold transition-all active:scale-95">
                        <Icons.LogOut size={18}/> Sair
                    </button>
                </div>
            </div>
            
            {/* Seção Newsletter */}
            <div className={`${theme.card} p-5 ${theme.radius} border ${theme.border} stagger-in d-2 premium-card`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Icons.Bell className="text-amber-400"/> Novidades do Sistema</h3>
                    <button onClick={() => setShowNewsHistory(!showNewsHistory)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                        {showNewsHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
                    </button>
                </div>

                {/* Área de Criação (Apenas Breno) */}
                {user.username === 'Breno' && (
                    <div className="bg-black/20 p-4 rounded-xl border border-white/10 mb-6">
                        <h4 className="text-sm font-bold text-amber-400 mb-3 uppercase tracking-wider">Publicar Atualização</h4>
                        <div className="space-y-3">
                            <Input theme={theme} placeholder="Título da Novidade" value={newsTitle} onChange={(e:any)=>setNewsTitle(e.target.value)} />
                            <textarea 
                                className="w-full h-24 bg-black/10 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-white/30 resize-none text-sm"
                                placeholder="Descreva as mudanças..."
                                value={newsContent}
                                onChange={(e)=>setNewsContent(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button theme={theme} onClick={handlePostNews} size="sm" icon={Icons.Send}>Publicar</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de Novidades */}
                {showNewsHistory && (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {data.newsletter && data.newsletter.length > 0 ? (
                            data.newsletter.sort((a:any,b:any) => b.timestamp - a.timestamp).map((news:any) => (
                                <div key={news.id} className="bg-white/5 p-4 rounded-xl border border-white/5 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-base text-amber-200">{news.title}</h4>
                                        <span className="text-[10px] opacity-50 bg-black/30 px-2 py-1 rounded">{news.date}</span>
                                    </div>
                                    <p className="text-sm opacity-80 whitespace-pre-wrap">{news.content}</p>
                                    {user.username === 'Breno' && (
                                        <button onClick={()=>del('newsletter', news.id)} className="absolute bottom-2 right-2 text-red-400 opacity-20 hover:opacity-100 p-1"><Icons.Trash size={14}/></button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center opacity-30 text-sm py-4">Nenhuma novidade registrada.</div>
                        )}
                    </div>
                )}
            </div>

            <div className={`${theme.card} p-5 ${theme.radius} border ${theme.border} stagger-in d-2 premium-card flex justify-between items-center`}>
                <div>
                    <h3 className="font-bold text-lg">🎓 Tutorial</h3>
                    <p className="text-xs opacity-50">Reveja o tour guiado do sistema</p>
                </div>
                <button onClick={() => { localStorage.removeItem(`tour_seen_${user.username}`); restartTour(); }} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold text-sm">Iniciar Tour</button>
            </div>

            <div className={`${theme.card} p-5 ${theme.radius} border ${theme.border} stagger-in d-2 premium-card`}>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Icons.Stars/> Configuração IA (Gemini)</h3>
                <div className="flex gap-2">
                    <input 
                        type="password" 
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/50" 
                        placeholder="Cole sua API Key aqui..." 
                        value={geminiKey} 
                        onChange={(e:any)=>setGeminiKey(e.target.value)} 
                    />
                    <button onClick={()=>saveApiKey(geminiKey)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Salvar</button>
                </div>
                <p className="text-xs opacity-50 mt-2">Necessário para usar o Cadastro Mágico.</p>
            </div>

            {user.username === 'Breno' && (
                <div className={`${theme.card} p-5 ${theme.radius} border ${theme.border} stagger-in d-3 premium-card`}>
                    <h3 className="font-bold text-lg mb-4 text-red-400 flex items-center gap-2"><Icons.Shield/> Segurança e Bloqueios</h3>
                    <div className="flex flex-col md:flex-row gap-2 mb-4"><input className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm flex-1" placeholder="IP para bloquear" value={ipToBlock} onChange={(e:any)=>setIpToBlock(e.target.value)} /><button onClick={blockIp} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Bloquear</button></div>
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-6">{data.blocked_ips && data.blocked_ips.map((item:any) => (<div key={item.id} className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg flex justify-between items-center"><div><div className="text-sm font-bold font-mono">{item.ip}</div></div><button onClick={()=>del('blocked_ips', item.id)} className="text-red-400 hover:text-red-300 p-2"><Icons.Trash size={16}/></button></div>))}</div>
                    <h4 className="font-bold text-sm mb-3 border-t border-white/10 pt-3">Histórico de Acessos</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {ipHistory.map((log:any) => { 
                            const safeIp = (log.ip||'').replace(/\./g, '_'); 
                            const currentLabel = ipLabels[safeIp] || ''; 
                            
                            // Lógica de Exibição de Localização
                            let locationStr = '';
                            if (log.location?.exact_address) {
                                // Se tiver endereço exato via GPS (Geocodificação Reversa)
                                const addr = log.location.exact_address;
                                const bairro = addr.suburb || addr.neighbourhood || addr.city_district || '';
                                const cidade = addr.city || addr.town || addr.village || '';
                                const estado = addr.state_code || addr.state || '';
                                locationStr = `${bairro ? bairro + ', ' : ''}${cidade} - ${estado}`;
                            } else if (log.location) {
                                // Fallback para IP Info
                                locationStr = `${log.location.city || ''} - ${log.location.region || ''} (${log.location.isp || ''})`;
                            }

                            return (
                                <div key={log.id} className="bg-white/5 p-2 rounded-lg text-xs flex flex-col gap-1 border border-white/5">
                                    <div className="flex justify-between opacity-60">
                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                        <span>{log.username}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono bg-black/30 px-1.5 rounded">{log.ip}</span>
                                        {locationStr && <span className="text-indigo-300 truncate max-w-[150px]">{locationStr}</span>}
                                        <input 
                                            className="bg-transparent border-b border-white/10 focus:border-white/50 outline-none flex-1 text-yellow-400 min-w-[50px]" 
                                            placeholder="Nota..." 
                                            defaultValue={currentLabel} 
                                            onBlur={(e) => saveIpLabel(log.ip, e.target.value)} 
                                        />
                                    </div>
                                </div>
                            ); 
                        })}
                    </div>
                </div>
            )}
            <div className={`${theme.card} p-5 ${theme.radius} border ${theme.border} stagger-in d-4 premium-card`}><h3 className="font-bold text-lg mb-4">🎨 Temas</h3><div className="grid grid-cols-2 gap-3">{Object.keys(THEMES).map(k=>(<button key={k} onClick={()=>changeTheme(k)} className={`p-4 ${theme.radius} border flex items-center gap-2 ${themeKey===k ? theme.primary : 'border-transparent bg-black/10'}`}>{THEMES[k].name}</button>))}</div></div>
        </div>
    );
}
