import { Component } from './component';
import { handlePrice } from '../../utils/utils';

/**
 * Базовый интерфейс для карточек
 */
export interface IBaseCard {
    title: string;
    price: number | null;
}

/**
 * Интерфейс для действий с карточкой
 */
export interface ICardActions {
    onClick?: (event: MouseEvent) => void;
}

/**
 * Базовый класс для карточек (товаров, элементов корзины и т.д.)
 */
export class BaseCard<T extends IBaseCard> extends Component<T> {
    // Основные элементы, общие для всех карточек
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    /**
     * Создает экземпляр базовой карточки
     * @param blockName - имя блока в DOM
     * @param container - корневой элемент карточки
     * @param titleSelector - селектор для элемента заголовка
     * @param priceSelector - селектор для элемента цены
     * @param buttonSelector - селектор для кнопки
     * @param actions - объект с обработчиками событий
     */
    constructor(
        protected blockName: string,
        container: HTMLElement,
        titleSelector: string,
        priceSelector: string,
        buttonSelector: string,
        actions?: ICardActions
    ) {
        super(container);

        // Находим основные элементы
        this._title = container.querySelector(titleSelector);
        this._price = container.querySelector(priceSelector);
        this._button = container.querySelector(buttonSelector);

        // Проверяем наличие элементов
        if (!this._title) {
            console.warn(`Элемент ${titleSelector} не найден в карточке`);
        }
        if (!this._price) {
            console.warn(`Элемент ${priceSelector} не найден в карточке`);
        }

        // Добавляем обработчик клика, если он предоставлен
        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                // Если кнопка не найдена, добавляем обработчик на весь контейнер
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    /**
     * Устанавливает заголовок карточки
     */
    set title(value: string) {
        if (this._title) {
            this._title.textContent = value;
        }
    }

    /**
     * Устанавливает цену карточки
     */
    set price(value: number | null) {
        if (this._price) {
            this._price.textContent = value ? handlePrice(value) + ' синапсов' : 'Бесценно';
        }
    }
} 