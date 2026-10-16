// Metaverse Web client, protocol mvw/0.1.
// Lets this world work standalone while also talking to the Metaverse Browser when framed.
export const PROTOCOL = 'mvw/0.1'
export const inBrowser = window.parent !== window
const params = new URLSearchParams(location.search)

export const spawnId = params.get('spawn')
export const pickSpawn = (spawns) => spawns[spawnId] ?? spawns.default

let identity = null
const listeners = new Set()
export function onIdentity(fn) {
  listeners.add(fn)
  if (identity) fn(identity)
  return () => listeners.delete(fn)
}

const post = (msg) => inBrowser && window.parent.postMessage({ protocol: PROTOCOL, ...msg }, '*')

window.addEventListener('message', (e) => {
  if (e.source !== window.parent || e.data?.protocol !== PROTOCOL) return
  if (e.data.type === 'enter') {
    identity = e.data.identity
    listeners.forEach((fn) => fn(identity))
  }
})
post({ type: 'ready' })

export const presence = (where) => post({ type: 'presence', where })

export function navigate(href, spawn, back) {
  if (inBrowser) return post({ type: 'navigate', href, spawn, back })
  const u = new URL(href)
  if (spawn) u.searchParams.set('spawn', spawn)
  setTimeout(() => (location.href = u.toString()), 450)
}
