import { seedTexts } from '../src/db/seedData.js'

async function check(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' })
    return res.status
  } catch {
    return 0
  }
}

const urls = seedTexts.flatMap((t) => t.chapters.map((c) => ({ text: t.title, ch: c.order, url: c.resourceUrl })))
let failures = 0

for (const { text, ch, url } of urls) {
  const status = await check(url)
  const ok = status >= 200 && status < 400
  if (!ok) failures++
  console.log(`${ok ? 'OK ' : 'FAIL'} [${status}] ${text} #${ch} ${url}`)
}

console.log(failures === 0 ? `\nAll ${urls.length} links OK` : `\n${failures} broken link(s) — fix seedData.ts before seeding`)
process.exit(failures === 0 ? 0 : 1)
