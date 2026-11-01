# RecargaAí

Aplicativo para recarregar cartões de transporte público da Grande São Paulo em um só lugar. A pessoa escolhe o cartão, define o valor e paga via Pix, sem sair do fluxo.

## O que dá para fazer

- Buscar um cartão por nome, cidade ou operadora, com sugestões enquanto digita.
- Escolher entre cartões municipais e metropolitanos.
- Guardar apelido e número do cartão neste navegador.
- Definir um valor sugerido ou digitar outro valor, dentro do limite daquele cartão.
- Ver uma estimativa de viagens e o resumo com taxa de conveniência zerada.
- Acompanhar o Pix com prazo, confirmação, expiração e novo código.
- Repetir a última recarga confirmada.
- Consultar o histórico deste aparelho, o comprovante e as perguntas frequentes.

## Fluxo

1. Na página inicial, a busca sugere cartões e também envia o termo para a lista. Se já existe uma recarga confirmada, dá para repeti-la. Um Pix ainda no prazo aparece para continuar.
2. A pessoa seleciona o tipo do cartão.
3. Informa apelido e número. O cartão fica salvo neste navegador.
4. Escolhe o valor, dentro do mínimo e do máximo daquele cartão, e revisa o total.
5. A tela de Pix mostra o QR Code e o código copia-e-cola, com prazo de 5 minutos.
6. **Já realizei o pagamento** registra a confirmação. Se o prazo acaba, **Gerar novo código Pix** abre outro código. Trocar o valor substitui o código anterior: só um Pix fica em aberto por cartão.
7. A confirmação mostra a linha do tempo até a validação no cartão. O comprovante pode ser copiado ou impresso e entra no histórico deste aparelho.

O histórico começa vazio. Ele só lista as recargas feitas neste navegador. Dá para remover uma recarga ou limpar a lista; os cartões salvos permanecem.

## Páginas

| Caminho | Arquivo | Função |
| --- | --- | --- |
| `/` | `src/routes/index.tsx` | Entrada, busca, cartões salvos e repetir recarga |
| `/cartoes` | `src/routes/cartoes.tsx` | Busca, filtro e seleção do tipo de cartão |
| `/cartao` | `src/routes/cartao.tsx` | Apelido e número do cartão |
| `/valor` | `src/routes/valor.tsx` | Valor da recarga e resumo |
| `/pagamento` | `src/routes/pagamento.tsx` | Pix, com prazo |
| `/confirmacao` | `src/routes/confirmacao.tsx` | Linha do tempo e comprovante |
| `/historico` | `src/routes/historico.tsx` | Recargas deste aparelho |
| `/ajuda` | `src/routes/ajuda.tsx` | Perguntas frequentes |

A busca usa o parâmetro `q`. O tipo do cartão segue em `card`, o cartão salvo em `saved` e o valor em `amount`. O Pix e a confirmação usam o identificador `id`. Se o tipo não existir, o fluxo volta para a lista.

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

- Sugestões: R$ 20, R$ 30, R$ 50 e R$ 100, quando couberem no cartão.
- Cada cartão tem mínimo e máximo próprios. Fora de um cartão específico, a faixa geral continua de R$ 5 a R$ 500.
- A taxa de conveniência exibida para o usuário é sempre R$ 0.
- Uma tarifa de referência estima quantas viagens o valor cobre. Não é a tarifa vigente da operadora.

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
    catalog.ts        cartões, limites, validação e formatação em real
    wallet.ts         cartões salvos e recargas deste navegador
  routes/             uma rota por arquivo
  test/               testes de valor e de roteamento
public/               favicon e robots.txt
```

`src/routeTree.gen.ts` é gerado automaticamente pelo roteador. Não edite esse arquivo à mão.

## Testes

`src/test/amount.test.ts` cobre valor, apelido, número do cartão e a estimativa de viagens.

`src/test/wallet.test.ts` cobre cartão salvo, confirmação do Pix, expiração e reaproveitamento de um código em aberto.

`src/test/app-routing.test.tsx` verifica se a página inicial e a identificação do cartão correspondem a rotas, em vez de caírem na página de não encontrado.

## Limitações

- Não há conta nem login. Apelido, número e histórico ficam neste navegador.
- O código Pix vale 5 minutos. Depois disso a recarga fica expirada.
- Cada tipo de cartão tem o próprio tamanho de número e os próprios limites de valor.
- Uma tarifa de referência estima as viagens. Ela não substitui a tarifa da operadora.
