import test from 'ava'
import { shared } from '..'
import { InternalError } from 'wezi-error'

type Sharable = {
    foo: string
    bar: number
};

test('set propery and get property', (t) => {
    const pointer = {
        req: {}
    }
    const sharable = shared<Sharable>(pointer as any)
    sharable.set('foo', '123')
    const value = sharable.get('foo')
    t.is(value, '123')
})

test('get inexistent propery key', (t) => {
    const pointer = {
        req: {}
    }
    const sharable = shared<Sharable>(pointer as any)
    const err: InternalError = t.throws(() => sharable.get('foo'))
    t.is(err.statusCode, 500)
    t.is(err.message, 'get sharable value error, key: foo don\'t exist')
})

test('remove propery', (t) => {
    const pointer = {
        req: {}
    }
    const sharable = shared<Sharable>(pointer as any)
    sharable.set('foo', '123')
    const value = sharable.get('foo')
    t.is(value, '123')
    const removed = sharable.remove('foo')
    t.is(removed, undefined)
})

test('get all values', (t) => {
    const pointer = {
        req: {}
    }
    const sharable = shared<Sharable>(pointer as any)
    sharable.set('foo', '123')
    sharable.set('bar', 123)
    const values = sharable.values()
    t.deepEqual(values, {
        foo: '123'
        , bar: 123
    })
})

test('get get value after delete reference', (t) => {
    const pointer = {
        req: {}
    }
    const sharable = shared<Sharable>(pointer as any)
    sharable.set('foo', '123')
    const value = sharable.get('foo')
    t.is(value, '123')

    delete pointer.req
    const err: Error = t.throws(() => sharable.get('foo'))
    t.is(err.message, 'Cannot use \'in\' operator to search for \'foo\' in undefined')
})
