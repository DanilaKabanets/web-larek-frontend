import { Component } from '../base/component';
import { IEvents } from '../base/events';
import { IOrderModel } from '../model/order';

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

    /**
     * Создаёт экземпляр представления формы заказа
     * @param container - HTML-элемент формы
     * @param events - брокер событий
     * @param model - модель формы заказа
     */
    constructor(
        container: HTMLFormElement,
        private events: IEvents,
        private model: IOrderModel
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
            this.events.on('contacts:changed', () => {
                this.updateContactsView();
            });
        } else {
            this.events.on('order:changed', () => {
                this.updateOrderView();
            });
        }
    }

    /**
     * Инициализирует форму заказа (адрес и способ оплаты)
     * @param container - HTML-элемент формы
     */
    private initOrderForm(container: HTMLFormElement): void {
        // Получаем ссылки на элементы формы
        this._card = container.elements.namedItem('card') as HTMLButtonElement;
        this._cash = container.elements.namedItem('cash') as HTMLButtonElement;
        this._addressInput = container.elements.namedItem('address') as HTMLInputElement;
        this._submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;

        // По умолчанию кнопка отправки неактивна
        if (this._submitButton) {
            this._submitButton.disabled = true;
        }

        // Обработчики для кнопок способа оплаты
        if (this._cash) {
            this._cash.addEventListener('click', () => {
                this._cash.classList.add('button_alt-active');
                this._card.classList.remove('button_alt-active');
                // Меняем значение на 'paymentOnDelivery' (оплата при доставке)
                this.model.setPayment('paymentOnDelivery');
            });
        }
        if (this._card) {
            this._card.addEventListener('click', () => {
                this._card.classList.add('button_alt-active');
                this._cash.classList.remove('button_alt-active');
                // Меняем значение на 'online' (онлайн-оплата)
                this.model.setPayment('online');
            });
        }

        // Добавляем обработчик события ввода для поля адреса
        if (this._addressInput) {
            this._addressInput.addEventListener('input', () => {
                this.model.setAddress(this._addressInput.value);
            });
        }

        // Добавляем обработчик отправки формы
        container.addEventListener('submit', (event) => {
            event.preventDefault();
            if (this.model.isAddressAndPaymentValid) {
                this.events.emit('order:submit', this.model.getData());
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
        this._submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;

        // По умолчанию кнопка отправки неактивна
        if (this._submitButton) {
            this._submitButton.disabled = true;
        }

        // Добавляем обработчики событий ввода
        if (this._phoneInput) {
            this._phoneInput.addEventListener('input', () => {
                this.model.setPhone(this._phoneInput.value);
            });
        }

        if (this._emailInput) {
            this._emailInput.addEventListener('input', () => {
                this.model.setEmail(this._emailInput.value);
            });
        }

        // Добавляем обработчик отправки формы
        container.addEventListener('submit', (event) => {
            event.preventDefault();
            if (this.model.isContactsValid) {
                this.events.emit('contacts:submit', {
                    email: this.model.email,
                    phone: this.model.phone
                });
            }
        });
    }

    /**
     * Обновляет представление формы заказа на основе данных модели
     */
    updateOrderView(): void {
        // Обновляем состояние кнопки отправки формы
        if (this._submitButton) {
            this._submitButton.disabled = !this.model.isAddressAndPaymentValid;
        }

        // Обновляем состояние кнопок способа оплаты
        if (this.model.payment === 'online') {
            this._card.classList.add('button_alt-active');
            this._cash.classList.remove('button_alt-active');
        } else if (this.model.payment === 'paymentOnDelivery') {
            this._cash.classList.add('button_alt-active');
            this._card.classList.remove('button_alt-active');
        } else {
            this._cash.classList.remove('button_alt-active');
            this._card.classList.remove('button_alt-active');
        }

        // Обновляем значение поля адреса
        if (this._addressInput) {
            this._addressInput.value = this.model.address;
        }
    }

    /**
     * Обновляет представление формы контактов на основе данных модели
     */
    updateContactsView(): void {
        // Обновляем состояние кнопки отправки формы
        if (this._submitButton) {
            this._submitButton.disabled = !this.model.isContactsValid;
        }

        // Обновляем значения полей формы
        if (this._phoneInput) {
            this._phoneInput.value = this.model.phone;
        }

        if (this._emailInput) {
            this._emailInput.value = this.model.email;
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
        } else {
            // Сбрасываем форму заказа
            this._cash.classList.remove('button_alt-active');
            this._card.classList.remove('button_alt-active');
            if (this._addressInput) {
                this._addressInput.value = '';
            }
        }
    }
} 