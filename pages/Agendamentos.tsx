
import React, { useState } from 'react';
import { Icons, Button, IconButton } from '../components/Shared';
import { formatDisplayDate, getTodayDate, calculateTimeSlot } from '../utils';

export default function Agendamentos({ data, theme, setFormData, setModal, dbOp, setSuggestedTrip, setEditingTripId, notify, requestConfirm }: any) {
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [calendarDate, setCalendarDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear(); const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate(); const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay, month, year };
    };

    const copyDaySummary = () => {
        const dayTrips = data.trips.filter((t:any) => t.date === selectedDate).sort((a:any,b:any) => (a.time||'').localeCompare(b.time||''));
        if (dayTrips.length === 0) return notify("Nenhuma viagem neste dia para copiar.", "error");
        let summary = `📅 RESUMO DO DIA ${formatDisplayDate(selectedDate)}\n\n`;
        dayTrips.forEach((t:any) => { const pList = data.passengers.filter((p:any)=>(t.passengerIds||[]).includes(p.id)); summary += `⏰ ${t.time} - ${t.driverName} (${t.status})\n`; pList.forEach((p:any) => summary += `  - ${p.name} (${p.neighborhood})\n`); summary += `\n`; });
        navigator.clipboard.writeText(summary);
        notify("Resumo do dia copiado!", "success");
    };

    const handleCreateTripFromPax = (p: any) => {
        setFormData({ driverId: '', time: p.time, date: p.date });
        setSuggestedTrip({ driver: { name: 'Selecione', capacity: 0 }, time: p.time, passengers: [p], occupancy: parseInt(p.passengerCount || 1), date: p.date });
        setEditingTripId(null); setModal('trip');
    };

    const openEditTrip = (t: any) => {
        const dr = data.drivers.find((d:any)=>d.id===t.driverId); 
        let pax = [];
        let occ = 0;
        
        const hasSnapshot = t.passengersSnapshot && t.passengersSnapshot.length > 0 && t.passengersSnapshot[0].id !== 'dummy_0';
        const hasLiveIds = t.passengerIds && t.passengerIds.length > 0;

        if (hasSnapshot) {
            pax = t.passengersSnapshot;
            occ = pax.reduce((a:any,b:any)=>a+parseInt(b.passengerCount||1),0);
        } else if (hasLiveIds) {
            pax = data.passengers.filter((p:any)=>(t.passengerIds||[]).includes(p.id));
            occ = pax.reduce((a:any,b:any)=>a+parseInt(b.passengerCount||1),0);
        } else if (t.isMadrugada) {
             occ = parseInt(t.pCountSnapshot || t.pCount || 0);
             for(let i=0; i<occ; i++) pax.push({ id: `dummy_${i}`, name: 'Passageiro Madrugada', neighborhood: 'Madrugada', passengerCount: 1 });
        } else {
            pax = [];
            occ = 0;
        }

        setFormData({ driverId: t.driverId, time: t.time, date: t.date, isMadrugada: !!t.isMadrugada }); 
        setEditingTripId(t.id);
        setSuggestedTrip({ driver: dr || {name: 'Desconhecido', capacity: 0}, time: t.time, passengers: pax, occupancy: occ, date: t.date });
        setModal('trip');
    };

    const sendPaxWhatsapp = (p: any) => {
        if(!p.phone) return notify('Passageiro sem telefone.', 'error');
        const msg = encodeURIComponent(`Olá ${p.name}, sobre seu agendamento para ${formatDisplayDate(p.date)} às ${p.time}...`);
        window.open(`https://wa.me/55${p.phone.replace(/\D/g,'')}?text=${msg}`, '_blank');
    };

    const clearPaxSchedule = (pid: string) => {
        requestConfirm("Remover Agendamento?", "O passageiro será removido da lista de agendamentos (horário será limpo).", () => {
            dbOp('update', 'passengers', { id: pid, time: '' });
        });
    };

    const { days, firstDay, month, year } = getDaysInMonth(calendarDate);
    const monthName = calendarDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const dayElements = [];
    for(let i = 0; i < firstDay; i++) dayElements.push(<div key={`empty-${i}`} className="h-10"></div>);
    for(let i = 1; i <= days; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const isSelected = selectedDate === dateStr;
        const hasTrip = data.trips.some((t:any) => t.date === dateStr); const hasPax = data.passengers.some((p:any) => p.date === dateStr);
        dayElements.push(<button key={i} onClick={() => setSelectedDate(dateStr)} className={`h-10 w-full rounded-lg flex flex-col items-center justify-center relative transition-colors ${isSelected ? theme.primary : 'hover:bg-white/5'}`}><span className={`text-sm ${isSelected ? 'font-bold' : 'opacity-80'}`}>{i}</span><div className="flex gap-0.5 mt-0.5">{hasTrip && <div className="w-1 h-1 rounded-full bg-blue-400"></div>}{hasPax && <div className="w-1 h-1 rounded-full bg-green-400"></div>}</div></button>);
    }

    const paxOfDay = data.passengers.filter((p:any) => p.date === selectedDate);
    const tripsForSelectedDate = data.trips.filter((t:any) => t.date === selectedDate).sort((a:any,b:any) => (a.time||'').localeCompare(b.time||''));
    const assigned: any[] = []; const pending: any[] = [];
    paxOfDay.forEach((p:any) => { 
        const isAssigned = data.trips.some((t:any) => t.date === selectedDate && t.status !== 'Cancelada' && (t.passengerIds||[]).some((id:any) => String(id) === String(p.id))); 
        if (isAssigned) assigned.push(p); 
        else if (p.time) pending.push(p); 
    });
    const pendingPax = pending.sort((a, b) => (a.time||'').localeCompare(b.time||''));
    const assignedPax = assigned.sort((a, b) => (a.time||'').localeCompare(b.time||''));

    return (
        <div className="space-y-6">
            <div className={`${theme.card} ${theme.radius} border ${theme.border} p-4 stagger-in d-1`}><div className="flex items-center justify-between mb-4"><h3 className="font-bold text-lg capitalize">{monthName}</h3><div className="flex gap-2"><button onClick={()=>setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth()-1)))} className="p-2 hover:bg-white/10 rounded-lg"><Icons.ChevronLeft size={20}/></button><button onClick={()=>setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth()+1)))} className="p-2 hover:bg-white/10 rounded-lg"><Icons.ChevronRight size={20}/></button></div></div><div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs opacity-60">{['D','S','T','Q','Q','S','S'].map((d,i)=><div key={i}>{d}</div>)}</div><div className="grid grid-cols-7 gap-1">{dayElements}</div><div className="mt-4 pt-3 border-t border-white/10 flex gap-2"><button onClick={copyDaySummary} className="w-full bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"><Icons.Copy size={16}/> 📋 Copiar Resumo do Dia</button></div></div>
            <div className="space-y-4 stagger-in d-2">
                <h3 className="font-bold text-lg border-b border-white/10 pb-2">📅 {formatDisplayDate(selectedDate)}</h3>
                
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest opacity-60 pl-1 text-yellow-400">Pendentes</h4>
                    {(() => {
                        if (pendingPax.length === 0) return <p className="text-sm opacity-40 italic pl-1">Todos os passageiros estão alocados ou sem horário.</p>;
                        
                        const grouped = pendingPax.reduce((acc:any, p:any) => {
                            const t = p.time || 'Sem Horário';
                            if (!acc[t]) acc[t] = [];
                            acc[t].push(p);
                            return acc;
                        }, {});
                        
                        const sortedTimes = Object.keys(grouped).sort();

                        return sortedTimes.map(time => (
                            <div key={time} className="mb-4">
                                <div className="flex items-center gap-2 mb-2 opacity-80">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <span className="font-bold font-mono text-lg">{time}</span>
                                    <div className="h-[1px] bg-white/10 flex-1"></div>
                                </div>
                                <div className="space-y-3 pl-2 border-l border-white/5">
                                    {grouped[time].map((p:any) => (
                                        <div key={p.id} className={`${theme.card} ${theme.radius} border border-yellow-500/30 p-4 relative bg-yellow-500/5 premium-card`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-lg">{p.name}</div>
                                                    <div className="text-xs opacity-70">{p.neighborhood} • {p.time}</div>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <div className="text-sm font-bold bg-white/10 px-2 py-1 rounded">{p.luggageCount || 0}🎒</div>
                                                    <div className="text-sm font-bold bg-white/10 px-2 py-1 rounded">{p.passengerCount}p</div>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFormData({ id: p.id, time: p.time, name: p.name });
                                                            setModal('reschedule');
                                                        }}
                                                        className="ml-1 p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors active:scale-95 cursor-pointer"
                                                        title="Reagendar Passageiro"
                                                    >
                                                        <Icons.Clock size={16} />
                                                    </button>

                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            clearPaxSchedule(p.id);
                                                        }} 
                                                        className="ml-1 p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors active:scale-95 cursor-pointer"
                                                        title="Remover Agendamento"
                                                    >
                                                        <Icons.CalendarX size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                                                <button onClick={() => sendPaxWhatsapp(p)} className="flex-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Icons.Phone size={16}/> WhatsApp</button>
                                                <button onClick={() => handleCreateTripFromPax(p)} className="flex-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Icons.Plus size={16}/> Criar Viagem</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ));
                    })()}
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-widest opacity-60 pl-1 text-blue-400">Em Viagem</h4>
                    {assignedPax.length > 0 ? (
                        assignedPax.map((p:any) => {
                            const trip = data.trips.find((t:any) => t.date === selectedDate && t.status !== 'Cancelada' && (t.passengerIds||[]).map(String).includes(String(p.id)));
                            const isFinalized = trip && trip.status === 'Finalizada';
                            const displayTime = trip ? trip.time : (p.time || 'Sem horário');

                            return (
                                <div key={p.id} className={`${theme.card} ${theme.radius} border border-white/5 p-3 relative opacity-60 hover:opacity-100 transition-opacity`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-bold">{p.name}</div>
                                            <div className="text-xs opacity-70">
                                                {p.neighborhood} • {displayTime}
                                            </div>
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded font-bold ${isFinalized ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {isFinalized ? 'Viagem Finalizada' : 'Em Viagem'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm opacity-40 italic pl-1">Nenhum.</p>
                    )}
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10"><h4 className="text-xs font-bold uppercase tracking-widest opacity-60 pl-1">Viagens do Dia</h4>{tripsForSelectedDate.length > 0 ? (tripsForSelectedDate.map((t:any) => { const pCount = data.passengers.filter((p:any)=>(t.passengerIds||[]).includes(p.id)).reduce((a:any,b:any)=>a+parseInt(b.passengerCount||1),0); let statusColor = 'bg-blue-500'; if(t.status === 'Finalizada') statusColor = 'bg-green-500'; if(t.status === 'Cancelada') statusColor = 'bg-red-500'; return (<div key={t.id} className={`${theme.card} ${theme.radius} border ${theme.border} p-4 flex justify-between items-center relative overflow-hidden premium-card`}><div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor}`}></div><div><div className="font-bold flex items-center gap-2">{t.driverName}<span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${statusColor.replace('bg-', 'border-').replace('500', '500/50')} ${statusColor.replace('bg-', 'text-').replace('500', '400')} bg-transparent`}>{t.status}</span></div><div className="text-xs opacity-70 flex gap-2 mt-1"><span>🕒 {calculateTimeSlot(t.time)}</span><span>👥 {pCount} pax</span></div></div><IconButton theme={theme} onClick={()=>openEditTrip(t)} icon={Icons.Edit} variant="default" /></div>); })) : (<p className="text-sm opacity-40 italic pl-1">Nenhuma viagem.</p>)}</div>
            </div>
        </div>
    );
}
