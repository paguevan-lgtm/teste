
import { INITIAL_SP_LIST, BAIRROS } from './constants';
import { GoogleGenAI } from "@google/genai";

export const getTodayDate = () => {
    const d = new Date();
    const local = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
    return local.toISOString().split('T')[0];
};

export const getOperationalDate = () => {
    const d = new Date();
    // Só vira o dia operacional às 03:00 da manhã
    if (d.getHours() < 3) {
        d.setDate(d.getDate() - 1);
    }
    const local = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
    return local.toISOString().split('T')[0];
};

export const getLousaDate = () => {
    const d = new Date();
    // Sincronizado com o Operacional para evitar desvios
    if (d.getHours() < 3) {
        d.setDate(d.getDate() - 1);
    }
    const local = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
    return local.toISOString().split('T')[0];
};

export const formatDisplayDate = (d: string) => {
    if(!d) return '';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
};

export const dateAddDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

export const formatTime = (t: string) => t; 

export const getBairroIdx = (b: string) => { 
    if (!b) return 99;
    const normB = b.toLowerCase().trim();
    const idx = BAIRROS.findIndex(item => item.toLowerCase().trim() === normB);
    return idx === -1 ? 99 : idx; 
};

export const getAvatarUrl = (name: string) => {
    if(name && name.toLowerCase() === 'breno') {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=Robert`; 
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
};

export const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const addMinutes = (time: string, mins: number) => {
    if(!time) return '';
    if (time.includes('/')) return time; // Se já tiver barra, retorna como está (ex: 05:00/05:45)
    
    const parts = time.split(':');
    if (parts.length < 2) return time;

    const [h, m] = parts.map(Number);
    if (isNaN(h) || isNaN(m)) return time;

    const date = new Date();
    date.setHours(h);
    date.setMinutes(m + mins);
    // FORÇAR 24 HORAS
    return date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', hour12: false});
}

export const calculateTimeSlot = (t: string) => { 
    if(!t) return '-'; 
    if (t.includes('/')) {
        return t; // Se já tiver formato composto, não duplica
    }
    const endTime = addMinutes(t, 45);
    return `${t} - ${endTime}`; 
};

export const generateWhatsappMessage = (tripId: string, passengers: any[], driverName: string, time: string, date: string) => {
    if(!passengers?.length) return "";
    
    const [y, m, d] = date.split('-');
    const formattedDate = `${d}/${m}/${y}`;

    let msg = `*DADOS DA VIAGEM - ${formattedDate}*\n\n`;
    msg += `*Código:* ${tripId}\n`;
    msg += `*Horário:* ${time}\n`;
    msg += `*PASSAGEIRO(S):*\n\n`;

    // Ordena passageiros por bairro
    const sorted = passengers.sort((a,b)=>getBairroIdx(a.neighborhood)-getBairroIdx(b.neighborhood));

    sorted.forEach((p, index) => {
        let displayTime = p.time || time;
        // Evita duplicar se o horário já for composto (ex: Madrugada)
        if (!displayTime.includes('/')) {
            const endTime = addMinutes(displayTime, 45);
            displayTime = `${displayTime}/${endTime}`;
        }

        msg += `*Passageiro ${index + 1}:*\n`;
        msg += `• Nome: ${p.name}\n`;
        msg += `• Telefone: ${p.phone || 'Sem número'}\n`;
        if (p.address) msg += `• Endereço: ${p.address}\n`;
        if (p.reference) msg += `• Referência: ${p.reference}\n`;
        msg += `• Bairro: ${p.neighborhood || ''}\n`;
        msg += `• Qtd: ${p.passengerCount || 1} passageiro(s)\n`;
        msg += `• Horário: ${displayTime}\n`;
        msg += `• Bagagens: ${p.luggageCount || 0} bagagens\n\n`;
    });

    msg += `_Enviado via Bora de Van Transportes_`;
    return msg;
};

export const sendPaxWhatsapp = (p: any) => {
    if(!p.phone) return false;
    const msg = encodeURIComponent(`Olá ${p.name}, sobre seu agendamento para ${formatDisplayDate(p.date)} às ${p.time}...`);
    window.open(`https://wa.me/55${p.phone.replace(/\D/g,'')}?text=${msg}`, '_blank');
    return true;
};

export const generateTripListText = (passengers: any[], driverName: string, time: string) => {
    const sorted = passengers.sort((a,b)=>getBairroIdx(a.neighborhood)-getBairroIdx(b.neighborhood));
    return `VIAGEM ${time} - ${driverName}\n\n` + sorted.map(p=> `• ${p.name} - ${p.neighborhood}\n  ${p.address} (${p.reference || ''})`).join('\n\n');
};

export const callGemini = async (prompt: string, apiKey: string) => {
    if (!apiKey) throw new Error("Chave API Gemini não configurada!");
    
    // Fix: Using GoogleGenAI SDK instead of direct fetch
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
    });
    
    return response.text || "";
};

export const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                // Compress to JPEG with 0.7 quality
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

/* --- PRINT FUNCTION FIXED --- */
export const handlePrint = async (targetId: string, filename: string, title: string, options: any = {}) => {
    const element = document.getElementById(targetId);
    if (!element) throw new Error("Elemento não encontrado para impressão.");

    let wrapper = null;

    try {
        let clone: HTMLElement | null = null;
        
        const itemCount = element.children.length;
        let columns = 1;

        if (options.forceCols) {
            columns = options.forceCols;
        } else if (options.mode === 'confirmados') {
            columns = itemCount > 12 ? 2 : 1;
        } else if (options.mode === 'lousa') {
            columns = Math.ceil(itemCount / 12);
            if (columns < 1) columns = 1;
        }

        wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '0';
        wrapper.style.backgroundColor = '#1e293b';
        wrapper.style.color = 'white';
        wrapper.style.padding = '40px'; 
        wrapper.style.zIndex = '99999';
        
        let dateStr = new Date().toLocaleDateString('pt-BR');
        if (options.date) {
            const [y, m, d] = options.date.split('-');
            dateStr = `${d}/${m}/${y}`;
        }

        const titleEl = document.createElement('h1');
        titleEl.innerText = `${title} - ${dateStr}`;
        titleEl.style.textAlign = 'center';
        titleEl.style.marginBottom = '25px';
        titleEl.style.fontSize = '32px'; 
        titleEl.style.fontWeight = 'bold';
        titleEl.style.color = '#fbbf24'; 
        titleEl.style.width = '100%';
        wrapper.appendChild(titleEl);

        clone = element.cloneNode(true) as HTMLElement;
        
        const toHide = clone.querySelectorAll('.hide-on-print');
        toHide.forEach(el => el.remove());

        const toShow = clone.querySelectorAll('.show-on-print');
        toShow.forEach(el => {
            el.classList.remove('hidden');
            // @ts-ignore
            el.style.display = 'block';
        });

        const truncatedElements = clone.querySelectorAll('.truncate');
        truncatedElements.forEach(el => {
            el.classList.remove('truncate');
            // @ts-ignore
            el.style.overflow = 'visible';
            // @ts-ignore
            el.style.textOverflow = 'clip';
            // @ts-ignore
            el.style.whiteSpace = 'nowrap';
            // @ts-ignore
            el.style.maxWidth = 'none';
            // @ts-ignore
            el.style.width = 'auto';
        });

        const textElements = clone.querySelectorAll('.font-bold, .font-mono');
        textElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const fontSize = parseFloat(style.fontSize);
            if (fontSize) {
                // @ts-ignore
                el.style.fontSize = `${fontSize * 1.25}px`; 
            }
            // @ts-ignore
            el.style.lineHeight = '1.4';
            // @ts-ignore
            el.style.overflow = 'visible';
        });

        Array.from(clone.children).forEach((child: any) => {
            // @ts-ignore
            child.style.display = 'flex';
            // @ts-ignore
            child.style.alignItems = 'center'; 
            
            if (options.mode === 'madrugada') {
                // @ts-ignore
                child.style.justifyContent = 'flex-start';
                // @ts-ignore
                child.style.gap = '20px';
            } else {
                // @ts-ignore
                child.style.justifyContent = 'space-between';
            }

            // @ts-ignore
            child.style.padding = '10px 15px'; 
            // @ts-ignore
            child.style.height = 'auto';
            // @ts-ignore
            child.style.minHeight = '50px'; 
            // @ts-ignore
            child.style.overflow = 'visible'; 
            
            const innerFlexs = child.querySelectorAll('div.flex, .flex');
            innerFlexs.forEach((g: any) => {
                // @ts-ignore
                g.style.display = 'flex';
                // @ts-ignore
                g.style.alignItems = 'center'; 
                // @ts-ignore
                g.style.height = '100%';
                // @ts-ignore
                g.style.overflow = 'visible';
            });

            const vagaBox = child.querySelector('.font-mono.rounded') || child.querySelector('.font-mono.rounded-full');
            
            if (vagaBox) {
                // @ts-ignore
                vagaBox.style.padding = '0'; 
                // @ts-ignore
                vagaBox.style.display = 'flex';
                // @ts-ignore
                vagaBox.style.alignItems = 'center';
                // @ts-ignore
                vagaBox.style.justifyContent = 'center';
                
                // @ts-ignore
                vagaBox.style.height = '40px'; 
                // @ts-ignore
                vagaBox.style.width = '45px'; 
                // @ts-ignore
                vagaBox.style.lineHeight = '1';
                
                // @ts-ignore
                vagaBox.style.fontSize = '26px'; 
                // @ts-ignore
                vagaBox.style.fontWeight = '900'; 
                // @ts-ignore
                vagaBox.style.opacity = '1'; 

                // @ts-ignore
                vagaBox.style.marginTop = '0px'; 
                // @ts-ignore
                vagaBox.style.marginBottom = '0';

                const originalText = vagaBox.textContent || (vagaBox as HTMLElement).innerText;
                vagaBox.textContent = ''; 
                
                const textSpan = document.createElement('span');
                textSpan.textContent = originalText;
                textSpan.style.position = 'relative';
                textSpan.style.top = '-10px'; 
                
                vagaBox.appendChild(textSpan);
            }

            const nameSpan = child.querySelector('span.font-bold');
            if (nameSpan) {
                // @ts-ignore
                nameSpan.style.display = 'inline-block'; 
                // @ts-ignore
                nameSpan.style.lineHeight = '1.1'; 
                // @ts-ignore
                nameSpan.style.verticalAlign = 'middle';
                
                // @ts-ignore
                nameSpan.style.fontSize = '26px';
                
                // @ts-ignore
                nameSpan.style.position = 'relative';
                // @ts-ignore
                nameSpan.style.top = '-13px';
                // @ts-ignore
                nameSpan.style.marginTop = '0px'; 
                
                // @ts-ignore
                nameSpan.style.overflow = 'visible'; 
                
                // @ts-ignore
                if (nameSpan.classList.contains('line-through') || nameSpan.style.textDecoration.includes('line-through')) {
                    // @ts-ignore
                    nameSpan.style.textDecoration = 'none';
                    nameSpan.classList.remove('line-through');
                    
                    const strikeLine = document.createElement('div');
                    strikeLine.style.position = 'absolute';
                    strikeLine.style.left = '-2px';   
                    strikeLine.style.right = '-2px';
                    
                    strikeLine.style.top = 'calc(50% + 12px)';     
                    
                    strikeLine.style.height = '3px';  
                    strikeLine.style.backgroundColor = '#f87171'; 
                    strikeLine.style.borderRadius = '2px';
                    strikeLine.style.zIndex = '10';
                    
                    nameSpan.appendChild(strikeLine);
                    
                    // @ts-ignore
                    nameSpan.style.opacity = '0.7';
                }
            }

            const timeSpan = child.querySelector('span.font-mono.text-lg') || child.querySelector('.show-on-print span');
            if (timeSpan) {
                // @ts-ignore
                timeSpan.style.display = 'inline-block';
                // @ts-ignore
                timeSpan.style.lineHeight = '1.1';
                // @ts-ignore
                timeSpan.style.verticalAlign = 'middle';
                
                // @ts-ignore
                timeSpan.style.fontSize = '26px';

                // @ts-ignore
                timeSpan.style.position = 'relative';
                // @ts-ignore
                timeSpan.style.top = '-13px';
                // @ts-ignore
                timeSpan.style.marginTop = '0px'; 
                
                // @ts-ignore
                timeSpan.style.overflow = 'visible';

                // @ts-ignore
                if (timeSpan.classList.contains('line-through') || timeSpan.style.textDecoration.includes('line-through')) {
                    // @ts-ignore
                    timeSpan.style.textDecoration = 'none';
                    timeSpan.classList.remove('line-through');
                    
                    const strikeLine = document.createElement('div');
                    strikeLine.style.position = 'absolute';
                    strikeLine.style.left = '-2px';
                    strikeLine.style.right = '-2px';
                    
                    strikeLine.style.top = 'calc(50% + 12px)';     
                    
                    strikeLine.style.height = '3px';
                    strikeLine.style.backgroundColor = '#f87171';
                    strikeLine.style.borderRadius = '2px';
                    strikeLine.style.zIndex = '10';
                    
                    timeSpan.appendChild(strikeLine);
                    
                    // @ts-ignore
                    timeSpan.style.opacity = '0.7';
                }
            }
        });
        
        clone.style.width = '100%';
        clone.style.height = 'auto';
        clone.style.display = 'block';

        const contentContainer = document.createElement('div');
        if (columns > 1) {
            const colWidth = 600; 
            wrapper.style.width = `${columns * colWidth + 80}px`; 
            contentContainer.style.columnCount = columns.toString();
            contentContainer.style.columnGap = '40px';
            
            Array.from(clone.children).forEach(child => {
                // @ts-ignore
                child.style.breakInside = 'avoid';
                // @ts-ignore
                child.style.pageBreakInside = 'avoid';
                // @ts-ignore
                child.style.marginBottom = '15px';
            });
        } else {
            wrapper.style.width = `${Math.max(element.scrollWidth + 100, 700)}px`;
        }

        contentContainer.appendChild(clone);
        wrapper.appendChild(contentContainer);
        
        document.body.appendChild(wrapper);
        const target = wrapper;

        // @ts-ignore
        const html2canvas = (window as any).html2canvas;
        const canvas = await html2canvas(target, {
            backgroundColor: '#1e293b',
            scale: 2,
            useCORS: true,
            windowWidth: target.scrollWidth,
            width: target.scrollWidth,
            height: target.scrollHeight + 50 
        });

        const link = document.createElement('a');
        link.download = `${filename}_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.png`;
        link.href = canvas.toDataURL();
        link.click();

    } catch (err) {
        console.error("Erro no print:", err);
        throw new Error("Erro ao gerar imagem.");
    } finally {
        if (wrapper && document.body.contains(wrapper)) {
            document.body.removeChild(wrapper);
        }
    }
};
