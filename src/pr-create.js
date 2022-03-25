#!/usr/bin/env zx

import 'zx/globals'

const branch = await $`git rev-parse --abbrev-ref HEAD`.then(out => out.stdout.trim())

await $`git push -uf origin ${branch} --no-verify`

const repoPath= await $`git rev-parse --show-toplevel`.then(out => out.stdout.trim())

const workflowFieldnewsPath = repoPath + '/.github/workflows/fieldnews.yml'

let prTemplatePath = ''
if(fs.existsSync(repoPath + '/.github/pull_request_template.md')){
  prTemplatePath =  repoPath + '/.github/pull_request_template.md'
}

let prTemplate = prTemplatePath && fs.readFileSync(prTemplatePath, {  encoding: 'utf8' })

const prefix = fs.existsSync(workflowFieldnewsPath)
  ?  await $`cat ${workflowFieldnewsPath} | grep allowed_prefix | cut -d ':' -f 2 | sed "s/'//g" | xargs`.then(out => out.stdout.trim())
  : ''

const commitMessage= await $`git log --pretty=%B -n 1 | cut -d ':' -f 2 | xargs`.then(out => out.stdout.trim())

const title = `${prefix} ${commitMessage}`.trim()

const issueNumber = issueNumberFromBranch(branch)

if(issueNumber) {
  prTemplate = `- closes #${issueNumber}\n\n` + prTemplate
}

prTemplate = prTemplate || 'empty'

const reviewers = await $`gh api orgs/FieldControl/members --jq '.[].login' | xargs`.then(out => out.stdout.trim().replace(/\s+/g, ','))

await $`gh pr create --assignee @me --draft --title ${title} --body ${prTemplate} --reviewer ${reviewers}`

const url = await $`gh pr view --json url --jq .url`.then(out => out.stdout.trim())

$`google-chrome ${url}`

function issueNumberFromBranch(branch) {
  const match = branch.match(/^(\d+)/)
  return match && match[0]
}
