import { EventEmitter } from './events';
import { Component } from './component';

/**
 * Интерфейс для страницы, которая может быть заблокирована
 */
export interface ILockable {
    locked: boolean;
}

/**
 * Интерфейс данных модального окна
 */
export interface IModalData {
    content?: HTMLElement;
    isOpen: boolean;
}

/**
 * Класс для управления модальным окном
 */
export class Modal extends Component<IModalData> {
    /**
     * Создаёт экземпляр модального окна
     * @param container - HTML-элемент контейнера модального окна
     * @param events - брокер событий
     * @param page - экземпляр страницы для управления блокировкой
     */
    constructor(
        container: HTMLElement,
        private events: EventEmitter,
        private page: ILockable
    ) {
        super(container);
    }

    /**
     * Открывает модальное окно
     */
    open(): void {
        this.container.classList.add('modal_active');
        this.page.locked = true;
        this.events.emit('modal:open');
    }

    /**
     * Закрывает модальное окно
     */
    close(): void {
        this.container.classList.remove('modal_active');
        this.page.locked = false;
        this.events.emit('modal:close');
    }

    /**
     * Устанавливает содержимое модального окна
     * @param content - HTML-элемент для отображения в модальном окне
     */
    setContent(content: HTMLElement): void {
        // Создаем правильную структуру модального окна
        const modalContainer = document.createElement('div');
        modalContainer.classList.add('modal__container');

        const closeButton = document.createElement('button');
        closeButton.classList.add('modal__close');
        closeButton.setAttribute('aria-label', 'закрыть');
        closeButton.addEventListener('click', () => this.close());

        const contentContainer = document.createElement('div');
        contentContainer.classList.add('modal__content');

        // Добавляем контент в структуру
        contentContainer.appendChild(content);
        modalContainer.appendChild(closeButton);
        modalContainer.appendChild(contentContainer);

        // Очищаем и добавляем созданную структуру в модальное окно
        this.container.innerHTML = '';
        this.container.appendChild(modalContainer);
    }
} 