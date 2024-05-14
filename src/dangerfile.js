const dangerfile = `
const { message, danger, warn, fail } = require('danger')
const fs = require('node:fs/promises')
const child_process = require('node:child_process')

const { name: serviceName } = require('./package.json')

const levels = {
  0: () => {},
  1: message,
  2: warn,
  3: fail
}

const exec = level => msg => {
  if (typeof level !== 'number' || !level) return

  const exe = levels?.[level]

  if (!exe) return

  return exe(msg)
}

const modifiedFiles = danger.git.modified_files
const createdFiles = danger.git.created_files

const findModifiedFile = fileName =>
  modifiedFiles.find(modifiedFile => modifiedFile.includes(fileName))

const findModifiedTestFiles = () =>
  modifiedFiles.filter(file => file.includes('test.js'))
const findCreatedTestFiles = () =>
  createdFiles.filter(file => file.includes('test.js'))
const testFiles = [...findModifiedTestFiles(), ...findCreatedTestFiles()]

const findModifiedSourceFiles = () =>
  modifiedFiles.filter(file => file.includes('lib/'))
const findCreatedSourceFiles = () =>
  createdFiles.filter(file => file.includes('lib/'))
const sourceFiles = [...findModifiedSourceFiles(), ...findCreatedSourceFiles()]

const verifyDescriptionChanges = async msg => {
  if (!danger.github.pr.body) {
    msg('Escreva uma breve descrição do PR.')
  }
}

const verifyTestChanges = async msg => {
  if (!testFiles.length && sourceFiles.length) {
    return msg(
      'Nenhum teste foi criado ou atualizado para a nova implementação'
    )
  }

  for (const testFile of testFiles) {
    const { diff } = await danger.git.diffForFile(testFile)
    if (!diff.includes('assert')) {
      msg(\`Nenhum expect/assert foi adicionado no teste \${testFile}\`)
    }
  }
}

const buildScriptMessage = async msg => {
  const scriptMessage = []

  if (findModifiedFile('package.json')) {
    const packageDiff = await danger.git.JSONDiffForFile('package.json')
    const stringPackageContent = await danger.github.utils.fileContents(
      findModifiedFile('package.json')
    )
    const objectPackageContent = JSON.parse(stringPackageContent)
    if (packageDiff.version && !packageDiff.version.after.includes('-rc')) {
      const versionMessage =
        \`\n <strong>Microsserviço</strong>: \${serviceName}\` +
        \`\n <strong>Versão</strong>: \${objectPackageContent.version}\`
      scriptMessage.push(versionMessage)
    }
  }
  if (scriptMessage.length) {
    const headerMessage =
      ' =================== Roteiro de Implantação =================== \\n\\n'
    const fullMessage = headerMessage + scriptMessage
    msg(fullMessage)
  } else {
    msg('Nenhuma alteração na versão')
  }
}

const verifyImportantFiles = async (msg, list = []) => {
  const importantFiles = [
    'config.yml',
    'Dockerfile',
    'entrypoint.sh',
    '.eslintrc',
    'sonar-project.properties',
    '.mocharc.json',
    '.nycrc.json',
    ...list
  ]

  for (const file of importantFiles) {
    if (findModifiedFile(file)) {
      msg(\`Atenção: O arquivo <strong>\${file}</strong> foi atualizado.\`)
    }
  }
}

const verifyDocs = async msg => {
  if (!findModifiedFile('package.json')) return

  const packageDiff = await danger.git.JSONDiffForFile('package.json')
  if (packageDiff.version) {
    if (packageDiff.version.after.includes('-rc')) {
      msg('Versão com RC')
    }

    if (!findModifiedFile('CHANGELOG.md')) {
      msg(
        '<strong>CHANGELOG.md</strong> deve ser atualizado com as features implementadas na versão'
      )
    }
  }
}

const verifyDependencies = async msg => {
  if (!findModifiedFile('package.json')) return

  const findDiffDependencies = (diffDependencies, type) => {
    const newDevDependencies = []
    const updatedDevDependencies = []
    const dependencies = Object.keys(diffDependencies.after)

    for (const devDependency of dependencies) {
      const versionBefore = diffDependencies.before[devDependency]
      const versionAfter = diffDependencies.after[devDependency]

      if (versionAfter && !versionBefore) {
        newDevDependencies.push(
          \`\${devDependency} - \${versionAfter.replace('^', '')}\`
        )
      }

      if (versionBefore && versionAfter !== versionBefore) {
        updatedDevDependencies.push(
          \`\${devDependency} - De \${versionBefore.replace('^', '')} para \${versionAfter.replace('^', '')}\`
        )
      }
    }

    if (newDevDependencies.length) {
      msg(
        \`Novas \${type} instaladas neste PR: <br/>\` +
          \` \${newDevDependencies.join('<br/>')}\`
      )
    }

    if (updatedDevDependencies.length) {
      msg(
        \`\${type} foram atualizadas neste PR: <br/> \` +
          \` \${updatedDevDependencies.join('<br/>')}\`
      )
    }
  }

  const packageDiff = await danger.git.JSONDiffForFile('package.json')

  if (packageDiff.devDependencies) {
    findDiffDependencies(
      packageDiff.devDependencies,
      'dependências de desenvolvimento'
    )
  }

  if (packageDiff.dependencies) {
    findDiffDependencies(packageDiff.dependencies, 'dependências')
  }
}

const verifyOutdatedPackages = async msg => {
  try {
    const output = child_process.execSync('npm outdated --json || true')
    const json = JSON.parse(output.toString())
    const entries = Object.entries(json)

    const packagesToUpdate = entries.map(obj => {
      const [packageName, { current, latest }] = obj

      return \`\${packageName} - Atual \${current} - Última \${latest}\`
    })

    if (packagesToUpdate.length) {
      msg(
        'Dependências com novas versões disponíveis: <br/>' +
          \` \${packagesToUpdate.join('<br/>')} \`
      )
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Failed to execute 'npm outdated'", error)
  }
}

const modules = {
  'verify-description': verifyDescriptionChanges,
  'verify-tests': verifyTestChanges,
  'verify-docs': verifyDocs,
  roadmap: buildScriptMessage,
  'important-files': verifyImportantFiles,
  'verify-deps': verifyDependencies,
  'outdated-deps': verifyOutdatedPackages
}

const main = async () => {
  const file = await fs.readFile('.dangerrc', 'utf8')

  const defaultConfig = {
    rules: {
      'verify-description': 1,
      'verify-tests': 1,
      roadmap: 1,
      'important-files': 2,
      'verify-deps': 2,
      'outdated-deps': 2
    }
  }
  const parsedConfig = JSON.parse(file)
  const config = {
    ...defaultConfig,
    ...parsedConfig,
    rules: {
      ...defaultConfig.rules,
      ...parsedConfig.rules
    }
  }

  const rules = config.rules

  const jobs = Object.entries(rules).map(([name, level]) => {
    const fn = modules?.[name]
    if (!fn) return async () => {}

    return async () => {
      const callback = exec(level)
      const params = config?.[name]

      await fn(callback, params)
    }
  })

  for (const job of jobs) {
    await job()
  }
}

main()
`.trim()

module.exports = {
  dangerfile
}
