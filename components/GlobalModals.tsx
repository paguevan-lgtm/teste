
import React from 'react';
import { Icons, Input, Button } from './Shared';
import { getTodayDate } from '../utils';
import { BAIRROS } from '../constants';

export const GlobalModals = ({
    modal,
    setModal,
    aiModal,
    setAiModal,
    aiInput,
    setAiInput,
    isListening,
    toggleMic,
    handleSmartCreate,
    aiLoading,
    theme,
    themeKey,
    formData,
    setFormData,
    suggestedTrip,
    setSuggestedTrip,
    searchId,
    setSearchId,
    addById,
    autoFill,
    removePax,
    confirmTrip,
    simulate,
    save,
    data,
    spList,
    madrugadaList,
    tempVagaMadrugada,
    setTempVagaMadrugada,
    confirmAddMadrugadaVaga,
    vagaToBlock,
    tempJustification,
    setTempJustification,
    confirmMadrugadaBlock,
    saveExtraCharge,
    showNewsModal,
    latestNews,
    markNewsAsSeen
}: any) => {

    if (showNewsModal && latestNews) {
        return (
            <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/90 p-4">
                 <div className={`${theme.card} w-full max-w-lg p-6 rounded-2xl border ${theme.border} shadow-2xl relative animate-bounce-in`}>
                    <div className="absolute -top-6 -left-6 bg-amber-500 text-white p-3 rounded-full shadow-lg">
                        <Icons.Bell size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-1 mt-2 text-amber-400">Novidades!</h2>
                    <p className="text-xs opacity-60 mb-4 uppercase tracking-widest">{latestNews.date}</p>
                    
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                        <h3 className="font-bold text-lg mb-2">{latestNews.title}</h3>
                        <p className="text-sm opacity-90 whitespace-pre-wrap leading-relaxed">{latestNews.content}</p>
                    </div>
                    
                    <Button theme={theme} onClick={markNewsAsSeen} className="w-full">Entendi</Button>
                 </div>
            </div>
        );
    }

    if (aiModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                <div className={`${theme.card} w-full max-w-lg p-6 rounded-2xl border ${theme.border} shadow-2xl`}>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Icons.Stars className="text-amber-400"/> Cadastro Mágico</h3>
                    <p className="text-sm opacity-60 mb-4">Fale ou digite (ex: "João vai pro Boqueirão pagando Pix")</p>
                    
                    <textarea 
                        className="w-full h-32 bg-black/20 p-4 rounded-xl border border-white/10 mb-4 text-base text-white outline-none focus:border-white/30 transition-colors" 
                        value={aiInput} 
                        onChange={(e:any)=>setAiInput(e.target.value)} 
                        placeholder="Digite aqui..."
                    ></textarea>
                    
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={toggleMic} 
                            className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-white/10 hover:bg-white/20'}`}
                        >
                            <Icons.Mic size={24}/>
                        </button>
                        <div className="flex gap-3">
                            <button onClick={()=>setAiModal(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-bold text-sm">Cancelar</button>
                            <button 
                                onClick={handleSmartCreate} 
                                disabled={aiLoading}
                                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-lg font-bold text-white shadow-lg flex items-center gap-2"
                            >
                                {aiLoading ? 'Processando...' : <><Icons.Stars size={16}/> Criar Mágica</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div> 
        );
    }

    if (!modal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
            <div className={`${theme.card} w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-xl rounded-t-3xl md:rounded-2xl border ${theme.border} shadow-2xl flex flex-col page-transition`}>
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
                    <h2 className="text-xl font-bold">{modal==='trip'?'Criar Viagem':modal==='passenger'?'Passageiro':modal==='driver'?'Motorista':modal==='lostFound'?'Perdido & Achado':modal==='reschedule'?'Reagendar':modal==='extraCharge'?'Carro Extra':modal==='madrugadaVaga'?'Vaga Madrugada':modal==='madrugadaBlock'?'Bloquear Vaga':''}</h2>
                    <button onClick={()=>setModal(null)} className="opacity-50"><Icons.X size={24}/></button>
                </div>
                <div className="flex-1 scroll-y p-6 space-y-5 pb-10">
                    <div className={modal === 'reschedule' || modal === 'driver' ? 'hidden' : ''}>
                        <Input theme={theme} label="Data" type="date" value={formData.date || getTodayDate()} onChange={(e:any)=>setFormData({...formData, date:e.target.value})} />
                    </div>
                    
                    {modal === 'extraCharge' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm text-purple-200">Aqui você cria lembretes para quando carros extras levarem passageiros você ter controle.</div>
                            <Input theme={theme} label="WhatsApp (Opcional)" placeholder="Ex: 13999999999" value={formData.phone || ''} onChange={(e:any)=>setFormData({...formData, phone:e.target.value})} />
                            <div className="grid grid-cols-2 gap-4"><Input theme={theme} label="Valor (R$)" type="number" placeholder="0,00" value={formData.value || ''} onChange={(e:any)=>setFormData({...formData, value:e.target.value})} /><Input theme={theme} label="Data" type="date" value={formData.date} onChange={(e:any)=>setFormData({...formData, date:e.target.value})} /></div>
                            <div className="flex flex-col gap-1.5"><label className="text-xs font-bold opacity-60 ml-1">Observação</label><textarea className="bg-black/10 border border-white/10 text-white rounded-xl px-4 py-3.5 w-full outline-none focus:border-white/50 transition-colors h-24 resize-none" placeholder="Ex: Carro do João, levou 3 pessoas do Forte..." value={formData.notes || ''} onChange={(e:any)=>setFormData({...formData, notes:e.target.value})} /></div>
                            <div className="pt-4"><Button theme={theme} onClick={saveExtraCharge} icon={Icons.Check} className="w-full">Salvar Cobrança</Button></div>
                        </div>
                    )}

                    {modal === 'passenger' && (<><Input themeKey={themeKey} label="Nome" value={formData.name||''} onChange={(e:any)=>setFormData({...formData, name:e.target.value})} /><Input themeKey={themeKey} label="Telefone" type="tel" value={formData.phone||''} onChange={(e:any)=>setFormData({...formData, phone:e.target.value})} /><Input themeKey={themeKey} label="Endereço" value={formData.address||''} onChange={(e:any)=>setFormData({...formData, address:e.target.value})} /><div className="flex flex-col gap-1.5"><label className="text-xs font-bold opacity-60 ml-1">Bairro</label><select className="bg-black/10 border border-white/10 text-white rounded-xl px-4 py-3.5 h-14" value={formData.neighborhood} onChange={(e:any)=>setFormData({...formData, neighborhood:e.target.value})}>{BAIRROS.map(b=><option key={b} value={b} className="bg-slate-900">{b}</option>)}</select></div><Input themeKey={themeKey} label="Referência" value={formData.reference||''} onChange={(e:any)=>setFormData({...formData, reference:e.target.value})} /><div className="grid grid-cols-2 gap-4"><Input themeKey={themeKey} label="Horário (ex: 17:30)" type="time" value={formData.time||''} onChange={(e:any)=>setFormData({...formData, time:e.target.value})} /><Input themeKey={themeKey} label="Qtd Pax" type="number" value={formData.passengerCount||''} onChange={(e:any)=>setFormData({...formData, passengerCount:e.target.value})} /></div><Input themeKey={themeKey} label="Qtd Malas" type="number" value={formData.luggageCount||''} onChange={(e:any)=>setFormData({...formData, luggageCount:e.target.value})} /><div className="flex flex-col gap-1.5"><label className="text-xs font-bold opacity-60 ml-1">Pagamento</label><select className="bg-black/10 border border-white/10 text-white rounded-xl px-4 py-3.5 h-14" value={formData.payment} onChange={(e:any)=>setFormData({...formData, payment:e.target.value})}>{['Dinheiro','Pix','Cartão'].map(x=><option key={x} value={x} className="bg-slate-900">{x}</option>)}</select></div><div className="flex flex-col gap-1.5"><label className="text-xs font-bold opacity-60 ml-1">Status</label><select className="bg-black/10 border border-white/10 text-white rounded-xl px-4 py-3.5 h-14" value={formData.status} onChange={(e:any)=>setFormData({...formData, status:e.target.value})}>{['Ativo','Inativo'].map(x=><option key={x} value={x} className="bg-slate-900">{x}</option>)}</select></div><div className="pt-4"><Button themeKey={themeKey} onClick={()=>save('passengers')}>Salvar</Button></div></>)}
                    
                    {modal === 'trip' && (
                        <>
                            {!suggestedTrip ? (
                                <div className="space-y-6">
                                    <div className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-colors border ${formData.isMadrugada ? 'bg-indigo-500/20 border-indigo-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`} onClick={() => setFormData((prev:any) => ({...prev, isMadrugada: !prev.isMadrugada, driverId: ''}))}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isMadrugada ? 'bg-indigo-500 border-indigo-500' : 'border-white/30'}`}>{formData.isMadrugada && <Icons.Check size={14} className="text-white"/>}</div>
                                        <div><div className={`font-bold text-sm ${formData.isMadrugada ? 'text-indigo-300' : 'text-white'}`}>Viagem da Madrugada</div><div className="text-xs opacity-50">Filtra motoristas da tabela de madrugada</div></div>
                                    </div>
                                    <div className="flex flex-col gap-1.5"><label className="text-xs font-bold opacity-60 ml-1">Motorista</label><select className="bg-black/10 border border-white/10 text-white rounded-xl px-4 py-3.5 h-14" value={formData.driverId||''} onChange={(e:any)=>setFormData({...formData, driverId:e.target.value})}>
                                        <option value="" className="bg-slate-900">Selecione...</option>
                                        {data.drivers.filter((d:any) => { if (formData.isMadrugada) { const sp = spList.find((s:any) => s.name.toLowerCase() === d.name.toLowerCase()); return sp && madrugadaList.includes(sp.vaga); } return d.status==='Ativo'; }).map((d:any) => { let label = `${d.name} (${d.capacity} lug)`; if (formData.isMadrugada) { const sp = spList.find((s:any) => s.name.toLowerCase() === d.name.toLowerCase()); if (sp) label = `[Vaga ${sp.vaga}] ${label}`; } return <option key={d.id} value={d.id} className="bg-slate-900">{label}</option>; })}
                                    </select></div>
                                    {formData.isMadrugada ? (<div className="flex flex-col gap-1.5"><label className="text-xs font-bold opacity-60 ml-1">Horário</label><select className="bg-black/10 border border-white/10 text-white rounded-xl px-4 py-3.5 h-14" value={formData.time || ''} onChange={(e:any)=>setFormData({...formData, time:e.target.value})}><option value="" className="bg-slate-900">Selecione...</option><option value="04:00/04:45" className="bg-slate-900">4:00 as 4:45</option><option value="05:00/05:45" className="bg-slate-900">5:00 as 5:45</option><option value="06:00/06:45" className="bg-slate-900">6:00 as 6:45</option></select></div>) : (<Input themeKey={themeKey} label="Horário (ex: 17:30)" type="time" value={formData.time||''} onChange={(e:any)=>setFormData({...formData, time:e.target.value})} />)}
                                    <Button themeKey={themeKey} onClick={simulate} icon={Icons.Zap}>Gerar Rota</Button>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full"><div className="bg-black/10 p-5 rounded-xl border border-white/10 flex-1 flex flex-col"><div className="flex flex-col gap-1 mb-4"><label className="text-xs font-bold opacity-60">Motorista</label><div className="bg-black/20 border border-white/10 text-white rounded-xl px-3 py-2 w-full font-bold opacity-70">{suggestedTrip.driver.name}</div></div><div className="flex justify-between items-center mb-4"><span className="font-bold text-lg">Resumo</span><span className={`text-sm px-3 py-1 rounded-full font-bold ${suggestedTrip.occupancy > suggestedTrip.driver.capacity ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{suggestedTrip.occupancy} / {suggestedTrip.driver.capacity}</span></div><div className="flex gap-2 mb-4"><input className="bg-black/20 border border-white/10 rounded-xl px-4 flex-1 h-12" placeholder="ID Passageiro" value={searchId} onChange={(e:any)=>setSearchId(e.target.value)} /><button onClick={addById} className="bg-white/10 px-4 rounded-xl font-bold h-12">Add</button></div><button onClick={autoFill} className={`w-full mb-4 py-3 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 active:bg-white/10 anim-fade ${theme.accent}`}><Icons.Refresh size={20}/> 🤖 Puxar Passageiros (Auto)</button><div className="space-y-3 overflow-y-auto flex-1 pr-1 scroll-y max-h-[35vh]">{suggestedTrip.passengers.map((p:any, i:number) => (<div key={p.id} className={`${theme.bg} p-3 rounded-xl border ${theme.border} flex justify-between items-center shadow-sm`}><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${theme.primary}`}>{i+1}</div><div><div className="text-base font-bold">{p.name}</div><div className="text-xs opacity-60">{p.neighborhood}</div></div></div><div className="flex items-center gap-3"><span className={`${theme.accent} font-bold text-base`}>{p.passengerCount}p</span><button onClick={()=>removePax(p.id)} className="text-red-400 p-2"><Icons.Trash size={20}/></button></div></div>))}</div></div><div className="grid grid-cols-2 gap-3 pt-4"><Button themeKey={themeKey} variant="secondary" onClick={()=>setSuggestedTrip(null)}>Voltar</Button><Button themeKey={themeKey} onClick={confirmTrip} variant="success">Confirmar</Button></div></div>
                            )}
                        </>
                    )}

                    {modal === 'driver' && (<><Input themeKey={themeKey} label="Nome" value={formData.name||''} onChange={(e:any)=>setFormData({...formData, name:e.target.value})} /><Input themeKey={themeKey} label="Telefone" type="tel" value={formData.phone||''} onChange={(e:any)=>setFormData({...formData, phone:e.target.value})} /><div className="grid grid-cols-2 gap-4"><Input themeKey={themeKey} label="Placa" value={formData.plate||''} onChange={(e:any)=>setFormData({...formData, plate:e.target.value})} /><Input themeKey={themeKey} label="Capacidade" type="number" value={formData.capacity||''} onChange={(e:any)=>setFormData({...formData, capacity:e.target.value})} /></div><div className="grid grid-cols-2 gap-4"><Input themeKey={themeKey} label="CNH" value={formData.cnh||''} onChange={(e:any)=>setFormData({...formData, cnh:e.target.value})} /><Input themeKey={themeKey} label="Validade CNH" type="date" value={formData.cnhValidity||''} onChange={(e:any)=>setFormData({...formData, cnhValidity:e.target.value})} /></div><div className="flex flex-col gap-1.5"><label className="text-xs font-bold opacity-60 ml-1">Status</label><select className="bg-black/10 border border-white/10 text-white rounded-xl px-4 py-3.5 h-14" value={formData.status} onChange={(e:any)=>setFormData({...formData, status:e.target.value})}>{['Ativo','Inativo'].map(x=><option key={x} value={x} className="bg-slate-900">{x}</option>)}</select></div><div className="pt-4"><Button themeKey={themeKey} onClick={()=>save('drivers')}>Salvar</Button></div></>)}
                    
                    {modal === 'reschedule' && (<div className="space-y-6 anim-fade"><div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-200 flex items-center gap-3"><Icons.Clock size={20} className="shrink-0"/><div>Defina o novo horário para <span className="font-bold text-white text-base block">{formData.name}</span></div></div><div className="py-2"><Input theme={theme} label="Novo Horário" type="time" value={formData.time || ''} onChange={(e:any) => setFormData({...formData, time: e.target.value})} autoFocus/></div><div className="pt-2 grid grid-cols-2 gap-3"><Button theme={theme} variant="secondary" onClick={()=>setModal(null)}>Cancelar</Button><Button theme={theme} onClick={() => { save('reschedule'); }} icon={Icons.Check}>Salvar</Button></div></div>)}
                    
                    {modal === 'lostFound' && (<><Input themeKey={themeKey} label="O que foi encontrado?" value={formData.description||''} onChange={(e:any)=>setFormData({...formData, description:e.target.value})} placeholder="Ex: Guarda-chuva preto" /><Input themeKey={themeKey} label="Local / Veículo" value={formData.location||''} onChange={(e:any)=>setFormData({...formData, location:e.target.value})} placeholder="Ex: Van do João" /><Input themeKey={themeKey} label="Detalhes Adicionais" value={formData.details||''} onChange={(e:any)=>setFormData({...formData, details:e.target.value})} placeholder="Ex: Banco de trás, lado esquerdo" /><div className="flex flex-col gap-1.5"><label className="text-xs font-bold opacity-60 ml-1">Status</label><select className="bg-black/10 border border-white/10 text-white rounded-xl px-4 py-3.5 h-14" value={formData.status} onChange={(e:any)=>setFormData({...formData, status:e.target.value})}>{['Pendente','Entregue'].map(x=><option key={x} value={x} className="bg-slate-900">{x}</option>)}</select></div><div className="pt-4"><Button themeKey={themeKey} onClick={()=>save('lostFound')}>Salvar</Button></div></>)}
                    
                    {modal === 'madrugadaVaga' && (<div className="space-y-6"><div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-200">Digite o número da vaga do motorista para adicionar à tabela da Madrugada.</div><Input theme={theme} label="Número da Vaga" value={tempVagaMadrugada} onChange={(e:any) => setTempVagaMadrugada(e.target.value)} placeholder="Ex: 05" autoFocus /><div className="pt-4"><Button theme={theme} onClick={confirmAddMadrugadaVaga} icon={Icons.Check}>Confirmar Adição</Button></div></div>)}
                    
                    {modal === 'madrugadaBlock' && (<div className="space-y-6"><div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-200">Justifique o por que riscou a vaga <span className="font-bold font-mono">{vagaToBlock}</span> na Madrugada.</div><Input theme={theme} label="Motivo (Opcional)" value={tempJustification} onChange={(e:any) => setTempJustification(e.target.value)} placeholder="Ex: Quebrou, Médico, Folga..." autoFocus /><div className="pt-4 grid grid-cols-2 gap-3"><Button theme={theme} variant="secondary" onClick={()=>setModal(null)}>Cancelar</Button><Button theme={theme} onClick={confirmMadrugadaBlock} icon={Icons.Check} variant="danger">Bloquear</Button></div></div>)}
                </div>
            </div>
        </div>
    );
}
