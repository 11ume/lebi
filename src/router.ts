import queryString from 'querystring'
import { Context, RequestListener, NextFunction } from 'application'

const isHead = (ctx: Context) => ctx.req.method === 'HEAD'

export interface ContextRoute<P = void, Q = void> extends Context {
    params?: P
    , query?: Q
}

export type RouteStackItem = {
    path: string
    method: string
    route?: Route
    namespace?: string
    handler: HandlerFunction
}

type HandlerFunction = (ctx: ContextRoute, next: NextFunction, namespace?: string) => void

type Route = {
    keys: Array<string>
    , pattern: RegExp
}

const regexparam = (str: string, loose?: string) => {
    let c = ''
    let o = 0
    let tmp = ''
    let ext = 0
    const keys = []
    let pattern = ''
    const arr = str.split('/')
    arr[0] || arr.shift()

    // eslint-disable-next-line no-cond-assign
    while (tmp = arr.shift()) {
        c = tmp[0]
        if (c === '*') {
            keys.push('wild')
            pattern += '/(.*)'
        } else if (c === ':') {
            o = tmp.indexOf('?', 1)
            ext = tmp.indexOf('.', 1)
            keys.push(tmp.substring(1, ~o ? o : ~ext ? ext : tmp.length))
            pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)'
            if (~ext) pattern += (~o ? '?' : '') + '\\' + tmp.substring(ext)
        } else {
            pattern += '/' + tmp
        }
    }

    return {
        keys: keys
        , pattern: new RegExp('^' + pattern + (loose ? '(?=$|/)' : '/?$'), 'i')
    }
}

const regExpExtractParams = (route: Route, match: RegExpExecArray) => {
    let i = 0
    const params = {}
    while (i < route.keys.length) {
        const key = route.keys[i]
        params[key] = match[++i] || null
    }

    return params
}

const checkQuery = (url: string) => {
    const index = url.indexOf('?', 1)
    const isQuery = index !== -1
    return {
        index
        , isQuery
    }
}

type GetQueryString = {
    query: queryString.ParsedUrlQuery;
    pathname: string;
}

const getQueryString = (url: string, idx: number): GetQueryString => {
    const search = url.substring(idx)
    const path = search.substring(1)
    const pathname = url.substring(0, idx)
    const query = queryString.parse(path)

    return {
        query
        , pathname
    }
}

const routeStackPrepare = (handlerStackItems: RouteStackItem[], namespace = ''): RouteStackItem[] => {
    return handlerStackItems.map((item) => {
        const route = regexparam(`${namespace}${item.path}`)
        return {
            ...item
            , route
            , namespace
        }
    })
}

const isPatternMatch = (path: string, item: RouteStackItem) => item.route.pattern.exec(path)
const isNotMethodMatch = (method: string, routeStack: RouteStackItem[], index: number) => method !== routeStack[index].method

// quitar match de aqui
const findRouteHandler = (ctx: ContextRoute, baseUrl: string, item: RouteStackItem) => {
    let qr: GetQueryString = {
        query: {}
        , pathname: null
    }

    const cq = checkQuery(baseUrl)
    if (cq.isQuery) {
        qr = getQueryString(baseUrl, cq.index)
    }

    const match = isPatternMatch(qr.pathname || baseUrl, item)
    const params = match ? regExpExtractParams(item.route, match) : {}

    if (match) {
        const context = Object.assign(ctx, {
            query: qr.query
            , params
        })

        return context
    }

    return null
}

const prepareRoutes = (handlerStackItems: RouteStackItem[], namespace?: string) => {
    const routeStack = routeStackPrepare(handlerStackItems, namespace)
    return function find(ctx: ContextRoute, next: NextFunction) {
        const method = ctx.req.method
        const baseUrl = ctx.req.url
        for (let i = 0, len = routeStack.length; i < len; i++) {
            if (isNotMethodMatch(method, routeStack, i)) continue

            const item = routeStack[i]
            const context = findRouteHandler(ctx, baseUrl, item)
            if (context) {
                return item.handler(context, next)
            }

            if (context && isHead(ctx)) {
                ctx.res.end()
                return
            }
        }

        next()
    }
}

const router = (...handlerStackItems: RouteStackItem[]) => prepareRoutes(handlerStackItems)

const createHandlerMethod = (method: string) => (path: string, handler: RequestListener): RouteStackItem => {
    const upperMethod = method.toUpperCase()
    return {
        method: upperMethod
        , path
        , handler
    }
}

export const routerNamespace = (namespace: string) => (...handlerStackItems: RouteStackItem[]) => {
    return prepareRoutes(handlerStackItems, namespace)
}

export const get = createHandlerMethod('get')
export const del = createHandlerMethod('del')
export const put = createHandlerMethod('put')
export const path = createHandlerMethod('path')
export const post = createHandlerMethod('post')
export const head = createHandlerMethod('heat')
export const options = createHandlerMethod('options')

export default router
