import { useState, type ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/toast';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-store';
import { useTheme } from '@/hooks/use-theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shown instead of the app until the member signs in (Stack.Protected in the root layout). */
export default function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const showToast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Errors show after the first attempt, not while the member is still typing.
  const [submitted, setSubmitted] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const errors = {
    email: !email.trim() ? 'اكتب بريدك الإلكتروني.' : EMAIL.test(email.trim()) ? '' : 'اكتب بريدًا إلكترونيًا صحيحًا.',
    password: password ? '' : 'اكتب كلمة المرور.',
  };

  const onSignIn = async () => {
    setSubmitted(true);
    if (errors.email || errors.password) return;
    setSigningIn(true);
    try {
      await signIn(email, password);
    } catch {
      setSigningIn(false);
      showToast({ tone: 'danger', message: 'تعذر تسجيل الدخول. حاول مرة أخرى.' });
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.five, paddingBottom: insets.bottom + Spacing.four },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Image source={require('@/assets/images/icon.png')} style={styles.logo} accessibilityIgnoresInvertColors />
          <ThemedText style={[styles.name, { color: theme.primary }]}>هِمّة</ThemedText>
          <ThemedText themeColor="textSecondary">كل تكليف يصنع أثرًا</ThemedText>
        </View>

        <Card style={styles.card}>
          <View style={styles.heading}>
            <ThemedText type="title">تسجيل الدخول</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              ادخل بحسابك لمتابعة اجتماعاتك وتكليفاتك.
            </ThemedText>
          </View>

          <Field
            label="البريد الإلكتروني"
            icon="mail"
            error={submitted ? errors.email : ''}
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />
          <Field
            label="كلمة المرور"
            icon="lock"
            error={submitted ? errors.password : ''}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={onSignIn}
            trailing={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                hitSlop={Spacing.two}
                onPress={() => setShowPassword((shown) => !shown)}>
                <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
              </Pressable>
            }
          />

          <Button label="تسجيل الدخول" icon="login" disabled={signingIn} onPress={onSignIn} />

          <View style={styles.or}>
            <View style={[styles.line, { backgroundColor: theme.border }]} />
            <ThemedText type="caption" themeColor="textSecondary">
              أو
            </ThemedText>
            <View style={[styles.line, { backgroundColor: theme.border }]} />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={signingIn}
            onPress={() =>
              showToast({
                tone: 'info',
                message: 'تسجيل الدخول بحساب Google سيعمل بعد ربط التطبيق بالخادم.',
              })
            }
            style={({ pressed }) => [
              styles.google,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && styles.pressed,
            ]}>
            <Image source={require('@/assets/images/google.png')} style={styles.googleLogo} />
            <ThemedText type="label">المتابعة باستخدام Google</ThemedText>
          </Pressable>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  icon,
  error,
  trailing,
  ...input
}: TextInputProps & { label: string; icon: IconName; error: string; trailing?: ReactNode }) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <ThemedText type="label">{label}</ThemedText>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.surface, borderColor: error ? theme.danger : theme.border },
        ]}>
        <Icon name={icon} size={20} color={theme.primary} />
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          {...input}
        />
        {trailing}
      </View>
      {!!error && (
        <View style={styles.error}>
          <Icon name="error" size={14} color={theme.danger} />
          <ThemedText type="caption" themeColor="danger">
            {error}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
  brand: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 20,
    marginBottom: Spacing.two,
  },
  // Tall line height: the shadda and kasra on "هِمّة" sit above and below the letters.
  name: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    lineHeight: 52,
  },
  card: {
    gap: Spacing.three,
  },
  heading: {
    gap: Spacing.half,
  },
  field: {
    gap: Spacing.one + Spacing.half,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 50,
    paddingHorizontal: Spacing.three - Spacing.one,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  // Emails and passwords are Latin, so they're typed left to right.
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  or: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 50,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  googleLogo: {
    width: 20,
    height: 20,
  },
  pressed: {
    opacity: 0.7,
  },
});
