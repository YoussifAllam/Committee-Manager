import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Icon, type IconName } from '@/components/icon';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing, type Tone } from '@/constants/theme';
import { AssignmentActions } from '@/features/assignments/assignment-actions';
import { useAssignments } from '@/features/assignments/assignments-store';
import { STATUS } from '@/features/assignments/status';
import type { Assignment, AssignmentPriority } from '@/features/assignments/types';
import { useTheme } from '@/hooks/use-theme';
import { formatShortDate, formatTime } from '@/utils/date';

const PRIORITY_CHIP: Record<Exclude<AssignmentPriority, 'normal'>, { label: string; icon: IconName; tone: Tone }> = {
  urgent: { label: 'عاجل', icon: 'local_fire_department', tone: 'danger' },
  important: { label: 'مهم', icon: 'priority_high', tone: 'warning' },
};

/** One assignment in full: its quick updates, timeline and discussion. Opens as a full-screen modal. */
export default function AssignmentDetailsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { assignments } = useAssignments();
  // The comment box hides while an action asks for details, so there's only one thing to type into.
  const [askingDetails, setAskingDetails] = useState(false);
  const assignment = assignments.find((a) => a.id === id);

  if (!assignment) {
    return (
      <Screen>
        <ThemedText themeColor="textSecondary">هذا التكليف غير موجود.</ThemedText>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.screen, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.three, backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}>
        <View style={styles.headerRow}>
          <View style={styles.chips}>
            <Chip {...STATUS[assignment.status]} outlined />
            {assignment.priority !== 'normal' && <Chip {...PRIORITY_CHIP[assignment.priority]} outlined />}
            <Chip label={assignment.meetingTitle} icon="event_note" outlined />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="إغلاق"
            hitSlop={Spacing.two}
            onPress={() => router.back()}
            style={[styles.close, { backgroundColor: theme.surfaceMuted }]}>
            <Icon name="close" size={20} color={theme.text} />
          </Pressable>
        </View>
        <ThemedText type="page">{assignment.title}</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Section title="وصف التكليف">
          <View style={[styles.box, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ThemedText>{assignment.description}</ThemedText>
          </View>
        </Section>

        <Section title="تحديث سريع لحالة التكليف">
          <AssignmentActions assignment={assignment} onAskingChange={setAskingDetails} />
        </Section>

        <Section title={`التعليقات والمناقشات (${assignment.comments.length})`} icon="chat_bubble">
          {assignment.comments.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              لا توجد تعليقات بعد. اكتب أول تعليق أو استفسار.
            </ThemedText>
          )}
          {assignment.comments.map((comment) => (
            <View key={comment.id} style={[styles.box, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.commentHead}>
                <ThemedText type="label">
                  {comment.author}{' '}
                  <ThemedText type="caption" themeColor="textSecondary">
                    ({comment.role})
                  </ThemedText>
                </ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  {formatShortDate(comment.at)} · {formatTime(comment.at)}
                </ThemedText>
              </View>
              <ThemedText type="small">{comment.text}</ThemedText>
            </View>
          ))}
        </Section>

        <Section title="سجل التحديثات">
          {assignment.history.map((event) => (
            <View
              key={event.id}
              style={[styles.box, styles.event, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.dot, { backgroundColor: theme.primary }]} />
              <View style={styles.grow}>
                <ThemedText type="label">{event.text}</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  بواسطة: {event.by}
                </ThemedText>
              </View>
              <ThemedText type="caption" themeColor="textSecondary">
                {formatShortDate(event.at)}
              </ThemedText>
            </View>
          ))}
        </Section>
      </ScrollView>

      {!askingDetails && <CommentBox assignment={assignment} bottomInset={insets.bottom} />}
    </KeyboardAvoidingView>
  );
}

function Section({ title, icon, children }: { title: string; icon?: IconName; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitle}>
        {icon && <Icon name={icon} size={18} />}
        <ThemedText type="label" themeColor="textSecondary">
          {title}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

function CommentBox({ assignment, bottomInset }: { assignment: Assignment; bottomInset: number }) {
  const theme = useTheme();
  const { addComment } = useAssignments();
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    addComment(assignment.id, text.trim());
    setText('');
  };

  return (
    <View
      style={[
        styles.commentBox,
        { paddingBottom: bottomInset + Spacing.two, backgroundColor: theme.surface, borderTopColor: theme.border },
      ]}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="أضف تعليقًا أو استفسارًا..."
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel="تعليق جديد"
        multiline
        maxLength={1000}
        style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
      />
      <Button label="إرسال" icon="send" compact disabled={!text.trim()} onPress={send} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  chips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one + Spacing.half,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  box: {
    gap: Spacing.one,
    padding: Spacing.three - Spacing.one,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  event: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    marginTop: Spacing.two,
    borderRadius: Radius.pill,
  },
  grow: {
    flex: 1,
  },
  commentHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  commentBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: Spacing.three - Spacing.one,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
});
