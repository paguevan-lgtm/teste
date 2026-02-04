
import React, { useState } from 'react';
import { Icons } from '../components/Shared';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

export default function Paywall() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [copyPaste, setCopyPaste] = useState('');
    const [status, setStatus] = useState('pending'); // pending, waiting_payment

    const createPayment = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/create_payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: 'pagamento@boradevan.com', 
                    description: 'Renovação Mensal - Bora de Van' 
                })
            });
            
            const data = await response.json();
            
            if (data.qr_code && data.ticket_url) {
                setQrCode(data.qr_code_base64);
                setCopyPaste(data.qr_code);
                setStatus('waiting_payment');
            } else {
                alert('Erro ao gerar PIX. Tente novamente.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao gerar pagamento.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(copyPaste);
        alert('Código Pix Copiado!');
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                {/* Faixa de segurança superior */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-orange-600"></div>
                
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 text-amber-500 animate-pulse border border-amber-500/20">
                        <Icons.Lock size={40} />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Sistema Bloqueado</h2>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed px-4">
                        Olá <strong>{user?.username}</strong>. A licença de uso expirou. Realize o pagamento de <span className="text-green-400 font-bold">R$ 1,00</span> para liberar o acesso imediato para todos os usuários por 30 dias.
                    </p>

                    <div className="bg-black/40 w-full rounded-xl p-5 border border-white/5 mb-6 flex justify-between items-center">
                        <div className="text-left">
                            <div className="text-[10px] opacity-50 uppercase font-bold tracking-widest mb-1">Valor Total</div>
                            <div className="text-2xl font-bold text-green-400">R$ 1,00</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] opacity-50 uppercase font-bold tracking-widest mb-1">Renovação</div>
                            <div className="text-sm font-bold text-white">+30 Dias</div>
                        </div>
                    </div>

                    {status === 'pending' && (
                        <button 
                            onClick={createPayment} 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Icons.Zap size={20}/>}
                            {loading ? 'Gerando Cobrança...' : 'Pagar e Liberar Agora'}
                        </button>
                    )}

                    {status === 'waiting_payment' && (
                        <div className="w-full flex flex-col items-center animate-fade-in">
                            <div className="bg-white p-4 rounded-xl mb-4 shadow-inner">
                                {qrCode ? (
                                    <img src={`data:image/jpeg;base64,${qrCode}`} alt="Pix QR Code" className="w-48 h-48" />
                                ) : (
                                    <QRCodeSVG value={copyPaste} size={180} />
                                )}
                            </div>
                            
                            <p className="text-xs text-slate-400 mb-4">Escaneie o QR Code ou use o botão abaixo</p>
                            
                            <button 
                                onClick={copyToClipboard}
                                className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white py-3 rounded-xl text-sm font-bold mb-6 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Icons.Copy size={16}/> Copiar Código Pix
                            </button>

                            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold animate-pulse bg-amber-900/20 px-4 py-2 rounded-full border border-amber-500/20">
                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                Aguardando confirmação automática...
                            </div>
                        </div>
                    )}
                    
                    <button onClick={logout} className="mt-8 text-xs text-slate-600 hover:text-slate-400 transition-colors border-b border-transparent hover:border-slate-400 pb-0.5">
                        Trocar Conta
                    </button>
                </div>
            </div>
        </div>
    );
}
