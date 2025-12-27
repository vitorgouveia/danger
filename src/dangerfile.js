import { danger, fail, message, warn } from 'danger'
import { readFileSync } from 'node:fs'
import fs from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { getRulesMap } from './rules/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJson = JSON.parse(
  readFileSync(join(__dirname, './package.json'), 'utf8')
)
const serviceName = packageJson.name

const levels = {
  0: () => {},
  1: message,
  2: warn,
  3: fail
}

const modifiedFiles = danger.git.modified_files
const createdFiles = danger.git.created_files

const findModifiedFile = fileName =>
  modifiedFiles.find(modifiedFile => modifiedFile.includes(fileName))

const findModifiedTestFiles = () =>
  modifiedFiles.filter(file => file.includes('test.js'))

const findCreatedTestFiles = () =>
  createdFiles.filter(file => file.includes('test.js'))

const findModifiedSourceFiles = () =>
  modifiedFiles.filter(file => file.includes('lib/'))

const findCreatedSourceFiles = () =>
  createdFiles.filter(file => file.includes('lib/'))

async function main() {
  try {
    const file = await fs.readFile('.dangerrc', 'utf8')
    const config = JSON.parse(file)

    if (!config.rules || typeof config.rules !== 'object') {
      throw new Error(
        'Arquivo .dangerrc deve conter uma propriedade "rules" como objeto'
      )
    }

    const rulesMap = getRulesMap()
    const rules = config.rules

    for (const [name, level] of Object.entries(rules)) {
      const rule = rulesMap[name]

      if (!rule) {
        console.warn(`Regra desconhecida ignorada: "${name}"`)
        continue
      }

      if (!level || level === 0) {
        continue
      }

      const callback = levels[level]
      const params = config?.[name]

      await rule.execute(callback, params, {
        danger,
        modifiedFiles,
        createdFiles,
        serviceName,
        findModifiedFile,
        findModifiedTestFiles,
        findCreatedTestFiles,
        findModifiedSourceFiles,
        findCreatedSourceFiles
      })
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('Arquivo .dangerrc não encontrado.')
    }

    throw error
  }
}

main()
