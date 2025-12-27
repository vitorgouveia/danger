export default {
  name: 'roadmap',
  execute: async (msg, _, context) => {
    const { danger, findModifiedFile, serviceName } = context

    const scriptMessage = []

    if (findModifiedFile('package.json')) {
      const packageDiff = await danger.git.JSONDiffForFile('package.json')
      const stringPackageContent = await danger.github.utils.fileContents(
        findModifiedFile('package.json')
      )
      const objectPackageContent = JSON.parse(stringPackageContent)
      if (packageDiff.version && !packageDiff.version.after.includes('-rc')) {
        const versionMessage =
          `\n <strong>Microsserviço</strong>: ${serviceName}` +
          `\n <strong>Versão</strong>: ${objectPackageContent.version}`
        scriptMessage.push(versionMessage)
      }
    }

    if (scriptMessage.length) {
      const headerMessage =
        ' =================== Roteiro de Implantação =================== \n\n'
      const fullMessage = headerMessage + scriptMessage
      msg(fullMessage)
    } else {
      msg('Nenhuma alteração na versão')
    }
  }
}
