
export interface Passenger {
    id: string;
    name: string;
    phone?: string;
    address?: string;
    neighborhood: string;
    reference?: string;
    payment: string;
    passengerCount: number | string;
    luggageCount?: number;
    status: string;
    date: string;
    time: string;
    tags?: string;
}

export interface Driver {
    id: string;
    name: string;
    phone?: string;
    capacity: number;
    status: string;
    plate?: string;
    cnh?: string;
    cnhValidity?: string;
}

export interface Trip {
    id: string;
    driverId: string;
    driverName: string;
    date: string;
    time: string;
    passengerIds: string[];
    status: string;
    isTemp?: boolean;
    isMadrugada?: boolean;
    pCountSnapshot?: number;
    passengersSnapshot?: any[];
    value?: number;
    isPaid?: boolean;
    paymentStatus?: string;
    isExtra?: boolean;
    extraPhone?: string;
    notes?: string;
    vaga?: string;
    pCount?: number | string;
}

export interface Note {
    id: string;
    text: string;
    completed: boolean;
    username?: string; // Vincula a nota ao usuário
}

export interface LostFoundItem {
    id: string;
    description: string;
    location: string;
    details?: string;
    status: 'Pendente' | 'Entregue';
    date: string;
}

export interface Theme {
    name: string;
    bg: string;
    card: string;
    text: string;
    primary: string;
    accent: string;
    border: string;
    radius: string;
    palette: string[];
    font?: string;
}

export interface User {
    username: string;
    role: string;
}
