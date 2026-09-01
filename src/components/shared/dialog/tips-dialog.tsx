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
        text: "ホーム画面やデスクトップに追加して、アプリとして起動できます。",
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
        text: "先頭に「01_」「02_」などをつけると並び順を調整できます。",
      },
    ],
  },
  {
    title: "バックアップする",
    items: [
      {
        text: "メニューから登録内容をエクスポートできます。",
      },
      {
        text: "エクスポートした内容をインポートして復元できます。",
      },
      {
        text: "バックアップやブラウザ間のデータ移行に利用できます。",
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

        <Accordion className="max-h-[65dvh] overflow-y-auto rounded-lg border">
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
