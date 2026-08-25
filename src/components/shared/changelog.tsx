import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CHANGELOG = [
  {
    version: "v0.1.0",
    date: "2026-08-23",
    changes: ["初回リリース"],
  },
];

export function Changelog() {
  return (
    <Accordion className="max-w-lg rounded-lg border">
      <AccordionItem
        value="changelog"
        className="border-b px-4 last:border-b-0"
      >
        <AccordionTrigger>更新履歴</AccordionTrigger>

        <AccordionContent
          className="typeset typeset-docs space-y-6"
          style={{ "--typeset-size": "0.9rem" } as React.CSSProperties}
        >
          <div className="flex flex-col gap-4">
            {CHANGELOG.map((release) => (
              <div key={release.version}>
                <div className="font-mono">
                  {release.version}
                  <span className="text-muted-foreground">
                    {" | "}
                    {release.date}
                  </span>
                </div>

                <ul className="mt-0">
                  {release.changes.map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
