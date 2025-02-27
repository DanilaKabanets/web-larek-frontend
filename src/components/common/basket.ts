import { IProduct, IBasket } from '../../types';
import { handlePrice, cloneTemplate } from '../../utils/utils';
import { Component } from '../base/component';
import { IEvents } from '../base/events';
import { BaseCard, IBaseCard } from '../base/baseCard';

/**
 * Класс, реализующий корзину товаров по шаблону MVP
 * Объединяет функциональность хранения данных и их отображения
 */
export class Basket extends Component<Record<string, unknown>> implements IBasket {
    // Ссылки на внутренние элементы представления
    protected _list: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    // Хранилище товаров (модель)
    private products: Map<string, IProduct> = new Map();

    /**
     * Создаёт экземпляр корзины
     * @param blockName - имя блока в DOM
     * @param container - корневой элемент корзины
     * @param events - брокер событий
     */
    constructor(
        protected blockName: string,
        container: HTMLElement,
        protected events: IEvents
    ) {
        super(container);

        // Инициализация DOM-элементов
        this._button = container.querySelector(`.${blockName}__button`);
        this._price = container.querySelector(`.${blockName}__price`);
        this._list = container.querySelector(`.${blockName}__list`);

        // Проверка наличия необходимых элементов
        if (!this._button) {
            console.warn(`Элемент ${blockName}__button не найден в корзине`);
        }
        if (!this._price) {
            console.warn(`Элемент ${blockName}__price не найден в корзине`);
        }
        if (!this._list) {
            console.warn(`Элемент ${blockName}__list не найден в корзине`);
        }

        // Добавляем обработчик события заказа
        if (this._button) {
            this._button.addEventListener('click', () => this.events.emit('basket:order'));
        }
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
     * Создает HTML-элементы для товаров в корзине
     * @param template - шаблон элемента корзины
     * @returns Массив HTML-элементов
     */
    renderBasketItems(template: HTMLTemplateElement): HTMLElement[] {
        return this.getProducts().map((item, index) => {
            const itemElement = cloneTemplate<HTMLElement>(template);
            const basketItem = new StoreItemBasket('basket', itemElement, {
                onClick: () => {
                    this.removeProduct(item.id);
                }
            });

            basketItem.title = item.title;
            basketItem.index = index + 1;
            basketItem.price = item.price || 0;

            return basketItem.render({});
        });
    }

    /**
     * Отключает кнопку "Оформить заказ"
     */
    disableButton(): void {
        if (!this._button) {
            console.error('Элемент с классом', `${this.blockName}__button`, 'не найден в корзине');
            return;
        }
        this._button.disabled = true;
    }

    /**
     * Обновляет отображение корзины
     */
    updateView(): void {
        if (this._price) {
            this._price.textContent = handlePrice(this.getTotal()) + ' синапсов';
        }

        // Обновляем состояние кнопки
        if (this._button) {
            this._button.disabled = this.getProducts().length === 0;
        }
    }

    /**
     * Устанавливает HTML-элементы товаров в списке корзины
     */
    set list(items: HTMLElement[]) {
        if (!this._list) {
            console.error('Элемент с классом', `${this.blockName}__list`, 'не найден в корзине');
            return;
        }
        this._list.replaceChildren(...items);
        if (this._button) {
            this._button.disabled = !items.length;
        }
    }

    /**
     * Обновляет индексы элементов в корзине
     */
    refreshIndices(): void {
        if (!this._list) {
            console.error('Элемент с классом', `${this.blockName}__list`, 'не найден в корзине при обновлении индексов');
            return;
        }

        Array.from(this._list.children).forEach((item, index) => {
            const indexElement = item.querySelector(`.basket__item-index`);
            if (indexElement) {
                indexElement.textContent = (index + 1).toString();
            }
        });
    }

    /**
     * Генерирует событие изменения корзины
     */
    private emitChange(): void {
        this.events.emit('basket:changed', this.getProducts());
        this.updateView();
    }
}

export interface IProductBasket extends IBaseCard {
    index: number;
}

export interface IStoreItemBasketActions {
    onClick: (event: MouseEvent) => void;
}

export class StoreItemBasket extends BaseCard<IProductBasket> {
    protected _index: HTMLElement;

    constructor(
        protected blockName: string,
        container: HTMLElement,
        actions?: IStoreItemBasketActions
    ) {
        // Вызываем конструктор базового класса с селекторами для элементов
        super(
            blockName,
            container,
            '.card__title',
            '.card__price',
            '.basket__item-delete',
            actions
        );

        // Находим специфичный для корзины элемент индекса
        this._index = container.querySelector('.basket__item-index');

        // Добавляем специальное поведение для кнопки удаления
        if (this._button) {
            // Удаляем предыдущие обработчики (если есть)
            this._button.replaceWith(this._button.cloneNode(true));
            this._button = container.querySelector('.basket__item-delete');

            if (this._button && actions?.onClick) {
                this._button.addEventListener('click', (evt) => {
                    this.container.remove();
                    actions.onClick(evt);
                });
            }
        }
    }

    set index(value: number) {
        if (!this._index) {
            console.error('Элемент basket__item-index не найден в шаблоне корзины');
            return;
        }
        this._index.textContent = value.toString();
    }
}