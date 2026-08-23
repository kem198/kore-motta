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
      style={{ "--typeset-size": "0.95rem" } as React.CSSProperties}
    >
      <section>
        <h3>このアプリは何？</h3>

        <p>
          <strong>Kore Motta?</strong>
          は、毎日の「これ持った？」を確認するシンプルな Todo アプリです。
        </p>

        <p>
          持ち物や毎日行う作業を登録しておけば、毎日のチェックリストとして繰り返し利用できます。
        </p>
      </section>

      <section>
        <h3>このアプリの特徴</h3>

        <ul>
          <li>
            設定した時刻になると、登録したタスクがすべて未完了に戻ります。
          </li>
          <li>
            繰り返しのタスクや期限切れのタスクが溜まらないため、必要なタイミングで使えます。
          </li>
        </ul>
      </section>

      <section>
        <h3>情報の取り扱い</h3>

        <ul>
          <li>登録した内容は、お使いのブラウザ内に保存されます。</li>
          <li>登録した内容を外部サービスへ送信・保存することはありません。</li>
          <li>
            ブラウザの「Cookie
            と他のサイトデータ」を削除すると、登録した内容も削除されます。ご注意ください。
          </li>
        </ul>
      </section>

      <section>
        <h3>登録内容のバックアップ</h3>

        <ul>
          <li>登録した内容は、エクスポートしてバックアップできます。</li>
          <li>バックアップした内容は、インポートして復元できます。</li>
          <li>
            ブラウザのデータを削除する前や、ブラウザ間の移行など、必要に応じてエクスポートしてください。
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
            href="https://x.com/Kem198_x"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            @Kem198_x
          </a>{" "}
          までご連絡ください。
        </p>
      </section>

      <section>
        <h3>変更履歴</h3>

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
            size="icon"
            aria-label="アプリの使い方・利用規約"
            className="text-white hover:bg-white/10 hover:text-white"
          />
        }
      >
        <CircleHelpIcon size={20} />
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] max-h-[90vh] w-[calc(100%-2rem)] !max-w-xl flex-col">
        <DialogHeader>
          <DialogTitle>使い方・利用規約</DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 p-4">
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
