import { Component } from '../base/component';
import { IEvents } from '../base/events';
import { TPaymentType } from '../../types';
import { ensureElement } from '../../utils/utils';

/**
 * Представление формы заказа
 */
export class OrderView extends Component<object> {
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

    // Флаги состояния данных
    private _hasAddressAndPayment = false;
    private _hasContacts = false;
    private _address = '';
    private _email = '';
    private _phone = '';
    private _payment: TPaymentType | null = null;

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
                const typedData = data as { email: string, phone: string };
                this._email = typedData.email;
                this._phone = typedData.phone;
                this._hasContacts = Boolean(typedData.email && typedData.phone);
                this.updateContactsView();
            });
        } else {
            this.events.on('order:changed', (data: object) => {
                const typedData = data as { address: string, payment: TPaymentType };
                this._address = typedData.address;
                this._payment = typedData.payment;
                this._hasAddressAndPayment = Boolean(typedData.address && typedData.payment);
                this.updateOrderView();
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
            if (this._hasAddressAndPayment) {
                this.events.emit('order:submit');
            }
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
                // Проверяем валидность поля перед отправкой события
                this.validateAndEmitInput(this._phoneInput, 'phone:set');
            });
        }

        if (this._emailInput) {
            this._emailInput.addEventListener('input', () => {
                // Проверяем валидность поля перед отправкой события
                this.validateAndEmitInput(this._emailInput, 'email:set');
            });
        }

        // Добавляем обработчик отправки формы
        container.addEventListener('submit', (event) => {
            event.preventDefault();
            if (this._hasContacts && this.areInputsValid()) {
                this.events.emit('contacts:submit', {
                    email: this._email,
                    phone: this._phone
                });
            }
        });
    }

    /**
     * Проверяет валидность поля ввода и отправляет событие
     * @param input - поле ввода
     * @param eventName - имя события для отправки
     */
    private validateAndEmitInput(input: HTMLInputElement, eventName: string): void {
        const value = input.value;
        // Отправляем событие об изменении значения
        this.events.emit(eventName, { value });
    }

    /**
     * Проверяет валидность всех полей ввода
     */
    private areInputsValid(): boolean {
        let isValid = true;

        if (this._emailInput) {
            isValid = isValid && this._emailInput.validity.valid;
        }

        if (this._phoneInput) {
            isValid = isValid && this._phoneInput.validity.valid;
        }

        return isValid;
    }

    /**
     * Обновляет представление формы заказа на основе данных модели
     */
    updateOrderView(): void {
        // Обновляем состояние кнопки отправки формы
        if (this._submitButton) {
            this._submitButton.disabled = !this._hasAddressAndPayment;
        }

        // Обновляем состояние кнопок способа оплаты
        if (this._payment === 'online') {
            this._card.classList.add('button_alt-active');
            this._cash.classList.remove('button_alt-active');
        } else if (this._payment === 'paymentOnDelivery') {
            this._cash.classList.add('button_alt-active');
            this._card.classList.remove('button_alt-active');
        } else {
            this._cash.classList.remove('button_alt-active');
            this._card.classList.remove('button_alt-active');
        }

        // Обновляем значение поля адреса
        if (this._addressInput) {
            this._addressInput.value = this._address;
        }
    }

    /**
     * Обновляет представление формы контактов на основе данных модели
     */
    updateContactsView(): void {
        // Обновляем состояние кнопки отправки формы
        if (this._submitButton) {
            this._submitButton.disabled = !this._hasContacts || !this.areInputsValid();
        }

        // Обновляем значения полей формы
        if (this._phoneInput) {
            this._phoneInput.value = this._phone;
        }

        if (this._emailInput) {
            this._emailInput.value = this._email;
        }
    }

    /**
     * Обновляет представление формы на основе данных модели
     */
    updateView(): void {
        if (this._isContactsForm) {
            this.updateContactsView();
        } else {
            this.updateOrderView();
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
            this._email = '';
            this._phone = '';
            this._hasContacts = false;
        } else {
            // Сбрасываем форму заказа
            this._cash.classList.remove('button_alt-active');
            this._card.classList.remove('button_alt-active');
            if (this._addressInput) {
                this._addressInput.value = '';
            }
            this._address = '';
            this._payment = null;
            this._hasAddressAndPayment = false;
        }

        if (this._submitButton) {
            this._submitButton.disabled = true;
        }

        // Отправляем событие сброса формы
        this.events.emit('order:reset');
    }
} 