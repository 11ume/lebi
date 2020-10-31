<div align="center">
    <img src="https://github.com/11ume/wezi-assets/blob/main/logo.png?raw=true" width="300" height="auto"/>
</div>


<br>

<p align="center">
    small and expressive 
    <br>
    http server
<p>
    
<br>


> **why?** Wizi is small but powerful, the idea behind it is to create robust http servers like polar bear, is expressive and easy to use. 

<br>


### Usage

<br>

<div align="right">
    <img src="https://github.com/11ume/wezi-assets/blob/main/hi.png?raw=true" width="120" height="auto"/>
</div>

```ts
import wezi, { listen } from 'wezi'

const hello = () => 'Hi!'
const w = wezi(hello)
listen(w(), 3000)
```
