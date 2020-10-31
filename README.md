<div align="center">
    <img src="https://github.com/11ume/wezi-assets/blob/main/logo.png?raw=true" width="300" height="auto"/>
</div>


<br>

<p align="center">
    small and expressive 
    <br>
    web library
<p>
    
<br>

> **why?** 

<br>

**Wizi** is small library to create a robust e̶l̶e̶g̶a̶n̶t̶ ̶m̶o̶n̶o̶l̶i̶t̶h̶ microservice like a polar bear!, is centred on the simplicity, each part of his source code is simple, modular and essential. 

<br>


### Usage

<br>

<div align="right">
    <img src="https://github.com/11ume/wezi-assets/blob/main/hi2.png?raw=true" width="200" height="auto"/>
</div>

```ts
import wezi, { listen } from 'wezi'

const hello = () => 'Hi, i'm small polar bear!'
const w = wezi(hello)
listen(w(), 3000)
```
