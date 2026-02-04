
import React from 'react';
import { Icons, Button } from '../components/Shared';
import { formatDisplayDate, getTodayDate } from '../utils';

export default function Financeiro({ data, theme, billingData, billingDate, prevBillingMonth, nextBillingMonth, togglePaymentStatus, sendBillingMessage, del, setFormData, setModal, openEditTrip, user, notify }: any) {
    
    // Verifica permissão para ver o total recebido
    const canSeeRevenue = user && (user.role === 'admin' || user.username === 'Breno');

    const formatCurrency = (val: any) => {
        const num = parseFloat(val);
        if (isNaN(num)) return '0,00';
        return num.toFixed(2).replace('.', ',');
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho com Navegação de Mês */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10 stagger-in d-1">
                <h3 className="text-lg font-bold opacity-80 flex items-center gap-2"><Icons.Dollar size={20}/> Financeiro</h3>
                
                <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
                    <button onClick={prevBillingMonth} className="p-1.5 hover:bg-white/10 rounded transition-colors"><Icons.ChevronLeft size={18}/></button>
                    <span className="text-sm font-bold capitalize w-32 text-center">{billingDate.toLocaleDateString('pt-BR', {month:'long', year:'numeric'})}</span>
                    <button onClick={nextBillingMonth} className="p-1.5 hover:bg-white/10 rounded transition-colors"><Icons.ChevronRight size={18}/></button>
                </div>
            </div>

            {/* Resumo Topo */}
            <div className={`grid ${canSeeRevenue ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                <div className={`${theme.card} p-4 rounded-xl border ${theme.border} bg-red-500/10 border-red-500/20 stagger-in d-2`}>
                    <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">A Receber (Pendente)</div>
                    <div className="text-3xl font-bold text-white">R$ {formatCurrency(billingData.summary.pending)}</div>
                </div>
                
                {canSeeRevenue && (
                    <div className={`${theme.card} p-4 rounded-xl border ${theme.border} bg-green-500/10 border-green-500/20 stagger-in d-3`}>
                        <div className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">Recebido (Pago)</div>
                        <div className="text-3xl font-bold text-white">R$ {formatCurrency(billingData.summary.paid)}</div>
                    </div>
                )}
            </div>

            {/* Lista Agrupada por Dia */}
            <div className="space-y-6 stagger-in d-4">
                {billingData.groups.length > 0 ? billingData.groups.map((group:any, idx:number) => {
                    const [y, m, d] = group.date.split('-');
                    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                    const displayDate = `${d} de ${monthNames[parseInt(m)-1]}`;

                    return (
                        <div key={group.date} className="anim-fade" style={{animationDelay: `${idx * 100}ms`}}>
                            <h3 className="flex items-center gap-3 text-sm font-bold opacity-60 uppercase tracking-widest mb-3 pl-1">
                                <span>{displayDate}</span>
                                <div className="h-[1px] bg-white/10 flex-1"></div>
                                <span className="text-white/40">Total: R$ {formatCurrency(group.totalValue)}</span>
                            </h3>
                            
                            <div className="space-y-3">
                                {group.trips.map((trip:any) => (
                                    <div key={trip.id} className={`${theme.card} p-4 rounded-xl border ${theme.border} flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden premium-card`}>
                                        {/* Indicador Lateral de Status */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${trip.isPaid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-white/5 border border-white/10 shrink-0`}>
                                                {trip.isExtra ? <Icons.Car size={24}/> : (trip.isMadrugada ? <Icons.Moon size={24}/> : trip.time.split(':')[0] + 'h')}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                {trip.isExtra ? (
                                                    <>
                                                        <div className="font-bold text-lg flex items-center gap-2 flex-wrap">
                                                            {trip.driverName}
                                                            <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30 uppercase shrink-0">Extra</span>
                                                        </div>
                                                        <div className="text-sm opacity-60 italic max-w-[200px] truncate">
                                                            {trip.notes || 'Sem observação'}
                                                        </div>
                                                    </>
                                                ) : trip.isMadrugada ? (
                                                    <>
                                                            <div className="font-bold text-lg flex items-center gap-2">
                                                            {trip.driverName}
                                                            <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase shrink-0">Madrugada</span>
                                                        </div>
                                                        <div className="text-sm opacity-60 flex items-center gap-2">
                                                            <span>{trip.pCount} passageiros</span>
                                                            <span>•</span>
                                                            <span>Vaga {trip.vaga}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="font-bold text-lg flex items-center gap-2">
                                                            {trip.driverName}
                                                            {trip.isTemp && <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30 uppercase shrink-0">Temp</span>}
                                                        </div>
                                                        <div className="text-sm opacity-60 flex items-center gap-2">
                                                            <span>{trip.pCount} passageiros</span>
                                                            <span>•</span>
                                                            <span className="font-mono">#{trip.id}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-3 md:gap-6 bg-black/20 p-3 md:p-0 md:bg-transparent rounded-lg">
                                            <div className="flex flex-col items-start md:items-end px-1 md:px-0">
                                                <div className="text-xs opacity-50 uppercase font-bold">Valor</div>
                                                <div className="text-xl font-bold text-yellow-400 whitespace-nowrap">R$ {formatCurrency(trip.value)}</div>
                                            </div>

                                            <div className="flex gap-2 items-center ml-auto md:ml-0">
                                                <button 
                                                    onClick={() => togglePaymentStatus(trip)}
                                                    className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-2 border transition-all active:scale-95 ${trip.isPaid ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'}`}
                                                >
                                                    {trip.isPaid ? <Icons.CheckCircle size={14}/> : <Icons.Clock size={14}/>}
                                                    {trip.isPaid ? 'PAGO' : 'PENDENTE'}
                                                </button>
                                                
                                                {/* Botão de Editar */}
                                                {!trip.isExtra && (
                                                    <button 
                                                        onClick={() => openEditTrip(trip)}
                                                        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors flex-shrink-0"
                                                        title="Editar Viagem"
                                                    >
                                                        <Icons.Edit size={16}/>
                                                    </button>
                                                )}

                                                <button 
                                                    onClick={() => sendBillingMessage(trip)}
                                                    className="px-3 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 transition-colors shadow-lg active:scale-95 flex-shrink-0"
                                                    title="Cobrar no WhatsApp"
                                                >
                                                    <Icons.Phone size={16}/>
                                                </button>
                                                
                                                <button 
                                                    onClick={() => del('trips', trip.id)} 
                                                    className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex-shrink-0"
                                                    title="Excluir Cobrança/Viagem"
                                                >
                                                    <Icons.Trash size={16}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }) : (<div className="text-center py-10 opacity-30 text-sm border-2 border-dashed border-white/10 rounded-xl">Nenhuma viagem registrada em {billingDate.toLocaleDateString('pt-BR', {month:'long'})}.</div>)}
            </div>
        </div>
    );
}
