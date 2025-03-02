import { IEvents } from '../base/events';
import { TPaymentType } from '../../types';
import { ensureElement, ensureAllElements } from '../../utils/utils';
import { FormView, IFormData } from './form';

/**
 * Интерфейс данных заказа
 */
export interface IOrderData extends IFormData {
    address?: string;
    payment?: TPaymentType;
    hasAddressAndPayment?: boolean;
}

/**
 * Представление формы заказа (адрес и способ оплаты)
 */
export class OrderView extends FormView<IOrderData> {
    protected _orderButtons: HTMLButtonElement[];
    protected _addressInput: HTMLInputElement;
    protected _submitButton: HTMLButtonElement;
    protected _formErrors: HTMLElement;

    /**
     * Создаёт экземпляр представления формы заказа
     * @param container - HTML-элемент формы
     * @param events - брокер событий
     */
    constructor(
        container: HTMLFormElement,
        events: IEvents
    ) {
        super(container, events);

        // Инициализация элементов формы
        this._orderButtons = Array.from(ensureAllElements<HTMLButtonElement>('.button_alt', this.container));
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
        this._submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);

        try {
            this._formErrors = ensureElement<HTMLElement>('.form__errors', this.container);
        } catch (e) {
            console.warn('Элемент .form__errors не найден');
        }

        // Обработчики для кнопок способа оплаты
        this._orderButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.setPaymentMethod(button.name);
                this.events.emit('payment:set', { value: button.name === 'card' ? 'online' : 'paymentOnDelivery' });
            });
        });

        // Обработчик события ввода для поля адреса
        this.container.addEventListener('input', (evt: Event) => {
            const target = evt.target as HTMLInputElement;
            if (target.name === 'address') {
                this.events.emit('address:set', { value: target.value });
            }
        });

        // Обработчик отправки формы
        this.container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit('order:submit');
        });

        // Подписываемся на изменения модели
        this.events.on('order:changed', (data: object) => {
            const typedData = data as {
                address: string,
                payment: TPaymentType,
                hasAddressAndPayment: boolean,
                errors: Partial<Record<string, string>>
            };
            this.updateFormView(typedData, 'hasAddressAndPayment');
        });
    }

    /**
     * Обработчик отправки формы
     */
    protected onSubmit(): void {
        this.events.emit('order:submit');
    }

    /**
     * Устанавливает способ оплаты и обновляет UI
     */
    setPaymentMethod(payMethod: string): void {
        this._orderButtons.forEach(button => {
            button.classList.toggle('button_alt-active', button.name === payMethod);
        });
    }

    /**
     * Обработка изменений данных формы
     */
    protected onFormDataChanged(data: Partial<IOrderData>): void {
        // Обновляем состояние кнопок способа оплаты
        if (data.payment === 'online') {
            this.setPaymentMethod('card');
        } else if (data.payment === 'paymentOnDelivery') {
            this.setPaymentMethod('cash');
        }

        // Обновляем значение поля адреса
        if (this._addressInput && data.address !== undefined) {
            this._addressInput.value = data.address;
        }
    }

    /**
     * Запрашивает данные формы от модели
     */
    protected requestFormData(): void {
        this.events.emit('order:get-data');
    }

    /**
     * Дополнительная логика сброса формы
     */
    protected onReset(): void {
        // Сбрасываем кнопки способа оплаты
        this._orderButtons.forEach(button => {
            button.classList.remove('button_alt-active');
        });

        // Сбрасываем поле адреса
        if (this._addressInput) {
            this._addressInput.value = '';
        }

        // Отправляем событие сброса формы
        this.events.emit('order:reset');
    }
} 