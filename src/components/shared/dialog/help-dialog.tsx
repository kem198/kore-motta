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
import { ScrollArea } from "@/components/ui/scroll-area";
import { CircleHelpIcon } from "lucide-react";

const TIPS = ["a"];

const ISSUES = [
  "スマートフォンで入力を開始すると、キーボードの表示によりページがスクロールされ、追加したアイテムが見づらくなることがあります。その場合は、ページをスクロールして確認してください。",
];

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
            持ち物や定期的な作業を登録しておくと、その日限りのチェックリストとして利用できます。
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

      <DialogContent className="flex h-[90vh] max-h-[75vh] w-[calc(100%-1rem)] max-w-xl! flex-col">
        <DialogHeader>
          <DialogTitle>使い方・利用規約</DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 p-2">
          <div className="flex flex-col gap-4">
            <Term />
            <Tips />
            <Issues />
            <Changelog />
          </div>
        </ScrollArea>
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
