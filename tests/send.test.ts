import test from 'ava'
import fs from 'fs'
import fetch from 'node-fetch'
import { Readable } from 'stream'
import { Context } from '../packages/types'
import { server } from './helpers'
import {
    ok
    , send
    , buffer
    , stream
} from '../packages/send'

type ErrorPayload = {
    message: string
};

test('send text string message', async (t) => {
    const fn = (c: Context) => send(c, 200, 'hello')
    const url = await server(fn)
    const res = await fetch(url)

    const body = await res.text()
    t.is(body, 'hello')
    t.is(res.headers.get('Content-Length'), '5')
    t.is(res.headers.get('Content-Type'), 'text/plain charset=utf-8')
})

test('send text number message', async (t) => {
    const fn = (c: Context) => send(c, 200, 1)
    const url = await server(fn)
    const res = await fetch(url)

    const body = await res.text()
    t.is(body, '1')
    t.is(res.headers.get('Content-Length'), '1')
    t.is(res.headers.get('Content-Type'), 'text/plain charset=utf-8')
})

test('send json message', async (t) => {
    const fn = (c: Context) => send(c, 200, {
        message: 'hello'
    })
    const url = await server(fn)
    const res = await fetch(url)

    const body: { message: string } = await res.json()
    t.is(res.status, 200)
    t.is(body.message, 'hello')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
})

test('send ok whit message', async (t) => {
    const fn = (c: Context) => ok(c, 'fine')
    const url = await server(fn)
    const res = await fetch(url)

    const body = await res.text()
    t.is(body, 'fine')
    t.is(res.status, 200)
})

test('send ok empty', async (t) => {
    const fn = (c: Context) => ok(c)
    const url = await server(fn)
    const res = await fetch(url)

    t.is(res.status, 200)
})

test('send empty', async (t) => {
    const fn = (c: Context) => send(c)
    const url = await server(fn)
    const res = await fetch(url)

    t.is(res.status, 204)
})

test('send payload whit status code', async (t) => {
    const fn = (c: Context) => send(c, 401, {
        message: 'hello'
    })
    const url = await server(fn)
    const res = await fetch(url)

    const body: { message: string } = await res.json()
    t.is(res.status, 401)
    t.is(body.message, 'hello')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
})

test('send only status code', async (t) => {
    const fn = (c: Context) => send(c, 400)
    const url = await server(fn)
    const res = await fetch(url)

    t.is(res.status, 400)
})

test('send Not Content whit other status', async (t) => {
    const fn = (c: Context) => send(c, 400, null)
    const url = await server(fn)
    const res = await fetch(url)

    t.is(res.status, 400)
})

test('send direct message', async (t) => {
    const fn = () => 'hello'
    const url = await server(fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'hello')
})

test('send direct json', async (t) => {
    const fn = () => ({
        message: 'hello'
    })
    const url = await server(fn)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 200)
    t.is(body.message, 'hello')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
    t.is(res.headers.get('Content-Length'), '19')
})

test('send direct Not Content 204', async (t) => {
    const fn = () => null
    const url = await server(fn)
    const res = await fetch(url)

    t.is(res.status, 204)
})

test('send stream readable', async (t) => {
    const readable = new Readable()
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    readable._read = () => { }
    readable.push('foo')
    readable.push(null)

    const fn = (c: Context) => stream(c, 200, readable)
    const url = await server(fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'foo')
})

test('send file read stream', async (t) => {
    const readable = fs.createReadStream('./package.json')
    const fn = (c: Context) => stream(c, 200, readable)
    const url = await server(fn)
    const res = await fetch(url)
    const body: { repository: string } = await res.json()

    t.is(res.status, 200)
    t.is(body.repository, '11ume/wezi')
})

test('send buffer', async (t) => {
    const fn = (c: Context) => buffer(c, 200, Buffer.from('foo'))
    const url = await server(fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'foo')
})

test('try send not buffer', async (t) => {
    const fn = (c: Context) => buffer(c, 200, '' as any)
    const url = await server(fn)
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'buffer payload must be a instance of Buffer')
})

test('try send not stream', async (t) => {
    const fn = (c: Context) => stream(c, 200, '' as any)
    const url = await server(fn)
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'stream payload must be a instance of Stream')
})
