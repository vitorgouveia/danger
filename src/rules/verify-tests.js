export default {
  name: 'verify-tests',
  execute: async (msg, _, context) => {
    const {
      danger,
      findModifiedTestFiles,
      findCreatedTestFiles,
      findModifiedSourceFiles,
      findCreatedSourceFiles
    } = context

    const testFiles = [...findModifiedTestFiles(), ...findCreatedTestFiles()]
    const sourceFiles = [
      ...findModifiedSourceFiles(),
      ...findCreatedSourceFiles()
    ]

    if (!testFiles.length && sourceFiles.length) {
      return msg(
        'Nenhum teste foi criado ou atualizado para a nova implementação'
      )
    }

    for (const testFile of testFiles) {
      const { diff } = await danger.git.diffForFile(testFile)
      if (!diff.includes('assert')) {
        msg(`Nenhum expect/assert foi adicionado no teste ${testFile}`)
      }
    }
  }
}
