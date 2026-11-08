import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  CalendarDays,
  CircleHelp,
  LayoutDashboard,
  PieChart,
  Repeat2,
  ShieldCheck,
} from 'lucide-react-native';
import { colors } from '../theme';

export type AppView = 'overview' | 'mandates' | 'upcoming' | 'insights';

const items = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'mandates' as const, label: 'All mandates', icon: Repeat2 },
  { id: 'upcoming' as const, label: 'Upcoming', icon: CalendarDays },
  { id: 'insights' as const, label: 'Insights', icon: PieChart },
];

export function Brand({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return (
    <View style={styles.brandRow}>
      <View style={[styles.brandMark, compact && styles.brandMarkCompact]}>
        <Repeat2 size={compact ? 20 : 23} color="#FFFFFF" strokeWidth={2.5} />
      </View>
      <Text style={[styles.brandName, dark && styles.brandNameDark, compact && styles.brandNameCompact]}>mandate</Text>
    </View>
  );
}

export function Sidebar({ active, onChange, onHelp }: {
  active: AppView;
  onChange: (view: AppView) => void;
  onHelp: () => void;
}) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarBrand}><Brand /></View>
      <Text style={styles.navCaption}>YOUR SPACE</Text>
      <View style={styles.navItems}>
        {items.map(({ id, label, icon: Icon }) => {
          const selected = active === id;
          return (
            <Pressable key={id} onPress={() => onChange(id)} style={[styles.navItem, selected && styles.navItemActive]}>
              <Icon size={19} color={selected ? '#D9F99D' : '#91A199'} strokeWidth={selected ? 2.3 : 1.8} />
              <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{label}</Text>
              {selected ? <View style={styles.navActiveDot} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.sidebarBottom}>
        <View style={styles.helpCard}>
          <View style={styles.helpIcon}><CircleHelp size={19} color="#D9F99D" /></View>
          <Text style={styles.helpTitle}>A little less{'\n'}to keep in mind.</Text>
          <Text style={styles.helpCopy}>Learn how Mandate keeps your financial life organised.</Text>
          <Pressable onPress={onHelp} style={styles.helpButton}>
            <Text style={styles.helpButtonText}>How it works</Text>
          </Pressable>
        </View>
        <View style={styles.profileRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>PS</Text></View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>Pranav Sood</Text>
            <Text style={styles.profileEmail}>Personal account</Text>
          </View>
          <ShieldCheck size={17} color="#91A199" />
        </View>
      </View>
    </View>
  );
}

export function MobileNav({ active, onChange }: { active: AppView; onChange: (view: AppView) => void }) {
  return (
    <View style={styles.mobileNav}>
      {items.map(({ id, label, icon: Icon }) => {
        const selected = active === id;
        return (
          <Pressable key={id} onPress={() => onChange(id)} style={styles.mobileNavItem}>
            <Icon size={21} color={selected ? colors.green : colors.mutedLight} strokeWidth={selected ? 2.5 : 1.8} />
            <Text style={[styles.mobileNavLabel, selected && styles.mobileNavLabelActive]}>{label === 'All mandates' ? 'Mandates' : label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandMark: { width: 37, height: 37, borderRadius: 12, backgroundColor: '#78A83E', alignItems: 'center', justifyContent: 'center' },
  brandMarkCompact: { width: 33, height: 33, borderRadius: 11 },
  brandName: { fontFamily: 'Manrope_800ExtraBold', fontSize: 24, color: '#FFFFFF', letterSpacing: -1 },
  brandNameCompact: { fontSize: 22 },
  brandNameDark: { color: colors.ink },
  sidebar: { width: 238, backgroundColor: '#14261F', paddingHorizontal: 20, paddingTop: 34, paddingBottom: 22, minHeight: '100%' },
  sidebarBrand: { paddingHorizontal: 8, marginBottom: 50 },
  navCaption: { fontFamily: 'DMSans_600SemiBold', fontSize: 9, color: '#71847A', letterSpacing: 1.7, paddingHorizontal: 13, marginBottom: 13 },
  navItems: { gap: 7 },
  navItem: { height: 47, borderRadius: 11, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  navItemActive: { backgroundColor: '#263C32' },
  navLabel: { color: '#A0ADA5', fontFamily: 'DMSans_500Medium', fontSize: 13, flex: 1 },
  navLabelActive: { color: '#FFFFFF', fontFamily: 'DMSans_600SemiBold' },
  navActiveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#C5E889' },
  sidebarBottom: { marginTop: 'auto', paddingTop: 70 },
  helpCard: { borderRadius: 15, backgroundColor: '#20372C', padding: 16, marginBottom: 23 },
  helpIcon: { marginBottom: 12 },
  helpTitle: { fontFamily: 'Manrope_700Bold', fontSize: 15, lineHeight: 21, color: '#F4F8F5', letterSpacing: -0.2 },
  helpCopy: { fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 17, color: '#94A89C', marginTop: 8 },
  helpButton: { marginTop: 14, borderTopWidth: 1, borderTopColor: '#345044', paddingTop: 12 },
  helpButtonText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: '#D9F99D' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 3 },
  avatar: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#DDE7D1', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Manrope_700Bold', fontSize: 11, color: '#28432F' },
  profileCopy: { flex: 1, gap: 2 },
  profileName: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: '#F0F4F1' },
  profileEmail: { fontFamily: 'DMSans_400Regular', fontSize: 9, color: '#81978A' },
  mobileNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 8, paddingTop: 9, paddingBottom: 12 },
  mobileNavItem: { flex: 1, alignItems: 'center', gap: 5 },
  mobileNavLabel: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: colors.mutedLight },
  mobileNavLabelActive: { color: colors.green, fontFamily: 'DMSans_600SemiBold' },
});
