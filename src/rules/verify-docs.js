export default {
  name: 'verify-docs',
  execute: async (msg, _, context) => {
    const { danger, findModifiedFile } = context

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
}
