import './scss/styles.scss';

import { WebLarekAPI } from './components/webLarekAPI';
import { BasketModel } from './components/model/basket';
import { PageModel } from './components/model/page';
import { OrderModel } from './components/model/order';

import { Page } from './components/view/page';
import { Modal } from './components/view/modal';
import { OrderView } from './components/view/order';
import { BasketView } from './components/view/basket';
import { SuccessView } from './components/view/success';
import { ContactsView } from './components/view/contacts';

import { EventEmitter } from './components/base/events';
import { IProduct, IOrderSuccess, FormData } from './types';
import { ensureElement, cloneTemplate } from './utils/utils';
import { Card } from './components/view/card';
import { API_URL } from './utils/constants';

// === Шаблоны ===
const templates = {
    cardCatalog: ensureElement<HTMLTemplateElement>('#card-catalog'),
    cardPreview: ensureElement<HTMLTemplateElement>('#card-preview'),
    basketItem: ensureElement<HTMLTemplateElement>('#card-basket'),
    basket: ensureElement<HTMLTemplateElement>('#basket'),
    order: ensureElement<HTMLTemplateElement>('#order'),
    contacts: ensureElement<HTMLTemplateElement>('#contacts'),
    success: ensureElement<HTMLTemplateElement>('#success')
};

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
const basketContainer = cloneTemplate<HTMLElement>(templates.basket);
const basketView = new BasketView('basket', basketContainer, events);

/**
 * Инициализация обработчиков событий UI
 */
function initUIEvents() {
    // === События модального окна ===
    events.on('modal:open', () => {
        pageModel.setLocked(true);
    });

    events.on('modal:close', () => {
        pageModel.setLocked(false);
        // Сбрасываем состояние форм при закрытии модального окна
        orderModel.reset();
    });

    // === События успешного заказа ===
    events.on('success:close', () => {
        modal.close();
    });

    // === События каталога ===
    events.on('products:changed', (products: IProduct[]) => {
        const cardElements = products.map(product => {
            const cardElement = cloneTemplate<HTMLElement>(templates.cardCatalog);
            const card = new Card(cardElement, {
                onClick: () => events.emit('product:select', product)
            });
            return card.render(product);
        });

        page.store = cardElements;
        pageModel.setProducts(products);
    });

    events.on('product:select', (product: IProduct) => {
        const cardElement = cloneTemplate<HTMLElement>(templates.cardPreview);
        const card = new Card(cardElement, {
            onClick: () => {
                basketModel.addProduct(product);
                modal.close();
            }
        });

        modal.content = card.render(product);
        modal.open();
    });
}

/**
 * Инициализация обработчиков событий корзины и оформления заказа
 */
function initOrderEvents() {
    // === События корзины ===
    events.on('basket:changed', () => {
        // Обновляем счетчик в шапке
        page.counter = basketModel.getProductCount();
    });

    events.on('basket:get-products', () => {
        events.emit('basket:products', basketModel.getProducts());
    });

    events.on('basket:get-total', () => {
        events.emit('basket:total-updated', { value: basketModel.getTotal() });
    });

    events.on('basket:remove', (data: { id: string }) => {
        basketModel.removeProduct(data.id);
        const basketItems = basketView.renderBasketItems(templates.basketItem);
        basketView.items = basketItems;
    });

    events.on('basket:open', () => {
        const basketItems = basketView.renderBasketItems(templates.basketItem);
        basketView.items = basketItems;
        basketView.updateView();
        modal.content = basketContainer;
        modal.open();
    });

    // === События заказа ===
    events.on('basket:checkout', () => {
        events.emit('basket:order');
    });

    events.on('basket:order', () => {
        const orderElement = cloneTemplate<HTMLFormElement>(templates.order);
        const orderView = new OrderView(orderElement, events);
        orderView.updateView();
        modal.content = orderElement;
    });

    // === События формы заказа ===
    events.on('payment:set', (data) => {
        orderModel.setPayment(data);
    });

    events.on('address:set', (data) => {
        orderModel.setAddress(data);
    });

    events.on('order:get-data', () => {
        const orderData = orderModel.getData();
        events.emit('order:changed', {
            address: orderData.address,
            payment: orderData.payment,
            hasAddressAndPayment: orderModel.hasAddressAndPayment,
            errors: orderModel.formErrors
        });
    });

    events.on('order:submit', () => {
        const contactsElement = cloneTemplate<HTMLFormElement>(templates.contacts);
        const contactsView = new ContactsView(contactsElement, events);
        contactsView.updateView();
        modal.content = contactsElement;
    });

    // === События формы контактов ===
    events.on('email:set', (data) => {
        orderModel.setEmail(data);
    });

    events.on('phone:set', (data) => {
        orderModel.setPhone(data);
    });

    events.on('contacts:get-data', () => {
        const orderData = orderModel.getData();
        events.emit('contacts:changed', {
            email: orderData.email,
            phone: orderData.phone,
            hasContacts: orderModel.hasContacts,
            errors: orderModel.formErrors
        });
    });

    // === Отправка заказа ===
    events.on('contacts:submit', (contactsData: { email: string, phone: string }) => {
        const orderData = orderModel.getData();
        const fullOrderData = {
            ...orderData,
            email: contactsData.email,
            phone: contactsData.phone
        };

        events.emit('order:data', fullOrderData);
    });

    events.on('order:data', (orderData: FormData) => {
        const orderDto = basketModel.createOrderData(orderData);

        apiModel.postOrderLot(orderDto)
            .then((result: IOrderSuccess) => {
                basketModel.clearBasket();

                const successElement = cloneTemplate<HTMLElement>(templates.success);
                const successView = new SuccessView(successElement, events);
                successView.total = result.total;

                modal.content = successElement;
            })
            .catch((error: Error) => {
                console.error('Ошибка при оформлении заказа:', error);
            });
    });

    events.on('success:open', () => {
        const successElement = cloneTemplate<HTMLElement>(templates.success);
        const successView = new SuccessView(successElement, events);
        successView.total = basketModel.getTotal();

        modal.content = successElement;
        basketModel.clearBasket();
        orderModel.reset();
    });
}

/**
 * Загрузка данных и инициализация приложения
 */
function initApplication() {
    // Инициализация обработчиков событий
    initUIEvents();
    initOrderEvents();

    // Загрузка товаров
    apiModel.getProductItems()
        .then((products: IProduct[]) => {
            events.emit('products:changed', products);
        })
        .catch(error => {
            console.error('Ошибка при загрузке товаров:', error);
        });
}

// Запуск приложения
initApplication();