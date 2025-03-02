import { IProduct, IOrder, IOrderSuccess } from "../types";
import { Api, ApiListResponse } from "./base/api";
import { CDN_URL } from "../utils/constants";

/**
 * Интерфейс для API WebLarek
 */
export interface IWebLarekAPI {
    getProductItems: () => Promise<IProduct[]>;
    postOrderLot: (order: IOrder) => Promise<IOrderSuccess>;
}

/**
 * Класс для взаимодействия с API WebLarek
 */
export class WebLarekAPI extends Api implements IWebLarekAPI {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = CDN_URL;
    }

    /**
     * Получение списка продуктов с сервера
     */
    getProductItems(): Promise<IProduct[]> {
        return this.get('/product').then((data: ApiListResponse<IProduct>) =>
            data.items.map((item) => ({
                ...item,
                image: this.cdn + item.image
            }))
        );
    }

    /**
     * Отправка данных заказа на сервер
     */
    postOrderLot(order: IOrder): Promise<IOrderSuccess> {
        return this.post('/order', order).then(
            (data: IOrderSuccess) => data
        );
    }
}