import { PrepareComposer, $composer } from 'wezi-composer'
import { Context, Handler, ComposerHandler } from 'wezi-types'
import matchit, { Matcher, Found } from 'matchit-radix-tree'

type RouteEntity = {
    path: string
    method: string
    handlers: Handler[]
}

const replyHead = (context: Context): void => {
    context.res.writeHead(200, {
        'Content-Length': '0'
    })
    context.res.end(null, null, null)
}

const dispatchRoute = (found: Found, prepare: PrepareComposer, context: Context): void => {
    if (context.req.method === 'HEAD') {
        replyHead(context)
        return
    }

    if (found.handlers) {
        const dispatch = prepare(false, ...found.handlers)
        dispatch(context, found.params)
        return
    }

    const dispatch = prepare(false, found.handler)
    dispatch(context, found.params)
}

const findRouteMatch = (matcher: Matcher, prepare: PrepareComposer) => (context: Context, payload: unknown): void => {
    const found = matcher.lookup(context.req.method, context.req.url)
    if (found) {
        dispatchRoute(found, prepare, context)
        return
    }

    context.next(payload)
}

const prepareRouterStack = (matcher: Matcher, entities: RouteEntity[]) => entities
    .forEach((entity) => {
        matcher.create(entity.method, entity.path, ...entity.handlers)
    })

const prepareRoutes = (matcher: Matcher, entities: RouteEntity[], prepare: PrepareComposer) => {
    prepareRouterStack(matcher, entities)
    return findRouteMatch(matcher, prepare)
}

const createRouteEntity = (method: string) => (path: string, ...handlers: Handler[]): RouteEntity => {
    return {
        path
        , method
        , handlers
    }
}

export const createRouter = (...entities: RouteEntity[]) => {
    const match: ComposerHandler = (prepare: PrepareComposer) => {
        const matcher = matchit()
        return prepareRoutes(matcher, entities, prepare)
    }

    Object.defineProperty(match, 'id', {
        value: $composer
        , writable: false
    })

    return match
}

export const get = createRouteEntity('GET')
export const post = createRouteEntity('POST')
export const put = createRouteEntity('PUT')
export const del = createRouteEntity('DELETE')
export const head = createRouteEntity('HEAD')
export const patch = createRouteEntity('PATCH')
export const options = createRouteEntity('OPTIONS')

