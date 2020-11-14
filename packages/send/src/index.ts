import { Stream, Readable } from 'stream'
import createError from 'wezi-error'
import { Context } from 'wezi-types'
import { isEmpty, noContentType } from './utils'

export const buffer = (context: Context, statusCode: number, payload: Buffer) => {
    context.res.statusCode = statusCode ?? 200
    if (Buffer.isBuffer(payload)) {
        if (noContentType(context)) {
            context.res.setHeader('Content-Type', 'application/octet-stream')
        }

        context.res.setHeader('Content-Length', payload.length)
        context.res.end(payload)
        return
    }

    context.next(createError(500, 'send buffer must be a instance of Buffer'))
}

export const stream = (context: Context, statusCode: number, payload: Readable) => {
    context.res.statusCode = statusCode ?? 200
    if (payload instanceof Stream) {
        if (noContentType(context)) {
            context.res.setHeader('Content-Type', 'application/octet-stream')
        }

        payload.pipe(context.res)
        return
    }

    context.next(createError(500, 'send stream must be a instance of Stream'))
}

export const json = <T = void>(context: Context, payload: T, statusCode?: number) => {
    try {
        const payloadStr = JSON.stringify(payload)
        context.res.statusCode = statusCode ?? 200
        if (noContentType(context)) {
            context.res.setHeader('Content-Type', 'application/json charset=utf-8')
        }

        context.res.setHeader('Content-Length', Buffer.byteLength(payloadStr))
        context.res.end(payloadStr)
    } catch (err) {
        context.next(createError(500, 'send json must be a stringifiable object', err))
    }
}

export const text = (context: Context, payload: string | number, statusCode?: number) => {
    const payloadStr = typeof payload === 'number' ? payload.toString() : payload
    context.res.statusCode = statusCode ?? 200
    if (noContentType(context)) {
        context.res.setHeader('Content-Type', 'text/plain charset=utf-8')
    }

    context.res.setHeader('Content-Length', Buffer.byteLength(payloadStr))
    context.res.end(payloadStr)
}

export const empty = (context: Context, statusCode?: number) => {
    context.res.statusCode = statusCode ?? 204
    context.res.end()
}

export const send = (context: Context, statusCode?: number, payload?) => {
    if (isEmpty(payload)) {
        return empty(context, statusCode)
    }

    if (typeof payload === 'object') {
        return json(context, payload, statusCode)
    }

    return text(context, payload, statusCode)
}
