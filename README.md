# RecargaAí

Protótipo de interface para recarregar cartões de transporte público da Grande São Paulo em um só lugar. A pessoa escolhe o cartão, define o valor e segue para um pagamento via Pix — tudo nesta demonstração, sem sair do fluxo.

O RecargaAí não é um aplicativo de operadora e não processa pagamento de verdade. Cartões, histórico, QR Code e código Pix são ilustrativos. Nenhuma integração está homologada e nenhuma cobrança é gerada.

## O que dá para fazer

- Buscar um cartão por nome, cidade ou operadora.
- Escolher entre cartões municipais e metropolitanos.
- Definir um valor sugerido ou digitar outro valor.
- Ver o resumo com taxa de conveniência zerada para o usuário.
- Simular a espera, a confirmação e o comprovante de um Pix.
- Consultar um histórico fictício e as perguntas frequentes.

## Fluxo

1. Na página inicial, a busca envia o termo para a lista de cartões. Um cartão popular abre direto na escolha do valor.
2. A pessoa seleciona o cartão e continua.
3. Escolhe o valor e revisa o total.
4. A tela de Pix mostra um QR Code ilustrativo e um código copia-e-cola simulado.
5. O botão **Simular confirmação do pagamento** registra a operação nesta sessão e abre o resumo.
6. O comprovante é um documento de demonstração, sem validade.

O histórico da tela **Histórico** não inclui as simulações feitas na sessão. Ele usa uma lista fixa de exemplo.

## Páginas

| Caminho | Arquivo | Função |
| --- | --- | --- |
| `/` | `src/routes/index.tsx` | Entrada, busca e cartões populares |
| `/cartoes` | `src/routes/cartoes.tsx` | Busca, filtro e seleção do cartão |
| `/valor` | `src/routes/valor.tsx` | Valor da recarga e resumo |
| `/pagamento` | `src/routes/pagamento.tsx` | Pix simulado |
| `/confirmacao` | `src/routes/confirmacao.tsx` | Resumo e comprovante demonstrativo |
| `/historico` | `src/routes/historico.tsx` | Recargas de exemplo |
| `/ajuda` | `src/routes/ajuda.tsx` | Perguntas frequentes |

A busca usa o parâmetro `q`. O cartão escolhido segue em `card`, e o valor em `amount`. Se o cartão ou o valor não forem válidos, o fluxo volta para a lista ou para o início.

## Cartões de exemplo

| Cartão | Região | Categoria |
| --- | --- | --- |
| Bilhete Único | São Paulo | Municipal |
| Cartão TOP | Região Metropolitana | Metropolitano |
| Cartão BEM | Osasco | Municipal |
| Cartão Legal | São Bernardo do Campo | Municipal |
| Cartão Cidadão | ABC Paulista | Municipal |
| Cartão BOM | Região Metropolitana | Metropolitano |

Os cinco primeiros aparecem como cartões populares na página inicial. A lista completa está em `src/lib/catalog.ts`.

## Valor da recarga

- Sugestões: R$ 20, R$ 30, R$ 50 e R$ 100.
- Mínimo: R$ 5.
- Máximo: R$ 500.
- A taxa de conveniência exibida para o usuário é sempre R$ 0.

Valores vazios, inválidos ou fora da faixa mostram uma mensagem e não seguem para o pagamento.

## Identidade visual

A interface usa uma linguagem editorial, com títulos grandes, cantos arredondados e grafismos de trajeto: linha pontilhada, pontos de parada e um arco de rota no painel inicial.

| Papel | Cor |
| --- | --- |
| Verde principal | `#087F5B` |
| Verde profundo, usado nos títulos | `#123D32` |
| Creme | `#FFF8E8` |
| Fundo | `#F1F4F2` |
| Branco | `#FFFFFF` |
| Amarelo, só em detalhes | `#FFD66B` |

A fonte é [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans). Os tokens ficam em `src/styles.css`. O cabeçalho, a navegação, os passos do fluxo e os componentes compartilhados ficam em `src/components/recarga-ui.tsx`.

## Tecnologias

- [React 19](https://react.dev/)
- [TanStack Start](https://tanstack.com/start) e [TanStack Router](https://tanstack.com/router), com rotas por arquivo
- [Vite](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vitest](https://vitest.dev/) e Testing Library
- [Lucide](https://lucide.dev/) para ícones

O projeto também está ligado ao [Lovable](https://lovable.dev). Alterações enviadas à branch conectada voltam para o editor. Evite reescrever o histórico git já publicado.

## Como executar

É preciso ter [Node.js](https://nodejs.org/) com npm.

```sh
git clone <url-deste-repositorio>
cd <pasta-do-repositorio>
npm install
npm run dev
```

O Vite mostra o endereço local no terminal. Em geral é [http://localhost:8080/](http://localhost:8080/).

Para ver a versão de produção na máquina:

```sh
npm run build
npm run preview
```

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção |
| `npm run preview` | Serve a build localmente |
| `npm test` | Roda os testes uma vez |
| `npm run test:watch` | Roda os testes e observa mudanças |
| `npm run lint` | Analisa o código com ESLint |
| `npm run format` | Formata o projeto com Prettier |

## Estrutura

```text
src/
  components/
    recarga-ui.tsx    interface compartilhada do RecargaAí
    ui/               componentes de base
  lib/
    catalog.ts        cartões, valores, histórico e formatação em real
  routes/             uma rota por arquivo
  test/               testes de valor e de roteamento
public/               favicon e robots.txt
```

`src/routeTree.gen.ts` é gerado automaticamente pelo roteador. Não edite esse arquivo à mão.

## Testes

`src/test/amount.test.ts` cobre a validação de valor: vazio, abaixo do mínimo, acima do máximo e decimal com vírgula.

`src/test/app-routing.test.tsx` verifica se a página inicial corresponde a uma rota, em vez de cair na página de não encontrado.

## Limitações

- Não há conta, login nem persistência das recargas simuladas.
- O QR Code não é um código Pix válido.
- O código copia-e-cola começa com `DEMO-PIX` e não deve ser pago.
- O comprovante não tem validade fiscal nem operacional.
- A disponibilização de crédito no cartão físico não é simulada além do texto de orientação.
