<div align="center">
    <img src="https://github.com/11ume/wezi-assets/blob/main/logo.png?raw=true" width="300" height="auto"/>
</div>

<br>

<br>

<p align="center"> 
    Wezi is a simple, small and expressive library
    <br>
    to create a e̶l̶e̶g̶a̶n̶t̶ ̶m̶o̶n̶o̶l̶i̶t̶h̶s robust APIs and microservices like polar bears!. 
<p>

<br>

<div align="center"> 
    
[![ci status](https://img.shields.io/github/workflow/status/11ume/wezi/ci?style=flat&colorA=000000&colorB=000000)](https://github.com/11ume/wezi/actions?query=workflow%3Aci)
[![js-standard-style](https://img.shields.io/badge/code%20style%20-standard-standard?style=flat&colorA=000000&colorB=000000)](http://standardjs.com)
[![codecov](https://img.shields.io/badge/☂%20-coverage-☂?style=flat&colorA=000000&colorB=000000)](https://codecov.io/gh/11ume/wezi/branch/main)
[![discord shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=92E8FF)](https://discord.com)

</div>
    
<br>

> Features

<br>

* **Small** Only contains essential features.
* **Fast** Hight performance (even JSON parsing is opt-in).  
* **Clean** Thinked for implement the best practices.
* **Async** Fully asynchronous, implements enhanced flow handlers.
* **Functional** Is functional programing friendly.  
* **Friendly** Has features similar to other popular projects.
* **Safe** Is designed from scratch to work with Typescript.
* **Middlwares** Implements a  middleware logic.

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

*The most simple and natural way, is a direct return*.

<br>

```ts
import wezi, { listen } from 'wezi'

const hello = () => 'Hi, i'm a small polar bear!'
const w = wezi(hello)
listen(w(), 3000)
```

**Note**: By default a direct return, emit a status code 200.

<br>

*The second way is through the **send** function, which allows you to define a status code*.

<br>

```ts
import wezi, { listen } from 'wezi'
import { Context } from 'wezi-types'
import { send } from 'wezi-send'

const hello = (c: Context) => send(c, 200, 'Hi, i'm a small polar bear!')
const w = wezi(hello)
listen(w(), 3000)
```

<br>

#### Recibe

<br>

> The payload of each messages is parsed in explicit form, this makes wezi really fast, since the type is not inferred in each request that is made.

<br>

```ts
import wezi, { listen } from 'wezi'
import { Context } from 'wezi-types'
import { json } from 'wezi-receive'

type Bear = {
    type: string
}

const getBearType = async (c: Context) => {
    const bear = await json<Bear>(c)
    return bear.type
}

const w = wezi(getBearType)
listen(w(), 3000)
```

**Note**: By default the wezi does not discriminate between HTTP methods, to achieve this you must use the router package.


<br>

#### The flow of handlers 

<br>

> Each handler must do two things in his execution, return a value and end the request, or pass to next handler, using the **next** function. Also through the **next** function you can pass some value to the next handler.

<br>

```ts
import wezi, { listen } from 'wezi'
import { Context } from 'wezi-types'

const passName = (c: Context) => c.next('John')
const greet = (_, name: string) => `Hi ${name}!`

const w = wezi(passName, greet)
listen(w(), 3000)
```

*If you wonder what is the sense of passing values through the **next** function, well it is a very clear and pure way of handling the flow of data from one handler to the other*.


<br>

#### Error handling

<br>

> By default each handler runs within a controlled context, and wezi has a default error handler.

<br>

```ts
import wezi, { listen } from 'wezi'

const error = () => {
    throw Error('Something wrong has happened')
}

const w = wezi(error)
listen(w(), 3000)
```

<br>

```ts
import wezi, { listen } from 'wezi'

const error = () => Promise.reject(new Error('Something wrong has happened'))
const w = wezi(error)
listen(w(), 3000)
```
<br>

**Return** status code **500** { message: 'Something wrong has happened' }
