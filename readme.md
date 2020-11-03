<div align="center">
    <img src="https://github.com/11ume/wezi-assets/blob/main/logo.png?raw=true" width="300" height="auto"/>
</div>

<br>

<br>

<p align="center"> 
    wezi is a small, simple and expressive library
    <br>
    to create a e̶l̶e̶g̶a̶n̶t̶ ̶m̶o̶n̶o̶l̶i̶t̶h̶s  robust web services like polar bears!. 
<p>

<br>

<div align="center"> 
    
[![Build Status](https://img.shields.io/github/workflow/status/11ume/wezi/Build?style=flat&colorA=000000&colorB=000000)](https://github.com/11ume/wezi/actions?query=workflow%3ABuild)

</div>
    
<br>

> Features

<br>

* **Small** only contains what you will need
* **Fast** high performance (even JSON parsing is opt-in)  
* **Clean** thinked for implement the best practices
* **Async** fully asynchronous, implements enhanced flow handlers
* **Functional** functional programing friendly
* **Intuitive** has features similar to other popular projects
* **Solid** desing for work whit Typescript

<br>


### Usage

<br>

<div align="right">
    <img src="https://github.com/11ume/wezi-assets/blob/main/hi2.png?raw=true" width="200" height="auto"/>
</div>

> Say hello

```ts
import wezi, { listen } from 'wezi'

const hello = () => 'Hi, i'm a small polar bear!'
const w = wezi(hello)
listen(w(), 3000)
```

<br>


> Send and receive messages


```ts
import wezi, { Context, listen } from 'wezi'
import { json } from 'wezi-receive'

type Bear = {
    name: string
    type: string 
}

const locate = (type: string) => ({
    'polar': 'North pole',
    'grezzly': 'Yellowstone National Park'
})[type]

const find = async (c: Context) => {
    const bear = await json<Bear>(c)
    const location = locate(bear.type)
    if (location) return `The ${bear.name} lives in ${location}`
    return null
}

const w = wezi(find)
listen(w(), 3000)
```

<br>


> Using the router


```ts
import wezi, { listen } from 'wezi'
import router, { ContextRoute, get } from 'wezi-router'

type Bear = {
    type: string
    location: string
}

const bears = [
    {
        type: 'polar',
        location: 'North pole'
    },
    {
        type: 'grezzly', 
        location: 'Yellowstone National Park'
    }
]

const getAll = (): Bear[] => bears
const getById = ({ params }: ContextRoute<Pick<Bear,'type'>>): Bear => params.type 
    ? bears.find((bear) => bear.type === params.type) 
    : null 

const r = router(
    get('/bears', getAll)
    , get('/bears/:type', getById)
)

const w = wezi(r)
listen(w(), 3000)

```
