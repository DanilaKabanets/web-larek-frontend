import { IProduct, IOrder, IOrderDto } from "../../types";
import { Api } from "../base/api";

// класс наследуется от Api для того, что можно было использовать родительские свойства и методы 
// Необходимо: 
// - отправлять запросы на на сервер чтобы получить карточки и оформить заказ 
export class WebLarekAPIModel extends Api {
    protected link: string;
    protected products: IProduct[];

    constructor(link: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.link = link;
        this.products = [];
    }

    // Получение списка продуктов с сервера
    getProductItems(): Promise<IProduct[]> {
        // Определяем тип для ответа API
        type ApiResponse = IProduct[] | { items: IProduct[] };

        return this.get('/api/weblarek/product')
            .then((data: ApiResponse) => {
                console.log('Получен ответ от API:', data);
                // Проверяем, является ли ответ массивом или объектом с полем items
                if (Array.isArray(data)) {
                    this.products = data;
                } else if (data && 'items' in data) {
                    this.products = data.items;
                } else {
                    // Если формат ответа не соответствует ожидаемому, возвращаем пустой массив
                    console.error('Неожиданный формат ответа API:', data);
                    this.products = [];
                }
                return this.products;
            });
    }

    // Отправка данных заказа на сервер
    postOrderLot(order: IOrderDto): Promise<IOrder> {
        return this.post('/api/weblarek/order', order) as Promise<IOrder>;
    }
}