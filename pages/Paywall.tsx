
import React, { useState, useEffect } from 'react';
import { Icons, Toast } from '../components/Shared';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

export default function Paywall() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [copyPaste, setCopyPaste] = useState('');
    const [status, setStatus] = useState('pending'); // pending, waiting_payment, approved

    const createPayment = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/create_payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: 'user@boradevan.com', // Placeholder ou email do usuario se tiver
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
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-orange-600"></div>
                
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 text-amber-500 animate-pulse">
                        <Icons.Lock size={32} />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">Acesso Expirado</h2>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        Olá, <strong>{user?.username}</strong>. A licença de uso do sistema venceu. Para liberar o acesso para todos os usuários por mais 30 dias, realize o pagamento.
                    </p>

                    <div className="bg-black/30 w-full rounded-xl p-4 border border-white/5 mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs opacity-50 uppercase font-bold">Valor</span>
                            <span className="text-xl font-bold text-green-400">R$ 1,00</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs opacity-50 uppercase font-bold">Validade</span>
                            <span className="text-sm font-bold text-white">+30 Dias</span>
                        </div>
                    </div>

                    {status === 'pending' && (
                        <button 
                            onClick={createPayment} 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Icons.Zap size={20}/>}
                            {loading ? 'Gerando Pix...' : 'Liberar Acesso Agora'}
                        </button>
                    )}

                    {status === 'waiting_payment' && (
                        <div className="w-full flex flex-col items-center animate-fade-in">
                            <div className="bg-white p-4 rounded-xl mb-4">
                                {/* QR Code pode ser renderizado via base64 ou componente */}
                                {qrCode ? (
                                    <img src={`data:image/jpeg;base64,${qrCode}`} alt="Pix QR Code" className="w-48 h-48" />
                                ) : (
                                    <QRCodeSVG value={copyPaste} size={180} />
                                )}
                            </div>
                            
                            <p className="text-xs text-slate-400 mb-3">Escaneie o QR Code ou copie o código abaixo:</p>
                            
                            <button 
                                onClick={copyToClipboard}
                                className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white py-3 rounded-xl text-xs font-mono mb-4 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Icons.Copy size={14}/> Copiar Código Pix
                            </button>

                            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                Aguardando pagamento...
                            </div>
                        </div>
                    )}
                    
                    <button onClick={logout} className="mt-6 text-xs text-slate-500 hover:text-white transition-colors">
                        Sair / Trocar Conta
                    </button>
                </div>
            </div>
        </div>
    );
}
