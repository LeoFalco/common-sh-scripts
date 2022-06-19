#!/usr/bin/env zx

import 'zx/globals';
import chalk from 'chalk';
import lodash from 'lodash';
import { $ } from 'zx';
const { yellow, green } = chalk;
const { chain } = lodash

console.log()
const branch = await $`git rev-parse --abbrev-ref HEAD`.then(parseOutput)
console.log()

await $`git push -uf origin ${branch} --no-verify`
console.log()

const repoPath = await $`git rev-parse --show-toplevel`.then(parseOutput)

const prTemplatePath = repoPath + '/.github/pull_request_template.md'
let prTemplate = fs.existsSync(prTemplatePath)
? fs.readFileSync(prTemplatePath, {  encoding: 'utf8' })
: ''

const commitMessage= await $`git log --pretty=%B -n 1 | cut -d ':' -f 2 | xargs`.then(parseOutput)

const workflowFieldnewsPath = repoPath + '/.github/workflows/fieldnews.yml'
let prefix = fs.existsSync(workflowFieldnewsPath)
  ?  await $`cat ${workflowFieldnewsPath} | grep allowed_prefix | cut -d ':' -f 2 | sed "s/'//g" | xargs`.then(parseOutput)
  : ''

prefix = prefix.split(',')[0].trim()


const title = `${prefix} ${capitalize(commitMessage)}`.trim()

const issueNumber = issueNumberFromBranch(branch)

if(issueNumber) {
  prTemplate = `- closes #${issueNumber}\n\n` + prTemplate
}

if(!prTemplate){
  prTemplate = `empty`
}

const allReviewersAsString = await $`gh api orgs/FieldControl/members --jq '.[].login' | xargs`.then(out => out.stdout.trim().replace(/\s+/g, ','))

console.log()


const reviewers = [
  'FieldControl/Enterprise',
  'FieldControl/Fieldevelopers',
  'Giovani-f',
  'IgorMoraes15',
  'LeoFalco',
  'caiorsantanna',
  'godinhojoao',
  'lfreneda',
  'thalescrosa',
  'victorreinor',
  'LeoFalco',
  'ThayDias',
  'willaug',
  'satakedev'
]

console.log('reviewers', reviewers)

await (quiet($`gh pr create --assignee @me --title ${title} --body ${prTemplate} --reviewer ${reviewers.join(',')}`))

const url = await $`gh pr view --json url --jq .url`.then(parseOutput)
console.log()
console.log(`pr opened ${url}`)

function issueNumberFromBranch(branch) {
  const match = branch.match(/^(\d+)/)
  return match && match[0]
}

function parseOutput(process) {
  return process && process.stdout.trim()
}

async function open(url) {
  await $`google-chrome ${url}`
}

function capitalize(text){
  return text.charAt(0).toUpperCase() + text.slice(1)
}