<template>
  <div id="app">
    <button @click="listen()">Listen</button>
    <button @click="fetch('server.ping')">Fetch</button>
    <div ref="responses"></div>
  </div>

</template>

<script>

import {WebSocketService} from "./lib/WebSocket.ts";

export default {
  name: 'App',
    data: function () {
        return {
            ws: null
        }
    },
    methods: {
      fetch: function (method) {
          this.ws.fetch(method).then((res) => {
            this.displayMessage(res)
            }
          )
      },
      displayMessage: function (data) {
        this.$refs.responses.innerHTML += `Data: ${JSON.stringify(data)} <br/>`;
      },
      listen: function () {
        this.ws.listen('today', this.displayMessage);
      }
    },
    created() {
      this.ws = new WebSocketService('wss://whitebit.com/trade_ws');
    }
  }

</script>

<style>
  button {
    position: relative;
    display: inline-block;
    color: #000;
    font-weight: bold;
    text-shadow: rgba(255,255,255,.5) 1px 1px, rgba(100,100,100,.3) 3px 7px 3px;
    margin-left: 20px;
    padding: 20px 20px;
    outline: none;
    border-radius: 50px / 100%;
    background-image:
            linear-gradient(45deg, rgba(255,255,255,.0) 30%, rgba(255,255,255,.8), rgba(255,255,255,.0) 70%),
            linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0) 20%, rgba(255,255,255,0) 90%, rgba(255,255,255,.3)),
            linear-gradient(to right, rgba(125,125,125,1), rgba(255,255,255,.9) 45%, rgba(125,125,125,.5)),
            linear-gradient(to right, rgba(125,125,125,1), rgba(255,255,255,.9) 45%, rgba(125,125,125,.5)),
            linear-gradient(to right, rgba(223,190,170,1), rgba(255,255,255,.9) 45%, rgba(223,190,170,.5)),
            linear-gradient(to right, rgba(223,190,170,1), rgba(255,255,255,.9) 45%, rgba(223,190,170,.5));
    background-size: 200% 100%, auto, 100% 2px, 100% 2px, 100% 1px, 100% 1px;
    background-position: 200% 0, 0 0, 0 0, 0 100%, 0 4px, 0 calc(100% - 4px);
    box-shadow: rgba(0,0,0,.5) 3px 10px 10px -10px;
  }
  button:hover {
    transition: .9s linear;
    background-position: -200% 0, 0 0, 0 0, 0 100%, 0 4px, 0 calc(100% - 4px);
  }
</style>
