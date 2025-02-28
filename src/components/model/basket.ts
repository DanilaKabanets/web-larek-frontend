import { IProduct } from '../../types';
import { IEvents } from '../base/events';
import { isEmpty } from '../../utils/utils';

/**
 * Интерфейс модели корзины
 */
export interface IBasketModel {
    getProducts(): IProduct[];
    getTotal(): number;
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
        // Подписываемся на события от представления
        this.events.on('basket:get-products', () => {
            this.events.emit('basket:products', this.getProducts());
        });

        this.events.on('basket:get-total', () => {
            this.events.emit('basket:total-updated', { value: this.getTotal() });
        });

        this.events.on('basket:remove', (data: object) => {
            this.removeProduct((data as { id: string }).id);
        });

        this.events.on('basket:checkout', () => {
            this.events.emit('basket:order', {
                products: this.getProducts(),
                total: this.getTotal()
            });
        });
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
    private removeProduct(id: string): void {
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