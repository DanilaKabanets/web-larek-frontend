import { IEvents } from '../base/events';
import { TPaymentType, IOrder } from '../../types';
import { isEmpty } from '../../utils/utils';

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
    getData(): Omit<IOrder, 'total' | 'items'>;
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
    constructor(private events: IEvents) {
        // Подписываемся на события ввода пользователя от представления
        this.events.on('address:set', (data: object) => this.setAddress(data));
        this.events.on('payment:set', (data: object) => this.setPayment(data));
        this.events.on('email:set', (data: object) => this.setEmail(data));
        this.events.on('phone:set', (data: object) => this.setPhone(data));
        this.events.on('order:reset', () => this.reset());
    }

    /**
     * Устанавливает адрес доставки
     * @param data - объект с данными адреса
     */
    private setAddress(data: object): void {
        const addressData = data as { value: string };
        this._address = addressData.value;
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
        this.emitChange();
    }

    /**
     * Устанавливает номер телефона
     * @param data - объект с данными телефона
     */
    private setPhone(data: object): void {
        const phoneData = data as { value: string };
        this._phone = phoneData.value;
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
     * Проверяет наличие данных адреса и способа оплаты
     */
    get hasAddressAndPayment(): boolean {
        return !isEmpty(this._address) && !isEmpty(this._payment);
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
    getData(): Omit<IOrder, 'total' | 'items'> {
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
     * Генерирует событие изменения данных формы
     */
    private emitChange(): void {
        // Генерируем разные события в зависимости от того, какие данные изменились
        if (this._address || this._payment !== null) {
            this.events.emit('order:changed', {
                address: this._address,
                payment: this._payment,
                hasAddressAndPayment: this.hasAddressAndPayment
            });
        }

        if (this._email || this._phone) {
            this.events.emit('contacts:changed', {
                email: this._email,
                phone: this._phone,
                hasContacts: this.hasContacts
            });
        }

        // Общее событие изменения заказа
        this.events.emit('order:full-changed', this.getData());
    }
} 