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

await $`gh pr create --assignee @me --draft --title ${title} --body ${prTemplate || 'empty'} --reviewer "ThayDias,willaug,caiorsantanna,IgorMoraes15,anselmoj,gilmarferrini,Giovani-f,godinhojoao,guilhermevinifield,helderlim,ottonielmatheus,satakedev,thalescrosa,victorreinor,lfreneda"`

await $`gh pr view -w`

function issueNumberFromBranch(branch) {
  const match = branch.match(/^(\d+)/)
  return match && match[0]
}
