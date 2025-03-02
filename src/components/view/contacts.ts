import { IEvents } from '../base/events';
import { ensureElement, ensureAllElements } from '../../utils/utils';
import { FormView, IFormData } from './form';

/**
 * Интерфейс данных контактов
 */
export interface IContactsData extends IFormData {
    email?: string;
    phone?: string;
    hasContacts?: boolean;
}

/**
 * Представление формы контактов
 */
export class ContactsView extends FormView<IContactsData> {
    protected _inputs: HTMLInputElement[];

    /**
     * Создаёт экземпляр представления формы контактов
     * @param container - HTML-элемент формы
     * @param events - брокер событий
     */
    constructor(
        container: HTMLFormElement,
        events: IEvents
    ) {
        super(container, events);

        // Инициализация элементов формы
        this._inputs = Array.from(ensureAllElements<HTMLInputElement>('.form__input', this.container));
        this._submitButton = ensureElement<HTMLButtonElement>('.button', this.container);

        // Обработчики для полей ввода
        this._inputs.forEach(input => {
            input.addEventListener('input', (evt: Event) => {
                const target = evt.target as HTMLInputElement;
                const field = target.name;
                const value = target.value;
                this.events.emit('contacts:change', { field, value });

                // Также отправляем событие для конкретного поля
                this.events.emit(`${field}:set`, { value });
            });
        });

        // Подписываемся на изменения модели
        this.events.on('contacts:changed', (data: object) => {
            const typedData = data as { email: string, phone: string, hasContacts: boolean, errors?: Partial<Record<string, string>> };
            this.updateFormView(typedData, 'hasContacts');
        });
    }

    /**
     * Обработчик отправки формы
     */
    protected onSubmit(): void {
        // Собираем данные из формы
        const contactsData = {
            email: this.getInputValue('email'),
            phone: this.getInputValue('phone')
        };

        this.events.emit('contacts:submit', contactsData);
        this.events.emit('success:open');
    }

    /**
     * Получает значение поля ввода по имени
     */
    private getInputValue(name: string): string {
        const input = this._inputs.find(input => input.name === name);
        return input ? input.value : '';
    }

    /**
     * Обработка изменений данных формы
     */
    protected onFormDataChanged(data: Partial<IContactsData>): void {
        // Обновляем значения полей формы
        this._inputs.forEach(input => {
            const fieldName = input.name;
            if (fieldName === 'email' && data.email !== undefined) {
                input.value = data.email;
            } else if (fieldName === 'phone' && data.phone !== undefined) {
                input.value = data.phone;
            }
        });
    }

    /**
     * Запрашивает данные формы от модели
     */
    protected requestFormData(): void {
        this.events.emit('contacts:get-data');
    }

    /**
     * Дополнительная логика сброса формы
     */
    protected onReset(): void {
        // Сбрасываем поля ввода
        this._inputs.forEach(input => {
            input.value = '';
        });

        // Отправляем событие сброса формы
        this.events.emit('contacts:reset');
    }
}