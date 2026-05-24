import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { usePortalContainer } from "../lib/portalContainer";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function FilterDialog({ open, onOpenChange, children }: FilterDialogProps) {
  const container = usePortalContainer();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={container ?? undefined}>
        <Dialog.Overlay className="egkn-dialog-overlay" />
        <Dialog.Content className="egkn-dialog-content" aria-describedby={undefined}>
          <header className="egkn-dialog-header">
            <Dialog.Title className="egkn-dialog-title">Фильтр ЕГКН</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="egkn-dialog-close"
                aria-label="Закрыть"
              >
                ×
              </button>
            </Dialog.Close>
          </header>
          <div className="egkn-dialog-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
