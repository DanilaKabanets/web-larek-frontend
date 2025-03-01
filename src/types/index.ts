export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

// Интерфейс для модели корзины
export interface IBasket {
    addProduct(product: IProduct): void;
    removeProduct(id: string): void;
    getTotal(): number;
    getProducts(): IProduct[];
    clearBasket(): void;
}

export type TPaymentType = 'online' | 'paymentOnDelivery';

export type CategoryType = 'софт-скил' | 'хард-скил' | 'дополнительное' | 'другое' | 'кнопка';

export interface IOrder {
    total: number;
    email: string;
    phone: string;
    address: string;
    items: string[];
    payment: TPaymentType;
}

export interface IOrderSuccess {
    id: string;
    total: number;
}