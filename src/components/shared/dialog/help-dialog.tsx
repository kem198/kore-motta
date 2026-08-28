"use client";

import { UnorderedList } from "@/components/shared/unordered-list";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FEATURES } from "@/constants/features";
import {
  ACCORDION_ITEM_CLASS_NAME,
  ACCORDION_TRIGGER_CLASS_NAME,
  TYPESET_CLASS_NAME,
} from "@/constants/help";
import { cn } from "@/lib/utils";
import { ListItem, ListItemWithTitle } from "@/types/help";
import { SquareArrowOutUpRightIcon } from "lucide-react";

const OVERVIEW: ListItem[] = [
  {
    text: "日付が変わると、すべてのアイテムが未完了に戻ります。",
  },
  {
    text: "持ち物や定期的な作業を登録しておくと、一日限りのチェックリストとして利用できます。",
  },
  {
    text: "アイテムが期限切れとして溜まらないため、好みのタイミングで使えます。",
  },
];

const TERMS: ListItem[] = [
  {
    text: "本サービスは、予告なく内容の変更、停止、または終了する場合があります。",
  },
  {
    text: "本サービスの利用によって生じた損害について、運営者は責任を負いません。",
  },
];

const STORED_DATA: ListItemWithTitle[] = [
  {
    title: "保存先",
    items: [
      {
        text: "登録した内容は、お使いのブラウザに保存されます。",
      },
      {
        text: "登録した内容を外部サービスへ送信・保存することはありません。",
      },
    ],
  },
  {
    title: "注意事項",
    items: [
      {
        text: "個人情報や機密情報など重要な情報は登録しないでください。",
      },
      {
        text: "ブラウザの「Cookie と他のサイトデータ」を削除すると、登録した内容が削除されます。必要に応じて事前にバックアップを取ってください。",
      },
    ],
  },
];

const ISSUES: ListItem[] = [
  {
    text: "iPhone の Safari では、キーボードの表示により末尾のアイテムが見づらくなる場合があります。お手数ですがキーボードを閉じてご確認ください。",
  },
  {
    text: "ページを開いたまま日付をまたいだ場合、未完了に戻りません。メニューから「更新する」をお試しください。",
  },
];

const CHANGELOG = [
  {
    version: "v0.2.2",
    date: "2026-08-28",
    changes: [
      {
        text: "使い方・利用規約を更新しました。",
      },
    ],
  },
  {
    version: "v0.2.0",
    date: "2026-08-28",
    changes: [
      {
        text: "すべて未完了に戻す操作を、手動でも行えるようにしました。",
      },
      {
        text: "UI を調整し、アイテムの表示範囲を広げました。",
      },
      {
        text: "UI を調整し、iOS Safari で起きる表示崩れを軽減しました。",
      },
    ],
  },
  {
    version: "v0.1.0",
    date: "2026-08-27",
    changes: [{ text: "初回リリース" }],
  },
];

type HelpAccordionProps = {
  children: React.ReactNode;
  className?: string;
};

function HelpAccordion({ children, className }: HelpAccordionProps) {
  return (
    <Accordion className={cn("max-w-lg rounded-lg border", className)}>
      {children}
    </Accordion>
  );
}

type HelpAccordionItemProps = {
  value: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

function HelpAccordionItem({
  value,
  title,
  children,
  className,
  triggerClassName,
  contentClassName,
}: HelpAccordionItemProps) {
  return (
    <AccordionItem
      value={value}
      className={cn(ACCORDION_ITEM_CLASS_NAME, className)}
    >
      <AccordionTrigger
        className={cn(ACCORDION_TRIGGER_CLASS_NAME, triggerClassName)}
      >
        {title}
      </AccordionTrigger>

      <AccordionContent className={contentClassName}>
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

type InformationSectionProps = ListItemWithTitle & {
  className?: string;
};

function InformationSection({
  title,
  items,
  className,
}: InformationSectionProps) {
  return (
    <section className={cn("space-y-2", className)}>
      <h4 className="font-medium">{title}</h4>
      <UnorderedList items={items} />
    </section>
  );
}

type HelpAccordionsProps = {
  className?: string;
};

function HelpAccordions({ className }: HelpAccordionsProps) {
  return (
    <HelpAccordion className={className}>
      <HelpAccordionItem value="terms" title="利用規約">
        <UnorderedList items={TERMS} />
      </HelpAccordionItem>

      <HelpAccordionItem value="data" title="情報の取り扱いについて">
        <div className="flex flex-col gap-4">
          {STORED_DATA.map((section) => (
            <InformationSection
              key={section.title}
              title={section.title}
              items={section.items}
            />
          ))}
        </div>
      </HelpAccordionItem>

      <HelpAccordionItem value="issues" title="既知の問題">
        <UnorderedList items={ISSUES} />
      </HelpAccordionItem>

      <HelpAccordionItem value="changelog" title="更新履歴">
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

              <UnorderedList items={release.changes} />
            </div>
          ))}
        </div>
      </HelpAccordionItem>
    </HelpAccordion>
  );
}

type SummaryProps = {
  className?: string;
};

function Summary({ className }: SummaryProps) {
  return (
    <div
      className={cn(TYPESET_CLASS_NAME, className)}
      style={{ "--typeset-size": "0.9rem" } as React.CSSProperties}
    >
      <section>
        <h3>このアプリは何？</h3>

        <p>
          <span className="font-ubuntu-sans font-medium">Kore Motta?</span>{" "}
          は、日頃の「これ持った？」を確認するシンプルな Todo アプリです。
        </p>

        <p>一日ごとにすべてのアイテムが未完了に戻ることが特徴です。</p>
      </section>

      <section>
        <h3>概要</h3>
        <UnorderedList items={OVERVIEW} />
      </section>
    </div>
  );
}

type SupportProps = {
  className?: string;
};

function Support({ className }: SupportProps) {
  return (
    <section
      className={cn(
        TYPESET_CLASS_NAME,
        "text-muted-foreground space-y-6 text-xs",
        className,
      )}
    >
      <p className="mb-0 leading-relaxed">
        ご不明な点は{" "}
        <a
          href="https://x.com/kem198_x"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          @KeM198
        </a>{" "}
        までご連絡ください。
        <br />
        アプリが気に入ったら、応援していただけると励みになります！
      </p>

      <ul className="mt-0">
        <li>
          <a
            href="https://github.com/kem198/kore-motta"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            GitHub でスターをつける{" "}
            <SquareArrowOutUpRightIcon className="inline size-3.5 align-middle" />
          </a>
        </li>

        {FEATURES.tip && (
          <li>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              おやつをおごる{" "}
              <SquareArrowOutUpRightIcon className="inline size-3.5 align-middle" />
            </a>
          </li>
        )}
      </ul>
    </section>
  );
}

type HelpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  bodyClassName?: string;
};

export function HelpDialog({
  open,
  onOpenChange,
  className,
  bodyClassName,
}: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        initialFocus={false}
        className={cn("flex w-[90vw] max-w-xl! flex-col", className)}
      >
        <DialogHeader>
          <DialogTitle>使い方・利用規約</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            "flex flex-col gap-4 py-2",
            "-mx-4 max-h-[60dvh] overflow-y-auto px-4",
            bodyClassName,
          )}
        >
          <Summary className="mb-4" />
          <HelpAccordions />
          <Support />
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline">
                閉じる
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
