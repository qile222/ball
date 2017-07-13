import commonRes from './res_common'

class Cache {

    constructor() {

    }

    set(k, v) {

    }

    get(k) {

    }

}

class LocalStorageImpl extends Cache {

    set(k, v) {
        window.localStorage.setItem(k, JSON.stringify(v))
    }

    get(k) {
        let v = window.localStorage.getItem(k)
        try {
            return JSON.parse(v)
        } catch (e) {
            return v
        }
    }

}

let impls = {
    localStorage: LocalStorageImpl,
}

module.exports =
    impls[commonRes.cacheImpl || Object.getOwnPropertyNames(impls)[0]]