import test from 'ava'
import http, { IncomingMessage, ServerResponse } from 'http'
import listen from 'test-listen'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import createError, { HttpError } from 'wezi-error'
import composer from '..'

const server = (fn: (req: IncomingMessage, res: ServerResponse) => void) => {
    return listen(http.createServer((req, res) => fn(req, res)))
}

const createContext = ({
    req
    , res
    , next = null
    , errorHandler = null
}): Context => ({
    req
    , res
    , next
    , errorHandler
})

test('main composer handler flow', async (t) => {
    const url = await server((req, res) => {
        const handler = () => 'hello'
        const dispatch = composer(true, handler)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const r = await res.text()
    t.is(r, 'hello')
})

test('main composer handler flow end if end response if all higher-order handlers are executed, and none of them have ended the response', async (t) => {
    const url = await server((req, res) => {
        const dispatch = composer(true, (c: Context) => c.next(), (c: Context) => c.next())
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    t.truthy(res.ok)
})

test('main composer multi handlers', async (t) => {
    const url = await server((req, res) => {
        const check = (c: Context) => {
            c.next()
        }
        const hello = () => 'hello'
        const dispatch = composer(true, check, hello)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const r = await res.text()
    t.is(r, 'hello')
})

test('main composer multi handlers async', async (t) => {
    const url = await server((req, res) => {
        const check = (c: Context) => {
            c.next()
        }
        const hello = () => Promise.resolve('hello')
        const dispatch = composer(true, check, hello)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const r = await res.text()
    t.is(r, 'hello')
})

test('main composer multi handlers next error', async (t) => {
    const url = await server((req, res) => {
        const check = (c: Context) => c.next(createError(400))
        const hello = () => Promise.resolve('hello')
        const errorHandler = (context: Context, error: Partial<HttpError>) => {
            context.res.statusCode = error.statusCode || 500
            context.res.end()
        }
        const dispatch = composer(true, check, hello)
        const context = createContext({
            req
            , res
            , errorHandler
        })

        dispatch(context)
    })

    const res = await fetch(url)
    t.is(res.status, 400)
})

test('main composer multi handlers throw error', async (t) => {
    const url = await server((req, res) => {
        const check = (c: Context) => c.next()
        const hello = () => Promise.reject(new Error('Something wrong is happened'))
        const errorHandler = (context: Context, error: Partial<HttpError>) => {
            context.res.statusCode = 500
            context.res.end(JSON.stringify({
                message: error.message
            }))
        }
        const dispatch = composer(true, check, hello)
        const context = createContext({
            req
            , res
            , errorHandler
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const r = await res.json()

    t.is(r.message, 'Something wrong is happened')
    t.is(res.status, 500)
})
