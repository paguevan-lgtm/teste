
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
    Calculator: (p:any) => <Icon {...p}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></Icon>,
    Image: (p:any) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></Icon>,
    Fingerprint: (p:any) => <Icon {...p}><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 6" /><path d="M5 15.73A6 6 0 0 1 5 12a7 7 0 0 1 14 0 6 6 0 0 1-1.35 3.73" /><path d="M8.2 18.2A3 3 0 0 1 8 16.5c0-1.66 1.34-3 3-3 .2 0 .39.02.58.05" /><path d="M16.5 12.5a4.5 4.5 0 0 0-9 0 3 3 0 0 0 3 3" /><path d="M12 21v-1" /></Icon>,
    Laptop: (p:any) => <Icon {...p}><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="2" y1="20" x2="22" y2="20" /></Icon>,
    Smartphone: (p:any) => <Icon {...p}><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></Icon>
};

export const Button = ({ onClick, children, theme, variant='primary', icon:IconComp, disabled, className='', size='md', id='' }: any) => {
    let baseClass = `${theme?.radius || 'rounded-xl'} font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-sm `;
    
    if (size === 'sm') baseClass += 'px-3 py-1.5 text-xs ';
    else if (size === 'lg') baseClass += 'px-6 py-3 text-lg ';
    else baseClass += 'px-4 py-2 text-sm ';

    if (disabled) baseClass += 'opacity-50 cursor-not-allowed ';
    else baseClass += 'hover:opacity-90 ';

    if (variant === 'primary') baseClass += theme ? theme.primary : 'bg-blue-600 text-white';
    else if (variant === 'secondary') baseClass += 'bg-white/10 hover:bg-white/20 text-white';
    else if (variant === 'success') baseClass += 'bg-green-600 text-white hover:bg-green-500';
    else if (variant === 'danger') baseClass += 'bg-red-500/20 text-red-400 hover:bg-red-500/30';
    else if (variant === 'default') baseClass += 'bg-black/20 text-white hover:bg-black/30 border border-white/10';

    return (
        <button id={id} className={`${baseClass} ${className}`} onClick={onClick} disabled={disabled}>
            {IconComp && <IconComp size={size === 'sm' ? 14 : (size === 'lg' ? 24 : 18)} />}
            {children}
        </button>
    );
};

export const IconButton = ({ onClick, icon:IconComp, theme, variant='default', className='', title, disabled, size=20 }: any) => {
    let baseClass = `p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center `;
    if (variant === 'danger') baseClass += 'bg-red-500/10 text-red-400 hover:bg-red-500/20';
    else if (variant === 'success') baseClass += 'bg-green-500/10 text-green-400 hover:bg-green-500/20';
    else if (variant === 'primary') baseClass += 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20';
    else baseClass += 'bg-white/5 hover:bg-white/10 text-white';

    if (disabled) baseClass += ' opacity-50 cursor-not-allowed';

    return (
        <button className={`${baseClass} ${className}`} onClick={onClick} title={title} disabled={disabled}>
            <IconComp size={size} />
        </button>
    );
};

export const Input = ({ label, value, onChange, type='text', placeholder, theme, themeKey, autoFocus, onFocus, onBlur, autoCapitalize }: any) => {
    // If theme not provided but themeKey is, get from THEMES
    const t = theme || (themeKey ? THEMES[themeKey] : THEMES.default);
    
    return (
        <div className="flex flex-col gap-1.5">
            {label && <label className="text-xs font-bold opacity-60 ml-1">{label}</label>}
            <input 
                type={type} 
                className={`${t.inner || 'bg-black/20'} ${t.border} ${t.radius || 'rounded-xl'} px-4 py-3 text-sm outline-none focus:border-current transition-colors w-full`}
                value={value} 
                onChange={onChange} 
                placeholder={placeholder}
                autoFocus={autoFocus}
                onFocus={onFocus}
                onBlur={onBlur}
                autoCapitalize={autoCapitalize}
            />
        </div>
    );
};

export const ClockWidget = ({ theme }: any) => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const int = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(int);
    }, []);
    return (
        <div className={`${theme.card} p-4 rounded-2xl border ${theme.border} flex flex-col justify-center items-center h-full`}>
            <div className="text-3xl font-black tabular-nums tracking-tighter">
                {time.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
            </div>
            <div className="text-xs opacity-50 uppercase font-bold tracking-widest">
                {time.toLocaleDateString('pt-BR', {weekday: 'long', day: '2-digit', month: 'short'})}
            </div>
        </div>
    );
};

export const WeatherWidget = ({ theme }: any) => {
    // Mock weather for now, or simple logic
    return (
        <div className={`${theme.card} p-4 rounded-2xl border ${theme.border} flex flex-col justify-center items-center h-full relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-3xl mb-1"><Icons.CloudRain size={32} className="text-blue-400"/></div>
            <div className="text-xs font-bold opacity-70">Praia Grande</div>
            <div className="text-[10px] opacity-40">28°C • Chuvoso</div>
        </div>
    );
};

export const Toast = ({ message, type, visible }: any) => {
    if (!visible) return null;
    let bg = 'bg-slate-800';
    if (type === 'success') bg = 'bg-green-600';
    if (type === 'error') bg = 'bg-red-600';
    if (type === 'info') bg = 'bg-blue-600';

    return (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-white font-bold text-sm animate-bounce-in ${bg}`}>
            {type === 'success' && <Icons.CheckCircle size={18}/>}
            {type === 'error' && <Icons.X size={18}/>}
            {type === 'info' && <Icons.Bell size={18}/>}
            {message}
        </div>
    );
};

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type='danger', theme }: any) => {
    if (!isOpen) return null;
    const t = theme || THEMES.default;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`${t.card} w-full max-w-sm p-6 rounded-2xl border ${t.border} shadow-2xl transform scale-100 transition-all`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {type === 'danger' ? <Icons.Trash size={24}/> : <Icons.Bell size={24}/>}
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-sm opacity-70 mb-6 leading-relaxed">{message}</p>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-sm transition-colors">Cancelar</button>
                    <button onClick={onConfirm} className={`px-4 py-2 rounded-xl font-bold text-sm text-white shadow-lg transition-transform active:scale-95 ${type === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export const CommandPalette = ({ isOpen, onClose, theme, actions }: any) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<any>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) setTimeout(() => inputRef.current.focus(), 100);
    }, [isOpen]);

    if (!isOpen) return null;
    
    const filtered = actions.filter((a:any) => a.label.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
            <div className={`${theme.card} w-full max-w-lg rounded-xl border ${theme.border} shadow-2xl overflow-hidden flex flex-col max-h-[60vh]`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <Icons.Search className="opacity-50"/>
                    <input 
                        ref={inputRef}
                        className="bg-transparent outline-none w-full text-lg placeholder-white/30"
                        placeholder="O que você precisa?"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className="text-[10px] font-bold border border-white/10 rounded px-1.5 py-0.5 opacity-50">ESC</div>
                </div>
                <div className="overflow-y-auto p-2">
                    {filtered.map((action:any, i:number) => (
                        <button 
                            key={i} 
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/10 group transition-colors"
                            onClick={() => { action.action(); onClose(); }}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-md bg-${action.color || 'gray-500'}/20 text-${action.color || 'gray-400'}`}>
                                    {action.icon}
                                </div>
                                <span className="font-medium">{action.label}</span>
                            </div>
                            {action.shortcut && <span className="text-xs font-mono opacity-40 border border-white/10 px-1 rounded">{action.shortcut}</span>}
                        </button>
                    ))}
                    {filtered.length === 0 && <div className="p-4 text-center opacity-40 text-sm">Nada encontrado.</div>}
                </div>
            </div>
        </div>
    );
};

export const QuickCalculator = ({ isOpen, onClose, theme }: any) => {
    const [expr, setExpr] = useState('');
    
    if (!isOpen) return null;

    const handleBtn = (v: string) => {
        if (v === 'C') setExpr('');
        else if (v === '=') {
            try {
                // eslint-disable-next-line no-eval
                setExpr(eval(expr).toString());
            } catch {
                setExpr('Erro');
            }
        } else {
            setExpr(prev => prev + v);
        }
    };

    const btns = ['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className={`${theme.card} w-72 p-4 rounded-2xl border ${theme.border} shadow-2xl`} onClick={e => e.stopPropagation()}>
                <div className="bg-black/40 rounded-xl p-4 mb-4 text-right text-2xl font-mono overflow-x-auto whitespace-nowrap">
                    {expr || '0'}
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {btns.map(b => (
                        <button 
                            key={b} 
                            onClick={() => handleBtn(b)}
                            className={`p-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors ${b === '=' ? 'bg-amber-600 text-white col-span-1' : 'bg-white/5'}`}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
