import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageTitle } from "@/components/app-ui";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Ajuda — RecargaAí" },
      { name: "description", content: "Perguntas frequentes sobre recarga, Pix e validação de créditos." },
      { property: "og:title", content: "Ajuda — RecargaAí" },
      { property: "og:description", content: "Perguntas frequentes sobre recarga, Pix e validação de créditos." },
    ],
  }),
  component: HelpPage,
});

const FAQ = [
  { q: "Como funciona a recarga?", a: "Você escolhe o cartão, define o valor e paga via Pix. Tudo em uma única interface, sem precisar de vários aplicativos." },
  { q: "Existe taxa de conveniência?", a: "Não. A proposta do RecargaAí é não cobrar taxa de conveniência do usuário." },
  { q: "Como pago via Pix?", a: "Escaneie o QR Code no app do seu banco ou use o código Pix Copia e Cola. Neste protótipo, o pagamento é apenas simulado." },
  { q: "Quando recebo a confirmação?", a: "Após a identificação do pagamento, a tela de confirmação exibe o resumo e o identificador da operação." },
  { q: "Como valido os créditos no cartão?", a: "A disponibilização e a validação do crédito dependem do sistema de cada cartão. Siga as instruções da operadora, como aproximar o cartão de um validador ou terminal." },
  { q: "Este app já está integrado às operadoras?", a: "Não. Este é um protótipo com dados demonstrativos; nenhuma integração está homologada e nenhuma transação real é realizada." },
];

function HelpPage() {
  return (
    <div>
      <PageTitle title="Como podemos ajudar?" subtitle="Perguntas frequentes sobre recargas." />
      <div className="card-surface px-4">
        <Accordion type="single" collapsible>
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={String(i)} className="last:border-b-0">
              <AccordionTrigger className="text-left font-semibold text-navy">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
