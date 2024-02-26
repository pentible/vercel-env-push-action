interface HttpClientParams {
    url: string;
    headers?: HeadersInit;
}

type Primitive = bigint | boolean | number | string | symbol | null | undefined;
type JsonArray = JsonValue[];
type JsonValue = JsonArray | JsonObject | Primitive;
interface JsonObject {
    [key: string]: JsonValue;
}

export class HttpClient {
    private readonly url: string;
    private readonly headers: HeadersInit | undefined;

    constructor({ url, headers }: HttpClientParams) {
        this.url = url;
        this.headers = headers;
    }

    async get<T>(path: `/${string}`, params: URLSearchParams) {
        const response = await fetch(
            `${this.url}${path}?${params.toString()}`,
            {
                method: "get",
                headers: this.headers,
            },
        );

        return (await response.json()) as T;
    }

    async post<T>(path: `/${string}`, body: JsonValue) {
        const response = await fetch(`${this.url}${path}`, {
            method: "post",
            headers: this.headers,
            body: JSON.stringify(body),
        });

        return (await response.json()) as T;
    }

    async delete<T>(path: `/${string}`) {
        const response = await fetch(`${this.url}${path}`, {
            method: "delete",
            headers: this.headers,
        });

        return (await response.json()) as T;
    }
}
