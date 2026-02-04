
import React from 'react';
import { Icons } from './Shared';
import { getAvatarUrl } from '../utils';

export const Sidebar = ({ 
    theme, 
    view, 
    setView, 
    menuOpen, 
    setMenuOpen, 
    user, 
    orderedMenuItems, 
    handleMenuDragStart, 
    handleMenuDragOver, 
    handleMenuDrop, 
    draggedMenuIndex 
}: any) => {

    const renderMenuContent = (isMobile: boolean) => (
        <>
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white">
                        <Icons.Van size={24}/>
                    </div>
                    <h1 className="text-xl font-bold">Bora de Van</h1>
                </div>
                {isMobile && <button onClick={() => setMenuOpen(false)}><Icons.X /></button>}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                {orderedMenuItems.map((item:any, index:number) => (
                    <div 
                        key={item.id} 
                        draggable 
                        onDragStart={(e) => handleMenuDragStart(e, index)} 
                        onDragOver={handleMenuDragOver} 
                        onDrop={(e) => handleMenuDrop(e, index)} 
                        className={`transition-all duration-200 ${draggedMenuIndex === index ? 'opacity-50 scale-95 bg-white/5 rounded-xl' : ''}`}
                    >
                        <button 
                            id={`menu-btn-${item.id}${isMobile ? '-mobile' : ''}`} 
                            onClick={() => { setView(item.id); if(isMobile) setMenuOpen(false); }} 
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${view === item.id ? `${theme.primary} shadow-lg` : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
                        >
                            <item.i size={20}/>
                            <span className="flex-1 text-left">{item.l}</span>
                            <div className="opacity-0 group-hover:opacity-50 cursor-grab active:cursor-grabbing">
                                <Icons.GripVertical size={14}/>
                            </div>
                        </button>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-white/5 mt-auto">
                <button onClick={() => { setView('settings'); if(isMobile) setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                        <img src={getAvatarUrl(user?.username || 'User')} alt="User" />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-sm font-bold">{user?.username}</div>
                        <div className="text-[10px] opacity-70">{user?.role}</div>
                    </div>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div id="sidebar-nav" className={`hidden md:flex w-64 ${theme.card} border-r ${theme.border} flex-col flex-shrink-0 z-20`}>
                {renderMenuContent(false)}
            </div>

            {/* Mobile Sidebar Overlay */}
            <div 
                className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
                onClick={() => setMenuOpen(false)}
            >
                <div 
                    id="mobile-sidebar" 
                    className={`absolute top-0 bottom-0 left-0 w-64 ${theme.card} border-r ${theme.border} transform transition-transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl`} 
                    onClick={e => e.stopPropagation()}
                >
                    {renderMenuContent(true)}
                </div>
            </div>
        </>
    );
};
