#!/usr/bin/env zx

import 'zx/globals'

const existingPrUrl = await $`gh pr view --json url --jq .url`.then(parseOutput).catch(() => null)

if(existingPrUrl){
  await open(existingPrUrl)

  process.exit(0)
}

const branch = await $`git rev-parse --abbrev-ref HEAD`.then(parseOutput)

await $`git push -uf origin ${branch} --no-verify`

const repoPath= await $`git rev-parse --show-toplevel`.then(parseOutput)

const workflowFieldnewsPath = repoPath + '/.github/workflows/fieldnews.yml'

let prTemplatePath = ''
if(fs.existsSync(repoPath + '/.github/pull_request_template.md')){
  prTemplatePath =  repoPath + '/.github/pull_request_template.md'
}

let prTemplate = prTemplatePath && fs.readFileSync(prTemplatePath, {  encoding: 'utf8' })

const prefix = fs.existsSync(workflowFieldnewsPath)
  ?  await $`cat ${workflowFieldnewsPath} | grep allowed_prefix | cut -d ':' -f 2 | sed "s/'//g" | xargs`.then(parseOutput)
  : ''

const commitMessage= await $`git log --pretty=%B -n 1 | cut -d ':' -f 2 | xargs`.then(parseOutput)

const title = `${prefix} ${commitMessage}`.trim()

const issueNumber = issueNumberFromBranch(branch)

if(issueNumber) {
  prTemplate = `- closes #${issueNumber}\n\n` + prTemplate
}

prTemplate = prTemplate || 'empty'

const reviewers = await $`gh api orgs/FieldControl/members --jq '.[].login' | xargs`.then(out => out.stdout.trim().replace(/\s+/g, ','))

await $`gh pr create --assignee @me --draft --title ${title} --body ${prTemplate} --reviewer ${reviewers}`

const url = await $`gh pr view --json url --jq .url`.then(parseOutput)

await open(url)

function issueNumberFromBranch(branch) {
  const match = branch.match(/^(\d+)/)
  return match && match[0]
}

function parseOutput(out) {
  return out.stdout.trim()
}

async function open(url) {
  await $`google-chrome ${url}`
}