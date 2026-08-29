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
import {
  ACCORDION_ITEM_CLASS_NAME,
  ACCORDION_TRIGGER_CLASS_NAME,
} from "@/constants/help";
import { ListItemWithTitle } from "@/types/help";

const TIPS: ListItemWithTitle[] = [
  {
    title: "アプリとして使う",
    items: [
      {
        text: "ホーム画面やデスクトップに置いて、アプリとして起動できます。",
        children: [
          "[PC Edge / Chrome]: URL 欄 > インストールボタン",
          "[iPhone Safari]: 共有メニュー > ホーム画面に追加",
          "[Android Chrome]: メニュー > ホーム画面に追加",
          "上記以外のブラウザでも同様です。",
        ],
      },
      {
        text: "アンインストールは通常のアプリと同様に行ってください。",
      },
    ],
  },
  {
    title: "カテゴリの並び順を調整する",
    items: [
      {
        text: "カテゴリは名前順に並びます。",
      },
      {
        text: "「01_お出かけ前」「02_旅行」などとすると、並び順を調整できます。",
      },
    ],
  },
  {
    title: "バックアップする",
    items: [
      {
        text: "メニューから、登録した内容をエクスポートできます。",
      },
      {
        text: "エクスポートした内容は、インポートして復元できます。",
      },
      {
        text: "バックアップやブラウザ間のデータ移行にご利用ください。",
      },
    ],
  },
  {
    title: "手動で未完了に戻す",
    items: [
      {
        text: "このアプリは、次のタイミングでアイテムが未完了に戻ります。",
        children: [
          "日付が変わった後、ページが更新されたとき",
          "日付が変わった後、別のページやアプリに切り替えて、再び戻ってきたとき",
        ],
      },
      {
        text: "ページを開いたまま日付をまたいだ場合は、未完了に戻りません。",
        children: [
          "その場合は、「メニュー > すべて未完了に戻す」をご利用ください。",
        ],
      },
    ],
  },
  {
    title: "手動で更新する",
    items: [
      {
        text: "アプリとして端末にインストールすると、ブラウザの更新ボタンが表示されないため、アプリ内から更新できるようにしています。",
        children: [
          "最新のバージョンに更新したい場合や、挙動が不安定な場合は、「メニュー > 更新する」をお試しください。",
        ],
      },
    ],
  },
];

type TipsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TipsDialog({ open, onOpenChange }: TipsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        initialFocus={false}
        className="flex w-[90vw] max-w-xl! flex-col"
      >
        <DialogHeader>
          <DialogTitle>便利な使い方</DialogTitle>
        </DialogHeader>

        <Accordion className="max-h-[60dvh] overflow-y-auto rounded-lg border">
          {TIPS.map((section) => (
            <AccordionItem
              key={section.title}
              value={section.title}
              className={ACCORDION_ITEM_CLASS_NAME}
            >
              <AccordionTrigger className={ACCORDION_TRIGGER_CLASS_NAME}>
                {section.title}
              </AccordionTrigger>

              <AccordionContent>
                <UnorderedList items={section.items} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

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
