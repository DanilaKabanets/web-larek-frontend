import { IEvents } from '../base/events';

/**
 * Интерфейс для данных модального окна
 */
export interface IModalData {
    isOpen: boolean;
}

/**
 * Интерфейс модели модального окна
 */
export interface IModalModel {
    isOpen: boolean;
    open(): void;
    close(): void;
}

/**
 * Модель модального окна, отвечающая за хранение состояния и бизнес-логику
 */
export class ModalModel implements IModalModel {
    // Флаг состояния модального окна
    private _isOpen = false;

    /**
     * Создаёт экземпляр модели модального окна
     * @param events - брокер событий
     */
    constructor(private events: IEvents) { }

    /**
     * Открывает модальное окно
     */
    open(): void {
        this._isOpen = true;
        this.emitChange();
    }

    /**
     * Закрывает модальное окно
     */
    close(): void {
        this._isOpen = false;
        this.emitChange();
    }

    /**
     * Возвращает статус открытия модального окна
     */
    get isOpen(): boolean {
        return this._isOpen;
    }

    /**
     * Оповещает об изменении состояния модального окна
     */
    private emitChange(): void {
        this.events.emit('modal:changed', { isOpen: this._isOpen });
    }
} 