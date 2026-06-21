import { Button } from "../common/Button";
import { Modal } from "../modals/Modal";

type AdminConfirmationModalProps = {
  confirmLabel: string;
  description: string;
  isBusy?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
};

export function AdminConfirmationModal({
  confirmLabel,
  description,
  isBusy,
  isOpen,
  onClose,
  onConfirm,
  title
}: AdminConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isBusy}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isBusy}>
            {isBusy ? "Working..." : confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="rounded-[22px] bg-cream-50 px-4 py-4 text-sm leading-7 text-charcoal-900/72">
        This action is reserved for admin moderation and should only be used when the
        record clearly needs intervention.
      </div>
    </Modal>
  );
}
