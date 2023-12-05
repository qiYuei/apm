<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { onMounted } from 'vue'

// d = 1234

// onMounted(() => {
//   // Promise.reject('error')
//   setTimeout(() => {
//     d = 1234
//   }, 3000)
// })

function toHandlers() {
  for (let i = 0; i < 999; i++) {}

  let str = '321423'

  str.push(1234)
}

onMounted(() => {})

function promiseError() {
  return new Promise((resolve, reject) => {
    reject('some message reject')
  })
}

function promiseError2() {
  return new Promise((resolve, reject) => {
    reject(new Error('throw error'))
  })
}

function rescourceError() {
  setTimeout(() => {
    const image = new Image()
    image.src = './heel.jpg'
    document.body.appendChild(image)

    const script = document.createElement('script')
    script.src = './test.js'
    document.body.appendChild(script)
  }, 3000)
}

function asyncError() {
  setTimeout(function b() {
    ppt.push(123)
  }, 3000)
}

function xhrError() {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', './test.js?abc=123454')
  xhr.send()
}

function fetchError() {
  fetch('./test.js?abc=123454')
    .then((res) => {
      console.log(res, '------------fetch res')
    })
    .catch((r) => {
      console.log(r, '------------fetch')
    })

  fetch('./test', {
    method: 'post',
    body: JSON.stringify({ A: 1 })
  })
}

function fetch1() {
  fetch('http://localhost:3000/api/test', {
    method: 'post',
    body: JSON.stringify({ A: 1 })
  })
}

function fetch2() {
  fetch('http://localhost:3000/api/test', {})
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>

      <button @click="toHandlers">惦记我</button>
      <button @click="rescourceError">资源加载</button>
      <button @click="promiseError">Promise</button>
      <button @click="promiseError2">Promise2</button>
      <button @click="asyncError">异步错误</button>
      <button @click="xhrError">xhr错误</button>
      <button @click="fetchError">fetch错误</button>
      <button @click="fetch1">fetch1</button>
      <button @click="fetch2">fetch2</button>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
