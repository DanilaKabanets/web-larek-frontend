import { IProduct, FormData, IOrder } from '../../types';
import { IEvents } from '../base/events';
import { isEmpty } from '../../utils/utils';

/**
 * Интерфейс модели корзины
 */
export interface IBasketModel {
    getProducts(): IProduct[];
    getTotal(): number;
    getProductCount(): number;
    createOrderData(formData: FormData): IOrder;
}

/**
 * Класс модели корзины, отвечающий за хранение и управление данными
 */
export class BasketModel implements IBasketModel {
    // Хранилище товаров
    private products: Map<string, IProduct> = new Map();

    /**
     * Создаёт экземпляр модели корзины
     * @param events - брокер событий
     */
    constructor(protected events: IEvents) {
    }

    /**
     * Добавляет товар в корзину
     * @param product - товар для добавления
     */
    addProduct(product: IProduct): void {
        this.products.set(product.id, product);
        this.emitChange();
    }

    /**
     * Удаляет товар из корзины
     * @param id - идентификатор товара
     */
    public removeProduct(id: string): void {
        this.products.delete(id);
        this.emitChange();
    }

    /**
     * Возвращает все товары в корзине
     */
    getProducts(): IProduct[] {
        return Array.from(this.products.values());
    }

    /**
     * Возвращает количество товаров в корзине
     */
    getProductCount(): number {
        return this.getProducts().length;
    }

    /**
     * Рассчитывает общую стоимость корзины
     */
    getTotal(): number {
        return [...this.products.values()]
            .reduce((total, item) => total + (item.price || 0), 0);
    }

    /**
     * Проверяет, есть ли товар в корзине
     * @param id - идентификатор товара
     */
    hasProduct(id: string): boolean {
        return this.products.has(id);
    }

    /**
     * Очищает корзину
     */
    clearBasket(): void {
        this.products.clear();
        this.emitChange();
    }

    /**
     * Формирует данные заказа для отправки на сервер
     * @param formData - данные из формы заказа
     * @returns объект заказа для отправки на сервер
     */
    createOrderData(formData: FormData): IOrder {
        return {
            payment: formData.payment,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            total: this.getTotal(),
            items: this.getProducts().map(item => item.id)
        };
    }

    /**
     * Генерирует событие изменения корзины
     */
    private emitChange(): void {
        const products = this.getProducts();
        const total = this.getTotal();

        this.events.emit('basket:changed', products);
        this.events.emit('basket:total-updated', { value: total });

        // Если корзина пуста, отправляем дополнительное событие
        if (isEmpty(products) || products.length === 0) {
            this.events.emit('basket:empty');
        }
    }
} 