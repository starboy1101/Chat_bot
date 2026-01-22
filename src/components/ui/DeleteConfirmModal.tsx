import React from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

interface DeleteConfirmModalProps {
  open: boolean;
  chatName?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal = ({
  open,
  chatName = "this chat",
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="
          relative z-10 w-full max-w-md mx-4
          rounded-2xl bg-popover border border-border
          shadow-2xl p-6
          animate-in fade-in zoom-in
        "
      >
        <h2 className="text-lg font-semibold text-foreground">
          Delete chat?
        </h2>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          This will delete <span className="font-medium text-foreground">
            {chatName}
          </span>.
        </p>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Visit{" "}
          <span className="underline underline-offset-2 cursor-pointer">
            settings
          </span>{" "}
          to delete any memories saved during this chat.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>

          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteConfirmModal;