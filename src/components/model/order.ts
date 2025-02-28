import { IEvents } from '../base/events';
import { TPaymentType, IOrderDto } from '../../types';

/**
 * Интерфейс модели формы заказа
 */
export interface IOrderModel {
    address: string;
    payment: TPaymentType;
    email: string;
    phone: string;
    isAddressAndPaymentValid: boolean;
    isContactsValid: boolean;
    isValid: boolean;
    setAddress(address: string): void;
    setPayment(payment: TPaymentType): void;
    setEmail(email: string): void;
    setPhone(phone: string): void;
    getData(): Omit<IOrderDto, 'total' | 'items'>;
    reset(): void;
}

/**
 * Модель формы заказа, отвечающая за хранение и управление данными
 */
export class OrderModel implements IOrderModel {
    // Данные заказа
    private _address = '';
    private _payment: TPaymentType | null = null;
    private _email = '';
    private _phone = '';

    /**
     * Создаёт экземпляр модели формы заказа
     * @param events - брокер событий
     */
    constructor(private events: IEvents) { }

    /**
     * Устанавливает адрес доставки
     * @param address - адрес доставки
     */
    setAddress(address: string): void {
        this._address = address;
        this.emitChange();
    }

    /**
     * Устанавливает способ оплаты
     * @param payment - способ оплаты
     */
    setPayment(payment: TPaymentType): void {
        this._payment = payment;
        this.emitChange();
    }

    /**
     * Устанавливает адрес электронной почты
     * @param email - адрес электронной почты
     */
    setEmail(email: string): void {
        this._email = email;
        this.emitChange();
    }

    /**
     * Устанавливает номер телефона
     * @param phone - номер телефона
     */
    setPhone(phone: string): void {
        this._phone = phone;
        this.emitChange();
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
     * Проверяет валидность данных адреса и способа оплаты
     */
    get isAddressAndPaymentValid(): boolean {
        return Boolean(this._address && this._payment);
    }

    /**
     * Проверяет валидность данных контактов
     */
    get isContactsValid(): boolean {
        return Boolean(this._email && this._phone &&
            OrderModel.validateEmail(this._email) &&
            OrderModel.validatePhone(this._phone));
    }

    /**
     * Проверяет валидность всех данных формы
     */
    get isValid(): boolean {
        return this.isAddressAndPaymentValid && this.isContactsValid;
    }

    /**
     * Возвращает данные формы заказа
     */
    getData(): Omit<IOrderDto, 'total' | 'items'> {
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
        this._payment = null;
        this._email = '';
        this._phone = '';
        this.emitChange();
    }

    /**
     * Валидирует email с использованием регулярного выражения
     * @param email - адрес электронной почты для проверки
     */
    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Валидирует телефон с использованием регулярного выражения
     * @param phone - номер телефона для проверки
     */
    static validatePhone(phone: string): boolean {
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Генерирует событие изменения данных формы
     */
    private emitChange(): void {
        // Генерируем разные события в зависимости от того, какие данные изменились
        if (this._address || this._payment !== null) {
            this.events.emit('order:changed', this.getData());
        }

        if (this._email || this._phone) {
            this.events.emit('contacts:changed', {
                email: this._email,
                phone: this._phone
            });
        }

        // Общее событие изменения заказа
        this.events.emit('order:full-changed', this.getData());
    }
} 