import { Component } from '../base/component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

/**
 * Интерфейс данных успешного заказа
 */
export interface ISuccessData {
    total: number;
}

/**
 * Представление модального окна успешного заказа
 */
export class SuccessView extends Component<ISuccessData> {
    protected _okButton: HTMLButtonElement;
    protected _totalElement: HTMLElement;

    /**
     * Создаёт экземпляр представления успешного заказа
     * @param container - HTML-элемент контейнера
     * @param events - брокер событий
     */
    constructor(container: HTMLElement, private events: IEvents) {
        super(container);

        // Находим необходимые элементы
        this._okButton = ensureElement<HTMLButtonElement>('.order-success__close', container);
        this._totalElement = ensureElement<HTMLElement>('.order-success__description', container);

        // Добавляем обработчик нажатия кнопки
        this._okButton.addEventListener('click', () => {
            this.events.emit('success:close');
        });
    }

    /**
     * Устанавливает итоговую сумму заказа
     * @param total - итоговая сумма заказа
     */
    set total(total: number) {
        this._totalElement.textContent = `Списано ${total} синапсов`;
    }

    /**
     * Сбрасывает информацию в окне успешного заказа (заглушка)
     */
    reset(): void {
        // По макету нет необходимости что-либо сбрасывать
    }
} 