import { IProduct } from '../../types';
import { IEvents } from '../base/events';

/**
 * Интерфейс модели корзины
 */
export interface IBasketModel {
    addProduct(product: IProduct): void;
    removeProduct(id: string): void;
    getProducts(): IProduct[];
    getTotal(): number;
    clearBasket(): void;
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
    constructor(protected events: IEvents) { }

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
    removeProduct(id: string): void {
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
     * Рассчитывает общую стоимость корзины
     */
    getTotal(): number {
        return [...this.products.values()]
            .reduce((total, item) => total + (item.price || 0), 0);
    }

    /**
     * Очищает корзину
     */
    clearBasket(): void {
        this.products.clear();
        this.emitChange();
    }

    /**
     * Генерирует событие изменения корзины
     */
    private emitChange(): void {
        this.events.emit('basket:changed', this.getProducts());
    }
} 