export default {
  name: 'verify-description',
  execute: async (msg, _, context) => {
    const { danger } = context

    if (!danger?.github?.pr?.body) {
      msg('Escreva uma breve descrição do PR.')
    }
  }
}
