import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import { Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  IndianRupee,
  Clock3,
  Lightbulb,
  Plus,
  Repeat2,
  Search,
  SearchX,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  WalletCards,
} from 'lucide-react-native';
import { Brand, MobileNav, Sidebar, type AppView } from './src/components/Navigation';
import { MandateRow, MerchantLogo, SectionHeading, UpcomingItem } from './src/components/MandateUI';
import {
  AddMandateModal,
  HelpModal,
  MandateDetailsModal,
  type NewMandateInput,
} from './src/components/MandateModals';
import { initialMandates, type Mandate, type MandateCategory } from './src/data/mandates';
import { cardShadow, colors, formatCurrency, formatShortDate } from './src/theme';

const STORAGE_KEY = '@mandate/list-v1';
const categories: Array<'All' | MandateCategory | 'Cancelled'> = ['All', 'Entertainment', 'Utilities', 'Finance', 'Health', 'Software', 'Cancelled'];

export default function App() {
  const { width, height } = useWindowDimensions();
  const desktop = width >= 1020;
  const wideContent = width >= 1220;
  const compact = width < 650;
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [mandates, setMandates] = useState<Mandate[]>(initialMandates);
  const [view, setView] = useState<AppView>('overview');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addVisible, setAddVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [toast, setToast] = useState('');
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length) setMandates(parsed);
        } catch {
          // Keep the seeded list if local data is malformed.
        }
      }
      hydrated.current = true;
    });
  }, []);

  useEffect(() => {
    if (hydrated.current) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mandates));
  }, [mandates]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  const active = useMemo(() => mandates.filter((item) => item.status === 'active'), [mandates]);
  const selected = mandates.find((item) => item.id === selectedId) ?? null;
  const monthlyTotal = active.reduce((sum, item) => sum + monthlyAmount(item), 0);
  const upcoming = useMemo(() => [...active].sort((a, b) => a.nextDebit.localeCompare(b.nextDebit)), [active]);
  const nextWeekTotal = upcoming.filter((item) => daysUntil(item.nextDebit) <= 7).reduce((sum, item) => sum + item.amount, 0);
  const filtered = useMemo(() => mandates.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || (category === 'Cancelled' ? item.status === 'cancelled' : item.category === category && item.status === 'active');
    return matchesSearch && matchesCategory;
  }), [mandates, search, category]);

  const changeView = (next: AppView) => {
    setView(next);
    setSearch('');
    setCategory('All');
  };

  const openMerchant = async (mandate: Mandate) => {
    try {
      if (Platform.OS === 'web') {
        const popup = window.open(mandate.manageUrl, '_blank');
        if (!popup) throw new Error('Pop-up blocked');
        popup.opener = null;
      } else if (mandate.appScheme && await Linking.canOpenURL(mandate.appScheme)) {
        await Linking.openURL(mandate.appScheme);
      } else {
        await Linking.openURL(mandate.manageUrl);
      }
      setToast(`${mandate.name} opened. Manage the autopay on their secure page.`);
    } catch {
      setToast(`Couldn’t open ${mandate.name}. Please check the link or your pop-up settings.`);
      throw new Error('Unable to open merchant');
    }
  };

  const addMandate = (input: NewMandateInput) => {
    const palette = ['#7C3AED', '#0F766E', '#EA580C', '#2563EB', '#BE3455'];
    const newMandate: Mandate = {
      ...input,
      id: `mandate-${Date.now()}`,
      status: 'active',
      lastDebit: new Date().toISOString().slice(0, 10),
      reference: `MND-${String(Date.now()).slice(-8)}`,
      color: palette[mandates.length % palette.length],
      initials: input.name.trim().slice(0, 1).toUpperCase(),
    };
    setMandates((current) => [...current, newMandate]);
    setAddVisible(false);
    setCategory('All');
    setToast(`${input.name} added to your mandates.`);
  };

  const markCancelled = (mandate: Mandate) => {
    setMandates((current) => current.map((item) => item.id === mandate.id ? { ...item, status: 'cancelled' } : item));
    setSelectedId(null);
    setToast(`${mandate.name} marked as cancelled. Your totals are updated.`);
  };

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  const pageCopy = {
    overview: ['Good afternoon, Pranav', 'Here’s what’s happening with your autopays.'],
    mandates: ['All your mandates', 'Every recurring payment, in one place.'],
    upcoming: ['Upcoming debits', 'Plan ahead. No surprise deductions.'],
    insights: ['Your spending, simplified', 'See where your recurring payments go each month.'],
  }[view];

  const renderStats = () => (
    <View style={styles.statsRow}>
      <View style={[styles.heroStat, compact && styles.heroStatCompact]}>
        <View style={styles.heroOrbOne} />
        <View style={styles.heroOrbTwo} />
        <View style={styles.statTopLine}>
          <View style={styles.heroLabelRow}><WalletCards size={17} color="#D9F99D" /><Text style={styles.heroLabel}>Monthly autopays</Text></View>
          <View style={styles.heroIcon}><ArrowUpRight size={17} color="#D9F99D" /></View>
        </View>
        <Text style={styles.heroAmount}>{formatCurrency(monthlyTotal)}</Text>
        <View style={styles.heroFooter}>
          <View style={styles.miniLogos}>
            {active.slice(0, 3).map((item) => (
              <View key={item.id} style={[styles.miniLogo, { backgroundColor: item.color }]}><Text style={styles.miniLogoText}>{item.initials.slice(0, 1)}</Text></View>
            ))}
            {active.length > 3 ? <View style={[styles.miniLogo, styles.miniLogoMore]}><Text style={styles.miniLogoMoreText}>+{active.length - 3}</Text></View> : null}
          </View>
          <Text style={styles.heroFooterText}>Across {active.length} active merchants</Text>
        </View>
      </View>
      <View style={[styles.smallStat, compact && styles.smallStatCompact]}>
        <View style={styles.statTopLine}>
          <View style={styles.statIcon}><Repeat2 size={19} color={colors.green} /></View>
          <View style={styles.healthyPill}><View style={styles.healthyDot} /><Text style={styles.healthyText}>On track</Text></View>
        </View>
        <Text style={styles.smallStatLabel}>Active mandates</Text>
        <View style={styles.statValueLine}><Text style={styles.smallStatValue}>{active.length}</Text><Text style={styles.statValueSuffix}>autopays</Text></View>
        <Text style={styles.smallStatFoot}>{mandates.length - active.length ? `${mandates.length - active.length} cancelled · ` : ''}All in one place</Text>
      </View>
      <View style={[styles.smallStat, compact && styles.smallStatCompact]}>
        <View style={styles.statTopLine}>
          <View style={[styles.statIcon, styles.statIconWarm]}><Clock3 size={19} color="#9A6A32" /></View>
          <CalendarDays size={17} color={colors.mutedLight} />
        </View>
        <Text style={styles.smallStatLabel}>Due in the next 7 days</Text>
        <Text style={[styles.smallStatValue, styles.nextWeekAmount]}>{formatCurrency(nextWeekTotal)}</Text>
        <Text style={styles.smallStatFoot}>{upcoming.filter((item) => daysUntil(item.nextDebit) <= 7).length} upcoming payments</Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <>
      <View style={styles.listTools}>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.mutedLight} />
          <TextInputSearch value={search} onChange={setSearch} />
        </View>
        <Pressable style={styles.filterButton} onPress={() => setCategory(category === 'All' ? 'Cancelled' : 'All')} accessibilityLabel="Toggle cancelled mandates">
          <SlidersHorizontal size={16} color={colors.inkSoft} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filterChip, category === item && styles.filterChipActive]}>
            <Text style={[styles.filterChipText, category === item && styles.filterChipTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );

  const renderMandateList = (limit?: number) => {
    const ordered = view === 'upcoming' ? [...filtered].sort((a, b) => a.nextDebit.localeCompare(b.nextDebit)) : filtered;
    const visible = typeof limit === 'number' ? ordered.slice(0, limit) : ordered;
    return (
      <View style={styles.listCard}>
        <View style={styles.listHeading}>
          <SectionHeading
            title={view === 'overview' ? 'Your mandates' : view === 'upcoming' ? 'Scheduled payments' : 'Mandate directory'}
            subtitle={`${filtered.length} ${filtered.length === 1 ? 'mandate' : 'mandates'}${category !== 'All' ? ` · ${category}` : ''}`}
            action={view === 'overview' ? 'View all' : undefined}
            onAction={() => changeView('mandates')}
          />
        </View>
        {renderFilters()}
        <View style={styles.listRows}>
          {visible.length ? visible.map((item) => (
            <MandateRow key={item.id} mandate={item} onPress={() => setSelectedId(item.id)} />
          )) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}><SearchX size={24} color={colors.muted} /></View>
              <Text style={styles.emptyTitle}>No mandates found</Text>
              <Text style={styles.emptyCopy}>Try another search or clear your filters.</Text>
              <Pressable onPress={() => { setSearch(''); setCategory('All'); }}><Text style={styles.clearText}>Clear filters</Text></Pressable>
            </View>
          )}
        </View>
        {view === 'overview' && filtered.length > 5 ? (
          <Pressable style={styles.listFooter} onPress={() => changeView('mandates')}>
            <Text style={styles.listFooterText}>See all {filtered.length} mandates</Text><ArrowRight size={15} color={colors.green} />
          </Pressable>
        ) : null}
      </View>
    );
  };

  const renderAside = () => (
    <View style={[styles.aside, !wideContent && styles.asideStacked]}>
      <View style={styles.upcomingCard}>
        <SectionHeading title="Coming up" subtitle="Your next scheduled debits" />
        <View style={styles.upcomingList}>
          {upcoming.slice(0, 4).map((item) => <UpcomingItem key={item.id} mandate={item} onPress={() => setSelectedId(item.id)} />)}
        </View>
        <Pressable style={styles.calendarButton} onPress={() => changeView('upcoming')}>
          <CalendarDays size={15} color={colors.green} /><Text style={styles.calendarButtonText}>View payment schedule</Text><ChevronRight size={15} color={colors.green} />
        </Pressable>
      </View>
      <View style={styles.tipCard}>
        <View style={styles.tipIcon}><Lightbulb size={19} color="#526F2D" /></View>
        <Text style={styles.tipEyebrow}>A SMALL NUDGE</Text>
        <Text style={styles.tipTitle}>You’re always in control.</Text>
        <Text style={styles.tipCopy}>Cancel any autopay directly with the biller. We’ll help you get to the right place.</Text>
        <Pressable onPress={() => setHelpVisible(true)} style={styles.tipLink}><Text style={styles.tipLinkText}>How Mandate works</Text><ArrowUpRight size={15} color={colors.green} /></Pressable>
      </View>
      <View style={styles.secureNote}><ShieldCheck size={15} color={colors.muted} /><Text style={styles.secureNoteText}>Private by design. Stored on this device.</Text></View>
    </View>
  );

  const renderUpcoming = () => (
    <View style={[styles.contentGrid, !wideContent && styles.contentGridStacked]}>
      <View style={styles.mainColumn}>
        <View style={styles.scheduleBanner}>
          <View style={styles.scheduleIcon}><CalendarDays size={24} color={colors.green} /></View>
          <View style={{ flex: 1 }}><Text style={styles.scheduleBannerTitle}>{upcoming.length} payments on your calendar</Text><Text style={styles.scheduleBannerCopy}>Your next debit is {upcoming[0] ? `${upcoming[0].name}, ${formatShortDate(upcoming[0].nextDebit)}` : 'not scheduled'}.</Text></View>
        </View>
        {renderMandateList()}
      </View>
      {renderAside()}
    </View>
  );

  const renderInsights = () => {
    const breakdown = (['Entertainment', 'Utilities', 'Finance', 'Health', 'Software'] as MandateCategory[]).map((name) => ({
      name,
      value: active.filter((item) => item.category === name).reduce((sum, item) => sum + monthlyAmount(item), 0),
    })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
    const barColors = ['#52795D', '#A6C36F', '#D6B56D', '#8C9BB5', '#B397B5'];
    const largest = [...active].sort((a, b) => monthlyAmount(b) - monthlyAmount(a))[0];
    return (
      <View style={[styles.contentGrid, !wideContent && styles.contentGridStacked]}>
        <View style={styles.mainColumn}>
          <View style={styles.insightCard}>
            <SectionHeading title="Where your money goes" subtitle="Monthly equivalent by category" />
            <View style={styles.insightTotalRow}><Text style={styles.insightTotal}>{formatCurrency(monthlyTotal)}</Text><View style={styles.monthlyPill}><TrendingUp size={13} color={colors.green} /><Text style={styles.monthlyPillText}>per month</Text></View></View>
            <View style={styles.breakdownList}>
              {breakdown.map((item, index) => (
                <View key={item.name} style={styles.breakdownItem}>
                  <View style={styles.breakdownLabelRow}><View style={styles.breakdownNameRow}><View style={[styles.breakdownDot, { backgroundColor: barColors[index] }]} /><Text style={styles.breakdownName}>{item.name}</Text></View><Text style={styles.breakdownAmount}>{formatCurrency(item.value)}</Text></View>
                  <View style={styles.barTrack}><View style={[styles.barFill, { width: `${monthlyTotal ? item.value / monthlyTotal * 100 : 0}%`, backgroundColor: barColors[index] }]} /></View>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={[styles.aside, !wideContent && styles.asideStacked]}>
          <View style={styles.upcomingCard}>
            <View style={styles.statIcon}><Sparkles size={19} color={colors.green} /></View>
            <Text style={styles.insightSideTitle}>Your biggest autopay</Text>
            {largest ? <><View style={styles.largestMerchant}><MerchantLogo mandate={largest} size={48} /><Text style={styles.largestName}>{largest.name}</Text></View><Text style={styles.largestAmount}>{formatCurrency(monthlyAmount(largest.amount))}<Text style={styles.largestFrequency}> / month</Text></Text><Text style={styles.largestCopy}>That’s {Math.round(monthlyAmount(largest.amount) / monthlyTotal * 100)}% of your monthly recurring spend.</Text></> : null}
          </View>
          <View style={styles.tipCard}><IndianRupee size={23} color="#526F2D" /><Text style={[styles.tipTitle, { marginTop: 14 }]}>Small amounts add up.</Text><Text style={styles.tipCopy}>Review mandates you no longer use. Cancelling one could make a meaningful difference over a year.</Text></View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.app, { minHeight: height, height: Platform.OS === 'web' ? height : undefined }]}>
      <StatusBar style="dark" />
      {desktop ? <Sidebar active={view} onChange={changeView} onHelp={() => setHelpVisible(true)} /> : null}
      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, compact && styles.scrollContentCompact]}>
          <View style={styles.contentWidth}>
            {!desktop ? <View style={styles.mobileBrand}><Brand compact dark /><Pressable onPress={() => setToast('You’re all caught up. No new alerts.')} style={styles.notificationButton}><Bell size={19} color={colors.inkSoft} /></Pressable></View> : null}
            <View style={[styles.pageHeader, compact && styles.pageHeaderCompact]}>
              <View style={styles.pageHeaderCopy}>
                <Text style={[styles.pageTitle, compact && styles.pageTitleCompact]}>{pageCopy[0]}</Text>
                <Text style={styles.pageSubtitle}>{pageCopy[1]}</Text>
              </View>
              <View style={styles.headerActions}>
                {desktop ? <Pressable onPress={() => setToast('You’re all caught up. No new alerts.')} style={styles.notificationButton}><Bell size={19} color={colors.inkSoft} /><View style={styles.notificationDot} /></Pressable> : null}
                <Pressable onPress={() => setAddVisible(true)} style={[styles.addMandateButton, compact && styles.addMandateButtonCompact]}>
                  <Plus size={18} color="#FFFFFF" strokeWidth={2.4} /><Text style={styles.addMandateText}>{compact ? 'Add' : 'Add mandate'}</Text>
                </Pressable>
              </View>
            </View>

            {view === 'overview' ? (
              <>
                {renderStats()}
                <View style={[styles.contentGrid, !wideContent && styles.contentGridStacked]}>
                  <View style={styles.mainColumn}>{renderMandateList(5)}</View>
                  {renderAside()}
                </View>
              </>
            ) : view === 'mandates' ? (
              <View style={[styles.contentGrid, !wideContent && styles.contentGridStacked]}>
                <View style={styles.mainColumn}>{renderMandateList()}</View>
                {renderAside()}
              </View>
            ) : view === 'upcoming' ? renderUpcoming() : renderInsights()}
            <View style={styles.footer}><Repeat2 size={13} color={colors.mutedLight} /><Text style={styles.footerText}>Less mental load. More financial clarity.</Text></View>
          </View>
        </ScrollView>
        {!desktop ? <MobileNav active={view} onChange={changeView} /> : null}
      </View>

      <MandateDetailsModal mandate={selected} onClose={() => setSelectedId(null)} onOpenMerchant={openMerchant} onMarkCancelled={markCancelled} />
      <AddMandateModal visible={addVisible} onClose={() => setAddVisible(false)} onAdd={addMandate} />
      <HelpModal visible={helpVisible} onClose={() => setHelpVisible(false)} />
      {toast ? <View style={[styles.toast, !desktop && styles.toastMobile]}><CheckCircle2 size={18} color="#D9F99D" /><Text style={styles.toastText}>{toast}</Text></View> : null}
    </View>
  );
}

function TextInputSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { TextInput } = require('react-native') as typeof import('react-native');
  return <TextInput value={value} onChangeText={onChange} placeholder="Search mandates…" placeholderTextColor={colors.mutedLight} style={styles.searchInput} accessibilityLabel="Search mandates" />;
}

function monthlyAmount(mandate: Mandate | number) {
  if (typeof mandate === 'number') return mandate;
  return mandate.frequency === 'Yearly' ? Math.round(mandate.amount / 12) : mandate.frequency === 'Quarterly' ? Math.round(mandate.amount / 3) : mandate.amount;
}

function daysUntil(value: string) {
  const today = new Date();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const target = new Date(`${value}T12:00:00`);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - current) / 86400000);
}

const styles = StyleSheet.create({
  app: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  body: { flex: 1, minWidth: 0 },
  scrollContent: { paddingHorizontal: 36, paddingTop: 39, paddingBottom: 24 },
  scrollContentCompact: { paddingHorizontal: 17, paddingTop: 20, paddingBottom: 22 },
  contentWidth: { width: '100%', maxWidth: 1270, alignSelf: 'center' },
  mobileBrand: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 31 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 29 },
  pageHeaderCompact: { marginBottom: 24, alignItems: 'flex-end', gap: 10 },
  pageHeaderCopy: { flex: 1 },
  pageTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 29, lineHeight: 38, color: colors.ink, letterSpacing: -1.1 },
  pageTitleCompact: { fontSize: 22, lineHeight: 29, letterSpacing: -0.7 },
  pageSubtitle: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.muted, marginTop: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notificationButton: { width: 41, height: 41, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#7E9D45', right: 9, top: 8, borderWidth: 1, borderColor: '#FFFFFF' },
  addMandateButton: { height: 43, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.green, borderRadius: 11, ...cardShadow },
  addMandateButtonCompact: { height: 39, paddingHorizontal: 13, borderRadius: 10 },
  addMandateText: { color: '#FFFFFF', fontFamily: 'DMSans_600SemiBold', fontSize: 12 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 25 },
  heroStat: { width: '37%', minWidth: 295, flexGrow: 1.2, minHeight: 182, borderRadius: 18, backgroundColor: colors.greenDark, padding: 23, overflow: 'hidden' },
  heroStatCompact: { width: '100%', minWidth: '100%', minHeight: 174 },
  heroOrbOne: { position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 34, borderColor: 'rgba(255,255,255,0.025)', right: -70, top: -70 },
  heroOrbTwo: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(217,249,157,0.025)', left: -35, bottom: -45 },
  statTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  heroLabel: { color: '#C4D3CB', fontFamily: 'DMSans_500Medium', fontSize: 12 },
  heroIcon: { width: 29, height: 29, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  heroAmount: { fontFamily: 'Manrope_800ExtraBold', color: '#FFFFFF', fontSize: 35, letterSpacing: -1.5, marginTop: 15 },
  heroFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 17, gap: 10 },
  miniLogos: { flexDirection: 'row', paddingLeft: 0 },
  miniLogo: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: -5, borderWidth: 2, borderColor: colors.greenDark },
  miniLogoText: { color: '#FFFFFF', fontFamily: 'Manrope_800ExtraBold', fontSize: 9 },
  miniLogoMore: { backgroundColor: '#E9F2DC' },
  miniLogoMoreText: { color: colors.green, fontFamily: 'DMSans_600SemiBold', fontSize: 8 },
  heroFooterText: { color: '#9CB2A5', fontFamily: 'DMSans_400Regular', fontSize: 10 },
  smallStat: { flex: 1, minWidth: 195, minHeight: 182, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 20, ...cardShadow },
  smallStatCompact: { minWidth: '46%', minHeight: 169, padding: 16 },
  statIcon: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#EFF5EC', alignItems: 'center', justifyContent: 'center' },
  statIconWarm: { backgroundColor: '#FAF3E8' },
  healthyPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F0F6EC', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5 },
  healthyDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#6E9651' },
  healthyText: { fontFamily: 'DMSans_500Medium', color: '#67804C', fontSize: 9 },
  smallStatLabel: { color: colors.muted, fontFamily: 'DMSans_500Medium', fontSize: 11, marginTop: 14 },
  statValueLine: { flexDirection: 'row', alignItems: 'baseline', gap: 7, marginTop: 3 },
  smallStatValue: { color: colors.ink, fontFamily: 'Manrope_800ExtraBold', fontSize: 29, letterSpacing: -1 },
  statValueSuffix: { color: colors.mutedLight, fontFamily: 'DMSans_400Regular', fontSize: 11 },
  nextWeekAmount: { fontSize: 25, marginTop: 4 },
  smallStatFoot: { color: colors.mutedLight, fontFamily: 'DMSans_400Regular', fontSize: 10, marginTop: 5 },
  contentGrid: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  contentGridStacked: { flexDirection: 'column' },
  mainColumn: { flex: 1, minWidth: 0, width: '100%', gap: 18 },
  aside: { width: 295, flexShrink: 0, gap: 17 },
  asideStacked: { width: '100%' },
  listCard: { backgroundColor: colors.surface, borderRadius: 17, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', width: '100%', ...cardShadow },
  listHeading: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  listTools: { flexDirection: 'row', gap: 9, paddingHorizontal: 20 },
  searchBox: { flex: 1, height: 39, borderRadius: 9, backgroundColor: '#F8F9F7', borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 11 },
  searchInput: { flex: 1, height: 38, color: colors.ink, fontFamily: 'DMSans_400Regular', fontSize: 11, outlineStyle: 'none' } as any,
  filterButton: { width: 39, height: 39, borderRadius: 9, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  filterChips: { gap: 7, paddingHorizontal: 20, paddingVertical: 13 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7, backgroundColor: '#F6F7F5' },
  filterChipActive: { backgroundColor: '#E9F1E5' },
  filterChipText: { fontFamily: 'DMSans_500Medium', color: colors.muted, fontSize: 10 },
  filterChipTextActive: { color: colors.green, fontFamily: 'DMSans_600SemiBold' },
  listRows: { borderTopWidth: 1, borderTopColor: colors.border },
  listFooter: { height: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  listFooterText: { color: colors.green, fontFamily: 'DMSans_600SemiBold', fontSize: 11 },
  emptyState: { alignItems: 'center', padding: 35 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  emptyTitle: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: colors.ink },
  emptyCopy: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.muted, marginTop: 6 },
  clearText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: colors.green, marginTop: 14 },
  upcomingCard: { backgroundColor: colors.surface, borderRadius: 17, borderWidth: 1, borderColor: colors.border, padding: 20, width: '100%', ...cardShadow },
  upcomingList: { marginTop: 9 },
  calendarButton: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 5, paddingTop: 15, flexDirection: 'row', alignItems: 'center', gap: 7 },
  calendarButtonText: { flex: 1, fontFamily: 'DMSans_600SemiBold', fontSize: 10, color: colors.green },
  tipCard: { backgroundColor: '#EDF3E4', borderRadius: 17, padding: 20, width: '100%' },
  tipIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  tipEyebrow: { fontFamily: 'DMSans_600SemiBold', fontSize: 8, letterSpacing: 1.2, color: '#81915F' },
  tipTitle: { fontFamily: 'Manrope_700Bold', fontSize: 16, letterSpacing: -0.3, color: '#31442C', marginTop: 6 },
  tipCopy: { fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 17, color: '#718065', marginTop: 8 },
  tipLink: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 15 },
  tipLinkText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: colors.green },
  secureNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  secureNoteText: { fontFamily: 'DMSans_400Regular', fontSize: 9, color: colors.mutedLight },
  scheduleBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, backgroundColor: '#EDF3E8', borderRadius: 15 },
  scheduleIcon: { width: 45, height: 45, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  scheduleBannerTitle: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: colors.ink },
  scheduleBannerCopy: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.muted, marginTop: 5 },
  insightCard: { backgroundColor: colors.surface, borderRadius: 17, borderWidth: 1, borderColor: colors.border, padding: 23, width: '100%', ...cardShadow },
  insightTotalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 25 },
  insightTotal: { fontFamily: 'Manrope_800ExtraBold', fontSize: 32, letterSpacing: -1, color: colors.ink },
  monthlyPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, backgroundColor: colors.limeSoft },
  monthlyPillText: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: colors.green },
  breakdownList: { gap: 21, marginTop: 27 },
  breakdownItem: { gap: 9 },
  breakdownLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breakdownDot: { width: 7, height: 7, borderRadius: 4 },
  breakdownName: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.inkSoft },
  breakdownAmount: { fontFamily: 'Manrope_700Bold', fontSize: 12, color: colors.ink },
  barTrack: { height: 7, borderRadius: 4, backgroundColor: '#F0F2EF', overflow: 'hidden' },
  barFill: { height: 7, borderRadius: 4 },
  insightSideTitle: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: colors.muted, marginTop: 17 },
  largestMerchant: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  largestName: { flex: 1, fontFamily: 'Manrope_700Bold', fontSize: 14, color: colors.ink },
  largestAmount: { fontFamily: 'Manrope_800ExtraBold', fontSize: 27, color: colors.ink, marginTop: 15, letterSpacing: -0.8 },
  largestFrequency: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.muted },
  largestCopy: { fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 7 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingTop: 29 },
  footerText: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: colors.mutedLight },
  toast: { position: 'absolute', bottom: 24, right: 25, maxWidth: 410, backgroundColor: '#19382B', borderRadius: 12, paddingHorizontal: 17, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10, ...cardShadow },
  toastMobile: { bottom: 79, left: 16, right: 16 },
  toastText: { flex: 1, fontFamily: 'DMSans_500Medium', fontSize: 11, lineHeight: 16, color: '#FFFFFF' },
});
