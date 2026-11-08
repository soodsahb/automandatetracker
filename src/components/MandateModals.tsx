import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ExternalLink,
  Link2,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import type { Mandate, MandateCategory } from '../data/mandates';
import { cardShadow, colors, formatCurrency, formatShortDate } from '../theme';
import { MerchantLogo } from './MandateUI';

function ModalShell({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close dialog" />
      <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.modalCard, wide && styles.modalCardWide]}>
          <Pressable onPress={onClose} style={styles.closeButton} accessibilityLabel="Close">
            <X size={20} color={colors.inkSoft} />
          </Pressable>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function MandateDetailsModal({ mandate, onClose, onOpenMerchant, onMarkCancelled }: {
  mandate: Mandate | null;
  onClose: () => void;
  onOpenMerchant: (mandate: Mandate) => Promise<void>;
  onMarkCancelled: (mandate: Mandate) => void;
}) {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    setOpened(false);
    setOpening(false);
  }, [mandate?.id]);

  if (!mandate) return null;
  const cancelled = mandate.status === 'cancelled';

  const openMerchant = async () => {
    setOpening(true);
    try {
      await onOpenMerchant(mandate);
      setOpened(true);
    } catch {
      setOpened(false);
    } finally {
      setOpening(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <ModalShell onClose={onClose}>
        <View style={styles.detailHeader}>
          <MerchantLogo mandate={mandate} size={62} />
          <View style={[styles.activePill, cancelled && styles.cancelledPill]}>
            <View style={[styles.activeDot, cancelled && styles.cancelledDot]} />
            <Text style={[styles.activePillText, cancelled && styles.cancelledPillText]}>
              {cancelled ? 'Cancelled' : 'Active mandate'}
            </Text>
          </View>
          <Text style={styles.detailName}>{mandate.name}</Text>
          <Text style={styles.detailCategory}>{mandate.category} · {mandate.frequency}</Text>
        </View>

        <View style={styles.amountPanel}>
          <View>
            <Text style={styles.amountLabel}>{mandate.frequency.toUpperCase()} AMOUNT</Text>
            <Text style={styles.detailAmount}>{formatCurrency(mandate.amount)}</Text>
          </View>
          <View style={styles.nextDebitBox}>
            <CalendarDays size={17} color={colors.green} />
            <View>
              <Text style={styles.nextDebitLabel}>{cancelled ? 'No upcoming debit' : 'Next debit'}</Text>
              <Text style={styles.nextDebitValue}>{cancelled ? '—' : formatShortDate(mandate.nextDebit)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <DetailItem label="PAYMENT METHOD" value={mandate.paymentMethod} />
          <DetailItem label="MANDATE REFERENCE" value={mandate.reference} />
          <DetailItem label="LAST DEBIT" value={formatShortDate(mandate.lastDebit)} />
          <DetailItem label="BILLING FREQUENCY" value={mandate.frequency} />
        </View>

        {opened && !cancelled ? (
          <View style={styles.openedPanel}>
            <CheckCircle2 size={25} color={colors.green} />
            <Text style={styles.openedTitle}>{mandate.name} is open</Text>
            <Text style={styles.openedCopy}>
              Follow their steps to cancel the autopay. Once you’re done, update your records here.
            </Text>
            <Pressable style={styles.primaryButton} onPress={() => onMarkCancelled(mandate)}>
              <Check size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>I’ve cancelled this mandate</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>I’ll do it later</Text>
            </Pressable>
          </View>
        ) : cancelled ? (
          <View style={styles.infoPanel}>
            <CheckCircle2 size={19} color={colors.green} />
            <Text style={styles.infoCopy}>This mandate is marked cancelled in Mandate. No future debits are included in your totals.</Text>
          </View>
        ) : (
          <>
            <View style={styles.infoPanel}>
              <ShieldCheck size={20} color={colors.green} />
              <Text style={styles.infoCopy}>
                You’ll manage this directly with {mandate.name}. We never ask for your banking password or OTP.
              </Text>
            </View>
            <Pressable style={styles.primaryButton} onPress={openMerchant} disabled={opening}>
              {opening ? <ActivityIndicator color="#FFFFFF" /> : <ExternalLink size={18} color="#FFFFFF" />}
              <Text style={styles.primaryButtonText}>{opening ? 'Opening…' : `Open ${mandate.name} to manage`}</Text>
            </Pressable>
            <Text style={styles.actionHint}>Opens the merchant’s app when available, or their secure website.</Text>
          </>
        )}
      </ModalShell>
    </Modal>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailItemLabel}>{label}</Text>
      <Text style={styles.detailItemValue}>{value}</Text>
    </View>
  );
}

export type NewMandateInput = {
  name: string;
  amount: number;
  category: MandateCategory;
  frequency: Mandate['frequency'];
  nextDebit: string;
  paymentMethod: string;
  manageUrl: string;
};

const categories: MandateCategory[] = ['Entertainment', 'Utilities', 'Finance', 'Health', 'Software'];

export function AddMandateModal({ visible, onClose, onAdd }: {
  visible: boolean;
  onClose: () => void;
  onAdd: (input: NewMandateInput) => void;
}) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [nextDebit, setNextDebit] = useState('2026-12-08');
  const [paymentMethod, setPaymentMethod] = useState('HDFC Bank •• 4242');
  const [manageUrl, setManageUrl] = useState('https://');
  const [category, setCategory] = useState<MandateCategory>('Entertainment');
  const [frequency, setFrequency] = useState<Mandate['frequency']>('Monthly');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) setError('');
  }, [visible]);

  const submit = () => {
    if (!name.trim()) return setError('Add the merchant or biller name.');
    if (!Number(amount) || Number(amount) < 1) return setError('Enter a valid autopay amount.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDebit) || Number.isNaN(new Date(`${nextDebit}T12:00:00`).getTime())) {
      return setError('Use YYYY-MM-DD for the next debit date.');
    }
    if (!/^https?:\/\/.+\..+/.test(manageUrl)) return setError('Add a valid merchant website, including https://.');
    onAdd({ name: name.trim(), amount: Number(amount), category, frequency, nextDebit, paymentMethod: paymentMethod.trim() || 'Not specified', manageUrl });
    setName('');
    setAmount('');
    setManageUrl('https://');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <ModalShell onClose={onClose} wide>
        <View style={styles.addIcon}><Building2 size={23} color={colors.green} /></View>
        <Text style={styles.addTitle}>Add a mandate</Text>
        <Text style={styles.addSubtitle}>Keep every recurring payment in one calm place.</Text>
        <View style={styles.formGrid}>
          <Field label="MERCHANT OR BILLER" style={styles.fullField}>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. Amazon Prime" placeholderTextColor={colors.mutedLight} style={styles.input} autoFocus />
          </Field>
          <Field label="AMOUNT (₹)">
            <TextInput value={amount} onChangeText={setAmount} placeholder="0" keyboardType="numeric" placeholderTextColor={colors.mutedLight} style={styles.input} />
          </Field>
          <Field label="NEXT DEBIT">
            <TextInput value={nextDebit} onChangeText={setNextDebit} placeholder="YYYY-MM-DD" placeholderTextColor={colors.mutedLight} style={styles.input} />
          </Field>
          <Field label="PAYMENT METHOD" style={styles.fullField}>
            <TextInput value={paymentMethod} onChangeText={setPaymentMethod} placeholder="Bank or card" placeholderTextColor={colors.mutedLight} style={styles.input} />
          </Field>
          <Field label="MERCHANT MANAGE PAGE" style={styles.fullField}>
            <View style={styles.inputWithIcon}>
              <Link2 size={17} color={colors.mutedLight} />
              <TextInput value={manageUrl} onChangeText={setManageUrl} placeholder="https://merchant.com/account" autoCapitalize="none" keyboardType="url" placeholderTextColor={colors.mutedLight} style={[styles.input, styles.inputInner]} />
            </View>
          </Field>
        </View>
        <Text style={styles.fieldLabel}>CATEGORY</Text>
        <View style={styles.choiceRow}>
          {categories.map((item) => (
            <Pressable key={item} onPress={() => setCategory(item)} style={[styles.choiceChip, category === item && styles.choiceChipActive]}>
              <Text style={[styles.choiceText, category === item && styles.choiceTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.fieldLabel, { marginTop: 18 }]}>FREQUENCY</Text>
        <View style={styles.choiceRow}>
          {(['Monthly', 'Quarterly', 'Yearly'] as const).map((item) => (
            <Pressable key={item} onPress={() => setFrequency(item)} style={[styles.choiceChip, frequency === item && styles.choiceChipActive]}>
              <Text style={[styles.choiceText, frequency === item && styles.choiceTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.formActions}>
          <Pressable onPress={onClose} style={styles.cancelButton}><Text style={styles.cancelButtonText}>Cancel</Text></Pressable>
          <Pressable onPress={submit} style={[styles.primaryButton, styles.addButton]}>
            <Text style={styles.primaryButtonText}>Add mandate</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </ModalShell>
    </Modal>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: object }) {
  return <View style={[styles.field, style]}><Text style={styles.fieldLabel}>{label}</Text>{children}</View>;
}

export function HelpModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <ModalShell onClose={onClose}>
        <View style={styles.addIcon}><ShieldCheck size={24} color={colors.green} /></View>
        <Text style={styles.addTitle}>Your money stays yours.</Text>
        <Text style={styles.addSubtitle}>Mandate is your organiser, not a payment app.</Text>
        {[
          ['Add your autopays', 'Keep the amount, biller and next debit date together.'],
          ['Get a clear view', 'See what’s active and what’s coming up, without digging through statements.'],
          ['Cancel at the source', 'We open the merchant’s app or website. Follow their steps, then mark the mandate cancelled here.'],
        ].map(([title, copy], index) => (
          <View style={styles.helpStep} key={title}>
            <View style={styles.helpStepNumber}><Text style={styles.helpStepNumberText}>{index + 1}</Text></View>
            <View style={{ flex: 1 }}><Text style={styles.helpStepTitle}>{title}</Text><Text style={styles.helpStepCopy}>{copy}</Text></View>
          </View>
        ))}
        <Pressable style={styles.primaryButton} onPress={onClose}><Text style={styles.primaryButtonText}>Got it</Text><Check size={18} color="#FFFFFF" /></Pressable>
      </ModalShell>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(13, 28, 21, 0.52)' },
  modalScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 510, backgroundColor: colors.surface, borderRadius: 24, padding: 28, ...cardShadow },
  modalCardWide: { maxWidth: 580 },
  closeButton: { position: 'absolute', right: 18, top: 18, zIndex: 2, width: 35, height: 35, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  detailHeader: { alignItems: 'center', paddingTop: 6 },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, backgroundColor: '#EDF5EE', paddingHorizontal: 10, paddingVertical: 5, marginTop: 14 },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#4B8B67' },
  activePillText: { fontFamily: 'DMSans_600SemiBold', fontSize: 10, color: colors.green },
  cancelledPill: { backgroundColor: '#F0F1F0' },
  cancelledDot: { backgroundColor: colors.mutedLight },
  cancelledPillText: { color: colors.muted },
  detailName: { fontFamily: 'Manrope_800ExtraBold', fontSize: 25, color: colors.ink, letterSpacing: -0.7, marginTop: 12, textAlign: 'center' },
  detailCategory: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.muted, marginTop: 5 },
  amountPanel: { backgroundColor: '#F2F6EF', borderRadius: 16, padding: 20, marginTop: 23, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  amountLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 9, letterSpacing: 1.2, color: colors.muted },
  detailAmount: { fontFamily: 'Manrope_800ExtraBold', fontSize: 29, color: colors.greenDark, letterSpacing: -1, marginTop: 5 },
  nextDebitBox: { flexDirection: 'row', alignItems: 'center', gap: 9, borderLeftWidth: 1, borderLeftColor: '#DCE5D7', paddingLeft: 18 },
  nextDebitLabel: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: colors.muted },
  nextDebitValue: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: colors.inkSoft, marginTop: 4 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailItem: { width: '50%', gap: 6, paddingVertical: 9 },
  detailItemLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 8, letterSpacing: 0.9, color: colors.mutedLight },
  detailItemValue: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.inkSoft },
  infoPanel: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#F7F9F6', borderRadius: 12, padding: 13, marginVertical: 18 },
  infoCopy: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 17, color: colors.muted },
  primaryButton: { backgroundColor: colors.green, minHeight: 49, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 18 },
  primaryButtonText: { color: '#FFFFFF', fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
  actionHint: { fontFamily: 'DMSans_400Regular', fontSize: 10, lineHeight: 15, color: colors.mutedLight, textAlign: 'center', marginTop: 11 },
  secondaryButton: { alignItems: 'center', padding: 13 },
  secondaryButtonText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: colors.muted },
  openedPanel: { marginTop: 20, alignItems: 'center' },
  openedTitle: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: colors.ink, marginTop: 10 },
  openedCopy: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 19, color: colors.muted, textAlign: 'center', marginVertical: 9, marginBottom: 19, maxWidth: 350 },
  addIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.limeSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  addTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 24, letterSpacing: -0.6, color: colors.ink },
  addSubtitle: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 19, color: colors.muted, marginTop: 7, marginBottom: 24 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  field: { flex: 1, minWidth: 190, gap: 8 },
  fullField: { minWidth: '100%' },
  fieldLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 9, color: colors.muted, letterSpacing: 0.8 },
  input: { height: 45, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 13, backgroundColor: '#FBFCFB', color: colors.ink, fontFamily: 'DMSans_400Regular', fontSize: 13, outlineStyle: 'none' } as any,
  inputWithIcon: { height: 45, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingLeft: 13, backgroundColor: '#FBFCFB', flexDirection: 'row', alignItems: 'center' },
  inputInner: { flex: 1, borderWidth: 0, backgroundColor: 'transparent' },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 9 },
  choiceChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: '#FFFFFF' },
  choiceChipActive: { backgroundColor: '#EBF3E8', borderColor: '#BCD1B3' },
  choiceText: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: colors.muted },
  choiceTextActive: { color: colors.green, fontFamily: 'DMSans_600SemiBold' },
  errorText: { color: colors.danger, fontFamily: 'DMSans_500Medium', fontSize: 11, marginTop: 16 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 25, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border },
  cancelButton: { paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { color: colors.muted, fontFamily: 'DMSans_600SemiBold', fontSize: 12 },
  addButton: { minWidth: 150 },
  helpStep: { flexDirection: 'row', gap: 13, marginBottom: 22 },
  helpStepNumber: { width: 29, height: 29, borderRadius: 10, backgroundColor: colors.limeSoft, alignItems: 'center', justifyContent: 'center' },
  helpStepNumberText: { fontFamily: 'Manrope_700Bold', fontSize: 12, color: colors.green },
  helpStepTitle: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: colors.ink },
  helpStepCopy: { fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 4 },
});
