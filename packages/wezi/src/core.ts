import http, { RequestListener, IncomingMessage, ServerResponse } from 'http'
import { send } from 'wezi-send'
import { Context, Handler } from 'wezi-types'
import composer from 'wezi-composer'

export const defaultErrorHandler = (ctx: Context) => {
    const status = ctx.error.statusCode || 500
    if (ctx.error.message) {
        send(ctx, status, {
            message: ctx.error.message
        })
        return
    }

    send(ctx, status)
}

export const listen = (run: RequestListener, port: number) => new Promise((resolve, reject) => {
    const server = http.createServer(run)
    server.on('listening', resolve)
    server.on('error', reject)
    return server.listen(port)
})

const run = (...handlers: Handler[]) => (errorHandler: Handler = defaultErrorHandler) => {
    return (req: IncomingMessage, res: ServerResponse) => {
        const dispatch = composer(true, ...handlers)
        const context: Context = {
            req
            , res
            , next: null
            , error: null
            , errorHandler
        }

        dispatch(context)
    }
}

export default run
