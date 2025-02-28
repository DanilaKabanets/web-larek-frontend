import { IProduct, IOrderDto } from "../../types";
import { Api, ApiListResponse } from "../base/api";
import { CDN_URL } from "../../utils/constants";

/**
 * Интерфейс для API WebLarek
 */
export interface IWebLarekAPI {
    getProductItems: () => Promise<IProduct[]>;
    postOrderLot: (order: IOrderDto) => Promise<IOrderDto>;
}

/**
 * Класс для взаимодействия с API WebLarek
 */
export class WebLarekAPIModel extends Api implements IWebLarekAPI {
    readonly cdn: string;

    constructor(protected readonly resource: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = CDN_URL;
    }

    /**
     * Получение списка продуктов с сервера
     */
    getProductItems(): Promise<IProduct[]> {
        return this.get('/product').then((data: ApiListResponse<IProduct>) =>
            data.items.map((item) => ({
                ...item
            }))
        );
    }

    /**
     * Отправка данных заказа на сервер
     */
    postOrderLot(order: IOrderDto): Promise<IOrderDto> {
        return this.post('/order', order).then(
            (data: IOrderDto) => data
        );
    }
}