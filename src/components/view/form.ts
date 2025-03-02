import { Component } from '../base/component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

/**
 * Базовый интерфейс данных формы
 */
export interface IFormData {
    errors?: Partial<Record<string, string>>;
    isValid?: boolean;
}

/**
 * Базовый класс для представлений форм
 */
export abstract class FormView<T extends IFormData> extends Component<T> {
    protected _submitButton: HTMLButtonElement;
    protected _formErrors: HTMLElement;

    /**
     * Создаёт экземпляр базового представления формы
     * @param container - HTML-элемент формы
     * @param events - брокер событий
     */
    constructor(
        container: HTMLFormElement,
        protected events: IEvents
    ) {
        super(container);

        try {
            this._formErrors = ensureElement<HTMLElement>('.form__errors', this.container);
        } catch (e) {
            // Элемент для отображения ошибок отсутствует
        }

        // Базовый обработчик отправки формы
        this.container.addEventListener('submit', this.handleSubmit.bind(this));
    }

    /**
     * Обработчик отправки формы
     */
    protected handleSubmit(event: Event): void {
        event.preventDefault();
        this.onSubmit();
    }

    /**
     * Метод, вызываемый при отправке формы
     * Должен быть переопределен в наследниках
     */
    protected abstract onSubmit(): void;

    /**
     * Отображает ошибки валидации формы
     */
    protected showFormErrors(errors?: Partial<Record<string, string>>): void {
        if (!this._formErrors) return;

        // Очищаем предыдущие ошибки
        this.setText(this._formErrors, '');

        if (errors) {
            // Собираем все ошибки в одну строку
            const errorMessages = Object.values(errors).filter(Boolean);
            if (errorMessages.length > 0) {
                this.setText(this._formErrors, errorMessages.join(', '));
                this._formErrors.classList.add('form__errors_visible');
            } else {
                this._formErrors.classList.remove('form__errors_visible');
            }
        } else {
            this._formErrors.classList.remove('form__errors_visible');
        }
    }

    /**
     * Общий метод обновления представления формы
     */
    protected updateFormView(data: Partial<T>, validationField?: keyof T): void {
        // Обновляем состояние кнопки отправки формы
        if (this._submitButton && validationField && validationField in data) {
            this._submitButton.disabled = !(data[validationField] === true);
        }

        // Отображаем ошибки валидации
        if (data.errors) {
            this.showFormErrors(data.errors);
        }

        // Вызываем дополнительный обработчик для наследников
        this.onFormDataChanged(data);
    }

    /**
     * Метод для обработки изменений данных формы
     * Должен быть переопределен в наследниках
     */
    protected abstract onFormDataChanged(data: Partial<T>): void;

    /**
     * Устанавливает состояние валидации формы (активность кнопки отправки)
     */
    set validation(value: boolean) {
        if (this._submitButton) {
            this._submitButton.disabled = !value;
        }
    }

    /**
     * Сбрасывает форму
     */
    reset(): void {
        // Базовый сброс формы

        // Деактивируем кнопку отправки
        if (this._submitButton) {
            this._submitButton.disabled = true;
        }

        // Очищаем ошибки
        if (this._formErrors) {
            this.setText(this._formErrors, '');
            this._formErrors.classList.remove('form__errors_visible');
        }

        // Вызываем дополнительную логику сброса в наследниках
        this.onReset();
    }

    /**
     * Дополнительная логика сброса формы для наследников
     */
    protected abstract onReset(): void;

    /**
     * Обновляет представление формы на основе данных модели
     */
    updateView(): void {
        // По умолчанию запрашиваем данные от модели с использованием события
        this.requestFormData();
    }

    /**
     * Запрашивает данные формы от модели
     */
    protected abstract requestFormData(): void;
} 