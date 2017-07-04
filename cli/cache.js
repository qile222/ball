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
        window.localStorage.setItem(k, v)
    }

    get(k) {
        return window.localStorage.getItem(k)
    }

}

let impls = {
    localStorage: LocalStorageImpl,
}

module.exports =
    impls[commonRes.cacheImpl || Object.getOwnPropertyNames(impls)[0]]