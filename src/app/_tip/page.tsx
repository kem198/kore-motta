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
          <h2>おやつをおごる</h2>
          <p>投げ銭で開発者 (KeM198) を応援できます。</p>
          <ul>
            <li>
              <a
                href="https://buy.stripe.com/4gMeVcfXo0mg5qb9vh48001"
                target="_blank"
                rel="noopener noreferrer"
              >
                おやつをおごる (100 円){" "}
                <SquareArrowOutUpRightIcon className="inline size-3.5 align-middle" />
              </a>
            </li>
            <li>
              <a
                href="https://buy.stripe.com/7sY9ASfXod929Gr36T48000"
                target="_blank"
                rel="noopener noreferrer"
              >
                コーヒーをおごる (300 円){" "}
                <SquareArrowOutUpRightIcon className="inline size-3.5 align-middle" />
              </a>
            </li>
          </ul>
        </div>

        <div className="rounded-md bg-gray-200 p-4 text-sm">
          <ul className="mt-0 space-y-1 *:mt-0">
            <li>投げ銭です。お礼の品やサービスの提供はございません。</li>
            <li>
              カード情報は決済会社が取り扱います。運営者がカード番号を取得・保存することはありません。
            </li>
            <li>
              メールアドレス、カード番号の下4桁、カード名義が決済会社から提供されます。これらは決済の確認や購入履歴の管理に利用します。
            </li>
            <li>ご支援後の返金は、原則として受け付けておりません。</li>
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
          <Link href={"/"} className={cn(buttonVariants(), "no-underline")}>
            アプリへ戻る
          </Link>
        </div>
      </div>
    </>
  );
}
