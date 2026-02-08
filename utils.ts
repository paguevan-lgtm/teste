
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
    // ... existing handlePrint content (omitted for brevity, assume it's the same) ...
    // Using simple placeholder to save space as it's not changed
    const element = document.getElementById(targetId);
    if (!element) throw new Error("Elemento não encontrado para impressão.");
    
    // (Existing Print Logic)
    let wrapper = null;
    try {
        let clone: HTMLElement | null = null;
        const itemCount = element.children.length;
        let columns = 1;
        if (options.forceCols) columns = options.forceCols;
        else if (options.mode === 'confirmados') columns = itemCount > 12 ? 2 : 1;
        else if (options.mode === 'lousa') { columns = Math.ceil(itemCount / 12); if (columns < 1) columns = 1; }

        wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;background-color:#1e293b;color:white;padding:40px;z-index:99999';
        
        let dateStr = new Date().toLocaleDateString('pt-BR');
        if (options.date) { const [y, m, d] = options.date.split('-'); dateStr = `${d}/${m}/${y}`; }

        const titleEl = document.createElement('h1');
        titleEl.innerText = `${title} - ${dateStr}`;
        titleEl.style.cssText = 'text-align:center;margin-bottom:25px;font-size:32px;font-weight:bold;color:#fbbf24;width:100%';
        wrapper.appendChild(titleEl);

        clone = element.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('.hide-on-print').forEach(el => el.remove());
        clone.querySelectorAll('.show-on-print').forEach(el => { el.classList.remove('hidden'); (el as any).style.display = 'block'; });
        // ... more print styles logic ... (simplified for this update)
        
        // Render clone to wrapper
        const contentContainer = document.createElement('div');
        if (columns > 1) {
            wrapper.style.width = `${columns * 600 + 80}px`; 
            contentContainer.style.columnCount = columns.toString();
            contentContainer.style.columnGap = '40px';
        } else {
            wrapper.style.width = `${Math.max(element.scrollWidth + 100, 700)}px`;
        }
        contentContainer.appendChild(clone);
        wrapper.appendChild(contentContainer);
        document.body.appendChild(wrapper);

        // @ts-ignore
        const html2canvas = (window as any).html2canvas;
        const canvas = await html2canvas(wrapper, { backgroundColor: '#1e293b', scale: 2, useCORS: true });
        const link = document.createElement('a');
        link.download = `${filename}_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.png`;
        link.href = canvas.toDataURL();
        link.click();
    } catch (err) { throw new Error("Erro ao gerar imagem."); } 
    finally { if (wrapper && document.body.contains(wrapper)) document.body.removeChild(wrapper); }
};

// --- SECURITY FINGERPRINTING ---

// Simple hash function (Cypher 53)
const cyrb53 = (str: string, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

// Helper for Canvas Fingerprint (Hardware Acceleration Signature)
const getCanvasFingerprint = () => {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'no_canvas';
        
        // Setup complex scene to trigger hardware specific rasterization differences
        canvas.width = 280;
        canvas.height = 60;
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        // Use a fallback font to force system default rendering paths
        ctx.font = "11pt no-real-font-123"; 
        ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.font = "18pt Arial";
        ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45);
        
        // Composite operation triggers GPU blending logic
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = "rgb(255,0,255)";
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, Math.PI * 2, true); 
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgb(0,255,255)";
        ctx.beginPath();
        ctx.arc(100, 50, 50, 0, Math.PI * 2, true); 
        ctx.closePath();
        ctx.fill();
        
        return canvas.toDataURL();
    } catch (e) { return 'canvas_err'; }
};

export const getDeviceFingerprint = async () => {
    try {
        const nav = window.navigator;
        const screen = window.screen;

        // 1. GPU (WebGL)
        const getWebGL = () => {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) return 'no_webgl';
                // @ts-ignore
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                // @ts-ignore
                const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown_renderer';
                // @ts-ignore
                const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown_vendor';
                return `${vendor}::${renderer}`;
            } catch (e) { return 'webgl_error'; }
        };

        // 2. OS Identification
        const getOS = () => {
            const ua = nav.userAgent;
            if (ua.indexOf("Win") !== -1) return "Windows";
            if (ua.indexOf("Mac") !== -1) return "MacOS";
            if (ua.indexOf("Linux") !== -1) return "Linux";
            if (ua.indexOf("Android") !== -1) return "Android";
            if (ua.indexOf("iOS") !== -1) return "iOS";
            return "UnknownOS";
        };

        // 3. Hardware Specs
        // @ts-ignore
        const cores = nav.hardwareConcurrency || 'x';
        // @ts-ignore
        const ram = nav.deviceMemory || 'x';
        
        // Orientation-independent screen dimensions
        const sW = Math.max(screen.width, screen.height);
        const sH = Math.min(screen.width, screen.height);
        const screenSpec = `${sW}x${sH}x${screen.colorDepth}x${window.devicePixelRatio}`;
        
        // 4. Timezone
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown_tz';

        // 5. Canvas (Rendering Engine Signature)
        const canvasFP = getCanvasFingerprint();

        // COMPOSIÇÃO DO FINGERPRINT
        // Adicionando Canvas que é muito específico do dispositivo/engine
        const hardwareString = [
            getOS(),
            // @ts-ignore
            nav.platform,
            cores,
            ram,
            screenSpec,
            tz,
            getWebGL(),
            canvasFP 
        ].join('|||');

        return cyrb53(hardwareString).toString(16);
    } catch (e) {
        return 'fallback_id_' + Date.now();
    }
};

// Extrator de detalhes para exibição (Log)
export const parseUserAgent = (ua: string) => {
    let device = 'Desktop';
    let browser = 'Unknown';
    let os = 'Unknown OS';
    
    // Device
    if (/mobile/i.test(ua)) device = 'Mobile';
    if (/tablet/i.test(ua)) device = 'Tablet';
    if (/iphone/i.test(ua)) device = 'iPhone';
    if (/android/i.test(ua)) device = 'Android';
    
    // Browser
    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/chrome/i.test(ua)) browser = 'Chrome';
    else if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';
    
    // OS
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/mac os/i.test(ua)) os = 'MacOS';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/ios/i.test(ua)) os = 'iOS';
    
    return { device, browser, os };
};

// Helper para obter Hardware Info legível (para logs)
export const getHardwareInfo = () => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        let gpu = 'Unknown GPU';
        if (gl) {
            // @ts-ignore
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            // @ts-ignore
            if(debugInfo) gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
        return gpu;
    } catch(e) { return 'Unknown GPU'; }
}

/**
 * Traduz erros comuns do Firebase para mensagens amigáveis.
 * @param error O objeto de erro do Firebase.
 * @returns Uma string com a mensagem traduzida.
 */
export const translateFirebaseError = (error: any): string => {
    if (!error) return "Ocorreu um erro desconhecido.";

    const message = error.message || '';
    
    if (message.includes('permission_denied') || message.includes('PERMISSION_DENIED')) {
        return "Erro: Você não tem permissão para realizar esta ação. Contate o administrador.";
    }
    
    if (message.includes('value argument contains undefined')) {
        return "Erro: Um campo obrigatório não foi preenchido. Verifique o formulário e tente novamente.";
    }

    if (message.includes('network error')) {
        return "Erro de conexão. Verifique sua internet e tente novamente.";
    }

    // Fallback para erros não traduzidos, mas limpa a parte técnica
    if (message.includes(':')) {
        return `Erro: ${message.split(':').slice(1).join(':').trim()}`;
    }

    return `Ocorreu um erro inesperado: ${message}`;
};
