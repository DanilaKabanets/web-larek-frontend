import { Component } from '../base/component';
import { IEvents } from '../base/events';
import { IModalModel, IModalData } from '../model/modal';

/**
 * Интерфейс для страницы, которая может быть заблокирована
 */
export interface ILockable {
    locked: boolean;
}

/**
 * Представление модального окна
 */
export class ModalView extends Component<object> {
    // Храним ссылку на обработчик клавиши ESC для последующего удаления
    private escHandler: (event: KeyboardEvent) => void;
    private _content: HTMLElement;

    /**
     * Создаёт экземпляр представления модального окна
     * @param container - HTML-элемент контейнера модального окна
     * @param events - брокер событий
     * @param model - модель модального окна
     * @param page - экземпляр страницы для управления блокировкой
     */
    constructor(
        container: HTMLElement,
        private events: IEvents,
        private model: IModalModel,
        private page: ILockable
    ) {
        super(container);

        // Проверяем, был ли уже создан контейнер
        let modalContainer = this.container.querySelector('.modal__container') as HTMLDivElement;

        // Создаем контейнер только если его еще нет
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.classList.add('modal__container');

            const closeButton = document.createElement('button');
            closeButton.classList.add('modal__close');
            closeButton.setAttribute('aria-label', 'закрыть');
            closeButton.addEventListener('click', () => this.close());

            const contentContainer = document.createElement('div');
            contentContainer.classList.add('modal__content');
            this._content = contentContainer;

            modalContainer.appendChild(closeButton);
            modalContainer.appendChild(contentContainer);

            // Очищаем контейнер перед добавлением новых элементов
            this.container.innerHTML = '';
            this.container.appendChild(modalContainer);
        } else {
            this._content = modalContainer.querySelector('.modal__content') as HTMLDivElement;

            // Добавляем обработчик клика на существующую кнопку закрытия
            const existingCloseButton = modalContainer.querySelector('.modal__close');
            if (existingCloseButton) {
                // Удаляем старые обработчики, чтобы избежать дублирования
                existingCloseButton.replaceWith(existingCloseButton.cloneNode(true));
                const newCloseButton = modalContainer.querySelector('.modal__close');
                newCloseButton.addEventListener('click', () => this.close());
            }
        }

        // Создаем обработчик клавиши ESC
        this.escHandler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                this.close();
            }
        };

        // Добавляем обработчик клика на оверлей для закрытия модального окна
        this.container.addEventListener('click', (event) => {
            // Закрываем окно только если клик был на оверлей (основной контейнер),
            // а не на содержимое модального окна
            if (event.target === this.container) {
                this.close();
            }
        });

        // Подписываемся на изменения в модели
        this.events.on('modal:changed', (data: IModalData) => {
            if (data.isOpen) {
                this.open(); // Теперь просто открываем DOM без вызова model.open()
            } else {
                this.close(); // Теперь просто закрываем DOM без вызова model.close()
            }
        });
    }

    /**
     * Открывает модальное окно
     */
    open(): void {
        // Проверяем наличие лишних контейнеров и удаляем их
        const containers = this.container.querySelectorAll('.modal__container');
        if (containers.length > 1) {
            // Оставляем только первый контейнер
            for (let i = 1; i < containers.length; i++) {
                containers[i].remove();
            }
            // Переназначаем контент
            this._content = this.container.querySelector('.modal__content') as HTMLDivElement;
        }

        // Обновляем обработчик кнопки закрытия
        const closeButton = this.container.querySelector('.modal__close');
        if (closeButton) {
            // Удаляем старые обработчики и добавляем новый
            closeButton.replaceWith(closeButton.cloneNode(true));
            const newCloseButton = this.container.querySelector('.modal__close');
            newCloseButton.addEventListener('click', () => this.close());
        }

        // Добавляем проверку, чтобы не добавлять класс, если он уже есть
        if (!this.container.classList.contains('modal_active')) {
            this.container.classList.add('modal_active');
            this.page.locked = true;

            // Добавляем обработчик клавиши ESC при открытии модального окна
            document.addEventListener('keydown', this.escHandler);
        }
    }

    /**
     * Закрывает модальное окно
     */
    close(): void {
        // Добавляем проверку, чтобы не удалять класс, если его уже нет
        if (this.container.classList.contains('modal_active')) {
            this.container.classList.remove('modal_active');
            this.page.locked = false;

            // Удаляем обработчик клавиши ESC при закрытии модального окна
            document.removeEventListener('keydown', this.escHandler);
        }
    }

    /**
     * Устанавливает содержимое модального окна
     * @param content - HTML-элемент для отображения в модальном окне
     */
    set content(value: HTMLElement) {
        // Полностью очищаем контейнер контента перед добавлением нового
        if (this._content) {
            this._content.innerHTML = '';
            this._content.replaceChildren(value);
        }
    }
} 