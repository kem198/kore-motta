"use client";

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

function Term() {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Kore Motta? について</h3>

        <p className="text-muted-foreground text-sm">
          Kore Motta? は、毎日の「これ持った？」を確認するシンプルな Todo
          アプリです。
        </p>

        <p className="text-muted-foreground text-sm">
          設定した時刻になると、登録したタスクがすべて未完了に戻ります。
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">登録内容の取り扱い</h3>

        <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
          <li>登録した内容は、お使いのブラウザ内に保存されます。</li>
          <li>登録した内容を外部サービスへ送信・保存することはありません。</li>
          <li>
            ブラウザの「Cookie
            と他のサイトデータ」を削除すると、登録した内容も削除されます。
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">登録内容のバックアップ</h3>

        <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
          <li>登録した内容は、エクスポートしてバックアップできます。</li>
          <li>バックアップした内容は、インポートして復元できます。</li>
          <li>
            ブラウザのデータを削除する前や、ブラウザ間の移行など、必要に応じてエクスポートしてください。
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">利用規約</h3>

        <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
          <li>
            本サービスは、予告なく内容の変更、停止、または終了する場合があります。
          </li>
          <li>
            本サービスの利用によって生じた損害について、運営者は責任を負いません。
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">お問い合わせ</h3>

        <p className="text-muted-foreground text-sm">
          ご不明な点やお問い合わせは{" "}
          <a
            href="https://x.com/Kem198_tw"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            @Kem198_tw
          </a>{" "}
          までご連絡ください。
        </p>
      </section>
    </div>
  );
}

function Changelog() {
  const CHANGELOG = [
    {
      version: "v0.1.0",
      date: "2026-08-23",
      changes: ["初回リリース"],
    },
  ];

  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold">変更履歴</h3>

      <div className="space-y-4 text-sm">
        {CHANGELOG.map((release) => (
          <div key={release.version}>
            <p className="font-medium">
              {release.version}
              <span className="text-muted-foreground"> | {release.date}</span>
            </p>

            <ul className="text-muted-foreground list-none space-y-1 pl-4">
              {release.changes.map((change) => (
                <li key={change}>└ {change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
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
            size="icon"
            aria-label="アプリの使い方・利用規約"
            className="text-white hover:bg-white/10 hover:text-white"
          />
        }
      >
        <CircleHelpIcon size={20} />
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] max-h-[90vh] flex-col">
        <DialogHeader>
          <DialogTitle>使い方・利用規約</DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <Term />
          <Changelog />
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
