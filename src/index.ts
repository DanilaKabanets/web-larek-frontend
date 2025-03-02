import './scss/styles.scss';

import { WebLarekAPI } from './components/webLarekAPI';
import { BasketModel } from './components/model/basket';
import { PageModel } from './components/model/page';
import { OrderModel } from './components/model/order';

import { Page } from './components/view/page';
import { Modal } from './components/view/modal';
import { OrderView } from './components/view/order';
import { BasketView } from './components/view/basket';

import { EventEmitter } from './components/base/events';
import { IProduct, IOrder, TPaymentType, IOrderSuccess, FormData } from './types';
import { ensureElement, cloneTemplate, handlePrice, isBoolean } from './utils/utils';
import { Card } from './components/view/card';
import { API_URL } from './utils/constants';

// === Шаблоны ===
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketItemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const modalContainerElement = ensureElement<HTMLElement>('#modal-container');

// === Инициализация ===
// Брокер событий
const events = new EventEmitter();

// === Модели ===
const apiModel = new WebLarekAPI('catalog', API_URL);
const pageModel = new PageModel(events);
const basketModel = new BasketModel(events);
const orderModel = new OrderModel(events);

// === Представления ===
const page = new Page(document.body, events);
const modal = new Modal(modalContainerElement, events);

// Инициализация контейнера корзины
const basketContainer = cloneTemplate<HTMLElement>(basketTemplate);
const basketView = new BasketView('basket', basketContainer, events);

// === Обработчики событий ===

// Обработчик блокировки/разблокировки страницы при открытии/закрытии модального окна
events.on('modal:open', () => {
    if (isBoolean(true)) {
        pageModel.setLocked(true);
    }
});
events.on('modal:close', () => {
    if (isBoolean(false)) {
        pageModel.setLocked(false);
    }
});

// Отображение списка товаров
events.on('products:changed', (products: IProduct[]) => {
    const cardElements = products.map(product => {
        const cardElement = cloneTemplate<HTMLElement>(cardCatalogTemplate);
        const card = new Card(cardElement, {
            onClick: () => events.emit('product:select', product)
        });

        return card.render(product);
    });

    page.store = cardElements;
    pageModel.setProducts(products);
});

// Отображение информации о товаре
events.on('product:select', (product: IProduct) => {
    const cardElement = cloneTemplate<HTMLElement>(cardPreviewTemplate);
    const card = new Card(cardElement, {
        onClick: () => {
            basketModel.addProduct(product);
            modal.close();
        }
    });

    modal.content = card.render(product);
    modal.open();
});

// Обновление состояния корзины
events.on('basket:changed', (items: IProduct[]) => {
    // Обновляем счетчик в шапке
    page.counter = basketModel.getProductCount();
});

// Открытие корзины
events.on('basket:open', () => {
    // Всегда получаем свежие элементы корзины при открытии
    const basketItems = basketView.renderBasketItems(basketItemTemplate);

    // Обновляем список элементов корзины
    basketView.items = basketItems;

    // Обновляем отображение корзины (цена, активность кнопки)
    basketView.updateView();

    // Отображаем корзину в модальном окне
    modal.content = basketContainer;
    modal.open();
});

// Оформление заказа
events.on('basket:order', () => {
    // Клонируем шаблон формы заказа
    const orderElement = cloneTemplate<HTMLFormElement>(orderTemplate);

    // Создаем представление формы заказа
    new OrderView(orderElement, events);

    // Отображаем форму заказа в модальном окне
    modal.content = orderElement;
});

// Обработчик события order:submit - переход от формы заказа к форме контактов
events.on('order:submit', () => {
    // Клонируем шаблон формы контактов
    const contactsElement = cloneTemplate<HTMLFormElement>(contactsTemplate);

    // Создаем представление формы контактов
    new OrderView(contactsElement, events);

    // Отображаем форму контактов в модальном окне
    modal.content = contactsElement;
});

// Обработка отправки заказа
events.on('order:data', (orderData: FormData) => {
    // Формируем данные для отправки
    const basketItems = basketModel.getProducts().map(item => item.id);

    const orderDto: IOrder = {
        payment: orderData.payment,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address,
        total: basketModel.getTotal(),
        items: basketItems
    };

    // Отправляем заказ
    apiModel.postOrderLot(orderDto)
        .then((result: IOrderSuccess) => {
            // Очищаем корзину после успешного заказа
            basketModel.clearBasket();

            // Отображаем сообщение об успешном оформлении заказа
            const successElement = cloneTemplate<HTMLElement>(successTemplate);
            modal.content = successElement;

            // Находим и обновляем информацию о номере заказа и сумме
            const idElement = successElement.querySelector('.order-success__number');
            const totalElement = successElement.querySelector('.order-success__total');
            const descriptionElement = successElement.querySelector('.order-success__description');
            const closeButton = successElement.querySelector('.order-success__close');

            if (idElement) {
                idElement.textContent = result.id;
            }
            if (totalElement) {
                totalElement.textContent = handlePrice(result.total);
            }
            if (descriptionElement) {
                descriptionElement.textContent = `Списано ${handlePrice(result.total)} синапсов`;
            }

            // Добавляем обработчик клика на кнопку "За новыми покупками"
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    modal.close();
                });
            }
        })
        .catch((error: Error) => {
            console.error('Ошибка при оформлении заказа:', error);
        });
});

// Обработка отправки формы контактов
events.on('contacts:submit', (contactsData: { email: string, phone: string }) => {
    // Получаем текущие данные заказа
    const orderData = orderModel.getData();

    // Объединяем данные заказа и контактов
    const fullOrderData = {
        ...orderData,
        email: contactsData.email,
        phone: contactsData.phone
    };

    // Вызываем событие для отправки заказа на сервер
    events.emit('order:data', fullOrderData);
});

// Обработка успешного оформления заказа
events.on('order:completed', (data: { total: number }) => {
    // Клонируем шаблон успешного оформления заказа
    const successElement = cloneTemplate<HTMLElement>(successTemplate);

    // Находим элементы для обновления
    const descriptionElement = successElement.querySelector('.order-success__description');
    const closeButton = successElement.querySelector('.order-success__close');

    // Обновляем сумму списания
    if (descriptionElement) {
        descriptionElement.textContent = `Списано ${handlePrice(data.total)} синапсов`;
    }

    // Добавляем обработчик клика на кнопку "За новыми покупками"
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.close();
        });
    }

    // Отображаем сообщение об успешном оформлении заказа
    modal.content = successElement;

    // Очищаем корзину
    basketModel.clearBasket();

    // Сбрасываем данные формы заказа
    orderModel.reset();
});

// Инициализация приложения
apiModel.getProductItems()
    .then((products: IProduct[]) => {
        events.emit('products:changed', products);
    })
    .catch(error => {
        console.error('Ошибка при загрузке товаров:', error);
    });