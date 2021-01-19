import test from 'ava'
import fetch from 'node-fetch'
import { router, get } from 'wezi'
import queryParser, { Payload } from 'wezi-query'
import { server } from './helpers'

test('get query string params', async (t) => {
    type Query = {
        name: string
        surname: string
    }

    const greet = (_c, { query }: Payload<void, Query>) => `${query.name} ${query.surname}`
    const r = router(
        get('/users', queryParser, greet)
    )
    const url = await server(r)
    const res = await fetch(`${url}/users?name=foo&surname=bar`)
    const body = await res.text()

    t.is(body, 'foo bar')
})

test('get query string params whit router params', async (t) => {
    type Params = {
        id: string
    }

    type Query = {
        name: string
        surname: string
    }

    const greet = (_c, { params, query }: Payload<Params, Query>) => `${params.id} ${query.name} ${query.surname}`
    const r = router(
        get('/users/:id', queryParser, greet)
    )
    const url = await server(r)
    const res = await fetch(`${url}/users/12?name=foo&surname=bar`)
    const body = await res.text()

    t.is(body, '12 foo bar')
})

test('get query string params must be null', async (t) => {
    type Query = {
        name: string
    }

    const greet = (_c, { query }: Payload<void, Query>) => query === null ? 'is null' : 'not is null value'
    const r = router(
        get('/users', queryParser, greet)
    )
    const url = await server(r)
    const res = await fetch(`${url}/users`)
    const body = await res.text()

    t.is(body, 'is null')
})
