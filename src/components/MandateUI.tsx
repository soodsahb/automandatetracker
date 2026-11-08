import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ArrowUpRight, ChevronRight } from 'lucide-react-native';
import type { Mandate } from '../data/mandates';
import { colors, formatCurrency, formatShortDate } from '../theme';

export function MerchantLogo({ mandate, size = 46 }: { mandate: Mandate; size?: number }) {
  return (
    <View
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: size * 0.29,
          backgroundColor: `${mandate.color}12`,
        },
      ]}
    >
      <Text style={[styles.logoText, { color: mandate.color, fontSize: size * 0.38 }]}>
        {mandate.initials}
      </Text>
    </View>
  );
}

export function MandateRow({ mandate, onPress }: { mandate: Mandate; onPress: () => void }) {
  const cancelled = mandate.status === 'cancelled';
  const { width } = useWindowDimensions();
  const compact = width < 650;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${mandate.name} mandate`}
      onPress={onPress}
      style={({ hovered, pressed }: any) => [
        styles.row,
        compact && styles.rowCompact,
        hovered && !cancelled && styles.rowHovered,
        pressed && styles.rowPressed,
      ]}
    >
      <MerchantLogo mandate={mandate} size={compact ? 42 : 46} />
      <View style={styles.rowMain}>
        <Text style={[styles.rowName, cancelled && styles.cancelledText]} numberOfLines={1}>
          {mandate.name}
        </Text>
        <View style={styles.rowMetaLine}>
          <View style={[styles.statusDot, cancelled && styles.cancelledDot]} />
          <Text style={styles.rowMeta}>{cancelled ? 'Cancelled' : mandate.category}</Text>
        </View>
      </View>
      {!compact ? (
        <View style={styles.rowDateWrap}>
          <Text style={styles.rowDateLabel}>{cancelled ? 'No upcoming debit' : 'Next debit'}</Text>
          <Text style={[styles.rowDate, cancelled && styles.cancelledText]}>
            {cancelled ? '—' : formatShortDate(mandate.nextDebit)}
          </Text>
        </View>
      ) : null}
      <View style={styles.rowAmountWrap}>
        <Text style={[styles.rowAmount, cancelled && styles.cancelledText]}>
          {formatCurrency(mandate.amount)}
        </Text>
        <Text style={styles.rowFrequency}>{mandate.frequency}</Text>
      </View>
      <ChevronRight size={18} color={colors.mutedLight} />
    </Pressable>
  );
}

export function UpcomingItem({ mandate, onPress }: { mandate: Mandate; onPress: () => void }) {
  const date = new Date(`${mandate.nextDebit}T12:00:00`);
  return (
    <Pressable onPress={onPress} style={({ hovered }: any) => [styles.upcomingItem, hovered && styles.rowHovered]}>
      <View style={styles.dateBadge}>
        <Text style={styles.dateMonth}>{date.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</Text>
        <Text style={styles.dateDay}>{date.getDate()}</Text>
      </View>
      <View style={styles.upcomingMain}>
        <Text style={styles.upcomingName} numberOfLines={1}>{mandate.name}</Text>
        <Text style={styles.upcomingMeta}>{mandate.paymentMethod}</Text>
      </View>
      <Text style={styles.upcomingAmount}>{formatCurrency(mandate.amount)}</Text>
    </Pressable>
  );
}

export function SectionHeading({ title, subtitle, action, onAction }: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? (
        <Pressable onPress={onAction} style={styles.textButton}>
          <Text style={styles.textButtonLabel}>{action}</Text>
          <ArrowUpRight size={15} color={colors.green} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoText: { fontFamily: 'Manrope_800ExtraBold', letterSpacing: -0.5 },
  row: {
    minHeight: 79,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: -1,
  },
  rowHovered: { backgroundColor: '#F8FAF8' },
  rowPressed: { opacity: 0.72 },
  rowCompact: { paddingHorizontal: 14, gap: 10, minHeight: 74 },
  rowMain: { flex: 1, minWidth: 80, gap: 5 },
  rowName: { color: colors.ink, fontFamily: 'Manrope_700Bold', fontSize: 14 },
  rowMetaLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#4D8B6C' },
  cancelledDot: { backgroundColor: colors.mutedLight },
  rowMeta: { color: colors.muted, fontFamily: 'DMSans_400Regular', fontSize: 12 },
  rowDateWrap: { width: 100, gap: 5 },
  rowDateLabel: { color: colors.mutedLight, fontFamily: 'DMSans_400Regular', fontSize: 11 },
  rowDate: { color: colors.inkSoft, fontFamily: 'DMSans_500Medium', fontSize: 12 },
  rowAmountWrap: { width: 91, alignItems: 'flex-end', gap: 5 },
  rowAmount: { color: colors.ink, fontFamily: 'Manrope_700Bold', fontSize: 14 },
  rowFrequency: { color: colors.mutedLight, fontFamily: 'DMSans_400Regular', fontSize: 11 },
  cancelledText: { color: colors.mutedLight, textDecorationLine: 'line-through' },
  upcomingItem: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 14 },
  dateBadge: {
    width: 44,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: { fontFamily: 'DMSans_600SemiBold', fontSize: 8, color: colors.muted, letterSpacing: 0.7 },
  dateDay: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: colors.ink, lineHeight: 23 },
  upcomingMain: { flex: 1, gap: 4 },
  upcomingName: { fontFamily: 'Manrope_700Bold', fontSize: 12, color: colors.ink },
  upcomingMeta: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: colors.mutedLight },
  upcomingAmount: { fontFamily: 'Manrope_700Bold', fontSize: 12, color: colors.ink },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: colors.ink, letterSpacing: -0.4 },
  sectionSubtitle: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.muted, marginTop: 5 },
  textButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  textButtonLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: colors.green },
});
