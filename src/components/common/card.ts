import { CategoryType } from '../../types';
import { ensureElement } from '../../utils/utils';
import { CDN_URL } from '../../utils/constants';
import { categoryMapping } from '../../utils/constants';
import { BaseCard, IBaseCard, ICardActions } from '../base/baseCard';

/**
 * Интерфейс для карточки товара в каталоге
 */
export interface ICard extends IBaseCard {
    category: string;
    description: string;
    image: string;
    selected: boolean;
    id: string;
}

/**
 * Карточка товара в каталоге
 */
export class Card extends BaseCard<ICard> {
    // Специфичные для карточки товара элементы
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;

    constructor(
        protected blockName: string,
        container: HTMLElement,
        actions?: ICardActions
    ) {
        super(blockName, container, `.${blockName}__title`, `.${blockName}__price`, `.${blockName}__button`, actions);

        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._category = container.querySelector(`.${blockName}__category`);
    }

    // Уникальный идентификатор карточки
    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    // Специфичные для карточки товара сеттеры
    set image(value: string) {
        if (!this._image) {
            console.error(`Элемент ${this.blockName}__image не найден`);
            return;
        }
        this._image.src = CDN_URL + value;
    }

    set selected(value: boolean) {
        if (this._button && !this._button.disabled) {
            this._button.disabled = value;
        }
    }

    // Переопределенный сеттер для цены с дополнительной логикой
    set price(value: number | null) {
        super.price = value;

        // Дополнительная логика для карточки товара
        if (this._button && !value) {
            this._button.disabled = true;
        }
    }

    set category(value: CategoryType) {
        if (!this._category) {
            console.error(`Элемент ${this.blockName}__category не найден`);
            return;
        }
        this._category.textContent = value;
        this._category.classList.add(categoryMapping[value]);
    }
}

export class StoreItem extends Card {
    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card', container, actions);
    }
}

export class StoreItemPreview extends Card {
    protected _description: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card', container, actions);

        this._description = container.querySelector(`.${this.blockName}__text`);
    }

    set description(value: string) {
        if (!this._description) {
            console.error(`Элемент ${this.blockName}__text не найден`);
            return;
        }
        this._description.textContent = value;
    }
}