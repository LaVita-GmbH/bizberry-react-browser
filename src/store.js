import { AbstractStore } from "@lavita-io/bizberry-sdk"

export class BrowserStore extends AbstractStore {
    async set(key, value, options = {}) {
        if (options.isPersistent) document.cookie = `${this.cookie_prefix}_${key}=${value};`
        return await super.set(key, value, options)
    }

    async get(key) {
        const value = await super.get(key)

        if (value === undefined) {
            return
        }

        return value
    }
}
