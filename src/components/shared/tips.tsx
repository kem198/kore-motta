import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TIPS = ["a"];

export function Tips() {
  return (
    <Accordion className="max-w-lg rounded-lg border">
      <AccordionItem value="issues" className="border-b px-4 last:border-b-0">
        <AccordionTrigger>便利な使い方</AccordionTrigger>

        <AccordionContent
          className="typeset typeset-docs space-y-6"
          style={{ "--typeset-size": "0.9rem" } as React.CSSProperties}
        >
          <ul>
            {TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
