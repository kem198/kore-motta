import { TodoAppHeader } from "@/components/shared/todo-app-header";
import { Button } from "@/components/ui/button";
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
          <p>投げ銭で制作者を応援できます。</p>
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
            <li>金額を選ぶと、決済画面に進みます。</li>
            <li>投げ銭です。お礼の品やサービスの提供はございません。</li>
            <li>カード番号は決済会社が取り扱い、こちらには届きません。</li>
            <li>
              決済時に入力されたメールアドレスは、決済会社からの領収書の送付、購入履歴の確認などに利用されます。
            </li>
          </ul>
        </div>
        <div>
          <Link href={"/"}>
            <Button>アプリへ戻る</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
