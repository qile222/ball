import commonRes from './res_common'
import EventDispatcher from './event_dispatcher'
import GameManager from './manager_game'
import Display from './display'
import NetManager from './manager_net'
import WorldManager from './manager_world'
import LoginManager from './manager_login'
import Scheduler from './scheduler'
import Cache from './cache'
import MemCache from './cache_mem'
import Util from './util'

const epsilon = commonRes.epsilon

export class Size {

    constructor(width, height) {
        this.width = width || 0
        this.height = height || 0
    }

}

export class Vec2 {

    constructor(x, y) {
        this.x = x || 0
        this.y = y || 0
    }

}

export class Rect {

    constructor(x, y, width, height) {
        this.x = x || 0
        this.y = y || 0
        this.width = width || 0
        this.height = height || 0
    }

    isContainPoint(vec2) {
        return vec2.x - this.x > epsilon &&
               vec2.y - this.y > epsilon &&
               vec2.x - this.x + this.width < epsilon &&
               vec2.y <= this.y + this.height < epsilon
    }

    isIntersection1(rect) {
        return this.x - rect.x - rect.width < epsilon &&
               rect.x - this.x - this.width < epsilon &&
               this.y - rect.y - rect.height < epsilon  &&
               rect.y - this.y - this.height < epsilon
    }

    isIntersection2(x, y, width, height) {
        return this.x - x - width < epsilon &&
               x - this.x - this.width < epsilon &&
               this.y - y - height < epsilon &&
               y - this.y - this.height < epsilon
    }

}

export class Color3B {

    constructor(r, g, b) {
        this.r = r || 0
        this.g = g || 0
        this.b = b || 0
    }

    toString() {
        return 'rgb(' + this.r +',' + this.g + ',' + this.b + ')'
    }

}

export class Color4B {

    constructor(r, g, b, a) {
        this.r = r || 0
        this.g = g || 0
        this.b = b || 0
        this.a = a || 1
    }

    toString() {
        return 'rgba(' + this.r +',' + this.g +
            ',' + this.b + ', ' + this.a + ')'
    }

}

class ConsoleImpl {

    log() {

    }

    warn() {

    }

    assert() {

    }

    error() {

    }

}

window.DEBUG = true
export const util = Util
export const eventDispatcher = new EventDispatcher()
export const cache = new Cache()
export const memCache = new MemCache()
export const scheduler = new Scheduler()
export const display = new Display()
export const netManager = new NetManager()
export const gameManager = new GameManager()
export const worldManager = new WorldManager()
export const loginManager = new LoginManager()
export const console = DEBUG && window.console || new ConsoleImpl