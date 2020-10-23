import { Stream, Readable } from 'stream'
import { isReadable } from './utils'
import { Context } from 'wuok'

const noContentType = (ctx: Context) => !ctx.res.getHeader('Content-Type')

export const end = (ctx: Context) => ctx.res.end()

export const sendBuffer = (ctx: Context, statusCode = 200, obj: Buffer) => {
    ctx.res.statusCode = statusCode
    if (Buffer.isBuffer(obj)) {
        if (noContentType(ctx)) {
            ctx.res.setHeader('Content-Type', 'application/octet-stream')
        }

        ctx.res.setHeader('Content-Length', obj.length)
        ctx.res.end(obj)
        return
    }

    end(ctx)
}

export const sendStream = (ctx: Context, statusCode = 200, obj: Readable) => {
    ctx.res.statusCode = statusCode
    if (obj instanceof Stream || isReadable(obj)) {
        if (noContentType(ctx)) {
            ctx.res.setHeader('Content-Type', 'application/octet-stream')
        }

        obj.pipe(ctx.res)
        return
    }

    end(ctx)
}

export const send = (ctx: Context, statusCode = 200, obj = null) => {
    ctx.res.statusCode = statusCode
    if (obj === null) {
        end(ctx)
        return
    }

    let payload = obj
    if (typeof obj === 'object' || typeof obj === 'number') {
        payload = JSON.stringify(obj)
        if (noContentType(ctx)) {
            ctx.res.setHeader('Content-Type', 'application/json charset=utf-8')
        }

        ctx.res.setHeader('Content-Length', Buffer.byteLength(payload))
    }

    ctx.res.end(payload)
}

