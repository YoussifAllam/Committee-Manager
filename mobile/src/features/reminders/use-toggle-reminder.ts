import { useToast } from '@/components/toast';
import { deliveryToast } from '@/features/reminders/delivery-toast';
import { useReminders } from '@/features/reminders/reminders-store';

/** Switches a reminder on or off and confirms it with a toast. */
export function useToggleReminder() {
  const { setEnabled } = useReminders();
  const showToast = useToast();

  return async (id: string, enabled: boolean) => {
    try {
      const delivery = await setEnabled(id, enabled);
      showToast(
        enabled
          ? deliveryToast(delivery, 'تم تفعيل التذكير وسيصلك في موعده القادم.')
          : { tone: 'info', message: 'تم إيقاف التذكير. لن تصلك تنبيهاته حتى تعيد تفعيله.' },
      );
    } catch {
      showToast({ tone: 'danger', message: 'تعذر تحديث التذكير. حاول مرة أخرى.' });
    }
  };
}
