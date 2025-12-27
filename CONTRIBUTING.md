# Guia de Contribuição

Este documento contém informações sobre como contribuir para este projeto e como
publicar atualizações.

## 🛠️ Setup Inicial

### Pré-requisitos

Você precisará de uma versão moderna do [Node.js](https://nodejs.org). Se
estiver usando um gerenciador de versões como
[`nodenv`](https://github.com/nodenv/nodenv) ou
[`nvm`](https://github.com/nvm-sh/nvm), você pode executar `nodenv install` na
raiz do repositório para instalar a versão especificada em
[`package.json`](./package.json). Caso contrário, Node.js 20.x ou superior deve
funcionar!

### Instalação

1. **Instalar dependências**

   ```bash
   npm install
   ```

2. **Empacotar o JavaScript para distribuição**

   ```bash
   npm run bundle
   ```

3. **Executar os testes**

   ```bash
   npm test
   ```

   Você deve ver algo como:

   ```
   PASS  ./index.test.js
     ✓ throws invalid number (3ms)
     ✓ wait 500 ms (504ms)
     ✓ test runs (95ms)
   ```

## 📝 Desenvolvendo a Action

### Estrutura do Projeto

- [`src/`](./src/) - Código-fonte da action
  - `index.js` - Ponto de entrada da action
  - `main.js` - Lógica principal da action
  - `dangerfile.js` - Template do dangerfile que será gerado
- [`__tests__/`](./__tests__/) - Testes unitários
- [`dist/`](./dist/) - Código compilado (gerado automaticamente)
- [`action.yml`](./action.yml) - Metadados da action (inputs, outputs, etc.)

### Atualizando os Metadados da Action

O arquivo [`action.yml`](action.yml) define os metadados sobre sua action, como
input(s) e output(s). Para detalhes sobre este arquivo, consulte
[Metadata syntax for GitHub Actions](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions).

### Atualizando o Código da Action

O diretório [`src/`](./src/) é o coração da sua action! Este contém o
código-fonte que será executado quando sua action for invocada.

**Pontos importantes ao escrever código da action:**

- A maioria das operações do GitHub Actions toolkit e CI/CD são processadas de
  forma assíncrona. Em `main.js`, você verá que a action é executada em uma
  função `async`:

  ```javascript
  const core = require('@actions/core')
  //...

  async function run() {
    try {
      //...
    } catch (error) {
      core.setFailed(error.message)
    }
  }
  ```

  Para mais informações sobre o GitHub Actions toolkit, consulte a
  [documentação](https://github.com/actions/toolkit/blob/master/README.md).

## 🚀 Processo de Desenvolvimento

### 1. Criar uma nova branch

```bash
git checkout -b releases/v1
```

ou para uma feature específica:

```bash
git checkout -b feature/nome-da-feature
```

### 2. Fazer alterações

- Substitua o conteúdo de `src/` com seu código da action
- Adicione testes em `__tests__/` para seu código-fonte
- Atualize a documentação conforme necessário

### 3. Formatar, testar e compilar

```bash
npm run all
```

> [!WARNING]
>
> Este passo é importante! Ele executará [`ncc`](https://github.com/vercel/ncc)
> para compilar o código JavaScript final da action com todas as dependências
> incluídas. Se você não executar este passo, sua action não funcionará
> corretamente quando for usada em um workflow. Este passo também inclui a opção
> `--license` para `ncc`, que criará um arquivo de licença para todos os módulos
> node de produção usados em seu projeto.

### 4. Commitar suas alterações

```bash
git add .
git commit -m "Descrição das alterações"
```

### 5. Fazer push para o repositório

```bash
git push -u origin releases/v1
```

### 6. Criar Pull Request

Crie um pull request e obtenha feedback sobre sua action.

### 7. Fazer merge

Após aprovação, faça o merge do pull request na branch `main`.

## ✅ Validar a Action

Você pode validar a action referenciando-a em um arquivo de workflow. Por
exemplo, você pode criar um workflow de teste em `.github/workflows/test.yml`:

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20'

  - name: Test Local Action
    id: test-action
    uses: ./
```

## 📦 Publicar uma Nova Versão

Após testar, você pode criar tags de versão que os desenvolvedores podem usar
para referenciar diferentes versões estáveis da sua action. Para mais
informações, consulte
[Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
no GitHub Actions toolkit.

### Processo de Versionamento

1. **Atualizar a versão no `package.json`** (se aplicável)

2. **Criar uma tag de versão**

   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

3. **Criar uma Release no GitHub**
   - Vá para a página de Releases do repositório
   - Clique em "Draft a new release"
   - Selecione a tag criada
   - Adicione notas de release descrevendo as mudanças
   - Publique a release

### Usar a Action em Outros Repositórios

Para incluir a action em um workflow em outro repositório, você pode usar a
sintaxe `uses` com o símbolo `@` para referenciar um branch específico, tag ou
hash de commit:

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Run my Action
    id: run-action
    uses: vitorgouveia/danger@v1  # Tag de versão
    # ou
    uses: vitorgouveia/danger@main  # Branch específica
    # ou
    uses: vitorgouveia/danger@abc123  # Hash de commit
```

## 🧪 Scripts Disponíveis

- `npm run bundle` - Formata e empacota o código
- `npm run format:write` - Formata o código com Prettier
- `npm run format:check` - Verifica formatação sem modificar arquivos
- `npm run lint` - Executa o ESLint
- `npm run test` - Executa os testes
- `npm run coverage` - Gera badge de cobertura
- `npm run package` - Compila o código com ncc
- `npm run all` - Executa formatação, lint, testes, cobertura e empacotamento

## 📋 Checklist Antes de Publicar

- [ ] Código formatado (`npm run format:write`)
- [ ] Sem erros de lint (`npm run lint`)
- [ ] Todos os testes passando (`npm test`)
- [ ] Código compilado (`npm run package`)
- [ ] Documentação atualizada
- [ ] Versão atualizada (se necessário)
- [ ] Tag de versão criada
- [ ] Release criada no GitHub

## 🐛 Reportar Problemas

Se encontrar problemas ou tiver sugestões, por favor:

1. Verifique se o problema já foi reportado nas
   [Issues](https://github.com/vitorgouveia/danger/issues)
2. Se não, crie uma nova issue descrevendo o problema
3. Inclua informações sobre:
   - Versão da action usada
   - Versão do Node.js
   - Logs de erro (se houver)
   - Passos para reproduzir

## 💡 Dicas

- Sempre execute `npm run all` antes de fazer commit
- Mantenha os testes atualizados ao adicionar novas funcionalidades
- Documente mudanças significativas no README ou CHANGELOG
- Siga as convenções de commit do projeto

## 📚 Recursos Adicionais

- [GitHub Actions Toolkit Documentation](https://github.com/actions/toolkit/blob/master/README.md)
- [Creating JavaScript Actions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
- [Action Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
