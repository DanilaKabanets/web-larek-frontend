import { CategoryType } from '../../types';
import { ensureElement } from '../../utils/utils';
import { CDN_URL, categoryMapping } from '../../utils/constants';
import { Component } from '../base/component';
import { handlePrice } from '../../utils/utils';

/**
 * Интерфейс для действий с карточкой
 */
export interface ICardActions {
    onClick?: (event: MouseEvent) => void;
}

/**
 * Интерфейс для карточки товара
 */
export interface ICard {
    title: string;
    price: number | null;
    category?: CategoryType | string;
    description?: string;
    image?: string;
    id?: string;
}

/**
 * Универсальная карточка товара
 * Поддерживает отображение в каталоге, предпросмотр и другие варианты
 */
export class Card extends Component<ICard> {
    // Основные элементы, общие для всех карточек
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    // Элементы карточки товара
    protected _image?: HTMLImageElement;
    protected _category?: HTMLElement;
    protected _description?: HTMLElement;

    /**
     * Создает экземпляр карточки товара
     * @param container - корневой элемент карточки
     * @param actions - объект с обработчиками событий
     * @param blockName - имя блока в DOM (по умолчанию 'card')
     */
    constructor(
        container: HTMLElement,
        actions?: ICardActions,
        protected blockName: string = 'card'
    ) {
        super(container);

        try {
            // Находим основные элементы с использованием ensureElement
            this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
            this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
        } catch (e) {
            // Ошибка при инициализации основных элементов карточки
        }

        // Для кнопки используем querySelector, так как она может отсутствовать
        this._button = container.querySelector(`.${blockName}__button`);

        // Добавляем обработчик клика, если он предоставлен
        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                // Если кнопка не найдена, добавляем обработчик на весь контейнер
                container.addEventListener('click', actions.onClick);
            }
        }

        // Находим дополнительные элементы с использованием ensureElement,
        // но обрабатываем каждый элемент отдельно, так как они могут отсутствовать
        try {
            this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        } catch (e) {
            this._image = undefined;
        }

        try {
            this._category = ensureElement<HTMLElement>(`.${blockName}__category`, container);
        } catch (e) {
            this._category = undefined;
        }

        try {
            this._description = ensureElement<HTMLElement>(`.${blockName}__text`, container);
        } catch (e) {
            this._description = undefined;
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

        // Дополнительная логика для карточки товара
        if (this._button && !value) {
            this._button.disabled = true;
        }
    }

    /**
     * Устанавливает или получает идентификатор карточки
     */
    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    /**
     * Устанавливает изображение карточки
     */
    set image(value: string) {
        if (this._image && value) {
            this._image.src = `${CDN_URL}${value}`;
        }
    }

    /**
     * Устанавливает выбранное состояние карточки
     */
    set selected(value: boolean) {
        if (this._button && !this._button.disabled) {
            this._button.disabled = value;
        }
    }

    /**
     * Устанавливает категорию карточки
     */
    set category(value: CategoryType | string) {
        if (this._category && value) {
            this._category.textContent = value;
            // Очищаем предыдущие классы категорий
            Object.values(categoryMapping).forEach(cls => {
                this._category.classList.remove(cls);
            });
            // Добавляем новый класс категории, если он существует в маппинге
            if (value in categoryMapping) {
                this._category.classList.add(categoryMapping[value as CategoryType]);
            }
        }
    }

    /**
     * Устанавливает описание карточки
     */
    set description(value: string) {
        if (this._description && value) {
            this._description.textContent = value;
        }
    }

    /**
     * Рендерит карточку с данными
     * @param data - данные для отображения
     * @returns HTML-элемент карточки
     */
    render(data: ICard): HTMLElement {
        // Устанавливаем все свойства из данных
        if (data.id) this.id = data.id;
        if (data.title) this.title = data.title;
        if (data.price !== undefined) this.price = data.price;
        if (data.image) this.image = data.image;
        if (data.category) this.category = data.category;
        if (data.description) this.description = data.description;

        return this.container;
    }
}