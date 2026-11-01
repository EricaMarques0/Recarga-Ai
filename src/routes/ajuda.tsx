import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageTitle, primaryButtonClass } from "@/components/recarga-ui";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Ajuda — RecargaAí" },
      { name: "description", content: "Perguntas frequentes sobre recarga, Pix e validação do crédito." },
      { property: "og:title", content: "Ajuda — RecargaAí" },
      { property: "og:description", content: "Perguntas frequentes sobre recarga, Pix e validação do crédito." },
    ],
  }),
  component: HelpPage,
});

const FAQ = [
  {
    q: "Como funciona a recarga?",
    a: "Você escolhe o tipo do cartão, informa um apelido e o número, define o valor e segue para o Pix. O comprovante fica no histórico deste aparelho.",
  },
  {
    q: "Existe taxa de conveniência?",
    a: "Não. A taxa exibida para quem recarrega é sempre zero.",
  },
  {
    q: "Como pago via Pix?",
    a: "A tela mostra o QR Code e o Pix Copia e Cola, válidos por 5 minutos. Depois de pagar, toque em “Já realizei o pagamento”. Se o valor mudar, o código anterior é substituído e só o novo fica em aberto.",
  },
  {
    q: "O código expirou. O que eu faço?",
    a: "Gere um novo código na mesma tela, ou abra a recarga no histórico e toque em “Tentar de novo”. O código anterior não é reaproveitado.",
  },
  {
    q: "Quando o crédito entra no cartão?",
    a: "Depois da confirmação, a tela mostra o repasse à operadora e como validar: em geral, aproximando o cartão de um validador ou terminal. O prazo depende do sistema de cada operadora.",
  },
  {
    q: "Informei o número errado.",
    a: "Confira o apelido e os quatro últimos dígitos no resumo, antes de pagar. A recarga fica ligada ao número que você digitou. Para outro cartão, volte e troque os dados.",
  },
  {
    q: "Onde vejo o comprovante?",
    a: "No histórico, abra uma recarga confirmada. Dá para copiar o resumo ou imprimir. Também dá para remover uma recarga ou limpar a lista; os cartões salvos continuam.",
  },
  {
    q: "Onde ficam meus cartões?",
    a: "Apelido, número e histórico ficam salvos neste navegador, neste aparelho. Em Seus cartões, dá para remover um cadastro; as recargas já feitas continuam no histórico. Outro celular ou uma limpeza dos dados do site começa a lista do zero.",
  },
];

function HelpPage() {
  return (
    <div>
      <PageTitle title="Como podemos ajudar?" subtitle="Recarga, prazo do Pix e validação do crédito." />
      <div className="card-surface px-4">
        <Accordion type="single" collapsible>
          {FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={String(i)} className="last:border-b-0">
              <AccordionTrigger className="text-left font-semibold text-navy">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <Link to="/cartoes" search={{ q: undefined }} className={`${primaryButtonClass} mt-6`}>
        Fazer uma recarga
      </Link>
    </div>
  );
}
