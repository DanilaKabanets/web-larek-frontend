import './scss/styles.scss';

import { WebLarekAPIModel } from './components/model/webLarekAPI';
import { BasketModel } from './components/model/basket';
import { PageModel } from './components/model/page';
import { ModalModel } from './components/model/modal';
import { OrderModel } from './components/model/order';

import { Page } from './components/view/page';
import { ModalView } from './components/view/modal';
import { OrderView } from './components/view/order';
import { BasketView } from './components/view/basket';

import { EventEmitter } from './components/base/events';
import { IProduct, IOrderDto } from './types';
import { ensureElement, cloneTemplate, handlePrice } from './utils/utils';
import { Card } from './components/view/card';
import { API_URL } from './utils/constants';

// Инициализация брокера событий
const events = new EventEmitter();

// === Модели ===
// Инициализация моделей
const apiModel = new WebLarekAPIModel('catalog', API_URL);
const pageModel = new PageModel(events);
const basketModel = new BasketModel(events);
const modalModel = new ModalModel(events);
const orderModel = new OrderModel(events);

// === Шаблоны ===
// Получение шаблонов
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketItemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const modalContainerElement = ensureElement<HTMLElement>('#modal-container');

// === Представления ===
// Инициализация представлений
const page = new Page(document.body, events);
const modal = new ModalView(modalContainerElement, events, modalModel, page);

// Инициализация контейнера корзины
const basketContainer = cloneTemplate<HTMLElement>(basketTemplate);
const basketView = new BasketView('basket', basketContainer, events, basketModel);

// === Обработчики событий ===

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
            modalModel.close();
        }
    });

    modal.content = card.render(product);
    modalModel.open();
});

// Обновление состояния корзины
events.on('basket:changed', (items: IProduct[]) => {
    // Обновляем счетчик в шапке
    page.counter = items.length;
    pageModel.setBasketCount(items.length);
});

// Открытие корзины
events.on('basket:open', () => {
    // Всегда получаем свежие элементы корзины при открытии
    const basketItems = basketView.renderBasketItems(basketItemTemplate);

    // Обновляем список элементов корзины
    basketView.list = basketItems;

    // Обновляем отображение корзины (цена, активность кнопки)
    basketView.updateView();

    // Отображаем корзину в модальном окне
    modal.content = basketContainer;
    modalModel.open();
});

// Оформление заказа
events.on('basket:order', () => {
    // Клонируем шаблон формы заказа
    const orderElement = cloneTemplate<HTMLFormElement>(orderTemplate);

    // Создаем представление формы заказа
    new OrderView(orderElement, events, orderModel);

    // Отображаем форму заказа в модальном окне
    modal.content = orderElement;
});

// Обработка отправки формы заказа
events.on('order:submit', () => {
    // Клонируем шаблон формы контактов
    const contactsElement = cloneTemplate<HTMLFormElement>(contactsTemplate);

    // Создаем представление формы контактов с той же моделью заказа
    new OrderView(contactsElement, events, orderModel);

    // Отображаем форму контактов в модальном окне
    modal.content = contactsElement;
});

// Обработка отправки формы контактов
events.on('contacts:submit', (contactsData: { email: string, phone: string }) => {
    // Собираем полные данные заказа из объединенной модели
    const completeOrderData: IOrderDto = {
        total: basketModel.getTotal(),
        items: basketModel.getProducts().map(item => item.id),
        ...orderModel.getData()  // Используем данные из модели заказа
    };

    // Отправляем заказ на сервер
    apiModel.postOrderLot(completeOrderData)
        .then(() => {
            // Оповещаем об успешном оформлении заказа
            events.emit('order:completed', { total: completeOrderData.total });
        })
        .catch((error: Error) => {
            console.error('Ошибка при оформлении заказа:', error);
        });
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
            modalModel.close();
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