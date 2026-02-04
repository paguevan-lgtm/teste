
import React, { useState } from 'react';
import { Icons, Button, IconButton } from '../components/Shared';
import { handlePrint, formatDisplayDate, dateAddDays } from '../utils';

export default function Tabela({ data, theme, tableTab, setTableTab, currentOpDate, getTodayDate, analysisDate, setAnalysisDate, analysisRotatedList, tableStatus, editName, tempName, setEditName, setTempName, saveDriverName, updateTableStatus, currentRotatedList, confirmedTimes, isTimeExpired, lousaOrder, sendToLousaKeepConfirmed, handleLousaAction, startLousaTime, draggedItem, handleDragStart, handleDrop, handleTouchStart, handleTouchMove, handleTouchEnd, addMadrugadaVaga, madrugadaList, handleMadrugadaDragStart, handleMadrugadaDrop, removeMadrugadaVaga, toggleMadrugadaRiscado, spList, madrugadaData, openMadrugadaTrip, cannedMessages, addCannedMessage, updateCannedMessage, deleteCannedMessage, handleCannedDragStart, handleCannedDrop, handleGeneralDragStart, handleGeneralDrop, addNullLousaItem, notify, getRotatedList, getRotatedMadrugadaList }: any) {

    let lousaEffectiveIndex = 0;

    // Lógica para determinar qual data de Madrugada mostrar INICIALMENTE
    const isLateDay = new Date().getHours() >= 14;
    const initialMadrugadaDate = (currentOpDate === getTodayDate() && isLateDay) 
        ? dateAddDays(currentOpDate, 1) 
        : currentOpDate;

    // Estado local para navegação da data da madrugada
    const [madrugadaDisplayDate, setMadrugadaDisplayDate] = useState(initialMadrugadaDate);

    // Usa a nova função getRotatedMadrugadaList para calcular a rotação exclusiva da madrugada
    // Se não existir (por algum motivo legado), cai no fallback antigo
    const madrugadaOrderedList = getRotatedMadrugadaList 
        ? getRotatedMadrugadaList(madrugadaDisplayDate) 
        : (getRotatedList ? getRotatedList(madrugadaDisplayDate).filter((d:any) => madrugadaList.includes(d.vaga)) : []);

    // Função auxiliar para filtrar confirmados com segurança
    const getConfirmados = () => {
        if (!currentRotatedList || !tableStatus) return [];
        return currentRotatedList.filter((d:any) => tableStatus[d.vaga] === 'confirmed');
    };

    const confirmadosList = getConfirmados();

    const onPrint = async (targetId: string, filename: string, title: string, options: any = {}) => {
        try {
            await handlePrint(targetId, filename, title, options);
        } catch (error: any) {
            notify(error.message, 'error');
        }
    };

    return (
        <div 
            className="space-y-6 max-w-4xl mx-auto w-full min-h-[70vh]"
        >
            <div id="table-tabs" className="flex p-1 bg-black/20 rounded-xl border border-white/5 gap-1 overflow-x-auto">
                <button onClick={()=>setTableTab('geral')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition-all ${tableTab==='geral' ? theme.primary : 'hover:bg-white/5 opacity-60'}`}>Tabela</button>
                <button onClick={()=>setTableTab('confirmados')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition-all ${tableTab==='confirmados' ? theme.primary : 'hover:bg-white/5 opacity-60'}`}>Confirmados</button>
                <button onClick={()=>setTableTab('lousa')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition-all ${tableTab==='lousa' ? theme.primary : 'hover:bg-white/5 opacity-60'}`}>Lousa</button>
                <button onClick={()=>setTableTab('madrugada')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition-all ${tableTab==='madrugada' ? theme.primary : 'hover:bg-white/5 opacity-60'}`}>Madrugada</button>
                <button onClick={()=>setTableTab('mensagens')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition-all ${tableTab==='mensagens' ? theme.primary : 'hover:bg-white/5 opacity-60'}`}>Mensagens</button>
            </div>
            
            {tableTab === 'geral' && (
                <div className={`${theme.card} p-5 rounded-xl border ${theme.border} anim-fade`}>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-lg font-bold opacity-80">Tabela Geral</h3>
                        <div className="flex items-center gap-2 bg-black/30 p-1 rounded-lg">
                            <button onClick={() => setAnalysisDate(dateAddDays(analysisDate, -1))} className="p-2 hover:bg-white/10 rounded-md"><Icons.ChevronLeft size={20}/></button>
                            <div className="px-4 font-mono font-bold text-sm">{formatDisplayDate(analysisDate)}</div>
                            <button onClick={() => setAnalysisDate(dateAddDays(analysisDate, 1))} className="p-2 hover:bg-white/10 rounded-md"><Icons.ChevronRight size={20}/></button>
                            <button onClick={() => setAnalysisDate(currentOpDate)} className="ml-2 text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20">{currentOpDate === getTodayDate() ? 'Hoje' : 'Amanhã (Op)'}</button>
                            <button onClick={() => onPrint('print-tabela-list', 'Tabela_Geral', 'TABELA GERAL', { forceCols: 2, date: analysisDate })} className="ml-4 p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors" title="Salvar como Imagem (2 Colunas)"><Icons.Print size={20}/></button>
                        </div>
                    </div>
                    {analysisDate === currentOpDate && <p className="text-xs opacity-50 mb-3 text-center hide-on-print">Arraste os itens para reorganizar a tabela de hoje.</p>}
                    <div id="print-tabela-list" className="space-y-2">
                        {analysisRotatedList && analysisRotatedList.length > 0 ? analysisRotatedList.map((driver:any, idx:number) => {
                            const isOperational = analysisDate === currentOpDate;
                            const status = isOperational ? tableStatus[driver.vaga] : null; 
                            const isDraggingThis = draggedItem?.index === idx && draggedItem?.listType === 'geral';
                            
                            return (
                                <div 
                                    key={driver.vaga || `row-${idx}`} 
                                    draggable={isOperational}
                                    onDragStart={(e) => isOperational && handleGeneralDragStart(e, idx)}
                                    onDragOver={(e:any) => isOperational && e.preventDefault()}
                                    onDrop={(e) => isOperational && handleGeneralDrop(e, idx)}
                                    onTouchStart={(e) => isOperational && handleTouchStart(e, idx, 'geral')}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={(e) => { 
                                        if(!isOperational) return;
                                        const touch = e.changedTouches[0]; 
                                        const target = document.elementFromPoint(touch.clientX, touch.clientY); 
                                        const closest = target ? target.closest('.draggable-item') : null; 
                                        if (closest) { 
                                            const parent = closest.parentNode; 
                                            const dropIndex = Array.from(parent!.children).indexOf(closest as HTMLElement); 
                                            handleTouchEnd(e, dropIndex, 'geral'); 
                                        } else { 
                                            handleTouchEnd(e, -1, 'geral'); 
                                        } 
                                    }}
                                    className={`p-3 rounded-lg border ${theme.border} flex flex-col sm:flex-row sm:items-center justify-between transition-colors gap-3 ${isDraggingThis ? 'opacity-50 border-blue-500 scale-105 shadow-2xl z-50 bg-blue-900/40' : 'bg-white/5 hover:bg-white/10'} ${isOperational ? 'draggable-item cursor-grab active:cursor-grabbing' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-mono text-sm font-bold opacity-70 flex-shrink-0 leading-none pt-[1px]">{driver.vaga}</div>
                                        <div className="flex items-center gap-2">
                                            {editName === driver.vaga ? (
                                                <div className="flex gap-1 hide-on-print">
                                                    <input className="bg-black/50 border border-white/20 rounded px-2 py-1 text-sm w-32 outline-none focus:border-white/50" value={tempName} onChange={e=>setTempName(e.target.value)} autoFocus />
                                                    <button onClick={()=>saveDriverName(driver.vaga)} className="text-green-400 hover:text-green-300"><Icons.CheckCircle size={18}/></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-lg">{driver.name}</span>
                                                    <button onClick={()=>{setEditName(driver.vaga); setTempName(driver.name)}} className="opacity-20 hover:opacity-100 transition-opacity hide-on-print"><Icons.Edit3 size={14}/></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {isOperational && (<div className="flex items-center gap-2 hide-on-print">{!status ? (<><button onClick={() => updateTableStatus(driver.vaga, 'confirmed')} className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"><Icons.CheckCircle size={14}/> Confirmar</button><button onClick={() => updateTableStatus(driver.vaga, 'lousa')} className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"><Icons.List size={14}/> Lousa</button></>) : (<div className="flex items-center gap-2"><span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border flex items-center gap-1 ${status==='confirmed'?'text-green-400 border-green-500/30 bg-green-500/10':'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'}`}>{status === 'confirmed' ? <Icons.CheckCircle size={10}/> : <Icons.List size={10}/>}{status === 'confirmed' ? 'Confirmado' : 'Na Lousa'}</span><button onClick={() => updateTableStatus(driver.vaga, null)} className="p-1 text-red-400 opacity-50 hover:opacity-100" title="Remover status"><Icons.X size={14}/></button></div>)}</div>)}
                                </div>
                            );
                        }) : <div className="text-center py-4 opacity-50">Nenhum motorista na lista.</div>}
                    </div>
                </div>
            )}

            {/* ABA CONFIRMADOS */}
            {tableTab === 'confirmados' && (
                <div className="flex flex-col gap-4 anim-fade">
                    <div className={`${theme.card} p-5 rounded-xl border ${theme.border} border-green-500/30 relative overflow-hidden`}>
                        <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-2 relative z-10">
                            <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> CONFIRMADOS
                            </h3>
                            <button onClick={() => onPrint('print-confirmados-list', 'Confirmados', 'LISTA DE CONFIRMADOS', { mode: 'confirmados', date: currentOpDate })} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white relative z-20" title="Salvar como Imagem"><Icons.Print size={18}/></button>
                        </div>
                        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none z-0"><Icons.CheckCircle size={64}/></div>
                        
                        <div id="print-confirmados-list" className="space-y-2 min-h-[100px] relative z-10">
                            {confirmadosList.length > 0 ? confirmadosList.map((driver:any) => {
                                const timeStr = confirmedTimes?.[driver.vaga];
                                const expired = isTimeExpired ? isTimeExpired(timeStr) : false;
                                const isInLousa = lousaOrder ? lousaOrder.some((i:any) => i.vaga === driver.vaga) : false;
                                
                                return (
                                    <div key={driver.vaga} className={`flex justify-between items-center p-2 rounded-lg border transition-all ${expired ? 'bg-red-900/10 border-red-500/20 opacity-80' : 'bg-black/20 border-white/5'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`font-mono text-sm w-8 h-7 rounded flex items-center justify-center flex-shrink-0 leading-none pt-[1px] ${expired ? 'bg-red-500/20 text-red-300' : 'bg-green-900/50 text-green-200'}`}>{driver.vaga}</div>
                                            <span className={`font-bold text-base ${expired ? 'line-through opacity-60' : ''}`}>{driver.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-mono font-bold text-lg ${expired ? 'text-red-400 decoration-red-500 line-through' : 'text-green-400'}`}>{timeStr || '--:--'}</span>
                                            {expired ? (
                                                isInLousa ? (
                                                    <span className="text-[10px] font-bold text-yellow-500/70 uppercase border border-yellow-500/30 px-2 py-1 rounded bg-yellow-500/10 hide-on-print">Na Lousa</span>
                                                ) : (
                                                    <button onClick={() => sendToLousaKeepConfirmed(driver.vaga)} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-bold hover:bg-yellow-500/30 transition-colors shadow-lg animate-pulse hide-on-print">
                                                        Mover p/ Lousa
                                                    </button>
                                                )
                                            ) : (
                                                <button onClick={() => handleLousaAction(null, 'remove_all', driver.vaga)} className="text-red-400 hover:text-red-300 transition-colors p-1 hide-on-print"><Icons.X size={14}/></button>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) : <div className="text-center opacity-30 text-sm py-10">Nenhum confirmado</div>}
                        </div>
                    </div>
                </div>
            )}
            
            {tableTab === 'lousa' && (
                <div className={`${theme.card} p-3 md:p-5 rounded-xl border ${theme.border} border-yellow-500/30 relative anim-fade`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-white/10 pb-2 gap-3 sm:gap-0 relative z-10">
                        <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> LOUSA</h3>
                        <div className="flex w-full sm:w-auto justify-end items-center gap-2">
                            <button 
                                onClick={addNullLousaItem} 
                                className="p-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-1 font-bold text-xs" 
                                title="Adicionar Pulo de Horário"
                            >
                                <Icons.Plus size={16}/> Pular Horário
                            </button>
                            <button onClick={() => onPrint('print-lousa-list', 'Lousa', 'LOUSA / FILA', { mode: 'lousa', date: currentOpDate })} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white relative z-20" title="Salvar como Imagem"><Icons.Print size={18}/></button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none z-0"><Icons.List size={64}/></div>
                    
                    <p className="text-xs opacity-50 mb-3 hide-on-print relative z-10">Segure o item por 1 segundo para arrastar.</p>
                    <div id="print-lousa-list" className="space-y-2 min-h-[300px] relative z-10">
                        {lousaOrder && lousaOrder.map((item:any, index:number) => { 
                            const vaga = item.vaga; 
                            const isNullItem = item.isNull;
                            const driver = isNullItem ? { name: "🚫 HORÁRIO VAGO" } : (spList.find((d:any) => d.vaga === vaga) || { name: '' }); 
                            const isRiscado = item.riscado; 
                            const isBaixou = item.baixou;
                            
                            let displayContent = '---'; 
                            let isExpired = false;
                            let timeClass = 'text-yellow-400';

                            if (isBaixou) {
                                displayContent = 'BAIXOU';
                                timeClass = 'text-orange-500 font-bold';
                                // Note: We do NOT increment lousaEffectiveIndex when "Baixou", effectively skipping the time slot calculation for this row
                            } else if (isRiscado) {
                                displayContent = 'RISCOU';
                                timeClass = 'text-red-500 font-bold';
                            } else if (!isNullItem) {
                                const t = new Date(startLousaTime.getTime() + lousaEffectiveIndex * 30 * 60000); 
                                displayContent = t.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}); 
                                isExpired = isTimeExpired ? isTimeExpired(displayContent) : false;
                                if (isExpired) timeClass = 'text-red-400 decoration-red-500 line-through';
                                lousaEffectiveIndex++; 
                            } else {
                                // isNullItem
                                const t = new Date(startLousaTime.getTime() + lousaEffectiveIndex * 30 * 60000); 
                                displayContent = t.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                                timeClass = 'opacity-50 decoration-white/30 line-through';
                                lousaEffectiveIndex++;
                            }
                            
                            const isDraggingThis = draggedItem?.index === index && draggedItem?.listType === 'lousa'; 
                            
                            return ( 
                                <div 
                                    key={item.uid} 
                                    draggable="true" 
                                    onDragStart={(e) => handleDragStart(e, index)} 
                                    onDragOver={(e:any) => e.preventDefault()} 
                                    onDrop={(e) => handleDrop(e, index)} 
                                    onTouchStart={(e) => handleTouchStart(e, index, 'lousa')} 
                                    onTouchMove={handleTouchMove} 
                                    onTouchEnd={(e) => { 
                                        const touch = e.changedTouches[0]; 
                                        const target = document.elementFromPoint(touch.clientX, touch.clientY); 
                                        const closest = target ? target.closest('.draggable-item') : null; 
                                        if (closest) { 
                                            const parent = closest.parentNode; 
                                            const dropIndex = Array.from(parent!.children).indexOf(closest as HTMLElement); 
                                            handleTouchEnd(e, dropIndex, 'lousa'); 
                                        } else { 
                                            handleTouchEnd(e, -1, 'lousa'); 
                                        } 
                                    }} 
                                    className={`flex justify-between items-center p-2 rounded-lg border draggable-item ${isDraggingThis ? 'opacity-50 border-yellow-500 scale-105 shadow-2xl z-50 bg-yellow-900/40' : ''} ${isExpired ? 'bg-red-900/10 border-red-500/20 opacity-80' : (isRiscado ? 'bg-red-900/10 border-red-500/20 opacity-60' : (isBaixou ? 'bg-orange-900/10 border-orange-500/20 opacity-70' : 'bg-black/20 border-white/5'))}`}
                                > 
                                    <div className="flex items-center gap-3 min-w-0 flex-1"> 
                                        {!isNullItem && <div className={`font-mono text-xs w-8 h-7 rounded flex items-center justify-center flex-shrink-0 leading-none pt-[1px] ${isExpired ? 'bg-red-500/20 text-red-300' : 'bg-white/10 opacity-70'}`}>{vaga}</div>} 
                                        <span className={`font-bold text-base truncate ${isRiscado || isExpired || isBaixou ? 'line-through' : ''} ${isExpired || isBaixou ? 'opacity-60' : ''}`}>{driver.name}</span> 
                                    </div> 
                                    <div className="flex items-center gap-1.5 flex-shrink-0"> 
                                        <span className={`font-mono font-bold text-lg mr-1 ${timeClass}`}>{displayContent}</span> 
                                        
                                        {!isNullItem && !isRiscado && !isBaixou && (
                                            <>
                                                <button onClick={() => handleLousaAction(item.uid, 'baixar', vaga)} className="p-1.5 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 hide-on-print flex-shrink-0" title="Baixar vaga"> <Icons.ArrowDown size={10}/> </button>
                                                <button onClick={() => handleLousaAction(item.uid, 'duplicate', vaga)} className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 hide-on-print flex-shrink-0" title="Duplicar vaga"> <Icons.Plus size={10}/> </button>
                                            </>
                                        )} 
                                        
                                        {!isBaixou && (
                                            <button onClick={() => handleLousaAction(item.uid, 'riscar', vaga)} className={`p-1.5 bg-white/5 rounded hover:bg-white/10 text-white hide-on-print flex-shrink-0 ${isRiscado ? 'text-red-500 bg-red-500/10' : ''}`} title="Riscar"> 
                                                <Icons.Slash size={10}/> 
                                            </button> 
                                        )}
                                        
                                        <button onClick={() => handleLousaAction(item.uid, 'remove', vaga)} className="p-1.5 bg-white/5 rounded hover:bg-red-500/20 text-red-400 hide-on-print flex-shrink-0" title="Remover"><Icons.X size={12}/></button> 
                                    </div> 
                                </div> 
                            ); 
                        })} 
                        {(!lousaOrder || lousaOrder.length === 0) && <div className="text-center opacity-30 text-sm py-10">Lousa vazia</div>} 
                    </div>
                </div>
            )}
            
            {tableTab === 'madrugada' && (
                <div className={`${theme.card} p-3 md:p-5 rounded-xl border ${theme.border} anim-fade overflow-hidden`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3 md:gap-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold flex items-center gap-2"><Icons.Moon size={20}/> Madrugada</h3>
                            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg ml-2">
                                <button onClick={() => setMadrugadaDisplayDate(dateAddDays(madrugadaDisplayDate, -1))} className="p-1.5 hover:bg-white/10 rounded-md"><Icons.ChevronLeft size={16}/></button>
                                <div className="px-2 font-mono font-bold text-xs">{formatDisplayDate(madrugadaDisplayDate)}</div>
                                <button onClick={() => setMadrugadaDisplayDate(dateAddDays(madrugadaDisplayDate, 1))} className="p-1.5 hover:bg-white/10 rounded-md"><Icons.ChevronRight size={16}/></button>
                                <button onClick={() => setMadrugadaDisplayDate(initialMadrugadaDate)} className="ml-1 text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20">Hoje</button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center justify-between md:justify-end w-full md:w-auto">
                            <Button theme={theme} onClick={addMadrugadaVaga} icon={Icons.Plus} size="sm" variant="success">Adicionar Motorista</Button>
                            
                            <div className="flex items-center gap-2">
                                <button onClick={() => onPrint('print-madrugada-list', 'Madrugada', 'MADRUGADA', { mode: 'madrugada', date: madrugadaDisplayDate })} className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors" title="Salvar como Imagem"><Icons.Print size={18}/></button>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs opacity-50 mb-3 hide-on-print">Planejamento para a madrugada do dia {formatDisplayDate(madrugadaDisplayDate)}.</p>
                    <div id="print-madrugada-list" className="space-y-2">
                        {/* USANDO LISTA ORDENADA AUTOMATICAMENTE COM BASE NA DATA SELECIONADA */}
                        {madrugadaOrderedList && madrugadaOrderedList.length > 0 ? madrugadaOrderedList.map((driver:any, index:number) => { 
                            const vaga = driver.vaga;
                            const mData = madrugadaData[vaga] || { qtd: '', time: '', riscado: false, comment: '' }; 
                            const isDraggingThis = draggedItem?.index === index && draggedItem?.listType === 'madrugada'; 
                            
                            // Busca viagem específica para a data selecionada
                            const tripId = `mad_${madrugadaDisplayDate}_${vaga}`;
                            const trip = data.trips.find((t:any) => t.id === tripId || (t.isMadrugada && t.vaga === vaga && t.date === madrugadaDisplayDate && t.status !== 'Cancelada'));
                            const isCancelled = trip && trip.status === 'Cancelada';
                            const isFinished = trip && trip.status === 'Finalizada';
                            
                            const displayTime = trip ? trip.time : (madrugadaDisplayDate === currentOpDate ? mData.time : '');
                            const displayQtd = trip ? (trip.pCountSnapshot || trip.pCount) : (madrugadaDisplayDate === currentOpDate ? mData.qtd : '');

                            let rowClass = `flex flex-col md:flex-row items-center gap-2 p-3 rounded-lg border draggable-item cursor-grab active:cursor-grabbing`;
                            if (isCancelled) rowClass += ` bg-red-900/10 border-red-500/30 opacity-70`;
                            else if (isFinished) rowClass += ` bg-green-900/10 border-green-500/30`;
                            else rowClass += ` bg-black/20 border-white/5`;
                            
                            if (isDraggingThis) rowClass += ` opacity-50 border-indigo-500 scale-105 shadow-2xl z-50 bg-indigo-900/40`;

                            return ( 
                                <div key={`${vaga}-${index}`} draggable="true" onDragStart={(e) => handleMadrugadaDragStart(e, index)} onDragOver={(e:any) => e.preventDefault()} onDrop={(e) => handleMadrugadaDrop(e, index)} onTouchStart={(e) => handleTouchStart(e, index, 'madrugada')} onTouchMove={handleTouchMove} onTouchEnd={(e) => { const touch = e.changedTouches[0]; const target = document.elementFromPoint(touch.clientX, touch.clientY); const closest = target ? target.closest('.draggable-item') : null; if (closest) { const parent = closest.parentNode; const dropIndex = Array.from(parent!.children).indexOf(closest as HTMLElement); handleTouchEnd(e, dropIndex, 'madrugada'); } else { handleTouchEnd(e, -1, 'madrugada'); } }} className={rowClass}> 
                                    <div className="flex items-center gap-3 w-full md:w-auto flex-1 relative min-w-0"> 
                                        <div className="opacity-30 cursor-grab hide-on-print flex-shrink-0"><Icons.List size={14}/></div> 
                                        <button onClick={() => removeMadrugadaVaga(vaga)} className="text-red-400 opacity-50 hover:opacity-100 hide-on-print flex-shrink-0"><Icons.Trash size={14}/></button> 
                                        <button onClick={() => toggleMadrugadaRiscado(vaga)} className={`p-1 rounded hover:bg-white/10 flex-shrink-0 ${mData.riscado ? 'text-red-400' : 'text-white/30'} hide-on-print`}> <Icons.Slash size={14}/> </button> 
                                        <div className="font-mono text-sm bg-indigo-500/20 text-indigo-300 w-[35px] h-[30px] rounded flex items-center justify-center flex-shrink-0 leading-none pt-[1px]">{vaga}</div> 
                                        <div className="flex flex-row items-center gap-2 min-w-0 flex-1"> 
                                            <span className={`font-bold text-lg truncate ${mData.riscado || isCancelled ? 'line-through opacity-50' : ''}`}>{driver.name}</span> 
                                            {isCancelled && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase font-bold">Cancelada</span>}
                                            {isFinished && <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded uppercase font-bold">Finalizada</span>}
                                            {mData.riscado && mData.comment && ( <div className="text-[12px] text-red-300 bg-red-900/30 px-2 py-1 rounded w-fit flex items-center justify-center leading-none truncate max-w-full relative top-[3px] font-bold">{mData.comment}</div> )} 
                                        </div> 
                                    </div> 
                                    {!mData.riscado && ( 
                                        <div className="flex items-center gap-2 w-full md:w-auto md:justify-end flex-shrink-0 mt-2 md:mt-0"> 
                                            <div className="flex gap-2 hide-on-print w-full md:w-auto items-center">
                                                <div className="bg-black/30 border border-white/10 rounded px-3 py-2 w-full md:w-20 text-center text-white/70">
                                                    {displayQtd || '-'}
                                                </div>
                                                <div className="bg-black/30 border border-white/10 rounded px-3 py-2 w-full md:w-32 text-center text-white/70 text-sm">
                                                    {displayTime || '-'}
                                                </div>
                                                
                                                <button 
                                                    onClick={() => openMadrugadaTrip(vaga, madrugadaDisplayDate)}
                                                    className="p-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 rounded-lg transition-colors font-bold text-xs flex items-center gap-1"
                                                    title="Editar Viagem"
                                                >
                                                    <Icons.Edit size={14}/> Gerenciar
                                                </button>
                                            </div>
                                            <div className="show-on-print hidden font-bold text-indigo-200 text-lg"> 
                                                <span>{displayTime}</span> 
                                                {displayQtd && <span className="ml-2 opacity-70">({displayQtd})</span>} 
                                            </div> 
                                        </div> 
                                    )} 
                                </div> 
                            ); 
                        }) : <div className="text-center opacity-30 text-sm py-4">Nenhuma vaga na madrugada para esta data.</div>} 
                    </div>
                </div>
            )}

            {tableTab === 'mensagens' && (
                <div className={`${theme.card} p-5 rounded-xl border ${theme.border} anim-fade`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2"><Icons.Message size={20}/> Mensagens Prontas</h3>
                        <Button theme={theme} onClick={addCannedMessage} icon={Icons.Plus} size="sm">Nova Mensagem</Button>
                    </div>
                    <div className="space-y-3">
                        {cannedMessages && cannedMessages.length > 0 ? cannedMessages.map((msg:any, index:number) => (
                            <div 
                                key={msg.id} 
                                draggable="true"
                                onDragStart={(e) => handleCannedDragStart(e, index)}
                                onDragOver={(e:any) => e.preventDefault()}
                                onDrop={(e) => handleCannedDrop(e, index)}
                                className={`draggable-item p-4 rounded-lg border ${theme.border} bg-white/5 flex flex-col gap-2 hover:bg-white/10 transition-colors`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="cursor-grab opacity-30 hover:opacity-100"><Icons.List size={14}/></div>
                                        <input 
                                            className="bg-transparent font-bold text-sm w-full outline-none border-b border-transparent focus:border-white/20 transition-colors" 
                                            value={msg.title} 
                                            onChange={(e) => updateCannedMessage(msg.id, 'title', e.target.value)}
                                            placeholder="Título da Mensagem"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { navigator.clipboard.writeText(msg.text); notify("Copiado!", "success"); }} className="p-2 hover:bg-white/10 rounded text-blue-400" title="Copiar"><Icons.Copy size={16}/></button>
                                        <button onClick={() => deleteCannedMessage(msg.id)} className="p-2 hover:bg-red-500/20 rounded text-red-400" title="Excluir"><Icons.Trash size={16}/></button>
                                    </div>
                                </div>
                                <textarea 
                                    className="bg-black/20 w-full rounded-lg p-2 text-xs opacity-80 min-h-[60px] outline-none border border-transparent focus:border-white/10 transition-colors resize-y"
                                    value={msg.text}
                                    onChange={(e) => updateCannedMessage(msg.id, 'text', e.target.value)}
                                    placeholder="Texto da mensagem..."
                                />
                            </div>
                        )) : <div className="text-center opacity-30 text-sm py-10">Nenhuma mensagem salva.</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
