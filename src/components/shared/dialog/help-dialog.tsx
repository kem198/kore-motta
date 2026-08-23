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
  const CHANGELOG = [
    {
      version: "v0.1.0",
      date: "2026-08-23",
      changes: ["初回リリース"],
    },
  ];

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

        <p>
          持ち物や毎日行う作業を登録しておけば、その日限りのチェックリストとして利用できます。
        </p>
      </section>

      <section>
        <h3>このアプリの特徴</h3>

        <ul>
          <li>
            設定した時刻を過ぎると、登録したアイテムがすべて未完了に戻ります。
          </li>
          <li>
            繰り返しのアイテムや期限切れのアイテムとして溜まらないため、必要なタイミングで使えます。
          </li>
        </ul>
      </section>

      <section>
        <h3>情報の取り扱いについて</h3>

        <h4>保存先</h4>

        <ul>
          <li>登録した内容は、お使いのブラウザ内に保存されます。</li>
          <li>登録した内容を外部サービスへ送信・保存することはありません。</li>
        </ul>

        <h4>バックアップ</h4>

        <ul>
          <li>登録した内容は、エクスポートしてバックアップできます。</li>
          <li>バックアップした内容は、インポートして復元できます。</li>
        </ul>

        <h4>注意点</h4>

        <ul>
          <li>
            ブラウザの「Cookie
            と他のサイトデータ」を削除すると、登録した内容も削除されます。
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
        <h3>お問い合わせ・変更履歴</h3>

        <p>
          ご不明な点やお問い合わせは{" "}
          <a
            href="https://x.com/Kem198_x"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            @Kem198_x
          </a>{" "}
          までご連絡ください。
        </p>

        <ul>
          {CHANGELOG.map((release) => (
            <li key={release.version}>
              <p>
                {release.version}
                <span> | {release.date}</span>
              </p>

              <ul>
                {release.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
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
            className="rounded-full text-white hover:bg-white/10 hover:text-white"
          />
        }
      >
        <CircleHelpIcon className="size-5" />
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] max-h-[75vh] w-[calc(100%-1rem)] !max-w-xl flex-col">
        <DialogHeader>
          <DialogTitle>使い方・利用規約</DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 p-2">
          <Term />
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
