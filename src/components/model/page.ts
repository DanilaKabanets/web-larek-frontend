import { IEvents } from '../base/events';
import { IProduct } from '../../types';
import { isEmpty } from '../../utils/utils';

/**
 * Интерфейс для данных страницы
 */
export interface IPageData {
    products: IProduct[];
    isLocked: boolean;
}

/**
 * Интерфейс модели страницы
 */
export interface IPageModel {
    products: IProduct[];
    isLocked: boolean;
    setProducts(products: IProduct[]): void;
    setLocked(isLocked: boolean): void;
}

/**
 * Модель страницы, отвечающая за хранение и управление данными
 */
export class PageModel implements IPageModel {
    // Данные страницы
    private _products: IProduct[] = [];
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
     * Устанавливает флаг блокировки страницы
     * @param isLocked - значение флага блокировки
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
     * Возвращает статус блокировки страницы
     */
    get isLocked(): boolean {
        return this._isLocked;
    }

    /**
     * Генерирует событие изменения модели страницы
     */
    private emitChange(): void {
        this.events.emit('page:changed', {
            products: this.products,
            isLocked: this.isLocked
        });
    }
} 