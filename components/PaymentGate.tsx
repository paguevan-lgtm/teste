
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { Icons } from './Shared';

// Usando as mesmas credenciais fornecidas
const MERCADO_PAGO_ACCESS_TOKEN = "APP_USR-2028294536116664-020323-6cd677880a20d8c24ac12a297178c743-753231933";

export const PaymentGate = ({ user, children }: any) => {
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [daysLeft, setDaysLeft] = useState(0);
    
    // States for Direct QR Code
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
    const [qrCodeCopyPaste, setQrCodeCopyPaste] = useState<string | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Monitor Subscription Status
    useEffect(() => {
        if (!user || !db) return;

        const subRef = db.ref('system_settings/subscription');
        
        const handleSnapshot = (snap: any) => {
            const val = snap.val();
            const now = Date.now();
            
            // Bypass for Breno (Admin never gets locked, but sees the app)
            if (user.username === 'Breno') {
                setIsLocked(false);
                setLoading(false);
                return;
            }

            if (!val || !val.expiry || val.expiry < now) {
                // EXPIRED
                setIsLocked(true);
                setDaysLeft(0);
            } else {
                // ACTIVE
                setIsLocked(false);
                const diffTime = Math.abs(val.expiry - now);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                setDaysLeft(diffDays);
            }
            setLoading(false);
        };

        subRef.on('value', handleSnapshot);
        return () => subRef.off('value', handleSnapshot);
    }, [user]);

    // Create Direct Pix Payment
    const handlePayClick = async () => {
        setVerifying(true);
        try {
            const paymentData = {
                transaction_amount: 1.00,
                description: "Mensalidade Sistema Bora de Van",
                payment_method_id: "pix",
                payer: {
                    email: "pagamento@boradevan.com.br", // Dummy email required by API
                    first_name: user.username,
                    last_name: "Operador"
                },
                external_reference: `sub_${Date.now()}`
            };

            const response = await fetch("https://api.mercadopago.com/v1/payments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
                    "X-Idempotency-Key": `pay_${Date.now()}`
                },
                body: JSON.stringify(paymentData)
            });

            const data = await response.json();
            
            if (data.status === 'pending' || data.status === 'created') {
                const qrData = data.point_of_interaction?.transaction_data;
                if (qrData) {
                    setQrCodeBase64(qrData.qr_code_base64);
                    setQrCodeCopyPaste(qrData.qr_code);
                    setPaymentId(data.id);
                    
                    // Start Polling for approval immediately
                    startPolling(data.id);
                } else {
                    alert("Erro ao gerar QR Code. Tente novamente.");
                }
            } else {
                alert("Erro ao criar pagamento: " + (data.message || 'Desconhecido'));
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão com Mercado Pago.");
        } finally {
            setVerifying(false);
        }
    };

    const startPolling = (pid: string) => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`https://api.mercadopago.com/v1/payments/${pid}`, {
                    headers: {
                        "Authorization": `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
                    }
                });
                const data = await response.json();
                
                if (data.status === 'approved') {
                    clearInterval(interval);
                    activateSubscription(data.id);
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 5000); // Check every 5 seconds

        // Stop polling after 10 minutes to save resources
        setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
    };

    const activateSubscription = async (pid: string) => {
        const now = Date.now();
        const newExpiry = now + (30 * 24 * 60 * 60 * 1000); // 30 Days
        
        await db.ref('system_settings/subscription').set({
            expiry: newExpiry,
            status: 'active',
            lastPaymentId: pid,
            paidBy: user.username,
            paidAt: now
        });
        
        // No need to set isLocked false manually, the useEffect listener will pick it up
    };

    const copyPixCode = () => {
        if (qrCodeCopyPaste) {
            navigator.clipboard.writeText(qrCodeCopyPaste);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        }
    };

    if (loading) return <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white font-bold">Verificando Assinatura...</div>;

    // IF LOCKED, DO NOT RENDER CHILDREN.
    if (isLocked) {
        return (
            <div className="fixed inset-0 z-[99999] bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden">
                    
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-orange-600"></div>

                    <div className="relative z-10">
                        {!qrCodeBase64 ? (
                            <>
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-lg animate-pulse">
                                    <Icons.Lock size={40} className="text-red-500"/>
                                </div>

                                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">SISTEMA BLOQUEADO</h1>
                                <p className="text-slate-400 mb-8 leading-relaxed">
                                    A licença de uso expirou. Para continuar gerenciando sua frota, realize o pagamento da renovação mensal.
                                </p>

                                <div className="bg-black/30 rounded-xl p-4 mb-8 border border-white/5">
                                    <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Valor da Renovação</div>
                                    <div className="text-4xl font-black text-green-400">R$ 1,00</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Acesso liberado para TODOS os usuários por 30 dias</div>
                                </div>

                                <button 
                                    onClick={handlePayClick}
                                    disabled={verifying}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
                                >
                                    {verifying ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Gerando PIX...</>
                                    ) : (
                                        <><Icons.Zap size={20}/> GERAR PIX DE R$ 1,00</>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-bold text-white mb-4">Pagamento via Pix</h2>
                                
                                <div className="bg-white p-4 rounded-xl mb-4 mx-auto w-fit">
                                    <img 
                                        src={`data:image/png;base64,${qrCodeBase64}`} 
                                        alt="Pix QR Code" 
                                        className="w-48 h-48 object-contain"
                                    />
                                </div>

                                <div className="text-xs text-slate-400 mb-4">
                                    Escaneie o QR Code acima ou use o botão abaixo para copiar o código Pix Copia e Cola.
                                </div>

                                <button 
                                    onClick={copyPixCode}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 mb-4 ${copySuccess ? 'bg-green-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    {copySuccess ? <><Icons.Check size={18}/> Copiado!</> : <><Icons.Copy size={18}/> Copiar Código Pix</>}
                                </button>

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-3">
                                    <div className="animate-spin w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full shrink-0"></div>
                                    <div className="text-left text-xs text-blue-300">
                                        Aguardando pagamento... O sistema será liberado automaticamente em alguns segundos após o Pix.
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => { setQrCodeBase64(null); setQrCodeCopyPaste(null); }}
                                    className="mt-4 text-xs text-slate-500 hover:text-white underline"
                                >
                                    Voltar / Cancelar
                                </button>
                            </div>
                        )}
                        
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
                            <Icons.Shield size={12}/> Pagamento Seguro via Mercado Pago
                        </div>
                    </div>
                </div>
                <div className="text-slate-600 text-[10px] mt-8 font-mono">SYSTEM_ID: {user.username.toUpperCase()}_SECURE</div>
            </div>
        );
    }

    return <>{children}</>;
};
