export interface GeneralResponse<T = any> {
    data: T,
    message: string;
    [key: string]: any;
}
