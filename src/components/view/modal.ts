import { Component } from '../base/component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

/**
 * Интерфейс для страницы, которая может быть заблокирована
 */
export interface ILockable {
    locked: boolean;
}

interface IModalData {
    content: HTMLElement;
}

/**
 * Представление модального окна
 */
export class Modal extends Component<IModalData> {
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;
    protected wrapper: HTMLElement;

    /**
     * Создаёт экземпляр представления модального окна
     * @param container - HTML-элемент контейнера модального окна
     * @param events - брокер событий
     */
    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this._content = ensureElement<HTMLElement>('.modal__content', container);

        this._closeButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', this.close.bind(this));
        this._content.addEventListener('click', (event) => event.stopPropagation());

        this.wrapper = document.querySelector('.page__wrapper');

        // Добавляем обработчик клавиши ESC для закрытия модального окна
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.container.classList.contains('modal_active')) {
                this.close();
            }
        });
    }

    /**
     * Устанавливает содержимое модального окна
     * @param content - HTML-элемент для отображения в модальном окне
     */
    set content(value: HTMLElement) {
        this._content.replaceChildren(value);
    }

    /**
     * Открывает модальное окно
     */
    open() {
        this.container.classList.add('modal_active');
        this.lock = true;
        this.events.emit('modal:open');
    }

    /**
     * Закрывает модальное окно
     */
    close() {
        this.container.classList.remove('modal_active');
        this.lock = false;
        this.content = null;
        this.events.emit('modal:close');
    }

    render(data: IModalData): HTMLElement {
        super.render(data);
        this.open();
        return this.container;
    }

    set lock(value: boolean) {
        if (value) {
            this.wrapper.classList.add('page__wrapper_locked');
        } else {
            this.wrapper.classList.remove('page__wrapper_locked');
        }
    }
} 