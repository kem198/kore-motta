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
          設定した時刻になると、登録したタスクが未完了に戻ります。
        </p>

        <p className="text-muted-foreground text-sm">
          入力した情報はお使いのブラウザ内に保存されます。外部サービスへ送信・保存されることはありません。
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">利用規約</h3>

        <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
          <li>法令および公序良俗に従ってご利用ください。</li>
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
            href="https://x.com/Kem198_x"
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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>使い方・利用規約</DialogTitle>
        </DialogHeader>

        <Term />

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
