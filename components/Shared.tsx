
import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../types';
import { THEMES, COLORS } from '../constants';

export const Icon = ({ children, size=20, className="" }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);

export const Icons = {
    Menu: (p:any) => <Icon {...p}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></Icon>,
    Home: (p:any) => <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></Icon>,
    Users: (p:any) => <Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>,
    Car: (p:any) => <Icon {...p}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9"/><path d="M2 12h17a1 1 0 0 0 .9-1.5l-2.4-3.2"/><path d="M2 12v6"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></Icon>,
    Van: (p:any) => <Icon {...p}><rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><line x1="16" y1="8" x2="20" y2="8"/><path d="M16 8h4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-6"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></Icon>,
    Map: (p:any) => <Icon {...p}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></Icon>,
    Calendar: (p:any) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Icon>,
    Settings: (p:any) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>,
    Plus: (p:any) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>,
    X: (p:any) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>,
    Trash: (p:any) => <Icon {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></Icon>,
    Copy: (p:any) => <Icon {...p}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></Icon>,
    Phone: (p:any) => <Icon {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></Icon>,
    Edit: (p:any) => <Icon {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Icon>,
    Refresh: (p:any) => <Icon {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></Icon>,
    Check: (p:any) => <Icon {...p}><polyline points="20 6 9 17 4 12"/></Icon>,
    Back: (p:any) => <Icon {...p}><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></Icon>,
    Send: (p:any) => <Icon {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Icon>,
    Zap: (p:any) => <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>,
    Download: (p:any) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></Icon>,
    Mic: (p:any) => <Icon {...p}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></Icon>,
    Stop: (p:any) => <Icon {...p}><rect x="9" y="9" width="6" height="6"/></Icon>,
    Stars: (p:any) => <Icon {...p}><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></Icon>,
    ChevronLeft: (p:any) => <Icon {...p}><polyline points="15 18 9 12 15 6" /></Icon>,
    ChevronRight: (p:any) => <Icon {...p}><polyline points="9 18 15 12 9 6" /></Icon>,
    ChevronDown: (p:any) => <Icon {...p}><polyline points="6 9 12 15 18 9" /></Icon>,
    ChevronUp: (p:any) => <Icon {...p}><polyline points="18 15 12 9 6 15" /></Icon>,
    Search: (p:any) => <Icon {...p}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></Icon>,
    Dollar: (p:any) => <Icon {...p}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></Icon>,
    Clipboard: (p:any) => <Icon {...p}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></Icon>,
    Box: (p:any) => <Icon {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></Icon>,
    Repeat: (p:any) => <Icon {...p}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></Icon>,
    Lock: (p:any) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></Icon>,
    LogOut: (p:any) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></Icon>,
    Shield: (p:any) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>,
    List: (p:any) => <Icon {...p}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></Icon>,
    CheckCircle: (p:any) => <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></Icon>,
    Edit3: (p:any) => <Icon {...p}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></Icon>,
    ArrowUp: (p:any) => <Icon {...p}><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></Icon>,
    ArrowDown: (p:any) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></Icon>,
    Moon: (p:any) => <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></Icon>,
    Sun: (p:any) => <Icon {...p}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></Icon>,
    CalendarX: (p:any) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="10" y1="14" x2="14" y2="18"/><line x1="14" y1="14" x2="10" y2="18"/></Icon>,
    Message: (p:any) => <Icon {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></Icon>,
    Clock: (p:any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>,
    Print: (p:any) => <Icon {...p}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></Icon>,
    Slash: (p:any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></Icon>,
    Bell: (p:any) => <Icon {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></Icon>,
    GripVertical: (p:any) => <Icon {...p}><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></Icon>,
    Command: (p:any) => <Icon {...p}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></Icon>,
    CloudRain: (p:any) => <Icon {...p}><line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></Icon>,
    Calculator: (p:any) => <Icon {...p}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></Icon>
};

export const Button = ({ onClick, children, theme, variant='primary', icon:I, disabled, className='', size='md', id='' }: any) => {
    const t = theme || THEMES.default;
    const sz: any = { sm:'px-3 py-2 text-sm', md:'px-4 py-3.5 text-base' };
    const v: any = {
        primary: `${t.primary} shadow-md premium-click`,
        secondary: `${t.card} ${t.text} premium-click border ${t.border}`,
        danger: `bg-rose-500/10 text-rose-500 border border-rose-500/20 active:bg-rose-500/20 premium-click`,
        success: `bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 active:bg-emerald-500/20 premium-click`,
        ai: `bg-ai text-white shadow-lg premium-click border-none`
    };
    return <button id={id} onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 ${t.radius} font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${v[variant]} ${sz[size]} ${className}`}>{I && <I size={size==='sm'?16:20} />} {children}</button>;
};

export const IconButton = ({ onClick, icon:I, variant='default', theme, disabled }: any) => {
     const t = theme || THEMES.default;
     const v: any = {
         default: `${t.card} ${t.text} hover:opacity-80 border ${t.border}`,
         danger: `bg-rose-500/10 text-rose-500 border border-rose-500/20`,
         success: `bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`
     }
     return <button onClick={onClick} disabled={disabled} className={`w-12 h-12 flex-shrink-0 flex items-center justify-center ${t.radius} transition-all active:scale-95 disabled:opacity-50 ${v[variant]}`}><I size={22}/></button>
}

export const Input = ({ label, theme, ...props }: any) => {
    const t = theme || THEMES.default;
    return (
        <div className="flex flex-col gap-1 w-full">
            <label className={`text-xs font-bold uppercase tracking-wider opacity-60 ml-1`}>{label}</label>
            <input className={`bg-black/10 border border-white/10 ${t.text} ${t.radius} px-4 py-3.5 outline-none focus:border-current transition-colors w-full`} {...props} />
        </div>
    );
};

export const Toast = ({ message, type = 'success', visible }: any) => {
    if (!visible) return null;
    const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };
    const icons = { success: <Icons.Check size={20}/>, error: <Icons.X size={20}/>, info: <Icons.Bell size={20}/> };
    // @ts-ignore
    const color = colors[type] || colors.info;
    
    return (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${color} text-white animate-bounce-in min-w-[300px]`}>
            {/* @ts-ignore */}
            {icons[type]}
            <span className="font-bold">{message}</span>
        </div>
    );
};

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger', theme }: any) => {
    if (!isOpen) return null;
    const t = theme || THEMES.default;
    
    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`${t.card} w-full max-w-sm p-6 rounded-2xl border ${t.border} shadow-2xl transform transition-all scale-100 relative z-[99999]`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {type === 'danger' ? <Icons.Trash size={24} /> : <Icons.Bell size={24} />}
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-sm opacity-70 mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold text-sm transition-colors">Cancelar</button>
                    <button onClick={onConfirm} className={`flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg active:scale-95 transition-all ${type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};

// --- PREMIUM WIDGETS ---

export const ClockWidget = ({ theme }: any) => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className={`${theme.card} rounded-xl p-4 border ${theme.border} flex items-center justify-between`}>
            <div>
                <div className="text-2xl font-black tracking-tight font-mono">{time.toLocaleTimeString()}</div>
                <div className="text-xs opacity-60 uppercase font-bold tracking-widest">{time.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            </div>
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center animate-pulse text-amber-400">
                <Icons.Clock size={20}/>
            </div>
        </div>
    );
};

export const WeatherWidget = ({ theme }: any) => {
    const [temp, setTemp] = useState<number|null>(null);
    const [code, setCode] = useState<number|null>(null); // WMO code

    useEffect(() => {
        if ("navigator" in window) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                // Using Open-Meteo (Free, No Key needed)
                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.current) {
                            setTemp(Math.round(data.current.temperature_2m));
                            setCode(data.current.weather_code);
                        }
                    })
                    .catch(err => console.error("Weather err", err));
            }, () => console.log("Geo denied"));
        }
    }, []);

    // Simple WMO code mapper
    const getWeatherInfo = (c: number) => {
        if (c === 0) return { icon: <Icons.Sun size={24} className="text-yellow-400"/>, label: 'Ensolarado' };
        if (c >= 1 && c <= 3) return { icon: <Icons.CloudRain size={24} className="text-gray-300"/>, label: 'Nublado' };
        if (c >= 51) return { icon: <Icons.CloudRain size={24} className="text-blue-400"/>, label: 'Chuvoso' };
        return { icon: <Icons.Sun size={24} className="text-orange-400"/>, label: 'Clima' };
    };

    const info = code !== null ? getWeatherInfo(code) : { icon: <Icons.Sun size={24} className="text-white/20"/>, label: '--' };

    return (
        <div className={`${theme.card} rounded-xl p-4 border ${theme.border} flex items-center justify-between`}>
            <div>
                <div className="text-2xl font-black tracking-tight">{temp !== null ? `${temp}°C` : '--'}</div>
                <div className="text-xs opacity-60 uppercase font-bold tracking-widest">{info.label}</div>
            </div>
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                {info.icon}
            </div>
        </div>
    );
};

export const CommandPalette = ({ isOpen, onClose, theme, actions }: any) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<any>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) setTimeout(() => inputRef.current.focus(), 50);
        if (!isOpen) setQuery('');
    }, [isOpen]);

    const filtered = actions.filter((a:any) => a.label.toLowerCase().includes(query.toLowerCase()));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
            <div className={`${theme.card} w-full max-w-xl rounded-xl border ${theme.border} shadow-2xl overflow-hidden flex flex-col max-h-[60vh]`} onClick={e => e.stopPropagation()}>
                <div className="border-b border-white/10 p-4 flex items-center gap-3">
                    <Icons.Search className="opacity-50"/>
                    <input 
                        ref={inputRef}
                        className="bg-transparent outline-none flex-1 text-lg placeholder-white/30"
                        placeholder="O que você precisa?"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className="text-xs bg-white/10 px-2 py-1 rounded text-white/50">ESC</div>
                </div>
                <div className="overflow-y-auto p-2">
                    {filtered.length > 0 ? filtered.map((action:any, i:number) => (
                        <button 
                            key={i} 
                            onClick={() => { action.action(); onClose(); }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left group"
                        >
                            <div className={`p-2 rounded bg-white/5 group-hover:bg-white/10 text-${action.color || 'white'}`}>
                                {action.icon}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-sm">{action.label}</div>
                                {action.desc && <div className="text-xs opacity-50">{action.desc}</div>}
                            </div>
                            {action.shortcut && <span className="text-xs font-mono opacity-30">{action.shortcut}</span>}
                        </button>
                    )) : <div className="p-4 text-center opacity-40 text-sm">Nada encontrado.</div>}
                </div>
                <div className="p-2 border-t border-white/5 bg-black/20 text-[10px] opacity-40 text-center uppercase font-bold tracking-widest">
                    Bora de Van Command Center
                </div>
            </div>
        </div>
    );
};

export const QuickCalculator = ({ isOpen, onClose, theme }: any) => {
    const [display, setDisplay] = useState('');
    
    if (!isOpen) return null;

    const btnClass = `flex-1 h-12 rounded-lg font-bold text-lg hover:brightness-110 active:scale-95 transition-all`;
    const handle = (v: string) => {
        if (v === 'C') setDisplay('');
        else if (v === '=') {
            try { setDisplay(eval(display).toString()); } catch { setDisplay('Erro'); }
        } else setDisplay(display + v);
    };

    return (
        <div className="fixed bottom-20 right-4 md:right-8 z-[9000] animate-bounce-in">
            <div className={`${theme.card} w-64 p-4 rounded-2xl border ${theme.border} shadow-2xl`}>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase opacity-50">Calc</span>
                    <button onClick={onClose}><Icons.X size={14} className="opacity-50 hover:opacity-100"/></button>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-right font-mono text-xl mb-3 overflow-hidden h-12 flex items-center justify-end">{display || '0'}</div>
                <div className="grid grid-cols-4 gap-2">
                    {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(k => (
                        <button 
                            key={k} 
                            onClick={()=>handle(k)} 
                            className={`${btnClass} ${['/','*','-','+','='].includes(k) ? theme.primary : 'bg-white/10'}`}
                        >
                            {k}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
