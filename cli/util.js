import seedrandom from 'seedrandom'
import commonRes from './res_common'
const numberEplison = commonRes.numberEplison

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

    static timeFormatMMSS(timestamp) {
        let ss = Math.floor(timestamp / 1000)
        let s = ss % 60
        let m = (ss - s) / 60
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s)
    }

    static timeFormatHHMM(timestamp) {

    }

    static toFixed(number, decimalCount) {
        let p = Math.pow(10, decimalCount)
        return Math.round(number * p) / p
    }

    static isCircleIntersection(p1, r1, p2, r2) {
        let x = p1.x - p2.x
        let y = p1.y - p2.y
        let centerDis = Math.sqrt(x * x + y * y)
        let disDiff = centerDis - (r1 + r2)
        return disDiff <= numberEplison
    }

    static request(url, header, data, cb, timeout) {
        let xhr = new XMLHttpRequest()
        xhr.open('POST', url, true)
        xhr.responseType = 'text'
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                let resData
                let isSucceed = false
                if (xhr.status == 200 || xhr.status == 304) {
                    try {
                        resData = JSON.parse(xhr.responseText)
                        isSucceed = true
                    } catch (e) {
                        resData = e
                    }
                } else {
                    resData = xhr.statusText
                }
                cb(isSucceed, resData)
            }
        }
        xhr.timeout = timeout || 15
        xhr.ontimeout = () => cb(false, 'time out')
        xhr.onerror = (e) => cb(false, e)
        if (header) {
            for (let k in header) {
                xhr.setRequestHeader(k, header[k])
            }
        }
        // xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(data)
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