import './scss/styles.scss';

import { WebLarekAPIModel } from './components/common/webLarekAPI';
import { Page } from './components/common/page';
import { EventEmitter } from './components/base/events';
import { IProduct, CategoryType, IOrderDto } from './types';
import { ensureElement, cloneTemplate, handlePrice } from './utils/utils';
import { Card, StoreItem, StoreItemPreview } from './components/common/card';
import { Basket } from './components/common/basket';
import { Order, IOrderForm } from './components/common/order';
import { Modal } from './components/base/modal';

/**
 * Основная точка входа в приложение WebLarek
 */

// Инициализация компонентов и API
const events = new EventEmitter();
const apiURL = process.env.API_ORIGIN as string;
const apiModel = new WebLarekAPIModel('catalog', apiURL);

// Получение шаблонов
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketItemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const modalContainerElement = ensureElement<HTMLElement>('#modal-container');

// Инициализация представлений
const page = new Page(document.body, events);

/**
 * Проверяет, является ли элемент карточкой товара
 * @param element - элемент для проверки
 * @returns true, если элемент является карточкой товара
 */
function isCardElement(element: unknown): element is Card {
    return element instanceof Card;
}

// Инициализация модального окна и корзины
const modal = new Modal(modalContainerElement, events, page);

// Создаем корзину - теперь она одновременно и модель данных, и представление
// Для шаблона MVP мы создаем её сразу, а не при открытии модального окна
const basketContainer = cloneTemplate<HTMLElement>(basketTemplate);
const basket = new Basket('basket', basketContainer, events);

// Обработчики событий

// Отображение списка товаров
events.on('products:changed', (products: IProduct[]) => {
    const cardElements = products.map(product => {
        const cardElement = cloneTemplate<HTMLElement>(cardCatalogTemplate);
        const card = new StoreItem(cardElement, {
            onClick: () => events.emit('product:select', product)
        });

        card.id = product.id;
        card.title = product.title;
        card.image = product.image;
        card.category = product.category as CategoryType;
        card.price = product.price;

        // Проверяем, что карточка создана корректно
        if (isCardElement(card)) {
            console.debug('Карточка товара создана успешно:', product.title);
        }

        return card.render({});
    });

    page.store = cardElements;
});

// Отображение информации о товаре
events.on('product:select', (product: IProduct) => {
    const cardElement = cloneTemplate<HTMLElement>(cardPreviewTemplate);
    const card = new StoreItemPreview(cardElement, {
        onClick: () => {
            basket.addProduct(product);
            modal.close();
        }
    });

    card.id = product.id;
    card.title = product.title;
    card.image = product.image;
    card.category = product.category as CategoryType;
    card.price = product.price;

    if (product.description) {
        card.description = product.description;
    }

    modal.setContent(card.render({}));
    modal.open();
});

// Обновление состояния корзины
events.on('basket:changed', (items: IProduct[]) => {
    // Обновляем только счетчик в шапке
    page.counter = items.length;
});

// Открытие корзины
events.on('basket:open', () => {
    // Создаем элементы корзины и устанавливаем их в список
    const basketItems = basket.renderBasketItems(basketItemTemplate);
    basket.list = basketItems;

    // Обновляем отображение корзины (цена, состояние кнопки и т.д.)
    basket.updateView();

    // Отображаем корзину в модальном окне
    modal.setContent(basketContainer);
    modal.open();
});

// Очистка корзины после оформления заказа
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
    modal.setContent(successElement);
    modal.open();

    // Очищаем корзину
    basket.clearBasket();
});

// Обработчик оформления заказа
events.on('basket:order', () => {
    // Клонируем шаблон формы заказа
    const orderElement = cloneTemplate<HTMLFormElement>(orderTemplate);

    // Создаем экземпляр формы заказа
    const orderForm = new Order('order', orderElement, events);

    // Временно храним данные заказа
    let orderData: Partial<IOrderDto> = {};

    // Изменяем обработчик события отправки формы на переход к следующему шагу
    orderElement.addEventListener('submit', (e) => {
        e.preventDefault();

        // Получаем данные формы
        const formData: IOrderForm = orderForm.getValue();

        // Если данные формы заполнены
        if (formData.address && formData.payment) {
            // Сохраняем данные первого шага
            orderData = {
                id: crypto.randomUUID(), // Генерируем уникальный ID для заказа
                total: basket.getTotal(),
                items: basket.getProducts().map(item => item.id), // Только ID товаров
                address: formData.address,
                payment: formData.payment,
            };

            // Клонируем шаблон формы контактов
            const contactsElement = cloneTemplate<HTMLFormElement>(contactsTemplate);

            // Находим кнопку отправки для контроля её состояния
            const submitButton = contactsElement.querySelector('button[type="submit"]') as HTMLButtonElement;


            // Добавляем обработчик для активации кнопки при валидной форме
            contactsElement.addEventListener('input', () => {
                submitButton.disabled = !contactsElement.checkValidity();
            });

            // Добавляем обработчик отправки формы контактов
            contactsElement.addEventListener('submit', (e) => {
                e.preventDefault();

                const phoneInput = contactsElement.elements.namedItem('phone') as HTMLInputElement;
                const emailInput = contactsElement.elements.namedItem('email') as HTMLInputElement;
                const phone = phoneInput.value;
                const email = emailInput.value;

                if (phone && email) {
                    // Добавляем контактные данные к заказу
                    const completeOrderData: IOrderDto = {
                        ...orderData as IOrderDto,
                        phone,
                        email
                    };

                    // Отправляем заказ на сервер
                    apiModel.postOrderLot(completeOrderData)
                        .then(() => {
                            console.log('Заказ успешно отправлен на сервер:', completeOrderData);
                            // Оповещаем об успешном оформлении заказа с передачей общей суммы
                            events.emit('order:completed', { total: completeOrderData.total });
                        })
                        .catch((error: Error) => {
                            console.error('Ошибка при оформлении заказа:', error);
                        });
                }
            });

            // Отображаем форму контактов в модальном окне
            modal.setContent(contactsElement);
        }
    });

    // Отображаем форму заказа в модальном окне
    modal.setContent(orderElement);
});

// Инициализация приложения
apiModel.getProductItems()
    .then((products: IProduct[]) => {
        events.emit('products:changed', products);
    })
    .catch(error => {
        console.error('Ошибка при загрузке товаров:', error);
    });