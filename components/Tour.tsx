
import React, { useState, useEffect } from 'react';
import { Icons } from './Shared';

export const TourGuide = ({ steps, currentStep, onNext, onPrev, onClose, theme }: any) => {
    const [targetRect, setTargetRect] = useState<any>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [arrowPos, setArrowPos] = useState<any>({});
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        const step = steps[currentStep];
        if (!step) return;
        
        setIsVisible(false);

        // Se não tem alvo específico, centraliza na tela
        if (!step.target) {
            setTargetRect(null);
            // Centraliza visualmente
            setPosition({ top: window.innerHeight / 2 - 150, left: window.innerWidth / 2 - 160 });
            setArrowPos(null);
            setIsVisible(true);
            return;
        }

        const findTarget = (retryCount = 0) => {
            const targets = document.querySelectorAll(step.target);
            let target = null;
            const isMobile = window.innerWidth < 768;

            for (let t of targets) {
                const r = t.getBoundingClientRect();
                // Verifica se está visível e dentro da viewport (ou quase)
                if (r.width > 0 && r.height > 0) {
                    target = t;
                    break;
                }
            }

            if (target) {
                const rect = target.getBoundingClientRect();
                
                // --- CÁLCULO FIXED (Não depende do scrollY) ---
                // rect.top e rect.left já são relativos à viewport, perfeito para position: fixed

                setTargetRect({
                    top: rect.top - 5,
                    left: rect.left - 5,
                    width: rect.width + 10,
                    height: rect.height + 10
                });

                let tooltipTop = rect.bottom + 20;
                let tooltipLeft = rect.left + (rect.width / 2) - 160; 
                let arrow: any = { top: -8, left: '50%', transform: 'translateX(-50%) rotate(45deg)' };

                // --- AJUSTES DE POSIÇÃO (Placement) ---
                if (step.placement === 'top') {
                    if (isMobile) {
                        const tooltipHeight = 220; 
                        tooltipTop = (window.innerHeight / 2) - (tooltipHeight / 2) - 40; 
                        tooltipLeft = (window.innerWidth / 2) - 160;
                        arrow = { bottom: -8, left: '50%', transform: 'translateX(-50%) rotate(225deg)' }; 
                    } else {
                        tooltipTop = rect.top - 240;
                        tooltipLeft = rect.left + (rect.width / 2) - 160;
                        arrow = { bottom: -8, left: '50%', transform: 'translateX(-50%) rotate(225deg)' }; 
                    }
                } else if (step.placement === 'right' && !isMobile) {
                    tooltipTop = rect.top; 
                    tooltipLeft = rect.right + 20; 
                    arrow = { left: -8, top: 20, transform: 'rotate(-45deg)' }; 
                } else if (step.placement === 'bottom') {
                        tooltipTop = rect.bottom + 20;
                        tooltipLeft = rect.left + (rect.width / 2) - 160;
                        arrow = { top: -8, left: '50%', transform: 'translateX(-50%) rotate(45deg)' };
                } else {
                    // Auto-ajuste para bordas
                    if (rect.height > window.innerHeight * 0.7 && rect.left < window.innerWidth / 2) {
                        if (isMobile) {
                            tooltipTop = 150; 
                            tooltipLeft = window.innerWidth / 2 - 160;
                            arrow = null; 
                        } else {
                            tooltipTop = rect.top + 100;
                            tooltipLeft = rect.right + 20;
                            arrow = { left: -8, top: 20, transform: 'rotate(-45deg)' };
                        }
                    }
                    else if (tooltipTop + 250 > window.innerHeight) {
                        tooltipTop = rect.top - 240; 
                        arrow = { bottom: -8, left: '50%', transform: 'translateX(-50%) rotate(225deg)' }; 
                    }
                }

                // AJUSTES FINAIS DE BORDA
                const tooltipWidth = Math.min(320, window.innerWidth * 0.9);
                if (tooltipLeft < 10) tooltipLeft = 10;
                if (tooltipLeft + tooltipWidth > window.innerWidth) {
                    tooltipLeft = window.innerWidth - tooltipWidth - 10;
                }

                // Ajuste visual da seta
                if (arrow && arrow.left === '50%') {
                    let targetCenterRelative = (rect.left + rect.width/2) - tooltipLeft;
                    targetCenterRelative = Math.max(20, Math.min(tooltipWidth - 20, targetCenterRelative));
                    arrow.left = targetCenterRelative + 'px';
                    arrow.transform = arrow.transform.replace('translateX(-50%)', 'translateX(0)');
                }

                setPosition({ top: tooltipTop, left: tooltipLeft });
                setArrowPos(arrow);
                setIsVisible(true);
                
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } else {
                if (retryCount < 20) { 
                    setTimeout(() => findTarget(retryCount + 1), 100);
                } else {
                    setTargetRect(null);
                    setPosition({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 160 });
                    setArrowPos(null);
                    setIsVisible(true);
                }
            }
        };

        setTimeout(() => findTarget(), 150);
        
        window.addEventListener('resize', () => findTarget());
        return () => window.removeEventListener('resize', () => findTarget());
    }, [currentStep, steps]);

    const step = steps[currentStep];
    if (!step) return null;

    return (
        <div style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s' }}>
            {/* 
                Overlay com "buraco" (Hole) para efeito de blur no fundo e nitidez no alvo.
                Feito com 4 divs fixas ao redor do targetRect para evitar cálculos complexos de path.
            */}
            {targetRect && (
                <>
                    {/* Top Overlay */}
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: targetRect.top, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000 }} />
                    {/* Bottom Overlay */}
                    <div style={{ position: 'fixed', top: targetRect.top + targetRect.height, left: 0, right: 0, bottom: 0, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000 }} />
                    {/* Left Overlay */}
                    <div style={{ position: 'fixed', top: targetRect.top, left: 0, width: targetRect.left, height: targetRect.height, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000 }} />
                    {/* Right Overlay */}
                    <div style={{ position: 'fixed', top: targetRect.top, left: targetRect.left + targetRect.width, right: 0, height: targetRect.height, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000 }} />
                    
                    {/* Borda Dourada ao redor do item nítido */}
                    <div 
                        className="tour-spotlight-border"
                        style={{
                            position: 'fixed',
                            top: targetRect.top,
                            left: targetRect.left,
                            width: targetRect.width,
                            height: targetRect.height,
                            borderRadius: '12px',
                            border: '2px solid #f59e0b',
                            boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)',
                            pointerEvents: 'none',
                            zIndex: 10001
                        }}
                    />
                </>
            )}

            <div 
                className={`tour-tooltip ${theme.card} p-6 rounded-2xl border ${theme.border} shadow-2xl flex flex-col gap-4`}
                style={{ top: position.top, left: position.left }}
            >
                {targetRect && arrowPos && <div className={`tour-arrow border-l border-t ${theme.border}`} style={arrowPos}></div>}
                
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-amber-400">{step.title}</h3>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onClose) onClose();
                        }} 
                        className="p-2 -mr-2 -mt-2 opacity-60 hover:opacity-100 text-white hover:text-red-400 hover:bg-white/10 rounded-full transition-all cursor-pointer"
                        title="Fechar Tour"
                    >
                        <Icons.X size={20}/>
                    </button>
                </div>
                
                <p className="text-sm leading-relaxed opacity-90">{step.content}</p>
                
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/10">
                    <div className="text-xs font-bold opacity-50 uppercase tracking-widest">
                        Passo {currentStep + 1} de {steps.length}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={onPrev} 
                            disabled={currentStep === 0}
                            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors"
                        >
                            <Icons.ChevronLeft size={20}/>
                        </button>
                        <button 
                            onClick={currentStep === steps.length - 1 ? onClose : onNext} 
                            className={`${theme.primary} px-4 py-2 rounded-lg text-sm font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2`}
                        >
                            {currentStep === steps.length - 1 ? 'Concluir 🚀' : 'Próximo'} <Icons.ChevronRight size={16}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
