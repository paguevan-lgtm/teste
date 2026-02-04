
import React, { useState, useEffect } from 'react';
import { Icons } from './Shared';
import { generatePixPayment, checkPaymentStatus } from '../utils';
import { db } from '../firebase';

export const SubscriptionModal = ({ theme, user, onUnlock }: any) => {
    const [step, setStep] = useState<'offer' | 'payment'>('offer');
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let interval: any;
        if (step === 'payment' && paymentData?.id) {
            interval = setInterval(async () => {
                try {
                    const status = await checkPaymentStatus(paymentData.id);
                    if (status === 'approved') {
                        clearInterval(interval);
                        handleSuccess();
                    }
                } catch(e) {
                    console.error("Error checking status", e);
                }
            }, 5000); // Check every 5 seconds
        }
        return () => clearInterval(interval);
    }, [step, paymentData]);

    const handleGeneratePix = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await generatePixPayment(user?.username ? `${user.username}@boradevan.com` : undefined);
            setPaymentData(data);
            setStep('payment');
        } catch (e: any) {
            setError("Erro ao gerar Pix. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        // Atualiza o banco de dados globalmente para desbloquear TODOS
        const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // +30 dias
        if (db) {
            db.ref('system_status/subscription').set({
                isActive: true,
                expiresAt: expiresAt,
                lastPaymentBy: user?.username || 'Unknown',
                paidAt: Date.now()
            });
        }
        // onUnlock será chamado automaticamente via listener no App.tsx
        if(onUnlock) onUnlock();
    };

    const copyPix = () => {
        if(paymentData?.qr_code) {
            navigator.clipboard.writeText(paymentData.qr_code);
            alert("Código Pix copiado!");
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-lg p-4 animate-fade-in">
            <div className={`w-full max-w-md ${theme?.card || 'bg-slate-800'} border-2 border-red-500 rounded-2xl shadow-2xl overflow-hidden relative`}>
                
                {/* Header Lock */}
                <div className="bg-red-600 p-4 flex items-center justify-center">
                    <div className="bg-white/20 p-3 rounded-full animate-pulse">
                        <Icons.Lock size={32} className="text-white"/>
                    </div>
                </div>

                <div className="p-6 text-center text-white">
                    {step === 'offer' && (
                        <>
                            <h2 className="text-2xl font-black mb-2">Sistema Bloqueado</h2>
                            <p className="text-sm opacity-80 mb-6 leading-relaxed">
                                A mensalidade do sistema venceu. Para continuar utilizando todos os recursos, é necessário realizar o pagamento.
                                <br/><br/>
                                <span className="text-green-400 font-bold">Ao pagar, o sistema é liberado para TODOS os usuários.</span>
                            </p>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                                <div className="text-xs opacity-50 uppercase tracking-widest mb-1">Valor da Mensalidade</div>
                                <div className="text-4xl font-black text-green-400">R$ 1,00</div>
                            </div>

                            {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

                            <button 
                                onClick={handleGeneratePix}
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icons.Zap size={20}/>}
                                {loading ? 'Gerando Pix...' : 'Pagar Agora com Pix'}
                            </button>
                        </>
                    )}

                    {step === 'payment' && paymentData && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-bold mb-2">Escaneie o QR Code</h2>
                            <p className="text-xs opacity-60 mb-4">Abra o app do seu banco e pague via Pix.</p>

                            <div className="bg-white p-4 rounded-xl inline-block mb-4">
                                <img src={`data:image/png;base64,${paymentData.qr_code_base64}`} alt="QR Code Pix" className="w-48 h-48 mix-blend-multiply" />
                            </div>

                            <div className="mb-6">
                                <button 
                                    onClick={copyPix}
                                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 mx-auto transition-colors"
                                >
                                    <Icons.Copy size={14}/> Copiar Código Pix
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-xs opacity-50 animate-pulse">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Aguardando confirmação do banco...
                            </div>
                            
                            <button onClick={()=>setStep('offer')} className="mt-6 text-xs text-white/40 hover:text-white underline">Voltar</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
