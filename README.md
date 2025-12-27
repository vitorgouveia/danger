# dev-kit/danger

GitHub Action baseada em [Danger.js](https://danger.systems/js/) que automatiza
a revisão de Pull Requests através de regras customizáveis. Esta action analisa
PRs e comenta automaticamente quando encontra problemas (dependências
desatualizadas, variáveis de ambientes adicionadas/removidas), podendo bloquear
o merge conforme as regras configuradas.

## 🚀 Características

- ✅ **Regras Customizáveis**: Configure quais regras aplicar e seus níveis de
  severidade
- ✅ **Múltiplos Níveis de Alerta**: Mensagens informativas, avisos ou falhas
  que bloqueiam o merge
- ✅ **Cache Inteligente**: Instalação otimizada do Danger.js com cache para
  execuções mais rápidas
- ✅ **Fácil Integração**: Basta adicionar um step no seu workflow do GitHub
  Actions

## 📋 Regras Disponíveis

A action inclui as seguintes regras que podem ser habilitadas ou desabilitadas:

| Regra                | Descrição                                                                 | Nível Padrão |
| -------------------- | ------------------------------------------------------------------------- | ------------ |
| `verify-description` | Verifica se o PR tem uma descrição                                        | 1 (message)  |
| `verify-tests`       | Verifica se testes foram criados/atualizados quando há mudanças no código | 1 (message)  |
| `verify-docs`        | Verifica se o CHANGELOG.md foi atualizado quando a versão muda            | 1 (message)  |
| `roadmap`            | Gera roteiro de implantação quando a versão é atualizada                  | 1 (message)  |
| `important-files`    | Alerta quando arquivos importantes são modificados                        | 2 (warn)     |
| `verify-deps`        | Lista novas e atualizadas dependências                                    | 2 (warn)     |
| `outdated-deps`      | Verifica dependências desatualizadas                                      | 2 (warn)     |

### Níveis de Severidade

Cada regra pode ser configurada com um dos seguintes níveis de severidade:

#### **Nível 0 - Desabilitado**

A regra não será executada. Use este nível quando quiser desabilitar
completamente uma verificação específica.

**Quando usar**: Quando uma regra não é relevante para o seu projeto ou você
quer temporariamente desabilitá-la.

**Exemplo**:

```json
{
  "rules": {
    "outdated-deps": 0 // Não verifica dependências desatualizadas
  }
}
```

#### **Nível 1 - Message (Informativo)**

A regra será executada e adicionará um comentário informativo no PR. Este
comentário **não bloqueia o merge** e serve apenas para informar sobre algo.

**Quando usar**: Para regras que você quer que sejam visíveis mas não críticas,
como notificações sobre mudanças de versão ou listagem de dependências
atualizadas.

**Exemplo**:

```json
{
  "rules": {
    "roadmap": 1, // Gera roteiro de implantação (informativo)
    "verify-deps": 1 // Lista dependências atualizadas (informativo)
  }
}
```

#### **Nível 2 - Warn (Aviso)**

A regra será executada e adicionará um aviso no PR. O aviso aparece de forma
destacada, mas **ainda não bloqueia o merge**. Use para alertar sobre possíveis
problemas que devem ser revisados.

**Quando usar**: Para regras que indicam algo que deve ser verificado, mas não é
crítico o suficiente para bloquear o merge. Útil para alertar sobre mudanças em
arquivos importantes ou dependências que precisam de atenção.

**Exemplo**:

```json
{
  "rules": {
    "important-files": 2, // Alerta sobre mudanças em arquivos importantes
    "verify-deps": 2 // Avisa sobre mudanças em dependências
  }
}
```

#### **Nível 3 - Fail (Falha)**

A regra será executada e, se encontrar problemas, **bloqueará o merge do PR**. O
PR não poderá ser mesclado até que o problema seja resolvido. Use para regras
críticas que são obrigatórias.

**Quando usar**: Para regras que são essenciais para manter a qualidade do
código, como verificar se o PR tem descrição ou se testes foram criados para
mudanças no código.

**Exemplo**:

```json
{
  "rules": {
    "verify-description": 3, // Obriga PR a ter descrição (bloqueia merge)
    "verify-tests": 3 // Obriga testes para mudanças no código (bloqueia merge)
  }
}
```

**Resumo Visual**:

| Nível | Tipo         | Bloqueia Merge? | Uso Recomendado                    |
| ----- | ------------ | --------------- | ---------------------------------- |
| 0     | Desabilitado | Não             | Regras não relevantes              |
| 1     | Message      | Não             | Informações úteis mas não críticas |
| 2     | Warn         | Não             | Alertas que devem ser revisados    |
| 3     | Fail         | **Sim**         | Regras obrigatórias e críticas     |

## 🎯 Uso Básico

### 1. Criar arquivo de configuração `.dangerrc`

Crie um arquivo `.dangerrc` na raiz do seu repositório:

```json
{
  "rules": {
    "verify-description": 3,
    "verify-tests": 2,
    "verify-docs": 1,
    "roadmap": 1,
    "important-files": 2,
    "verify-deps": 1,
    "outdated-deps": 0
  }
}
```

### 2. Adicionar ao workflow do GitHub Actions

Crie ou edite o arquivo `.github/workflows/danger.yml`:

```yaml
name: Danger Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  danger:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      issues: write

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '22'

      - name: Run Danger
        uses: vitorgouveia/danger@v1
```

## 📖 Exemplos de Uso

### Exemplo 1: Configuração Mínima

Apenas verificar descrição do PR:

```json
{
  "rules": {
    "verify-description": 3
  }
}
```

### Exemplo 2: Configuração Completa

Habilitar todas as regras com níveis customizados:

```json
{
  "rules": {
    "verify-description": 3,
    "verify-tests": 3,
    "verify-docs": 2,
    "roadmap": 1,
    "important-files": 2,
    "verify-deps": 1,
    "outdated-deps": 1
  },
  "important-files": ["docker-compose.yml", ".env.example"]
}
```

## ⚙️ Configuração Avançada

### Arquivos Importantes Customizados

Você pode especificar arquivos adicionais para a regra `important-files`:

```json
{
  "rules": {
    "important-files": 2
  },
  "important-files": ["docker-compose.yml", ".env.example", "nginx.conf"]
}
```

### Desabilitar Regras Específicas

Para desabilitar uma regra, defina seu nível como `0`:

```json
{
  "rules": {
    "verify-description": 3,
    "verify-tests": 0,
    "outdated-deps": 0
  }
}
```

## 🔍 Como Funciona

1. A action instala o Danger.js (com cache para otimização)
2. Cria um `dangerfile.js` dinâmico baseado nas regras configuradas
3. Executa o Danger.js que analisa o PR
4. Comenta no PR com os resultados das verificações
5. Bloqueia o merge se houver regras com nível 3 (fail)

## 📝 Requisitos

- Node.js 20 ou superior
- Arquivo `.dangerrc` na raiz do repositório
- Permissões adequadas no GitHub Actions:
  - `contents: read`
  - `pull-requests: write`
  - `issues: write` (opcional, para criar issues)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia o
[CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes sobre como contribuir e
publicar atualizações.

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo
[LICENSE](./LICENSE) para detalhes.

## 🔗 Links Úteis

- [Danger.js Documentation](https://danger.systems/js/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Repository](https://github.com/vitorgouveia/danger)
