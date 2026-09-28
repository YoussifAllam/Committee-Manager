import type { ToastOptions } from '@/components/toast';
import { openNotificationSettings } from '@/features/reminders/device-settings';
import type { Delivery } from '@/features/reminders/service';

/** The toast after a change: `success` when alerts are in place, otherwise why they aren't. */
export function deliveryToast(delivery: Delivery, success: string): ToastOptions {
  switch (delivery) {
    case 'no-permission':
      return {
        tone: 'warning',
        message: 'التذكير محفوظ، لكن لن يصلك إشعار حتى تسمح بالتنبيهات.',
        action: { label: 'فتح إعدادات الإشعارات', onPress: openNotificationSettings },
      };
    case 'failed':
      return { tone: 'danger', message: 'تعذر جدولة التنبيه. حاول مرة أخرى.' };
    case 'unsupported':
      return { tone: 'info', message: 'تم حفظ التذكير. التنبيهات المجدولة تعمل في تطبيق الهاتف فقط.' };
    default:
      return { tone: 'success', message: success };
  }
}
