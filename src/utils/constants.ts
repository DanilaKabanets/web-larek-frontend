import { CategoryType } from '../types';

export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {

};

export const categoryMapping: Record<CategoryType, string> = {
    'софт-скил': 'card__category_soft',
    'хард-скил': 'card__category_hard',
    'дополнительное': 'card__category_additional',
    'другое': 'card__category_other',
    'кнопка': 'card__category_button'
};

// Тексты ошибок валидации формы заказа
export const VALIDATION_ERRORS = {
    EMPTY_ADDRESS: 'Необходимо указать адрес доставки',
    INVALID_EMAIL: 'Некорректный формат email',
    EMPTY_EMAIL: 'Необходимо указать email',
    EMPTY_PHONE: 'Необходимо указать номер телефона',
    INVALID_PHONE: 'Некорректный формат номера телефона'
};
