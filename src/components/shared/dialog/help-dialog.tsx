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
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CircleHelpIcon } from "lucide-react";

const TIPS = [
  "ホーム画面やデスクトップに置いて、アプリとして起動できます。PC はブラウザの URL 欄に表示されているボタンから、スマートフォンはブラウザのメニューからインストールしてください。",
  "カテゴリは名前順に並びます。「01_毎日」「02_旅行」などとすると、並び順を調整できます。",
  "メニューからすべてのアイテムを未完了に戻せます。日付をまたいでから利用する時などにお使いください。",
];

const ISSUES = [
  "スマートフォンで入力を開始すると、キーボードの表示によりページがスクロールされ、追加したアイテムが見づらくなることがあります。その場合は、ページをスクロールして確認してください。",
  "ページを開いたまま日付をまたいだ場合、未完了に戻りません。メニューから「更新する」をお試しください。",
];

const CHANGELOG = [
  {
    version: "v0.1.0",
    date: "2026-08-27",
    changes: ["初回リリース"],
  },
];

function UnorderedList({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5">
      {items.map((item) => (
        <li key={item} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  );
}

function HelpAccordions() {
  return (
    <>
      <Accordion className="max-w-lg rounded-lg border">
        <AccordionItem value="tips" className="border-b px-4 last:border-b-0">
          <AccordionTrigger>便利な使い方</AccordionTrigger>

          <AccordionContent>
            <UnorderedList items={TIPS} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="issues" className="border-b px-4 last:border-b-0">
          <AccordionTrigger>既知の問題</AccordionTrigger>

          <AccordionContent>
            <UnorderedList items={ISSUES} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="changelog"
          className="border-b px-4 last:border-b-0"
        >
          <AccordionTrigger>更新履歴</AccordionTrigger>

          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

function Term() {
  return (
    <div
      className="typeset typeset-docs space-y-6"
      style={{ "--typeset-size": "0.9rem" } as React.CSSProperties}
    >
      <section>
        <h3>このアプリは何？</h3>

        <p>
          <span className="font-ubuntu-sans font-medium">Kore Motta?</span>{" "}
          は、毎日の「これ持った？」を確認するシンプルな Todo アプリです。
        </p>

        <p>一日ごとにすべてのアイテムが未完了に戻ることが特徴です。</p>
      </section>

      <section>
        <h3>概要</h3>

        <ul>
          <li>日付が変わると、すべてのアイテムが未完了に戻ります。</li>

          <li>
            持ち物や定期的な作業を登録しておくと、一日限りのチェックリストとして利用できます。
          </li>

          <li>
            アイテムが期限切れとして溜まらないため、好みのタイミングで使えます。
          </li>
        </ul>
      </section>

      <section>
        <h3>情報の取り扱いについて</h3>

        <h4>保存先</h4>

        <ul>
          <li>登録した内容は、お使いのブラウザに保存されます。</li>
          <li>登録した内容を外部サービスへ送信・保存することはありません。</li>
        </ul>

        <h4>バックアップ</h4>

        <ul>
          <li>登録した内容は、エクスポートしてバックアップできます。</li>
          <li>バックアップした内容は、インポートして復元できます。</li>
          <li>ブラウザ間のデータ移行などにも利用できます。</li>
        </ul>

        <h4>注意点</h4>

        <ul>
          <li>個人情報や機密情報など重要な情報は登録しないでください。</li>
          <li>
            ブラウザの「Cookie
            と他のサイトデータ」を削除すると、登録した内容が削除されます。
          </li>
          <li>
            登録した内容を失いたくない場合は、あらかじめエクスポートしてください。
          </li>
        </ul>
      </section>

      <section>
        <h3>利用規約</h3>

        <ul>
          <li>
            本サービスは、予告なく内容の変更、停止、または終了する場合があります。
          </li>
          <li>
            本サービスの利用によって生じた損害について、運営者は責任を負いません。
          </li>
        </ul>
      </section>

      <section>
        <h3>お問い合わせ</h3>

        <p>
          ご不明な点やお問い合わせは{" "}
          <a
            href="https://x.com/kem198_x"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            @KeM198
          </a>{" "}
          までご連絡ください。
        </p>
      </section>
    </div>
  );
}

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="アプリの使い方・利用規約"
            className="rounded-full text-white hover:bg-white/10 hover:text-white aria-expanded:bg-white/10 aria-expanded:text-white"
          />
        }
      >
        <CircleHelpIcon className="size-5" />
      </DialogTrigger>

      <DialogContent className="flex w-[90vw] max-w-xl! flex-col">
        <DialogHeader>
          <DialogTitle>使い方・利用規約</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            "flex flex-col gap-4 py-2",
            "-mx-4 max-h-[60vh] overflow-y-auto px-4",
          )}
        >
          <Term />
          <HelpAccordions />
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
