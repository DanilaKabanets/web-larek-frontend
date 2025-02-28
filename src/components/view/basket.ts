import { handlePrice, cloneTemplate } from '../../utils/utils';
import { Component } from '../base/component';
import { IEvents } from '../base/events';
import { Card, ICard } from './card';
import { IBasketModel } from '../model/basket';

/**
 * Интерфейс представления корзины
 */
export interface IBasketView {
    renderBasketItems(template: HTMLTemplateElement): HTMLElement[];
    updateView(): void;
    list: HTMLElement[];
}

/**
 * Класс представления корзины, отвечающий за отображение данных
 */
export class BasketView extends Component<Record<string, unknown>> implements IBasketView {
    // Ссылки на внутренние элементы представления
    protected _list: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    /**
     * Создаёт экземпляр представления корзины
     * @param blockName - имя блока в DOM
     * @param container - корневой элемент корзины
     * @param events - брокер событий
     * @param model - модель корзины
     */
    constructor(
        protected blockName: string,
        container: HTMLElement,
        protected events: IEvents,
        protected model: IBasketModel
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

        // Подписываемся на изменения в модели
        this.events.on('basket:changed', () => this.updateView());
    }

    /**
     * Создает HTML-элементы для товаров в корзине
     * @param template - шаблон элемента корзины
     * @returns Массив HTML-элементов
     */
    renderBasketItems(template: HTMLTemplateElement): HTMLElement[] {
        return this.model.getProducts().map((item, index) => {
            const itemElement = cloneTemplate<HTMLElement>(template);
            const basketItem = new StoreItemBasket(itemElement, {
                onClick: () => {
                    this.model.removeProduct(item.id);
                }
            });

            // Устанавливаем данные и возвращаем отрендеренный элемент
            return basketItem.render({
                title: item.title,
                price: item.price || 0,
                index: index + 1,
                id: item.id
            });
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
            this._price.textContent = handlePrice(this.model.getTotal()) + ' синапсов';
        }

        // Обновляем состояние кнопки
        if (this._button) {
            this._button.disabled = this.model.getProducts().length === 0;
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
}

/**
 * Интерфейс для товара в корзине
 */
export interface IProductBasket extends ICard {
    index?: number;
}

export interface IStoreItemBasketActions {
    onClick: (event: MouseEvent) => void;
}

/**
 * Класс для отображения товара в корзине
 */
export class StoreItemBasket extends Card {
    protected _index: HTMLElement;

    constructor(
        container: HTMLElement,
        actions?: IStoreItemBasketActions
    ) {
        // Вызываем конструктор базового класса
        super(container, actions, 'basket');

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

    /**
     * Устанавливает индекс товара в корзине
     */
    set index(value: number) {
        if (this._index) {
            this._index.textContent = value.toString();
        }
    }

    /**
     * Рендерит карточку товара в корзине
     * @param data - данные для отображения
     * @returns HTML-элемент карточки
     */
    render(data: IProductBasket): HTMLElement {
        super.render(data);
        if (data.index) this.index = data.index;
        return this.container;
    }
}