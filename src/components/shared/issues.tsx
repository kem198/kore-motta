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
    <Accordion>
      <AccordionItem value="known-issues">
        <AccordionTrigger>既知の問題</AccordionTrigger>

        <AccordionContent>
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
