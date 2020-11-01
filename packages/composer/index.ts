import { Context, Handler } from 'wezi-types'
import { send } from 'wezi-send'

type Dispatch = (context: Context, payload: unknown) => void

// execute and manage the return of a handler
const execute = async (context: Context, handler: Handler) => {
    try {
        const val = await handler(context)
        if (val === null) {
            send(context, 204, val)
            return
        }
        if (val !== undefined) {
            send(context, context.res.statusCode, val)
            return
        }
    }
    catch (err) {
        context.next(err)
    }
}

// create a function "next" used fo pass to next handler in the handler stack
const createNext = (context: Context, dispatch: Dispatch) => {
    return function next(payload: unknown) {
        let ctx = context
        if (payload instanceof Error) {
            ctx = Object.assign(context, {
                error: payload
            })
        }

        dispatch(ctx, payload)
    }
}

// end response if all higher-order handlers are executed, and none of them have ended the response
const end = (main: boolean, context: Context) => main && context.res.end()

// used for create a multi handler flow execution controller
const composer = (main: boolean, ...handlers: Handler[]) => {
    let i = 0
    return function dispatch(context: Context) {
        if (context.res.writableEnded) return
        if (context.error) {
            context.errorHandler(context) // circlular dep
            return
        }
        if (i < handlers.length) {
            const handler = handlers[i++]
            const nx = createNext(context, dispatch)
            const nc = Object.assign(context, {
                next: nx
            })
            setImmediate(execute, nc, handler)
            return
        }

        end(main, context)
    }
}

export default composer
