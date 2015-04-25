# mitsuku-api

Unofficial Js API to interact with the Mitsuku chatbot written and run by [Steve Worswick](https://www.chatbots.org/expert/steve_worswick/3067/). 

```
npm install mitsuku-api
```

This library is not intended for any serious use. Under the hood it just scrapes messages from raw HTML responses that [Mitsuku webchat](http://www.square-bear.co.uk/mitsuku/nfchat.htm) provides. 

## Usage
``` js
var m = require('mitsuku-api')();

m.send('hello world')
  .then(function(response){
    console.log(response);
  });
```

## License
Apache 2.0
