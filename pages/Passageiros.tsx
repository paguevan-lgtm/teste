
import React, { useState } from 'react';
import { Icons, Button, IconButton } from '../components/Shared';
import { formatDisplayDate, getTodayDate } from '../utils';

export default function Passageiros({ data, theme, searchTerm, setFormData, setModal, del, notify }: any) {
    const [expandedPax, setExpandedPax] = useState<string|null>(null);

    const filteredList = data.passengers.filter((item:any) => {
        if (!searchTerm) return true;
        const lower = searchTerm.toLowerCase().trim();
        return (item.name && item.name.toLowerCase().includes(lower)) || (item.neighborhood && item.neighborhood.toLowerCase().includes(lower)) || (item.phone && item.phone.includes(lower)) || (String(item.id).toLowerCase().includes(lower));
    });

    const copyPassengerData = (p: any) => {
        const txt = `*PASSAGEIRO*\n• Nome: ${p.name}\n• Tel: ${p.phone}\n• End: ${p.address}\n• Ref: ${p.reference||''}\n• Bairro: ${p.neighborhood}\n• Pagamento: ${p.payment}\n• Data: ${formatDisplayDate(p.date)} - ${p.time}\n• Qtd: ${p.passengerCount} pessoa(s)`;
        navigator.clipboard.writeText(txt);
        notify('Dados copiados para a área de transferência!', 'success');
    };

    const callPhone = (ph: string) => { 
        if(!ph) return notify("Passageiro sem telefone cadastrado.", "error"); 
        window.location.href = `tel:${ph.replace(/\D/g,'')}`; 
    }

    return (
        <div className="space-y-3">
            {filteredList.map((item:any, i:number) => (<div key={item.id} style={{animationDelay: `${i * 50}ms`}} onClick={() => setExpandedPax(expandedPax === item.id ? null : item.id)} className={`${theme.card} p-4 ${theme.radius} border ${theme.border} relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform stagger-in premium-card`}><div className="absolute top-1 right-8 text-4xl font-bold opacity-[0.07] pointer-events-none">#{item.id}</div><div className="absolute top-3 right-3 text-xs opacity-50">{expandedPax === item.id ? <Icons.ChevronUp size={18}/> : <Icons.ChevronDown size={18}/>}</div><div className="pr-8"><div className="flex flex-wrap gap-2 mb-1">{item.tags && item.tags.split(',').map((tag:string, i:number) => (<span key={i} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-bold uppercase">{tag.trim()}</span>))}</div><h3 className="font-bold text-lg">{item.name}</h3><p className="text-sm opacity-70">{item.neighborhood}</p></div>{expandedPax === item.id && (<div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm expand-content anim-fade"><div className="grid grid-cols-2 gap-4"><div><span className="block opacity-50 text-xs">TELEFONE</span>{item.phone}</div><div><span className="block opacity-50 text-xs">PAGAMENTO</span>{item.payment}</div><div className="col-span-2"><span className="block opacity-50 text-xs">ENDEREÇO</span>{item.address} {item.reference ? `(${item.reference})` : ''}</div><div><span className="block opacity-50 text-xs">DATA/HORA</span>{formatDisplayDate(item.date)} - {item.time}</div><div><span className="block opacity-50 text-xs">DETALHES</span>{item.passengerCount} pax | {item.luggageCount || 0} malas</div><div><span className="block opacity-50 text-xs">STATUS</span><span className={item.status === 'Ativo' ? 'text-green-400' : 'text-red-400'}>{item.status}</span></div></div><div className="flex gap-2 pt-4 mt-2"><Button theme={theme} onClick={(e:any)=>{e.stopPropagation(); setFormData({...item, date: getTodayDate()}); setModal('passenger')}} variant="secondary" className="flex-1 py-2 text-sm" icon={Icons.Edit}>Editar</Button><IconButton theme={theme} variant="default" onClick={(e:any)=>{e.stopPropagation(); copyPassengerData(item)}} icon={Icons.Copy}/>{item.phone && <IconButton theme={theme} variant="success" onClick={(e:any)=>{e.stopPropagation(); callPhone(item.phone)}} icon={Icons.Phone}/>}<IconButton theme={theme} variant="danger" onClick={(e:any)=>{e.stopPropagation(); del('passengers', item.id)}} icon={Icons.Trash}/></div></div>)}</div>))}
            {!filteredList.length && <div className="text-center opacity-50 py-10">Nenhum passageiro.</div>}
        </div>
    );
}
