import { IEvents } from '../base/events';
import { IProduct } from '../../types';
import { isEmpty } from '../../utils/utils';

/**
 * Интерфейс для данных страницы
 */
export interface IPageData {
    products: IProduct[];
    basketCount: number;
    isLocked: boolean;
}

/**
 * Интерфейс модели страницы
 */
export interface IPageModel {
    products: IProduct[];
    basketCount: number;
    isLocked: boolean;
    setProducts(products: IProduct[]): void;
    setBasketCount(count: number): void;
    setLocked(isLocked: boolean): void;
}

/**
 * Модель страницы, отвечающая за хранение и управление данными
 */
export class PageModel implements IPageModel {
    // Данные страницы
    private _products: IProduct[] = [];
    private _basketCount = 0;
    private _isLocked = false;

    /**
     * Создаёт экземпляр модели страницы
     * @param events - брокер событий
     */
    constructor(private events: IEvents) { }

    /**
     * Устанавливает список товаров
     * @param products - список товаров
     */
    setProducts(products: IProduct[]): void {
        if (isEmpty(products)) {
            this._products = [];
        } else {
            this._products = [...products];
        }
        this.emitChange();
    }

    /**
     * Устанавливает количество товаров в корзине
     * @param count - количество товаров
     */
    setBasketCount(count: number): void {
        this._basketCount = count;
        this.emitChange();
    }

    /**
     * Устанавливает состояние блокировки страницы
     * @param isLocked - флаг блокировки
     */
    setLocked(isLocked: boolean): void {
        this._isLocked = isLocked;
        this.emitChange();
    }

    /**
     * Возвращает список товаров
     */
    get products(): IProduct[] {
        return [...this._products];
    }

    /**
     * Возвращает количество товаров в корзине
     */
    get basketCount(): number {
        return this._basketCount;
    }

    /**
     * Возвращает состояние блокировки страницы
     */
    get isLocked(): boolean {
        return this._isLocked;
    }

    /**
     * Генерирует событие изменения данных страницы
     */
    private emitChange(): void {
        this.events.emit('page:changed', {
            products: this.products,
            basketCount: this.basketCount,
            isLocked: this.isLocked
        });
    }
} 