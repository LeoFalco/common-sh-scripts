#!/usr/bin/env zx

import 'zx/globals';


import { fileURLToPath } from 'url'
import { dirname, join } from 'path';
import { isSameDay, parseISO } from 'date-fns';
import { unlinkSync } from 'fs';


let dns = null
const today = new Date()

const currentPath = fileURLToPath(dirname(import.meta.url))
const dnsCachePath = join(currentPath, 'dns-cache.json')
const fileContent = fs.readFileSync(dnsCachePath, {
  flag: 'a+',
  encoding: 'utf-8'
})
const cache = fileContent ? JSON.parse(fileContent) : null
if (cache && cache.date && cache.dns && isSameDay(parseISO(cache.date), new Date())) {
  dns = cache.dns
  console.log('dns loaded from cache')
} else {
  const dnsInput = await question("Instance dns: ")
  const instanceIPRegexp = /ec2-\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3}/
  const result = instanceIPRegexp.exec(dnsInput)
  const dnsParsed = result && result[0]
  console.log('dnsParsed: ', dnsParsed)
  if (dnsParsed) {
    dns = dnsParsed
  }
}


if (!dns) {
  console.error("Parse dns from input failed")
  process.exit(2)
}

try {
   const result = await $`scp -i ~/developer.pem 'ubuntu@${dns}.sa-east-1.compute.amazonaws.com:/home/ubuntu/repositories/sammathnaur/packages/server/data/locations.csv' ~/Downloads`
   console.log('result', result)
  fs.writeFileSync(dnsCachePath, JSON.stringify({
    date: today,
    dns: dns
  }, null, 2))
} catch (err) {
  unlinkSync(dnsCachePath)
  throw err
}


console.log('done')