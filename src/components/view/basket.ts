import { handlePrice, cloneTemplate, ensureElement, createElement } from '../../utils/utils';
import { Component } from '../base/component';
import { IEvents } from '../base/events';
import { IProduct } from '../../types';

/**
 * Интерфейс представления корзины
 */
export interface IBasketView {
    renderBasketItems(template: HTMLTemplateElement): HTMLElement[];
    updateView(): void;
    items: HTMLElement[];
}

/**
 * Класс представления корзины, отвечающий за отображение данных
 */
export class BasketView extends Component<Record<string, unknown>> implements IBasketView {
    // Ссылки на внутренние элементы представления
    protected _list: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    // Данные корзины
    private _products: IProduct[] = [];
    private _total = 0;

    /**
     * Создаёт экземпляр представления корзины
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

        // Инициализация DOM-элементов с использованием ensureElement
        try {
            this._button = ensureElement<HTMLButtonElement>(`.${blockName}__button`, container);
            this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
            this._list = ensureElement<HTMLElement>(`.${blockName}__list`, container);
        } catch (e) {
            console.warn(`Ошибка при инициализации элементов корзины: ${e.message}`);
        }

        // Подписываемся на события модели
        this.events.on('basket:changed', (products: IProduct[]) => {
            this._products = products;
            this.updateView();
        });

        this.events.on('basket:total-updated', (data: object) => {
            this._total = (data as { value: number }).value;
            this.updatePrice();
        });

        // Добавляем обработчик для кнопки оформления заказа
        if (this._button) {
            this._button.addEventListener('click', () => {
                this.events.emit('basket:checkout');
            });
        }
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
        this.updatePrice();
        this.updateButtonState();

        // Запрашиваем обновление данных о сумме корзины
        this.events.emit('basket:get-total');
    }

    /**
     * Обновляет отображение общей суммы заказа
     */
    private updatePrice(): void {
        if (this._price) {
            this._price.textContent = handlePrice(this._total) + ' синапсов';
        }
    }

    /**
     * Обновляет состояние кнопки заказа
     */
    private updateButtonState(): void {
        if (this._button) {
            this._button.disabled = this._products.length === 0;
        }
    }

    /**
     * Устанавливает HTML-элементы товаров в списке корзины
     */
    set items(items: HTMLElement[]) {
        if (!this._list) {
            console.error('Элемент с классом', `${this.blockName}__list`, 'не найден в корзине');
            return;
        }

        if (items.length > 0) {
            this._list.replaceChildren(...items);
            if (this._button) this._button.disabled = false;
        } else {
            if (this._button) this._button.disabled = true;
            this._list.replaceChildren(createElement<HTMLParagraphElement>('p', { textContent: 'Корзина пуста' }));
        }
    }

    /**
     * Получает HTML-элементы товаров в списке корзины
     */
    get items(): HTMLElement[] {
        return Array.from(this._list?.children || []) as HTMLElement[];
    }

    /**
     * Рендерит элементы корзины
     * @param template - шаблон элемента корзины
     */
    renderBasketItems(template: HTMLTemplateElement): HTMLElement[] {
        // Запрашиваем актуальные данные корзины
        this.events.emit('basket:get-products');

        // Генерируем карточки на основе полученных данных
        const items = this._products.map((product, index) => {
            const item = cloneTemplate<HTMLElement>(template);

            // Находим элементы для заполнения
            const title = item.querySelector('.card__title');
            const price = item.querySelector('.card__price');
            const index_element = item.querySelector('.basket__item-index');
            const deleteButton = item.querySelector('.basket__item-delete');

            // Заполняем данные
            if (title) title.textContent = product.title;
            if (price) price.textContent = handlePrice(product.price) + ' синапсов';
            if (index_element) index_element.textContent = (index + 1).toString();

            // Добавляем обработчик для удаления
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    this.events.emit('basket:remove', { id: product.id });
                });
            }

            return item;
        });

        // Обновляем представление корзины
        this.items = items;

        return items;
    }
}