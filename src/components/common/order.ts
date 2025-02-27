import { IEvents } from '../base/events';
import { TPaymentType } from '../../types';

/**
 * Интерфейс для формы заказа (упрощенная версия IOrder)
 */
export interface IOrderForm {
    address: string;
    payment: TPaymentType;
    email?: string;
    phone?: string;
}

/**
 * Базовый класс для форм
 */
export class Form<T extends object> {
    protected data: T;

    constructor(
        protected container: HTMLFormElement,
        protected events: IEvents
    ) {
        this.data = {} as T;
    }

    /**
     * Генерирует событие изменения формы
     */
    protected emitChange() {
        this.events.emit('formChange', this.data);
    }
}

/**
 * Класс формы оформления заказа
 */
export class Order extends Form<IOrderForm> {
    // Элементы управления способом оплаты
    protected _card: HTMLButtonElement;
    protected _cash: HTMLButtonElement;
    protected _addressInput: HTMLInputElement;
    protected _submitButton: HTMLButtonElement;

    /**
     * Создаёт форму заказа
     * @param blockName - имя CSS-класса блока
     * @param container - HTML-элемент формы
     * @param events - брокер событий
     */
    constructor(
        protected blockName: string,
        container: HTMLFormElement,
        protected events: IEvents
    ) {
        super(container, events);

        // Получаем ссылки на кнопки выбора способа оплаты
        // Для обратной совместимости с HTML оставляем имена card и cash
        this._card = container.elements.namedItem('card') as HTMLButtonElement;
        this._cash = container.elements.namedItem('cash') as HTMLButtonElement;
        this._addressInput = container.elements.namedItem('address') as HTMLInputElement;
        this._submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;

        // По умолчанию кнопка отправки неактивна
        if (this._submitButton) {
            this._submitButton.disabled = true;
        }

        if (this._cash) {
            this._cash.addEventListener('click', () => {
                this._cash.classList.add('button_alt-active');
                this._card.classList.remove('button_alt-active');
                // Меняем значение на 'paymentOnDelivery' (оплата при доставке)
                this.onInputChange('payment', 'paymentOnDelivery');
            });
        }
        if (this._card) {
            this._card.addEventListener('click', () => {
                this._card.classList.add('button_alt-active');
                this._cash.classList.remove('button_alt-active');
                // Меняем значение на 'online' (онлайн-оплата)
                this.onInputChange('payment', 'online');
            });
        }

        // Добавляем обработчик события ввода для поля адреса
        if (this._addressInput) {
            this._addressInput.addEventListener('input', () => {
                this.onInputChange('address', this._addressInput.value);
            });
        }
    }

    /**
     * Обработчик изменения значения поля
     * @param field - имя поля
     * @param value - новое значение
     */
    protected onInputChange<K extends keyof IOrderForm>(field: K, value: IOrderForm[K]) {
        this.data[field] = value;
        this.emitChange();
        this.validateForm();
    }

    /**
     * Проверяет форму и активирует/деактивирует кнопку отправки
     */
    protected validateForm() {
        if (this._submitButton) {
            // Активируем кнопку только если заполнены адрес и способ оплаты
            const isValid = !!this.data.address && !!this.data.payment;
            this._submitButton.disabled = !isValid;

            // Для отладки
            console.log('Валидация формы:', {
                address: this.data.address,
                payment: this.data.payment,
                isValid
            });
        }
    }

    /**
     * Сбрасывает выделение кнопок оплаты
     */
    resetPaymentButtons() {
        this._cash.classList.remove('button_alt-active');
        this._card.classList.remove('button_alt-active');
    }

    /**
     * Возвращает текущие данные формы
     */
    getValue(): IOrderForm {
        return { ...this.data };
    }
}