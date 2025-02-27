export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export interface IBasket {
    addProduct(product: IProduct): void;
    removeProduct(id: string): void;
    getTotal(): number;
    getProducts(): IProduct[];
    clearBasket(): void;
    renderBasketItems(template: HTMLTemplateElement): HTMLElement[];
    disableButton(): void;
    updateView(): void;
}

export interface IOrder {
    id: string;
    total: number;
    email: string;
    phone: string;
    address: string;
    items: IProduct[];
    payment: TPaymentType;
}

export type TPaymentType = 'online' | 'paymentOnDelivery';

export type CategoryType = 'софт-скил' | 'хард-скил' | 'дополнительное' | 'другое';

export interface IOrderDto {
    id: string;
    total: number;
    email: string;
    phone: string;
    address: string;
    items: string[];
    payment: TPaymentType;
}