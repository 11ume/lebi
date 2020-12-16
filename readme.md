<br>

<br>

<div align="center">
    <img src="https://github.com/11ume/wezi-assets/blob/main/logo.png" width="300" height="auto"/>
</div>

<br>

<br>

<p align="center"> 
    Wezi is a simple, small and expressive library
    <br>
    to create e̶l̶e̶g̶a̶n̶t̶ ̶m̶o̶n̶o̶l̶i̶t̶h̶s robust web applications and microservices like polar bears!. 
<p>

<br>

<div align="center"> 
    
[![ci status](https://img.shields.io/github/workflow/status/11ume/wezi/ci?style=flat&colorA=000000&colorB=000000)](https://github.com/11ume/wezi/actions?query=workflow%3Aci)
[![js-standard-style](https://img.shields.io/badge/code%20style%20-standard-standard?style=flat&colorA=000000&colorB=000000)](http://standardjs.com)
[![codecov](https://img.shields.io/badge/☂%20-coverage-☂?style=flat&colorA=000000&colorB=000000)](https://codecov.io/gh/11ume/wezi/branch/main)
[![discord shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=92E8FF)](https://discord.com)

</div>
    
<br>

> ⚠️ Wezi is currently under development.

<br>

> Features

<br>

* **Simple** Only includes essential features.
* **Small** It's really small and modular.
* **Fast** High performance (even JSON parsing is opt-in).  
* **Async** Fully asynchronous, implements enhanced flow handlers.
* **Safe** Is designed from scratch to work with Typescript.
* **Middlwares** Implements a middleware logic.

<br>

**Wezi** is small and simple because are designed to work behind of an **API Gateway** or a **Reverse proxy**.
Most of the functionalities of other libraries similar to this, are usually redundant and you will probably never need to use them.

Respect the [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) principle. 

<br>

### Install


```bash
npm install wezi
```

<br>

### Usage

<br>

<div align="right">
    <img src="https://github.com/11ume/wezi-assets/blob/main/hi2.png?raw=true" width="200" height="auto"/>
</div>

#### Send

<br>

> Exists two ways to send messages.

<br>

*The most simple and natural way, is a direct return*.

<br>


```ts
import wezi, { listen } from 'wezi'

const hello = () => 'Hi, im a small polar bear!'
const w = wezi(hello)
listen(w, 3000)
```

<br>

> Direct return of promises.  

<br>

```ts
import wezi, { listen } from 'wezi'

const delay = (time: number) => new Promise((r) => setTimeout(r, time))
const hello = async () => {
    await delay(2000)
    return 'Hi, im a small polar bear!'
}

const w = wezi(hello)
listen(w, 3000)
```

<br>

**Note**: By default a direct return, emit a status code 200 or 204 if you return a **null** value, and only support objects that can be interpreted by **JSON.stringify**, to send other data types like buffers or streams, you must use special methods of the **send** package.

<br>

*The second way is through the **send** function, which allows you to define a status code*.

<br>


```ts
import wezi, { Context, listen } from 'wezi'

const hello = ({ send }: Context) => send.json(420, {
    message: 'Enhance Your Calm ✌️'
})
const w = wezi(hello)
listen(w, 3000)

```
<br>

#### Receive


<br>

> The payload of each messages is parsed in explicit form, this makes wezi really fast, since the type is not inferred in each request that is made.

<br>

> Receive JSON

<br>

```ts
import wezi, { Context, listen } from 'wezi'

type Bear = {
    type: string
    location: string
}

const locate = async ({ receive }: Context) => {
    const { type, location } = await receive.json<Bear>()
    return `The ${type} bear lives in ${location}`
}

const w = wezi(locate)
listen(w, 3000)

```

<br>

```bash
curl -X POST -H "Content-Type: application/json" -d '{ "type": "Polar", "location": "North Pole" }' http://localhost:3000
```

<br>

> Receive Text

<br>

```ts
import wezi, { Context, listen } from 'wezi'

const greet = async ({ receive }: Context) => {
    const name = await receive.text() // "wezi"
    return `Hi ${name}!`
}

const w = wezi(greet)
listen(w, 3000)

```

<br>

> Receive Buffer

<br>

```ts
import wezi, { Context, listen } from 'wezi'

const greet = async ({ receive }: Context) => {
    const name = await receive.buffer() // Buffer(7) [104, 111, 114, 97, 99, 105, 111]
    return `Hi ${name}!`
}

const w = wezi(greet)
listen(w, 3000)
```

<br>

```bash
curl http://localhost:3000 -H "Content-Type: text/plain" --data "wezi" 
```

<br>

**Note**: By default the wezi does not discriminate between HTTP methods, to achieve this you must use the **router** package.

<br>

#### The data flow between handlers 

<br>

> Each handler must do two things in his execution, return a value and end the request, or pass to next handler using the **next** function. Also through the **next** function you can pass some value to the next handler.

<br>


```ts
import wezi, { Context, listen } from 'wezi'

const passName = ({ next }: Context) => next('John')
const greet = (_c: Context, name: string) => `Hi ${name}!`

const w = wezi(passName, greet)
listen(w, 3000)
```

<br>

```ts
import wezi, { Context, listen } from 'wezi'
import { createError } from 'wezi-error'

type Bear = {
    type: string
    location: string
}

const check = async ({ next, panic, receive }: Context) => {
    const bear = await receive.json<Bear>()
    if (bear.type && bear.location) {
        next(bear)
        return
    }
    panic(createError(400, 'Type and location are required'))
}

const locate = async (_c: Context, { type, location }: Bear) => `The ${type} bear lives in ${location}`
const w = wezi(check, locate)
listen(w, 3000)
```

<br>

*Passing values through the **next** function, is a very clear and intuitive way for handling the flow of data from one handler to other*.

<br>


### Let's stop for a moment.

<br>

The **next** function is used to pass from current handler to next, and it can also pass parameters.
The **panic** function is used to stop the sequence of execution of the stack of handlers.

When **panic** function is invoked, the **composer** immediately stops the sequence of handlers execution, and the system goes into a panic state 🔥, so the error passed into panic function will be controlled by the error handler function 🚒.


<br>

<br>

#### Error handling

<br>

> By default each handler run inside a safe context, and are controlled by a default error handler, but you can define your own.

<br>

> Automatic error handling 

<br>


```ts
import wezi, { listen } from 'wezi'

const handler = () => {
    throw Error('Something wrong has happened')
}

const w = wezi(handler)
listen(w, 3000)
```

<br>

> Automatic error handling in promises 

<br>

```ts
import wezi, { listen } from 'wezi'

const handler = () => Promise.reject(Error('Something wrong has happened'))
const w = wezi(handler)
listen(w, 3000)
```

<br>

> Error handling through panic function 

<br>

```ts
import wezi, { Context, listen } from 'wezi'

const handler = ({ panic }: Context) => panic(new Error('Something wrong has happened'))
const w = wezi(handler)
listen(w, 3000)
```

<br>

**Note**: All the errors that are emitted in production mode whitout some status code or error message, return a default error message like this:

<br>

```bash
curl http://localhost:3000 -v

HTTP/1.1 500 Internal Server Error
Content-Type: application/json charset=utf-8
{"message":"Internal Server Error"}
```

<br>

#### Defining your own error handler

<br>

```ts
import wezi, { Context, listen } from 'wezi'
import { createError, InternalError } from 'wezi-error'

const greet = ({ panic }: Context) => panic(createError(400))
const errorHandler = ({ send }: Context, error: InternalError) => {
    const status = error.statusCode ?? 500
    const message = error.message || 'unknown'
    const payload = {
        message
    }
    send.json(status, payload)
}

const w = wezi(greet)
listen((req, res) => w(req, res, errorHandler), 3000)
```

```bash
curl http://localhost:3000 -v

HTTP/1.1 400 Bad Request
Content-Type: application/json charset=utf-8
{"message":"Bad Request"}
```
