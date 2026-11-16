// 临时脚本：用 CDP 打开页面 → 点击购物车按钮 → 截图（验证完即弃）
const http = require('node:http')
const fs = require('node:fs')

const PORT = 9333
const URL_SEED = 'http://127.0.0.1:5173/__seed2.html?to=/home'

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

  await new Promise((r) => ws.addEventListener('open', r, { once: true }))
  await send('Page.enable')
  await send('Runtime.enable')

  await send('Page.navigate', { url: URL_SEED })
  await sleep(6000)

  // 打开购物车面板
  const click = await send('Runtime.evaluate', {
    expression: `(() => { const b = document.querySelector('.cart-btn'); if (!b) return 'no-btn'; b.click(); return 'clicked' })()`,
    returnByValue: true,
  })
  console.log('click ->', click.result?.result?.value)
  await sleep(1200)

  const info = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      rows: [...document.querySelectorAll('.cart-row')].map(r => r.innerText.replace(/\\n/g, ' | ')),
      badge: document.querySelector('.cart-badge')?.innerText,
      sync: document.querySelector('.cart-sync')?.innerText,
      hasDel: document.querySelectorAll('.cart-del').length,
      total: document.querySelector('.cart-total')?.innerText.replace(/\\n/g,' ')
    })`,
    returnByValue: true,
  })
  console.log('dom ->', info.result?.result?.value)

  const shot = await send('Page.captureScreenshot', { format: 'png' })
  if (shot.result?.data) {
    fs.writeFileSync('D:/workSpace/java/java-main/.shotcart/cartpanel.png', Buffer.from(shot.result.data, 'base64'))
    console.log('screenshot saved')
  } else {
    console.log('screenshot failed', JSON.stringify(shot).slice(0, 200))
  }
  ws.close()
  process.exit(0)
})()
