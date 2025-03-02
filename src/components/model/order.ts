import { IEvents } from '../base/events';
import { TPaymentType, IOrder, FormData } from '../../types';
import { isEmpty } from '../../utils/utils';
import { VALIDATION_ERRORS } from '../../utils/constants';

/**
 * Интерфейс модели формы заказа
 */
export interface IOrderModel {
    address: string;
    payment: TPaymentType;
    email: string;
    phone: string;
    hasAddressAndPayment: boolean;
    hasContacts: boolean;
    isFormFilled: boolean;
    formErrors: Partial<Record<keyof FormData, string>>;
    getData(): FormData;
    reset(): void;
    validateForm(): boolean;
}

/**
 * Модель формы заказа, отвечающая за хранение и управление данными
 */
export class OrderModel implements IOrderModel {
    // Данные заказа
    private _address = '';
    private _payment: TPaymentType = 'online';
    private _email = '';
    private _phone = '';

    // Ошибки валидации полей формы
    formErrors: Partial<Record<keyof FormData, string>> = {};

    /**
     * Создаёт экземпляр модели формы заказа
     * @param events - брокер событий
     */
    constructor(private events: IEvents) {
    }

    /**
     * Устанавливает адрес доставки
     * @param data - объект с данными адреса
     */
    private setAddress(data: object): void {
        const addressData = data as { value: string };
        this._address = addressData.value;
        this.validateAddress();
        this.emitChange();
    }

    /**
     * Устанавливает способ оплаты
     * @param data - объект с данными способа оплаты
     */
    private setPayment(data: object): void {
        const paymentData = data as { value: TPaymentType };
        this._payment = paymentData.value;
        this.emitChange();
    }

    /**
     * Устанавливает адрес электронной почты
     * @param data - объект с данными email
     */
    private setEmail(data: object): void {
        const emailData = data as { value: string };
        this._email = emailData.value;
        this.validateEmail();
        this.emitChange();
    }

    /**
     * Устанавливает номер телефона
     * @param data - объект с данными телефона
     */
    private setPhone(data: object): void {
        const phoneData = data as { value: string };
        this._phone = phoneData.value;
        this.validatePhone();
        this.emitChange();
    }

    /**
     * Валидирует адрес доставки
     */
    private validateAddress(): void {
        if (isEmpty(this._address)) {
            this.formErrors.address = VALIDATION_ERRORS.EMPTY_ADDRESS;
        } else {
            delete this.formErrors.address;
        }
    }

    /**
     * Валидирует email
     */
    private validateEmail(): void {
        if (isEmpty(this._email)) {
            this.formErrors.email = VALIDATION_ERRORS.EMPTY_EMAIL;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this._email)) {
            this.formErrors.email = VALIDATION_ERRORS.INVALID_EMAIL;
        } else {
            delete this.formErrors.email;
        }
    }

    /**
     * Валидирует телефон
     */
    private validatePhone(): void {
        if (isEmpty(this._phone)) {
            this.formErrors.phone = VALIDATION_ERRORS.EMPTY_PHONE;
        } else if (!/^(\+7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/.test(this._phone)) {
            this.formErrors.phone = VALIDATION_ERRORS.INVALID_PHONE;
        } else {
            delete this.formErrors.phone;
        }
    }

    /**
     * Валидирует все поля формы
     */
    validateForm(): boolean {
        this.validateAddress();
        this.validateEmail();
        this.validatePhone();

        return Object.keys(this.formErrors).length === 0;
    }

    /**
     * Возвращает текущий адрес доставки
     */
    get address(): string {
        return this._address;
    }

    /**
     * Возвращает текущий способ оплаты
     */
    get payment(): TPaymentType {
        return this._payment;
    }

    /**
     * Возвращает текущий адрес электронной почты
     */
    get email(): string {
        return this._email;
    }

    /**
     * Возвращает текущий номер телефона
     */
    get phone(): string {
        return this._phone;
    }

    /**
     * Проверяет наличие данных адреса и способа оплаты
     */
    get hasAddressAndPayment(): boolean {
        return !isEmpty(this._address);
    }

    /**
     * Проверяет наличие данных контактов
     */
    get hasContacts(): boolean {
        return !isEmpty(this._email) && !isEmpty(this._phone);
    }

    /**
     * Проверяет наличие всех данных формы
     */
    get isFormFilled(): boolean {
        return this.hasAddressAndPayment && this.hasContacts;
    }

    /**
     * Возвращает данные формы заказа
     */
    getData(): FormData {
        return {
            address: this._address,
            payment: this._payment,
            email: this._email,
            phone: this._phone
        };
    }

    /**
     * Сбрасывает данные формы
     */
    reset(): void {
        this._address = '';
        this._payment = 'online';
        this._email = '';
        this._phone = '';
        this.formErrors = {};
        this.emitChange();
    }

    /**
     * Генерирует событие изменения данных формы
     */
    private emitChange(): void {
        // Генерируем разные события в зависимости от того, какие данные изменились
        if (this._address) {
            this.events.emit('order:changed', {
                address: this._address,
                payment: this._payment,
                hasAddressAndPayment: this.hasAddressAndPayment,
                errors: this.formErrors
            });
        }

        if (this._email || this._phone) {
            this.events.emit('contacts:changed', {
                email: this._email,
                phone: this._phone,
                hasContacts: this.hasContacts,
                errors: this.formErrors
            });
        }

        // Общее событие изменения заказа
        this.events.emit('order:full-changed', {
            ...this.getData(),
            errors: this.formErrors
        });
    }
} 