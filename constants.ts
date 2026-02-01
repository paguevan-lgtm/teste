
import { Theme } from './types';

export const BAIRROS = [ "Forte / Canto do Forte", "Tude Bastos / Chico de Paula", "Boqueirao", "Guilhermina", "Aviação", "Tupi", "Tupiry", "Ocian", "Gloria", "Vila Antartica", "Vila Sonia", "Quietude", "Mirim", "Anhanguera", "Maracana", "Ribeiropolis", "Esmeralda", "Samambaia", "Melvi", "Caiçara", "Imperador", "Real", "Princesa", "Florida", "Cidade das Crianças", "Solemar" ];

export const COLORS = ['#f59e0b', '#d97706', '#b45309', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];

// LISTA REORGANIZADA: Vaga 22 (Neto) em primeiro lugar.
export const INITIAL_SP_LIST = [
    {vaga: '22', name: 'Wash (Neto)'},
    {vaga: '08', name: 'Cristina'},
    {vaga: '16', name: 'Sergio'},
    {vaga: '09', name: 'Wash (Buda)'},
    {vaga: '13', name: 'Rafael'},
    {vaga: '12', name: 'Del'},
    {vaga: '07', name: 'Breno'},
    {vaga: '04', name: 'Martins'},
    {vaga: '14', name: 'Wash'},
    {vaga: '15', name: 'Julia'},
    {vaga: '19', name: 'Carlão'},
    {vaga: '18', name: 'Domingos'},
    {vaga: '05', name: 'Fernando'},
    {vaga: '00', name: 'Topic'},
    {vaga: '02', name: 'Cristian'},
    {vaga: '20', name: 'Aquiles'},
    {vaga: '06', name: 'Bruno'},
    {vaga: '21', name: 'Campos'},
    {vaga: '01', name: 'Max'},
    {vaga: '17', name: 'Max'},
    {vaga: '10', name: 'Salles'},
    {vaga: '11', name: 'Reginaldo'},
    {vaga: '03', name: 'Chaiene'}
];

export const THEMES: Record<string, Theme> = {
    default: { 
        name: 'Padrão', bg: 'bg-slate-950', card: 'bg-slate-800 border-slate-700', text: 'text-slate-200', primary: 'bg-amber-600 text-white', accent: 'text-amber-400', border: 'border-slate-700', radius: 'rounded-xl', palette: ['#f59e0b', '#d97706', '#fbbf24', '#b45309', '#78350f'] 
    },
    wood: { 
        name: 'Rústico (Madeira)', bg: 'bg-[#1a110e]', card: 'bg-[#2e1f18] border-[#4a342a]', text: 'text-[#e6dace]', primary: 'bg-[#8b5a2b] text-white', accent: 'text-[#d4a373]', border: 'border-[#4a342a]', radius: 'rounded-xl', palette: ['#8b5a2b', '#d4a373', '#6f4e37', '#a67b5b', '#c19a6b'] 
    },
    dark: { 
        name: 'Escuro Profundo', bg: 'bg-black', card: 'bg-zinc-900 border-zinc-800', text: 'text-zinc-200', primary: 'bg-orange-600 text-white', accent: 'text-orange-400', border: 'border-zinc-800', radius: 'rounded-xl', palette: ['#ea580c', '#f97316', '#fdba74', '#c2410c', '#7c2d12'] 
    },
    cyberpunk: { 
        name: 'Cyberpunk', bg: 'bg-[#0b0c15]', card: 'bg-[#181926] border-[#2f3146]', text: 'text-[#e0def4]', primary: 'bg-[#eb6f92] text-white', accent: 'text-[#f6c177]', border: 'border-[#2f3146]', radius: 'rounded-none', palette: ['#eb6f92', '#f6c177', '#9ccfd8', '#c4a7e7', '#31748f'] 
    },
    dracula: { 
        name: 'Drácula', bg: 'bg-[#282a36]', card: 'bg-[#44475a] border-[#6272a4]', text: 'text-[#f8f8f2]', primary: 'bg-[#bd93f9] text-[#282a36]', accent: 'text-[#50fa7b]', border: 'border-[#6272a4]', radius: 'rounded-xl', palette: ['#bd93f9', '#50fa7b', '#ff79c6', '#8be9fd', '#ffb86c'] 
    },
    solar: { 
        name: 'Solar (Claro)', bg: 'bg-[#fdf6e3]', card: 'bg-[#eee8d5] border-[#d2b589]', text: 'text-[#657b83]', primary: 'bg-[#b58900] text-white', accent: 'text-[#cb4b16]', border: 'border-[#d2b589]', radius: 'rounded-2xl', palette: ['#b58900', '#cb4b16', '#dc322f', '#d33682', '#6c71c4'] 
    },
    midnight: { 
        name: 'Meia-noite', bg: 'bg-indigo-950', card: 'bg-indigo-900 border-indigo-800', text: 'text-indigo-100', primary: 'bg-cyan-600 text-white', accent: 'text-cyan-300', border: 'border-indigo-700', radius: 'rounded-xl', palette: ['#0891b2', '#06b6d4', '#67e8f9', '#4338ca', '#3730a3'] 
    },
    forest: { 
        name: 'Floresta', bg: 'bg-green-950', card: 'bg-green-900 border-green-800', text: 'text-green-100', primary: 'bg-emerald-600 text-white', accent: 'text-emerald-400', border: 'border-green-800', radius: 'rounded-xl', palette: ['#059669', '#10b981', '#34d399', '#065f46', '#064e3b'] 
    },
};

export const USERS_DB: Record<string, {pass: string, role: string}> = {
    'Admin': { pass: 'Admin', role: 'admin' },
    'Operador': { pass: 'Operador', role: 'operador' },
    'Breno': { pass: '15744751', role: 'admin' }
};
