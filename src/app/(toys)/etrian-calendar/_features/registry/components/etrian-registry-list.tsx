import { Etrian } from "@/app/(toys)/etrian-calendar/_common/types/etrian";
import {
  AffiliationBadge,
  DateOfBirthBadge,
} from "@/app/(toys)/etrian-calendar/_features/registry/components/badge";
import { BirthdayMessage } from "@/app/(toys)/etrian-calendar/_features/registry/components/birthday-message";
import { ConfirmDialog } from "@/app/(toys)/etrian-calendar/_features/registry/components/dialog/confirm-dialog";
import { EditDialog } from "@/app/(toys)/etrian-calendar/_features/registry/components/dialog/edit-dialog";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircleIcon,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { Fragment } from "react";

function EtrianRegistrySkeleton() {
  return (
    <Item className="px-0">
      <ItemMedia>
        <Skeleton className="relative flex aspect-square h-10 w-10 shrink-0 overflow-hidden rounded-full" />
      </ItemMedia>

      <ItemContent className="flex flex-col gap-1">
        <Skeleton className="h-4 max-w-[10rem] rounded-full" />

        <Skeleton className="h-4 max-w-[16rem] rounded-full" />
      </ItemContent>
    </Item>
  );
}

type EtrianRegistryItemProps = {
  etrian: Etrian;
  index: number;
  length: number;
  isEditing: boolean;
  onDelete: (etrian: Etrian) => void;
  onUpdate: (etrian: Etrian) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
};

function EtrianRegistryItem({
  index,
  etrian,
  length,
  isEditing,
  onDelete,
  onUpdate,
  onReorder,
}: EtrianRegistryItemProps) {
  return (
    <Item className="justify-end px-0 md:flex-row">
      <ItemMedia>
        <Avatar>
          <AvatarImage className="grayscale" />
          <AvatarFallback>{etrian.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="flex flex-col items-start gap-0">
          {etrian.name}
          <BirthdayMessage etrian={etrian} />
        </ItemTitle>

        <ItemDescription>{etrian.memo}</ItemDescription>

        <ItemFooter className={etrian.memo ? "pt-2" : undefined}>
          <div className="flex flex-wrap items-center gap-2">
            <DateOfBirthBadge dateOfBirth={etrian.dateOfBirth} />
            {(etrian.affiliations ?? []).map((affiliation) => (
              <AffiliationBadge key={affiliation} affiliation={affiliation} />
            ))}
          </div>
        </ItemFooter>
      </ItemContent>

      <ItemActions className="flex w-full items-center justify-end gap-2 md:w-auto">
        {isEditing && (
          <>
            <ConfirmDialog
              title="冒険者情報の削除"
              description="下記の冒険者情報を削除します。"
              content={
                <>
                  <p>
                    冒険者名:{" "}
                    <span className="font-semibold">{etrian.name}</span>
                  </p>
                  <Alert variant="destructive">
                    <AlertCircleIcon size={16} />
                    <AlertTitle>この操作は元に戻せません。</AlertTitle>
                  </Alert>
                </>
              }
              confirmButtonLabel="削除"
              confirmButtonVariant="destructive"
              onConfirm={() => onDelete(etrian)}
            >
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full"
                aria-label={`削除: ${etrian.name}`}
              >
                <Trash2 />
              </Button>
            </ConfirmDialog>
            <ButtonGroup>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                onClick={() => onReorder(index, index - 1)}
                disabled={index === 0}
                aria-label={`上へ移動: ${etrian.name}`}
              >
                <ChevronUp />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                onClick={() => onReorder(index, index + 1)}
                disabled={index === length - 1}
                aria-label={`下へ移動: ${etrian.name}`}
              >
                <ChevronDown />
              </Button>

              <EditDialog etrian={etrian} onSave={onUpdate}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                  aria-label={`編集: ${etrian.name}`}
                >
                  <Pencil />
                </Button>
              </EditDialog>
            </ButtonGroup>
          </>
        )}

        {!isEditing && (
          <EditDialog etrian={etrian} onSave={onUpdate}>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              aria-label={`編集: ${etrian.name}`}
            >
              <Pencil />
            </Button>
          </EditDialog>
        )}
      </ItemActions>
    </Item>
  );
}

type EtrianRegistryItemListProps = {
  etrians: Etrian[];
  isLoaded: boolean;
  isEditing: boolean;
  onDelete: (etrian: Etrian) => void;
  onUpdate: (etrian: Etrian) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
};

export function EtrianRegistryItemList({
  etrians,
  isLoaded,
  isEditing,
  onDelete,
  onUpdate,
  onReorder,
}: EtrianRegistryItemListProps) {
  if (!isLoaded) {
    return (
      <ItemGroup>
        <EtrianRegistrySkeleton />
        <EtrianRegistrySkeleton />
        <EtrianRegistrySkeleton />
      </ItemGroup>
    );
  }

  if (etrians.length === 0) {
    return <ItemGroup />;
  }

  return (
    <ItemGroup>
      {etrians.map((etrian, index) => (
        <Fragment key={etrian.id}>
          <EtrianRegistryItem
            etrian={etrian}
            index={index}
            length={etrians.length}
            isEditing={isEditing}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onReorder={onReorder}
          />
          {index !== etrians.length - 1 && <ItemSeparator />}
        </Fragment>
      ))}
    </ItemGroup>
  );
}
