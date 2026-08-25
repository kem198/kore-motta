import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ISSUES = [
  "スマートフォンで入力を開始すると、キーボードの表示によりページがスクロールされ、追加したアイテムが見づらくなることがあります。その場合は、ページをスクロールして確認してください。",
];

export function Issues() {
  return (
    <Accordion className="max-w-lg rounded-lg border">
      <AccordionItem value="issues" className="border-b px-4 last:border-b-0">
        <AccordionTrigger>既知の問題</AccordionTrigger>

        <AccordionContent
          className="typeset typeset-docs space-y-6"
          style={{ "--typeset-size": "0.9rem" } as React.CSSProperties}
        >
          <ul>
            {ISSUES.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
