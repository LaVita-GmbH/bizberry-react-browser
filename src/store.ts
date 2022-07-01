import { QueryClient, useQuery, useQueryClient } from "react-query"

import Cookies from "js-cookie"
import { store } from "@lavita-io/bizberry-sdk"

export type StoreOptionsType = store.StoreOptionsType & {
    queryClient: QueryClient
    cookiePrefix?: string
}

export class BrowserStore extends store.AbstractStore {
    queryClient: QueryClient
    cookiePrefix: string

    constructor(values: StoreOptionsType) {
        super(values)
        this.queryClient = values.queryClient
        this.cookiePrefix = values?.cookiePrefix || "bizberry-react-browser-store"
    }

    get_cookie_key(key: string): string {
        return `${this.cookiePrefix}_${key}`
    }

    get_query_key(key: string): Array<string> {
        return [this.cookiePrefix, key]
    }

    async set(key: string, value: string, options: store.StoreValueOptionsType = {}): Promise<void> {
        await super.set(key, value, options)
        if (options.isPersistent) Cookies.set(this.get_cookie_key(key), value, { domain: process.env.COOKIE_DOMAIN, expires: 365 })
        this.queryClient.setQueryData(this.get_query_key(key), value)
    }

    async get(key: string) {
        let value = await super.get(key)

        if (value === undefined) {
            value = Cookies.get(this.get_cookie_key(key))
            if(value)
                await super.set(key, value, { isPersistent: true })
        }

        return value
    }

    async del(key: string): Promise<void> {
        await super.del(key)
        try {
            Cookies.remove(this.get_cookie_key(key))
        } catch (error) {
            console.warn(error)
        }
        this.queryClient.setQueryData(this.get_query_key(key), undefined)
        await this.queryClient.resetQueries(this.get_query_key(key))
    }

    useStore(key: string) {
        const queryClient = useQueryClient()
        return useQuery(this.get_query_key(key), async () => await this.get(key))
    }
}
