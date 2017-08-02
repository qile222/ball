import seedrandom from 'seedrandom'

export default class Util {

    static format(str, ...args) {
        let i = -1
        return str.replace(/%s/g, () => {
            return args[++i]
        })
    }

    static time() {
        return Date.now()
    }

    static setSeed(seed) {
        seedrandom(seed, {
            global: true
        })
    }

    // [begin, end)
    static randomInt(begin, end) {
        if (!end) {
            end = begin
            begin = 0
        }
        let ret = begin + Math.floor(Math.random() * (end - begin))
        return ret
    }

    static randomFromArray(array) {
        return array[Util.randomInt(array.length)]
    }

    static timeFormat(date, format) {
        if (typeof date == 'number') {
            date = new Date(date)
        }
        if (!format) {
            format = 'yyyy-MM-dd hh:mm:ss'
        }
        let times = {
            y: date.getFullYear(),
            M: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds()
        }
        let reg = /(y{1,4}|M{1,2}|d{1,2}|h{1,2}|m{1,2}|s{1,2})/g
        return format.replace(reg, v => {
            let str = '0' + times[v[0]]
            return str.slice(-(Math.min(str.length, v.length)))
        })
    }

    static toFixed(number, decimalCount) {
        let p = Math.pow(10, decimalCount)
        return Math.round(number * p) / p
    }

    static getRadian(x1, y1, x2, y2) {
        var x = x1 - x2
        var y = y1 - y2
        var hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
        var radian = Math.acos(x / hypotenuse)
        if (y1 > y2) {
            return Math.PI * 2 - radian
        } else {
            return radian
        }
    }

    static request(params) {
        let xhr = new XMLHttpRequest()
        xhr.responseType = 'json'
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 &&
                (xhr.status == 200 || xhr.status == 304)) {
                if (params.cb) {
                    params.cb(true, xhr.response)
                }
            }
        }
        xhr.timeout = params.timeout || 5000
        if (params.cb) {
            xhr.ontimeout = params.cb.bind(null, false, 'timeout')
            xhr.onerror = params.cb.bind(null, false)
        }
        if (params.header) {
            for (let k in params.header) {
                xhr.setRequestHeader(k, params.header[k])
            }
        }
        xhr.open(params.method, params.url, true)
        xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8')
        xhr.send(JSON.stringify(params.data))
    }

    static shadowCopy(obj) {
        return Object.assign({}, obj)
    }

    static mergeSort(arr, fn) {
        function sort(arr, first, last) {
            if (first >= last) {
                return
            }
            let middle = Math.floor((first + last) / 2)
            sort(arr, first, middle)
            sort(arr, middle + 1, last)
            while (first <= middle && middle + 1 <= last) {
                if (fn(arr[first], arr[middle + 1])) {
                    ++first
                } else {
                    let tmp = arr[middle + 1]
                    for (let i = middle; i >= first; --i) {
                        arr[i + 1] = arr[i]
                    }
                    arr[first] = tmp
                        ++middle
                }
            }
        }
        sort(arr, 0, arr.length - 1)
    }

}