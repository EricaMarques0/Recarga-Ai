# Rotas

O TanStack Start usa rotas por arquivo. Cada `.tsx` desta pasta é uma página. Não crie `src/pages/` nem `app/layout.tsx`: o layout de todas as telas é `src/routes/__root.tsx`, que precisa continuar renderizando `<Outlet />`.

## Páginas do RecargaAí

| Arquivo | Caminho |
| --- | --- |
| `index.tsx` | `/` |
| `cartoes.tsx` | `/cartoes` |
| `valor.tsx` | `/valor` |
| `pagamento.tsx` | `/pagamento` |
| `confirmacao.tsx` | `/confirmacao` |
| `historico.tsx` | `/historico` |
| `ajuda.tsx` | `/ajuda` |
| `__root.tsx` | envolve todas as páginas |

`routeTree.gen.ts` é gerado pelo roteador. Não edite esse arquivo à mão.

## Convenção, se uma rota nova for criada

| Arquivo | Caminho |
| --- | --- |
| `index.tsx` | `/` |
| `sobre.tsx` | `/sobre` |
| `usuarios/index.tsx` | `/usuarios` |
| `usuarios/$id.tsx` | `/usuarios/:id` |
| `_layout.tsx` | layout que renderiza os filhos com `<Outlet />` |
