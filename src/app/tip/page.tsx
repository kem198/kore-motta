import { TodoAppHeader } from "@/components/shared/todo-app-header";
import { buttonVariants } from "@/components/ui/button";
import { TYPESET_CLASS_NAME } from "@/constants/help";
import { cn } from "@/lib/utils";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import Link from "next/link";

export default function TipPage() {
  return (
    <>
      <TodoAppHeader />
      <div className={cn(TYPESET_CLASS_NAME, "flex flex-col gap-8 p-4")}>
        <div>
          <h2>コーヒーをおごる</h2>
          <p>OFUSE を通じて、開発者 (KeM198) を応援できます。</p>
          <ul>
            <li>
              <a
                href="https://ofuse.me/kem198"
                target="_blank"
                rel="noopener noreferrer"
              >
                OFUSE で応援する{" "}
                <SquareArrowOutUpRightIcon className="inline size-3.5 align-middle" />
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-muted rounded-md p-4 text-sm">
          <ul className="mt-0 space-y-1 *:mt-0">
            <li>投げ銭です。お礼の品やサービスの提供はございません。</li>
            <li>
              OFUSE を通じた応援・決済にあたっては、
              <a
                href="https://ofuse.me/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                OFUSE 利用規約{" "}
                <SquareArrowOutUpRightIcon className="inline size-3 align-middle" />
              </a>{" "}
              および{" "}
              <a
                href="https://sozi.co.jp/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                プライバシーポリシー{" "}
                <SquareArrowOutUpRightIcon className="inline size-3 align-middle" />
              </a>{" "}
              をご確認ください。
            </li>
            <li>
              ご不明な点は{" "}
              <a
                href="https://x.com/kem198_x"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                @KeM198{" "}
                <SquareArrowOutUpRightIcon className="inline size-3 align-middle" />
              </a>{" "}
              までお問い合わせください。
            </li>
          </ul>
        </div>

        <div>
          <Link href="/" className={cn(buttonVariants(), "no-underline")}>
            アプリへ戻る
          </Link>
        </div>
      </div>
    </>
  );
}
