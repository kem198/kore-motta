"use client";

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
import { cn } from "@/lib/utils";
import { SquareArrowOutUpRightIcon } from "lucide-react";

type ListItem = {
  text: string;
  children?: string[];
};

type InformationSectionItem = {
  title: string;
  items: ListItem[];
};

const TIPS: ListItem[] = [
  {
    text: "ホーム画面やデスクトップに置いて、アプリとして起動できます。",
    children: [
      "[PC Edge / Chrome]: URL 欄 > インストールボタン",
      "[iPhone Safari]: 共有メニュー > ホーム画面に追加",
      "[Android Chrome]: メニュー > ホーム画面に追加",
    ],
  },
  {
    text: "カテゴリは名前順に並びます。「01_毎朝」「02_旅行前」などとすると、並び順を調整できます。",
  },
  {
    text: "メニューから、手動ですべてのアイテムを未完了に戻せます。日付をまたいでから利用する時などにお使いください。",
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

const TERMS: ListItem[] = [
  {
    text: "本サービスは、予告なく内容の変更、停止、または終了する場合があります。",
  },
  {
    text: "本サービスの利用によって生じた損害について、運営者は責任を負いません。",
  },
];

const INFORMATION: InformationSectionItem[] = [
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
    title: "バックアップ",
    items: [
      {
        text: "登録した内容は、エクスポートしてバックアップできます。",
      },
      {
        text: "バックアップした内容は、インポートして復元できます。",
      },
      {
        text: "ブラウザ間のデータ移行などにも利用できます。",
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
      {
        text: "ブラウザの開発者ツールなどで保存データを直接変更した場合、データの内容によっては初期化されることがあります。",
      },
    ],
  },
];

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

const CHANGELOG = [
  {
    version: "v0.2.1",
    date: "2026-08-28",
    changes: [
      {
        text: "アイテムのどこをクリックしても、完了状態を切り替えられるようにしました。",
      },
      {
        text: "アイテムの編集は編集ボタンからのみ行えるようにしました。",
      },
    ],
  },
  {
    version: "v0.2.0",
    date: "2026-08-28",
    changes: [
      {
        text: "すべて未完了に戻す操作を、手動でもできるようにしました。",
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

const TYPESET_CLASS_NAME = "typeset typeset-docs";
const ACCORDION_ITEM_CLASS_NAME = "border-b px-4 last:border-b-0";
const ACCORDION_TRIGGER_CLASS_NAME = "py-3";

type UnorderedListProps = {
  items: ListItem[];
  className?: string;
  codeStyle?: boolean;
};

function UnorderedList({
  items,
  className,
  codeStyle: code = false,
}: UnorderedListProps) {
  return (
    <ul className={cn("flex list-disc flex-col gap-1 pl-5", className)}>
      {items.map((item) => (
        <li key={item.text} className="leading-relaxed">
          {item.text}
          {item.children && (
            <div
              className={cn(
                "mt-1 flex flex-col gap-1 pl-5",
                code && "bg-muted/50 rounded-md border p-2 text-xs",
              )}
            >
              {item.children.map((child) => (
                <div key={child}>{child}</div>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

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

type InformationSectionProps = InformationSectionItem & {
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
      <HelpAccordionItem value="tips" title="便利な使い方">
        <UnorderedList items={TIPS} codeStyle />
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

type InformationAccordionsProps = {
  className?: string;
};

function InformationAccordions({ className }: InformationAccordionsProps) {
  return (
    <HelpAccordion className={className}>
      <HelpAccordionItem value="terms" title="利用規約">
        <UnorderedList items={TERMS} />
      </HelpAccordionItem>

      <HelpAccordionItem value="data" title="情報の取り扱いについて">
        <div className="flex flex-col gap-4">
          {INFORMATION.map((section) => (
            <InformationSection
              key={section.title}
              title={section.title}
              items={section.items}
            />
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
  contentClassName?: string;
  bodyClassName?: string;
};

export function HelpDialog({
  open,
  onOpenChange,
  className,
  contentClassName,
  bodyClassName,
}: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        initialFocus={false}
        className={cn(
          "flex w-[90vw] max-w-xl! flex-col",
          className,
          contentClassName,
        )}
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
          <InformationAccordions />
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
