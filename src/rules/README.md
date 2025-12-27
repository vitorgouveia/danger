# Sistema de Regras Modular

Este diretório contém o sistema modular de regras para o dangerfile. Cada regra
é um módulo independente que pode ser facilmente adicionado, removido ou
modificado.

## Estrutura

```
src/rules/
├── index.js              # Registry de todas as regras
├── verify-description.js # Exemplo de regra
├── verify-tests.js       # Exemplo de regra
└── ...                   # Outras regras
```

## Como Adicionar uma Nova Regra

### 1. Criar o arquivo da regra

Crie um novo arquivo em `src/rules/` com o nome da sua regra (ex:
`minha-nova-regra.js`):

```javascript
export default {
  name: 'verify-description',
  execute: async (msg, _, context) => {
    const { danger } = context

    msg('escreva sua mensagem aqui, o nível correto será aplicado')
  }
}
```

### 2. Registrar a regra

Adicione a regra em `src/rules/index.js`:

```javascript
import minhaNovaRegra from './minha-nova-regra.js'

const rules = [minhaNovaRegra]
```

## Contexto disponível

Os helpers são injetados automaticamente no dangerfile quando necessário:

- `danger` - Objeto do danger
- `modifiedFiles` - Lista de arquivos modificados
- `createdFiles` - Lista de arquivo criados
- `serviceName` - Nome do serviço
- `findModifiedFile` - Helper para pesquisar arquivo modificado
- `findModifiedTestFiles` - Helper para pesquisar arquivo de teste modificado
- `findCreatedTestFiles` - Helper para pesquisar arquivo de teste criado
- `findModifiedSourceFiles` - Helper para pesquisar arquivo modificado
- `findCreatedSourceFiles` - Helper para pesquisar arquivo criado
