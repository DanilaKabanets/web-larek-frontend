# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TypeScript, Webpack

## Структура проекта
- src/ — исходные файлы проекта
- src/components/ — папка с компонентами
  - src/components/base/ — базовые компоненты (EventEmitter, Component, Api) и сервисные классы (WebLarekAPI)
  - src/components/model/ — модели (Order, Basket, Page)
  - src/components/view/ — представления (Card, Basket, Order, Contacts, Success, Modal, Page, Form)
- src/scss/ — стили проекта
- src/types/ — типы TypeScript
- src/utils/ — утилиты и константы
- src/pages/ — HTML-шаблоны страниц
- src/images/ — изображения проекта
- src/vendor/ — сторонние зависимости
- src/common.blocks/ — блоки для стилизации
- src/public/ — публичные файлы

## Важные файлы
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Архитектура проекта

### MVP
Архитектура приложения реализована по паттерну MVP (Model-View-Presenter), который обеспечивает четкое разделение ответственности между компонентами:

- **Модель (Model)** — отвечает за работу с данными: хранение, обработку и обновление состояния приложения. Модели содержат бизнес-логику и структуры данных, но не имеют прямых зависимостей от представлений.

- **Представление (View)** — отвечает за отображение данных пользователю и обработку пользовательских действий (клики, ввод данных и т.д.). Представления не содержат бизнес-логики, а только перенаправляют события пользовательского интерфейса Presenter'у.

- **Presenter** — является связующим звеном между Model и View. Он получает события от представлений, обрабатывает их с помощью моделей и обновляет представления в соответствии с новым состоянием. В данном проекте роль Presenter'а выполняет точка входа приложения (src/index.ts), где происходит инициализация всех компонентов и настройка обработчиков событий.

### Преимущества MVP в данном проекте:
1. **Переиспользование компонентов** — благодаря четкому разделению ответственности, компоненты можно легко переиспользовать при расширении проекта без необходимости их корректировки.
   
2. **Изолированность компонентов** — представления не взаимодействуют друг с другом напрямую, а модели не знают о представлениях, что упрощает тестирование и поддержку кода.
   
3. **Гибкость архитектуры** — возможность заменить любую часть системы, не затрагивая остальные компоненты.

### Взаимодействие между компонентами
Ключевым элементом взаимодействия между компонентами является брокер событий **EventEmitter**. Он обеспечивает слабое связывание компонентов, следуя принципу: компоненты общаются через события, а не через прямые вызовы методов.

**Схема взаимодействия:**
1. **Пользователь** взаимодействует с **Представлением** (например, кликает на товар).
2. **Представление** генерирует событие через **EventEmitter** (например, 'product:select').
3. **Presenter** (обработчик в index.ts) получает это событие и вызывает соответствующие методы **Модели** (например, добавление товара в корзину).
4. **Модель** изменяет данные и генерирует событие об изменении через **EventEmitter** (например, 'basket:changed').
5. **Presenter** получает событие от модели и вызывает методы обновления **Представления**.
6. **Представление** обновляется, отображая новое состояние.

## Базовые классы

### 1. Класс EventEmitter
Реализует паттерн «Наблюдатель». Брокер событий, позволяющий компонентам подписываться на события и получать уведомления при их возникновении, не имея прямых зависимостей.

**Роль в архитектуре MVP:** обеспечивает слабое связывание между View и Model, позволяя им коммуницировать без прямых зависимостей.

Основные методы:
- `on(event, callback)` - подписка на событие. Регистрирует обработчик для указанного события.
- `off(event, callback)` - отмена подписки. Удаляет зарегистрированный обработчик события.
- `emit(event, data)` - генерация события с данными. Вызывает все обработчики, зарегистрированные для указанного события, передавая им данные.
- `trigger(event, context)` - создание обработчика-триггера. Возвращает функцию, которая при вызове генерирует указанное событие с данными.
- `onAll(callback)` - подписка на все события. Регистрирует обработчик, который будет вызываться при любом событии.
- `offAll()` - сброс всех подписок. Удаляет все зарегистрированные обработчики событий.

**Используемые типы:**
- `EventName`: string | RegExp - имя события или регулярное выражение для подписки на группу событий
- `Subscriber`: (data: unknown) => void - функция-обработчик события
- `EmitterEvent`: { eventName: string, data: unknown } - структура события для метода onAll
- `IEvents`: интерфейс, определяющий методы для работы с событиями

### 2. Класс Api
Обеспечивает взаимодействие с сервером по HTTP. Абстрагирует работу с API сервера, инкапсулируя логику запросов и обработки ответов.

**Роль в архитектуре MVP:** предоставляет базовую функциональность для сервисных классов, обеспечивающих доступ к внешним данным.

Основные методы:
- `get(uri)` - выполняет GET-запрос по указанному URI. Возвращает Promise с данными ответа.
- `post(uri, data, method)` - выполняет POST/PUT/DELETE запросы по указанному URI с переданными данными. Метод запроса можно указать в параметре method. Возвращает Promise с данными ответа.
- `handleResponse()` - внутренний обработчик ответов. Проверяет статус ответа и преобразует его в JSON или выбрасывает ошибку.

**Используемые типы:**
- `ApiListResponse<Type>`: { total: number, items: Type[] } - формат ответа сервера со списком элементов
- `ApiPostMethods`: 'POST' | 'PUT' | 'DELETE' - допустимые методы для post запросов

### 3. Класс WebLarekAPI
Сервисный класс для взаимодействия с API сервера. Наследуется от базового класса Api и предоставляет методы для работы с конкретным API.

**Роль в архитектуре MVP:** обеспечивает доступ к внешним данным для моделей, выполняя запросы к серверу и преобразуя данные в формат, понятный приложению.

Методы класса:
- `getProductItems()` - получает каталог товаров с сервера. Выполняет GET-запрос к соответствующему эндпоинту API и возвращает список товаров типа `IProduct[]`.
- `postOrderLot(order)` - отправляет данные заказа на сервер. Выполняет POST-запрос с данными заказа типа `IOrder` и возвращает результат обработки заказа типа `IOrderSuccess`.

### 4. Класс Component
Базовый класс для всех компонентов пользовательского интерфейса. Предоставляет общие методы для работы с DOM и управления состоянием компонента.

**Роль в архитектуре MVP:** является базой для всех View-компонентов, предоставляя общую функциональность для работы с DOM.

Методы класса:
- `toggleClass(element, className, force)` - переключает CSS-класс элемента. Добавляет или удаляет указанный класс в зависимости от параметра force.
- `setText(element, value)` - устанавливает текстовое содержимое элемента. Преобразует переданное значение в строку.
- `setDisabled(element, state)` - управляет блокировкой элемента. Устанавливает или снимает атрибут 'disabled' в зависимости от параметра state.
- `setImage(element, src, alt)` - устанавливает изображение с альт-текстом. Обновляет атрибуты 'src' и 'alt' для элемента img.
- `render(data)` - рендерит компонент и возвращает DOM-элемент. Метод может быть переопределен в дочерних классах для реализации специфической логики отрисовки. 

## Компоненты приложения

### Модели (Model)

#### 1. BasketModel
Модель для управления корзиной товаров. Отвечает за хранение списка товаров в корзине и расчет общей стоимости заказа.

**Взаимодействие в MVP:** хранит состояние корзины и уведомляет через события об изменениях для обновления соответствующих представлений.

Методы класса:
- `addProduct(product)` - добавляет товар типа `IProduct` в корзину и генерирует событие 'basket:changed'.
- `removeProduct(id)` - удаляет товар из корзины по идентификатору и генерирует событие 'basket:changed'.
- `clearBasket()` - очищает корзину, удаляет все товары и генерирует событие 'basket:changed'.
- `getTotal()` - рассчитывает общую стоимость товаров в корзине и возвращает число.
- `getProducts()` - возвращает массив товаров типа `IProduct[]` в корзине.

#### 2. OrderModel
Модель для управления данными заказа. Хранит информацию о способе оплаты, адресе доставки и контактных данных.

**Взаимодействие в MVP:** хранит данные формы заказа и уведомляет через события об их изменении для валидации и обновления представлений.

Методы класса:
- `setAddress(address)` - устанавливает адрес доставки и генерирует событие 'order:ready' при готовности данных.
- `setPayment(payment)` - устанавливает способ оплаты типа `TPaymentType` и генерирует событие 'order:ready' при готовности данных.
- `setEmail(email)` - устанавливает адрес электронной почты и генерирует событие 'order:ready' при готовности данных.
- `setPhone(phone)` - устанавливает номер телефона и генерирует событие 'order:ready' при готовности данных.
- `getData()` - возвращает данные формы заказа для отправки на сервер в формате `IOrder`.
- `reset()` - сбрасывает все данные формы.

#### 3. PageModel
Модель для управления состоянием страницы приложения. Хранит информацию о текущем списке товаров, счетчике корзины и блокировке прокрутки.

**Взаимодействие в MVP:** хранит состояние страницы и уведомляет через события об изменениях для обновления соответствующих представлений.

### Представления (View)

#### 1. Page
Представление главной страницы приложения. Отвечает за отображение каталога товаров, счетчика корзины и управление блокировкой прокрутки.

**Взаимодействие в MVP:** отображает состояние из PageModel и передает события пользовательских действий (клик по корзине) через EventEmitter.

Методы класса:
- `counter(count)` - обновляет счетчик товаров в корзине.
- `catalog(items)` - рендерит каталог товаров на странице из массива HTML-элементов.
- `locked(isLocked)` - блокирует/разблокирует прокрутку страницы.

#### 2. Card
Базовый класс для отображения карточек товаров в каталоге и предпросмотре. Генерирует события при клике на карточку или кнопку в ней.

**Взаимодействие в MVP:** отображает данные о товаре из IProduct и передает события кликов в EventEmitter.

Методы класса:
- `title(value)` - устанавливает название товара.
- `image(src)` - устанавливает изображение товара.
- `description(text)` - устанавливает описание товара.
- `category(value)` - устанавливает категорию товара типа `CategoryType`.
- `price(amount)` - устанавливает цену товара.
- `selected(value)` - устанавливает/снимает выделение с карточки товара.
- `id(value)` - устанавливает или возвращает идентификатор товара.
- `render(data)` - рендерит карточку товара на основе переданных данных.

#### 3. Basket
Представление корзины товаров. Отображает список товаров в корзине, их общую стоимость и кнопки управления.

**Взаимодействие в MVP:** отображает данные из BasketModel и передает события пользовательских действий (удаление товара, оформление заказа) через EventEmitter.

Методы класса:
- `items` (свойство set/get) - устанавливает или возвращает список элементов корзины.
- `disableButton()` - отключает кнопку оформления заказа.
- `updateView()` - обновляет отображение корзины и запрашивает актуальную сумму заказа через событие 'basket:get-total'.
- `updatePrice()` (приватный) - обновляет отображение общей стоимости заказа.
- `updateButtonState()` (приватный) - обновляет состояние кнопки оформления заказа в зависимости от наличия товаров.
- `renderBasketItems(template)` - создаёт и рендерит элементы корзины на основе шаблона, запрашивая актуальные данные через событие 'basket:get-products'. Метод создает все необходимые элементы корзины, устанавливает их содержимое и добавляет обработчики событий для кнопок удаления.

События:
- Слушает 'basket:changed' - обновляет список товаров при изменении корзины.
- Слушает 'basket:total-updated' - обновляет общую стоимость заказа.
- Генерирует 'basket:checkout' - при нажатии на кнопку оформления заказа.
- Генерирует 'basket:remove' - при удалении товара из корзины.
- Генерирует 'basket:get-products' - запрашивает актуальные данные о товарах в корзине.
- Генерирует 'basket:get-total' - запрашивает актуальные данные о сумме корзины.

#### 4. Order
Представление формы заказа. Отображает поля для способа оплаты и адреса доставки.

**Взаимодействие в MVP:** отображает форму для сбора данных о способе оплаты и адресе доставки, передает введенные пользователем данные через события в OrderModel.

Методы класса:
- `updateOrderView()` - обновляет представление формы заказа (способ оплаты и адрес доставки).
- `updateView()` - обновляет представление формы в зависимости от ее состояния.
- `reset()` - сбрасывает форму и все поля ввода.

Приватные методы:
- `initOrderForm(container)` - инициализирует элементы формы заказа и добавляет обработчики событий.
- `validateAndEmitInput(input, eventName)` - валидирует поле ввода и генерирует соответствующее событие.
- `areInputsValid()` - проверяет валидность всех полей ввода на текущей форме.

#### 5. Contacts
Представление формы контактов. Отображает поля для ввода телефона и email.

**Взаимодействие в MVP:** отображает форму для сбора контактных данных пользователя, валидирует и передает введенные данные через события в OrderModel.

Методы класса:
- `updateContactsView()` - обновляет представление формы контактов (телефон и email).
- `updateView()` - обновляет представление формы в зависимости от ее состояния.
- `reset()` - сбрасывает форму и все поля ввода.
- `validation` - свойство для установки состояния валидации формы.

Приватные методы:
- `getInputValue(name)` - получает значение поля ввода по имени.

#### 6. Success
Представление окна успешного заказа. Отображает информацию о завершенном заказе и общую сумму.

**Взаимодействие в MVP:** отображает информацию об успешно оформленном заказе, предоставляет возможность закрыть окно и вернуться к покупкам.

Методы класса:
- `total` - свойство для установки и отображения общей суммы заказа.
- `reset()` - сбрасывает данные представления.

#### 7. Modal
Представление модальных окон. Обеспечивает отображение и скрытие модальных окон с различным содержимым.

**Взаимодействие в MVP:** служит контейнером для отображения других представлений (карточка товара, корзина, форма заказа) и генерирует события открытия/закрытия.

Методы класса:
- `content(element)` - устанавливает содержимое окна из HTML-элемента.
- `open()` - открывает модальное окно и генерирует событие 'modal:open'.
- `close()` - закрывает модальное окно и генерирует событие 'modal:close'.
- `render(data)` - рендерит модальное окно с указанными данными.

Особенности:
- Поддерживает автоматическое закрытие по клику на затемненную область или кнопку закрытия.
- Интегрируется с другими представлениями для отображения различного содержимого.
- Блокирует/разблокирует прокрутку страницы при открытии/закрытии.

### 8. Form
Представление форм. Предоставляет общие методы для работы с формами, включая обработку отправки, отображение ошибок валидации и управление состоянием кнопки отправки.

**Роль в архитектуре MVP:** является базой для всех форм в приложении, обеспечивая общую функциональность и обработку событий форм.

Методы класса:
- `handleSubmit(event)` - базовый обработчик отправки формы, предотвращает стандартное поведение и вызывает метод `onSubmit()`.
- `showFormErrors(errors)` - отображает ошибки валидации формы.
- `updateFormView(data, validationField)` - обновляет представление формы, включая состояние кнопки отправки и отображение ошибок.
- `reset()` - сбрасывает форму и очищает ошибки.
- `updateView()` - обновляет представление формы, запрашивая данные от модели.

Абстрактные методы (должны быть реализованы в наследниках):
- `onSubmit()` - вызывается при отправке формы.
- `onFormDataChanged(data)` - вызывается при изменении данных формы.
- `onReset()` - дополнительная логика сброса формы.
- `requestFormData()` - запрашивает данные формы от модели.

### Presenter

Presenter координирует взаимодействие между моделями и представлениями, реагируя на события и обновляя состояние приложения. В данном проекте роль Presenter'а выполняет точка входа приложения (src/index.ts).

Основные функции Presenter'а:
- Инициализация всех компонентов приложения (моделей и представлений)
- Подписка на события от представлений и настройка обработчиков
- Обработка бизнес-логики приложения в ответ на действия пользователя
- Обновление представлений в соответствии с изменениями в моделях
- Управление жизненным циклом объектов и компонентов приложения

Схема работы Presenter'а:
1. Получает событие от представления (например, клик по кнопке)
2. Обрабатывает событие и при необходимости вызывает методы моделей
3. Получает события от моделей об изменении состояния
4. Вызывает методы представлений для обновления интерфейса

## Типы данных и их использование

### Интерфейсы и типы:

1. **IProduct** - интерфейс товара
   ```typescript
   interface IProduct {
       id: string;
       description: string;
       image: string;
       title: string;
       category: string;
       price: number | null;
   }
   ```
   **Использование:**
   - WebLarekAPI: получает товары с сервера в формате IProduct[]
   - BasketModel: хранит список товаров типа IProduct[]
   - Card: отображает данные товара типа IProduct

2. **IBasket** - интерфейс для модели корзины
   ```typescript
   interface IBasket {
       addProduct(product: IProduct): void;
       removeProduct(id: string): void;
       getTotal(): number;
       getProducts(): IProduct[];
       clearBasket(): void;
   }
   ```
   **Использование:**
   - BasketModel: реализует интерфейс IBasket
   - index.ts (Presenter): использует методы интерфейса для управления корзиной

3. **TPaymentType** - тип способа оплаты
   ```typescript
   type TPaymentType = 'online' | 'paymentOnDelivery';
   ```
   **Использование:**
   - OrderModel: хранит выбранный способ оплаты
   - OrderView: отображает и обрабатывает выбор способа оплаты

4. **CategoryType** - тип категории товара
   ```typescript
   type CategoryType = 'софт-скил' | 'хард-скил' | 'дополнительное' | 'другое' | 'кнопка';
   ```
   **Использование:**
   - Card: применяет соответствующие стили в зависимости от категории

5. **IOrder** - интерфейс DTO заказа для передачи на сервер
   ```typescript
   interface IOrder {
       total: number;
       email: string;
       phone: string;
       address: string;
       items: string[];
       payment: TPaymentType;
   }
   ```
   **Использование:**
   - OrderModel: формирует объект с данными заказа типа IOrder
   - WebLarekAPI: принимает объект типа IOrder для отправки на сервер

6. **FormData** - тип для данных формы заказа
   ```typescript
   type FormData = Omit<IOrder, 'total' | 'items'>;
   ```
   **Использование:**
   - OrderModel: хранит данные формы заказа
   - OrderView и ContactsView: передают данные формы в OrderModel

7. **IOrderSuccess** - интерфейс успешного заказа
   ```typescript
   interface IOrderSuccess {
       id: string;
       total: number;
   }
   ```
   **Использование:**
   - WebLarekAPI: возвращает ответ сервера в формате IOrderSuccess
   - SuccessView: отображает информацию об успешном заказе
   - index.ts (Presenter): использует данные типа IOrderSuccess для обработки успешного заказа

8. **IContactsData** - интерфейс для контактных данных
   ```typescript
   interface IContactsData {
       email?: string;
       phone?: string;
   }
   ```
   **Использование:**
   - ContactsView: использует для работы с данными формы контактов

9. **ISuccessData** - интерфейс для данных успешного заказа
   ```typescript
   interface ISuccessData {
       total: number;
   }
   ```
   **Использование:**
   - SuccessView: использует для отображения итоговой суммы заказа

## Процессы в приложении

Все процессы в приложении реализованы через механизм событий, используя EventEmitter. Это обеспечивает слабое связывание компонентов и гибкость архитектуры.

### Основные процессы и события:

1. **Загрузка товаров:**
   - В точке входа index.ts вызывается apiModel.getProductItems()
   - После получения товаров генерируется событие 'products:changed'
   - Обработчик события создает карточки товаров и отображает их на странице

2. **Выбор товара:**
   - При клике на карточку товара генерируется событие 'product:select'
   - Обработчик создает представление товара и открывает модальное окно
   - При клике на кнопку в карточке товар добавляется в корзину

3. **Управление корзиной:**
   - При изменении корзины (добавление/удаление товаров) генерируется событие 'basket:changed'
   - Обработчик обновляет счетчик товаров и содержимое корзины
   - При клике на иконку корзины генерируется событие 'basket:open'
   - Обработчик отображает содержимое корзины в модальном окне

4. **Оформление заказа:**
   - При клике на кнопку "Оформить" генерируется событие 'order:open'
   - Обработчик отображает форму заказа в модальном окне
   - При заполнении формы заказа (адрес и способ оплаты) и нажатии кнопки "Далее" генерируется событие 'order:submit'
   - Обработчик проверяет валидность формы и переходит к форме контактов

5. **Ввод контактных данных:**
   - После перехода к форме контактов отображается представление ContactsView
   - При заполнении полей email и телефона данные валидируются
   - При изменении полей формы генерируются события, обновляющие модель заказа
   - При валидных данных активируется кнопка "Оплатить"
   - При нажатии кнопки "Оплатить" генерируется событие 'contacts:submit'
   - Обработчик собирает все данные и отправляет заказ на сервер

6. **Завершение заказа:**
   - После успешного оформления заказа генерируется событие 'order:completed'
   - Обработчик отображает представление SuccessView с информацией об успешном заказе
   - При закрытии окна успешного заказа корзина очищается и пользователь возвращается к каталогу товаров

7. **Модальные окна:**
   - При открытии модального окна генерируется событие 'modal:open'
   - Обработчик блокирует прокрутку страницы
   - При закрытии модального окна генерируется событие 'modal:close'
   - Обработчик разблокирует прокрутку страницы

Такой подход к организации процессов через события позволяет:
- Легко расширять функциональность приложения
- Изменять логику обработки событий без изменения компонентов
- Повторно использовать компоненты в разных контекстах
- Тестировать компоненты изолированно

## Утилиты

### Utils
Файл с вспомогательными функциями, используемыми в различных частях приложения.

Основные функции:
- `ensureElement(selector)` - находит элемент в DOM по селектору и возвращает его. Выбрасывает ошибку, если элемент не найден.
- `cloneTemplate(template)` - клонирует шаблон и возвращает его содержимое. Используется для создания элементов из шаблонов.
- `isEmpty(value)` - проверяет, является ли значение пустым (null, undefined, пустая строка).
- `pascalToKebab(value)` - преобразует строку из PascalCase в kebab-case.
- `setElementData(el, data)` - устанавливает dataset атрибуты элемента.
- `getElementData(el, scheme)` - получает типизированные данные из dataset атрибутов элемента.
- `createElement(tagName, props, children)` - создает HTML-элемент с указанными свойствами и дочерними элементами.
- `bem(block, element, modifier)` - формирует имя класса по методологии БЭМ.
- `handlePrice(price)` - обрабатывает цену, форматируя её для отображения.
- `isBoolean(value)` - проверяет, является ли значение логическим типом.