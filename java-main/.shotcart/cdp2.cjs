// 临时脚本：验证「加数量 → 刷新页面仍在」「删除行 → 服务端同步」
const http = require('node:http')
const fs = require('node:fs')

const PORT = 9333
const SEED = 'http://127.0.0.1:5173/__seed2.html?to=/home'

const getJSON = (path) =>
  new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: PORT, path }, (res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => resolve(JSON.parse(body)))
    }).on('error', reject)
  })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  const targets = await getJSON('/json/list')
  const page = targets.find((t) => t.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    }
  })
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const msgId = ++id
      pending.set(msgId, resolve)
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })

  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    return r.result?.result?.value
  }

  const rowsSnapshot = () =>
    evaluate(
      `JSON.stringify([...document.querySelectorAll('.cart-row')].map(r => r.innerText.replace(/\\n/g,'|')))`
    )

  await new Promise((r) => ws.addEventListener('open', r, { once: true }))
  await send('Page.enable')
  await send('Runtime.enable')

  await send('Page.navigate', { url: SEED })
  await sleep(5500)
  await evaluate(`document.querySelector('.cart-btn').click()`)
  await sleep(800)
  console.log('初始 ->', await rowsSnapshot())

  // 点第一行 +
  await evaluate(`document.querySelectorAll('.cart-row')[0].querySelectorAll('.cart-step')[1].click()`)
  await sleep(1200)
  console.log('点 + 后 ->', await rowsSnapshot())

  // 刷新整页（模拟关掉浏览器再打开）
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/home' })
  await sleep(5000)
  await evaluate(`document.querySelector('.cart-btn').click()`)
  await sleep(800)
  console.log('刷新后 ->', await rowsSnapshot())

  // 删除第二行（海藻冰淇淋）
  await evaluate(`document.querySelectorAll('.cart-row')[1].querySelector('.cart-del').click()`)
  await sleep(1200)
  console.log('删除后 ->', await rowsSnapshot())

  const shot = await send('Page.captureScreenshot', { format: 'png' })
  if (shot.result?.data) {
    fs.writeFileSync('D:/workSpace/java/java-main/.shotcart/cartpanel2.png', Buffer.from(shot.result.data, 'base64'))
    console.log('screenshot saved')
  }
  ws.close()
  process.exit(0)
})()
