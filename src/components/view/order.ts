import { Component } from '../base/component';
import { IEvents } from '../base/events';
import { TPaymentType } from '../../types';
import { ensureElement } from '../../utils/utils';

/**
 * Интерфейс данных заказа
 */
export interface IOrderData {
    address?: string;
    email?: string;
    phone?: string;
    payment?: TPaymentType;
}

/**
 * Представление формы заказа
 */
export class OrderView extends Component<IOrderData> {
    // Элементы управления способом оплаты и адресом
    protected _card: HTMLButtonElement;
    protected _cash: HTMLButtonElement;
    protected _addressInput: HTMLInputElement;
    protected _submitButton: HTMLButtonElement;

    // Элементы формы контактов
    protected _phoneInput: HTMLInputElement;
    protected _emailInput: HTMLInputElement;

    // Флаг, указывающий, является ли текущая форма формой контактов
    protected _isContactsForm = false;

    /**
     * Создаёт экземпляр представления формы заказа
     * @param container - HTML-элемент формы
     * @param events - брокер событий
     */
    constructor(
        container: HTMLFormElement,
        private events: IEvents
    ) {
        super(container);

        // Определяем тип формы по наличию элементов
        this._isContactsForm = Boolean(container.elements.namedItem('email'));

        if (this._isContactsForm) {
            // Инициализация формы контактов
            this.initContactsForm(container);
        } else {
            // Инициализация формы заказа (адрес и способ оплаты)
            this.initOrderForm(container);
        }

        // Подписываемся на изменения модели
        if (this._isContactsForm) {
            this.events.on('contacts:changed', (data: object) => {
                const typedData = data as { email: string, phone: string, hasContacts: boolean };
                this.updateContactsView(typedData);
            });
        } else {
            this.events.on('order:changed', (data: object) => {
                const typedData = data as { address: string, payment: TPaymentType, hasAddressAndPayment: boolean };
                this.updateOrderView(typedData);
            });
        }
    }

    /**
     * Инициализирует форму заказа (адрес и способ оплаты)
     * @param container - HTML-элемент формы
     */
    private initOrderForm(container: HTMLFormElement): void {
        // Получаем ссылки на элементы формы с использованием ensureElement
        this._card = container.elements.namedItem('card') as HTMLButtonElement;
        this._cash = container.elements.namedItem('cash') as HTMLButtonElement;
        this._addressInput = container.elements.namedItem('address') as HTMLInputElement;
        this._submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);

        // По умолчанию кнопка отправки неактивна
        this._submitButton.disabled = true;

        // Обработчики для кнопок способа оплаты
        if (this._cash) {
            this._cash.addEventListener('click', () => {
                this._cash.classList.add('button_alt-active');
                this._card.classList.remove('button_alt-active');
                // Отправляем событие об изменении способа оплаты
                this.events.emit('payment:set', { value: 'paymentOnDelivery' });
            });
        }
        if (this._card) {
            this._card.addEventListener('click', () => {
                this._card.classList.add('button_alt-active');
                this._cash.classList.remove('button_alt-active');
                // Отправляем событие об изменении способа оплаты
                this.events.emit('payment:set', { value: 'online' });
            });
        }

        // Добавляем обработчик события ввода для поля адреса
        if (this._addressInput) {
            this._addressInput.addEventListener('input', () => {
                // Отправляем событие об изменении адреса
                this.events.emit('address:set', { value: this._addressInput.value });
            });
        }

        // Добавляем обработчик отправки формы
        container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit('order:submit');
        });
    }

    /**
     * Инициализирует форму контактов
     * @param container - HTML-элемент формы
     */
    private initContactsForm(container: HTMLFormElement): void {
        // Получаем ссылки на элементы формы
        this._phoneInput = container.elements.namedItem('phone') as HTMLInputElement;
        this._emailInput = container.elements.namedItem('email') as HTMLInputElement;
        this._submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);

        // По умолчанию кнопка отправки неактивна
        this._submitButton.disabled = true;

        // Добавляем обработчики событий ввода
        if (this._phoneInput) {
            this._phoneInput.addEventListener('input', () => {
                // Просто отправляем событие об изменении значения
                this.emitInputValue(this._phoneInput, 'phone:set');
            });
        }

        if (this._emailInput) {
            this._emailInput.addEventListener('input', () => {
                // Просто отправляем событие об изменении значения
                this.emitInputValue(this._emailInput, 'email:set');
            });
        }

        // Добавляем обработчик отправки формы
        container.addEventListener('submit', (event) => {
            event.preventDefault();

            // Собираем данные из формы контактов
            if (this._emailInput && this._phoneInput) {
                this.events.emit('contacts:submit', {
                    email: this._emailInput.value,
                    phone: this._phoneInput.value
                });
            }
        });
    }

    /**
     * Отправляет событие об изменении значения поля ввода
     * @param input - поле ввода
     * @param eventName - имя события для отправки
     */
    private emitInputValue(input: HTMLInputElement, eventName: string): void {
        const value = input.value;
        // Отправляем событие об изменении значения
        this.events.emit(eventName, { value });
    }

    /**
     * Обновляет представление формы заказа на основе данных модели
     */
    updateOrderView(data: { address: string, payment: TPaymentType, hasAddressAndPayment: boolean }): void {
        // Обновляем состояние кнопки отправки формы
        if (this._submitButton) {
            this._submitButton.disabled = !data.hasAddressAndPayment;
        }

        // Обновляем состояние кнопок способа оплаты
        if (data.payment === 'online') {
            this._card.classList.add('button_alt-active');
            this._cash.classList.remove('button_alt-active');
        } else if (data.payment === 'paymentOnDelivery') {
            this._cash.classList.add('button_alt-active');
            this._card.classList.remove('button_alt-active');
        } else {
            this._cash.classList.remove('button_alt-active');
            this._card.classList.remove('button_alt-active');
        }

        // Обновляем значение поля адреса
        if (this._addressInput) {
            this._addressInput.value = data.address;
        }
    }

    /**
     * Обновляет представление формы контактов на основе данных модели
     */
    updateContactsView(data: { email: string, phone: string, hasContacts: boolean }): void {
        // Обновляем состояние кнопки отправки формы
        if (this._submitButton) {
            this._submitButton.disabled = !data.hasContacts;
        }

        // Обновляем значения полей формы
        if (this._phoneInput) {
            this._phoneInput.value = data.phone;
        }

        if (this._emailInput) {
            this._emailInput.value = data.email;
        }
    }

    /**
     * Обновляет представление формы на основе данных модели
     */
    updateView(): void {
        // Запрашиваем актуальные данные у модели
        if (this._isContactsForm) {
            this.events.emit('contacts:get-data');
        } else {
            this.events.emit('order:get-data');
        }
    }

    /**
     * Сбрасывает форму
     */
    reset(): void {
        if (this._isContactsForm) {
            // Сбрасываем форму контактов
            if (this._phoneInput) {
                this._phoneInput.value = '';
            }
            if (this._emailInput) {
                this._emailInput.value = '';
            }
        } else {
            // Сбрасываем форму заказа
            this._cash.classList.remove('button_alt-active');
            this._card.classList.remove('button_alt-active');
            if (this._addressInput) {
                this._addressInput.value = '';
            }
        }

        if (this._submitButton) {
            this._submitButton.disabled = true;
        }

        // Отправляем событие сброса формы
        this.events.emit('order:reset');
    }
} 