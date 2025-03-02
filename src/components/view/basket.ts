import { handlePrice, cloneTemplate, ensureElement, ensureAllElements, createElement } from '../../utils/utils';
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
 * Интерфейс данных корзины
 */
export interface IBasketData {
    items: HTMLElement[];
}

/**
 * Класс представления корзины, отвечающий за отображение данных
 */
export class BasketView extends Component<IBasketData> implements IBasketView {
    // Ссылки на внутренние элементы представления
    protected _list: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

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
            // Ошибка при инициализации элементов корзины
        }

        // Подписываемся на события модели для обновления представления
        this.events.on('basket:changed', () => {
            this.updateView();
        });

        this.events.on('basket:total-updated', (data: object) => {
            const totalData = data as { value: number };
            this.updatePrice(totalData.value);
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
            // Кнопка не найдена
            return;
        }
        this._button.disabled = true;
    }

    /**
     * Обновляет отображение корзины
     */
    updateView(): void {
        // Запрашиваем актуальные данные о сумме корзины
        this.events.emit('basket:get-total');

        // Запрашиваем актуальные данные о товарах для обновления кнопки
        this.events.emit('basket:get-products');
    }

    /**
     * Обновляет отображение общей суммы заказа
     */
    private updatePrice(total: number): void {
        if (this._price) {
            this.setText(this._price, handlePrice(total) + ' синапсов');
        }
    }

    /**
     * Обновляет состояние кнопки заказа
     */
    private updateButtonState(products: IProduct[]): void {
        if (this._button) {
            this._button.disabled = products.length === 0;
        }
    }

    /**
     * Устанавливает HTML-элементы товаров в списке корзины
     */
    set items(items: HTMLElement[]) {
        if (!this._list) {
            // Список элементов не найден
            return;
        }

        if (items.length > 0) {
            this._list.replaceChildren(...items);
            if (this._button) this._button.disabled = false;
        } else {
            if (this._button) this._button.disabled = true;

            // Создаем элемент для отображения сообщения о пустой корзине
            const emptyMessage = createElement('p', {
                textContent: 'Корзина пуста'
            });
            this._list.replaceChildren(emptyMessage);
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
        let renderedItems: HTMLElement[] = [];

        // Получаем актуальные данные корзины
        this.events.emit('basket:get-products');

        // Подписываемся на событие с продуктами один раз для рендеринга
        const handleProducts = (products: IProduct[]) => {
            // Очищаем подписку после получения данных
            this.events.off('basket:products', handleProducts);

            // Обновляем состояние кнопки
            this.updateButtonState(products);

            // Создаем элементы товаров
            renderedItems = products.map((product, index) => this.createBasketItemElement(product, index, template));

            // Обновляем DOM
            this.items = renderedItems;
        };

        this.events.on('basket:products', handleProducts);

        return renderedItems;
    }

    /**
     * Создает элемент товара для корзины
     */
    private createBasketItemElement(product: IProduct, index: number, template: HTMLTemplateElement): HTMLElement {
        const item = cloneTemplate<HTMLElement>(template);

        // Находим элементы для заполнения
        const title = item.querySelector('.card__title');
        const price = item.querySelector('.card__price');
        const indexElement = item.querySelector('.basket__item-index');
        const deleteButton = item.querySelector('.basket__item-delete');

        // Заполняем данные
        if (title) this.setText(title as HTMLElement, product.title);
        if (price) this.setText(price as HTMLElement, handlePrice(product.price) + ' синапсов');
        if (indexElement) this.setText(indexElement as HTMLElement, (index + 1).toString());

        // Добавляем обработчик для удаления
        if (deleteButton) {
            // Сохраняем ID товара в data-атрибуте для идентификации
            (deleteButton as HTMLElement).dataset.productId = product.id;

            // Добавляем обработчик события
            const clickHandler = () => {
                this.events.emit('basket:remove', { id: product.id });
            };

            // Используем { once: true } для автоматического удаления обработчика после вызова
            deleteButton.addEventListener('click', clickHandler, { once: true });
        }

        return item;
    }

    /**
     * Удаляет конкретный товар из DOM списка и обновляет индексацию
     * @param productId - идентификатор товара для удаления
     * @returns true, если элемент найден и удален, иначе false
     */
    removeItemFromList(productId: string): boolean {
        if (!this._list) {
            return false;
        }

        try {
            // Ищем элемент для удаления по data-атрибуту
            const selector = `.basket__item-delete[data-product-id="${productId}"]`;
            const deleteButton = ensureElement<HTMLElement>(selector, this._list);

            // Находим родительский элемент (карточку товара)
            const itemElement = deleteButton.closest('.basket__item') || deleteButton.parentElement;

            if (itemElement && itemElement.parentElement === this._list) {
                // Удаляем элемент
                this._list.removeChild(itemElement);

                // Обновляем индексы оставшихся элементов
                const itemElements = ensureAllElements<HTMLElement>('.basket__item-index', this._list);
                itemElements.forEach((element, index) => {
                    this.setText(element, (index + 1).toString());
                });

                return true;
            }
        } catch (e) {
            // Элемент не найден
            return false;
        }

        return false;
    }
}