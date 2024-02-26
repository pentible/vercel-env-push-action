/**
 * Create `URLSearchParams` instance with undefined values excluded.
 * NOTE: if you don't have undefined values, use `new URLSearchParams({...})` directly
 * ```ts
 * const params = queryParams({ foo: "true", bar: undefined, value: 10 });
 * // URLSearchParams { 'foo' => 'true', 'value' => '10' }
 * // params.toString(): foo=true&value=10
 * ```
 */
export function queryParams<T extends number | string | undefined>(
    params: Record<string, T>,
) {
    const urlSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
            urlSearchParams.set(key, String(value));
        }
    }

    return urlSearchParams;
}
