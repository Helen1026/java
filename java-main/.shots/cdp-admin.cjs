// 临时脚本：真实 Chrome + CDP 截图后台数据概览（验证完可删）
const http = require('node:http')
const fs = require('node:fs')

const PORT = 9333
const TOKEN = fs.readFileSync('D:/workSpace/java/java-main/.shots/admin_token.txt', 'utf8').trim()

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

  // 先落到前端域，注入管理员登录态
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/login' })
  await sleep(2000)
  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('token','${TOKEN}');
      localStorage.setItem('userInfo', JSON.stringify({username:'spongebob',nickname:'海绵宝宝',role:'admin'}));
      localStorage.setItem('username','spongebob'); 'ok'`,
    returnByValue: true,
  })

  // 进入后台概览
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/admin' })
  await sleep(4500)

  const check = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      title: document.querySelector('.block-title')?.textContent,
      cards: document.querySelectorAll('.stat-card').length,
      charts: [...document.querySelectorAll('.chart-title')].map(t => t.textContent.trim()),
      linePoints: document.querySelectorAll('.line-chart circle').length,
      pieSlices: document.querySelectorAll('.pie-chart path').length,
    })`,
    returnByValue: true,
  })
  console.log('dom ->', check.result?.result?.value)

  const shot = await send('Page.captureScreenshot', { format: 'png' })
  if (shot.result?.data) {
    fs.writeFileSync('D:/workSpace/java/java-main/.shots/admin-stats-real.png', Buffer.from(shot.result.data, 'base64'))
    console.log('screenshot saved')
  } else {
    console.log('screenshot failed', JSON.stringify(shot).slice(0, 200))
  }
  ws.close()
  process.exit(0
)})().catch((e) => { console.error('fail:', e.message); process.exit(1) })
