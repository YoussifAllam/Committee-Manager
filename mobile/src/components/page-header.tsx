import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';

type PageHeaderProps = {
  title: string;
  subtitle: string;
  /** Small label beside the title, e.g. a "خاص بك" chip. */
  badge?: ReactNode;
  /** Controls under the subtitle, such as the page's main button or the committee picker. */
  children?: ReactNode;
};

/** The card at the top of each tab: title, subtitle and the page's main control. */
export function PageHeader({ title, subtitle, badge, children }: PageHeaderProps) {
  return (
    <Card>
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {badge}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  text: {
    gap: Spacing.one,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 34,
  },
});
