import { ConfirmDialog } from '@/components/confirm-dialog';
import { useToast } from '@/components/toast';
import { useReminders } from '@/features/reminders/reminders-store';

type DeleteReminderDialogProps = {
  reminderId: string;
  visible: boolean;
  onClose: () => void;
  /** Runs after the reminder is gone, e.g. to leave its details screen. */
  onDeleted?: () => void;
};

/** "حذف التذكير؟" confirmation; deleting cancels every alert of the reminder first. */
export function DeleteReminderDialog({ reminderId, visible, onClose, onDeleted }: DeleteReminderDialogProps) {
  const { remove } = useReminders();
  const showToast = useToast();

  const onConfirm = async () => {
    onClose();
    try {
      await remove(reminderId);
      onDeleted?.();
      showToast({ tone: 'success', message: 'تم حذف التذكير.' });
    } catch {
      showToast({ tone: 'danger', message: 'تعذر حذف التذكير. حاول مرة أخرى.' });
    }
  };

  return (
    <ConfirmDialog
      visible={visible}
      title="حذف التذكير؟"
      message="لن يصلك هذا التنبيه مرة أخرى."
      confirmLabel="حذف"
      destructive
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
}
