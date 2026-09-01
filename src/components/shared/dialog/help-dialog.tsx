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
    text: "持ち物や定期的な作業を登録すると、一日限りのチェックリストとして利用できます。",
  },
  {
    text: "アイテムが期限切れとして溜まらないため、好みのタイミングで使えます。",
  },
  {
    text: "ログイン無しで利用できます。",
  },
];

const TERMS_LAST_MODIFIED = "2026-09-01";

const TERMS: ListItem[] = [
  {
    text: "本サービスは、予告なく機能の変更、停止、または終了する場合があります。",
  },
  {
    text: "本サービスの利用によって生じた損害について、運営者は、故意または重大な過失による場合を除き、一切の責任を負いません。",
  },
  {
    text: "本サービスに事実上または法律上の瑕疵 (バグ、エラー、不具合等) がないことを保証するものではありません。",
  },
];

const STORED_DATA: ListItemWithTitle[] = [
  {
    title: "保存先",
    items: [
      {
        text: "登録内容は、お使いのブラウザに保存されます。",
      },
      {
        text: "登録内容を外部サービスへ送信・保存することはありません。",
      },
    ],
  },
  {
    title: "注意事項",
    items: [
      {
        text: "個人情報や機密情報など、重要な情報は登録しないでください。",
      },
      {
        text: "ブラウザの「Cookie と他のサイトデータ」を削除すると、登録内容が削除されます。",
        children: [
          "必要に応じて「メニュー > エクスポート」から事前にバックアップを取ってください。",
        ],
      },
    ],
  },
];

const OTHER_SPECIFICATIONS: ListItemWithTitle[] = [
  {
    title: "未完了に戻るタイミング",
    items: [
      {
        text: "日付が変わってからアプリを開き直した際に未完了に戻ります。",
      },
      {
        text: "アプリを開いたまま日付が変わった場合は、未完了に戻りません。",
        children: [
          "その場合はアプリを開き直すか、「メニュー > すべて未完了に戻す」をご利用ください。",
        ],
      },
    ],
  },
  {
    title: "アプリの再読み込み",
    items: [
      {
        text: "「メニュー > 再読み込みする」から再読み込みできます。",
        children: [
          "最新バージョンへの更新や、挙動が不安定なときにお試しください。",
        ],
      },
    ],
  },
];

const ISSUES: ListItem[] = [
  {
    text: "iPhone の Safari では、キーボード表示により末尾のアイテムが見づらくなる場合があります。キーボードを閉じてご確認ください。",
  },
];

const CHANGELOG = [
  ...(FEATURES.todoTogglePosition
    ? [
        {
          version: "v0.4.1",
          date: "2026-09-02",
          changes: [
            {
              text: "チェックボタンの位置を左右から選べるようにしました。",
            },
          ],
        },
      ]
    : []),
  {
    version: "v0.3.2",
    date: "2026-08-31",
    changes: [
      {
        text: "スマートフォンではチェックボタンを大きくし、タップしやすくしました。",
      },
      {
        text: "保存済みの内容に不整合があった場合、可能な限り情報を復元するようにしました。",
      },
    ],
  },
  {
    version: "v0.3.1",
    date: "2026-08-30",
    changes: [
      {
        text: "スマートフォンでの表示時、上部・下部のナビゲーションにコンテンツが重ならないようにしました。",
      },
      {
        text: "アイテムのカテゴリを変更した際、移動先カテゴリのアイテムの中間に挿入されることがある不具合を修正しました。",
      },
      {
        text: "インポート機能で、テキストが長い場合に実行ボタンが画面の外にはみ出し、操作できなくなる問題を修正しました。",
      },
    ],
  },
  {
    version: "v0.3.0",
    date: "2026-08-29",
    changes: [
      {
        text: "日付が変わった後、別のページやアプリに切り替えて再び戻ってきたときも、すべて未完了に戻すようにしました。",
      },
    ],
  },
  {
    version: "v0.2.2",
    date: "2026-08-28",
    changes: [
      {
        text: "軽微な修正を行いました。",
      },
    ],
  },
  {
    version: "v0.2.1",
    date: "2026-08-28",
    changes: [
      {
        text: "軽微な修正を行いました。",
      },
    ],
  },
  {
    version: "v0.2.0",
    date: "2026-08-28",
    changes: [
      {
        text: "手動でも、すべて未完了に戻せるようにしました。",
      },
      {
        text: "アイテムの表示範囲を広げました。",
      },
      {
        text: "iOS Safari で起きる表示崩れを軽減しました。",
      },
    ],
  },
  {
    version: "v0.1.0",
    date: "2026-08-27",
    changes: [{ text: "アプリを公開しました。" }],
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
        <p className="text-muted-foreground space-y-6 text-sm">
          最終更新日: <span className="font-mono">{TERMS_LAST_MODIFIED}</span>
        </p>
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

      <HelpAccordionItem value="other-specifications" title="その他の仕様">
        <div className="flex flex-col gap-4">
          {OTHER_SPECIFICATIONS.map((section) => (
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

        <div className="md:hidden">
          <p>
            <span className="font-ubuntu-sans font-medium">Kore Motta?</span>{" "}
            は、日常の「これ持った？」を確認する Todo アプリです。
          </p>
          <p>日付をまたぐと、すべてのアイテムが自動で未完了に戻ります。</p>
        </div>

        {/* PC */}
        <p className="hidden md:block">
          <span className="font-ubuntu-sans font-medium">Kore Motta?</span>{" "}
          は、日常の「これ持った？」を確認する Todo アプリです。
          <br />
          日付をまたぐと、すべてのアイテムが自動で未完了に戻ります。
        </p>
      </section>

      <section>
        <h3>特徴</h3>
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
        アプリが気に入ったら、応援いただけると励みになります！
      </p>

      <ul className="mt-0">
        <li>
          <a
            href="https://github.com/kem198/kore-motta"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            GitHub{" "}
            <SquareArrowOutUpRightIcon className="inline size-3 align-middle" />
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
          <DialogTitle>アプリの概要・利用規約</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            "flex flex-col gap-4 py-2",
            "-mx-4 max-h-[65dvh] overflow-y-auto px-4",
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
