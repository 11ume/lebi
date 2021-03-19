import test from 'ava'
import fetch from 'node-fetch'
import router, { get } from 'wezi-router'
import queryParser from 'wezi-query'
import { text } from 'wezi-send'
import { Context } from 'wezi'
import { server, serverRouter } from './helpers'

test('get query string params', async (t) => {
    type Query = {
        name: string
        surname: string
    }

    const greet = (c: Context) => {
        const query = queryParser<Query>(c)
        text(c, `${query.name} ${query.surname}`)
    }
    const url = await server(greet)
    const res = await fetch(`${url}/users?name=foo&surname=bar`)
    const body = await res.text()

    t.is(body, 'foo bar')
})

test('get query string params with router flow', async (t) => {
    type Query = {
        name: string
        surname: string
    }

    const greet = (c: Context) => {
        const query = queryParser<Query>(c)
        text(c, `${query.name} ${query.surname}`)
    }
    const r = router(
        get('/users', greet)
    )
    const url = await serverRouter(r)
    const res = await fetch(`${url}/users?name=foo&surname=bar`)
    const body = await res.text()

    t.is(body, 'foo bar')
})

