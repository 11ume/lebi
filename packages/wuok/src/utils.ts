import { Stream, Readable } from 'stream'
import { createError } from './error'
import { RequestListener } from './app'

export const isDev = () => process.env.NODE_ENV === 'development'

export const isStream = (stream: Stream) => {
    return stream !== null &&
	typeof stream === 'object' &&
	typeof stream.pipe === 'function'
}

export const isReadable = (stream: Readable) => {
    return isStream(stream) &&
	stream.readable !== false &&
	typeof stream._read === 'function'
}

export const mergeHandlers = (handler: RequestListener | RequestListener[], handlers: RequestListener[]) => Array.isArray(handler) ? [...handler, ...handlers] : [handler, ...handlers]

export const parseJSON = (str: string) => {
    try {
        return JSON.parse(str)
    } catch (err) {
        throw createError(400, 'Invalid JSON', err)
    }
}