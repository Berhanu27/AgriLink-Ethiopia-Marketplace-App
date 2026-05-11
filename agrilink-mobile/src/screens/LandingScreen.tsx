import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions, ScrollView, Image } from 'react-native';
import { colors } from '../lib/theme';
import { useApp } from '../context/AppContext';
import t from '../lib/i18n';
import { Listing, TransporterPublic } from '../types';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = width * (9 / 16);

export default function LandingScreen({ navigation }: any) {
  const { language, setLanguage, listings, transporters } = useApp();
  const tr = t[language];

  const adminListings = listings.filter(l => l.farmerId === 'admin');
  const farmerListings = listings.filter(l => l.farmerId !== 'admin');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Top bar with language switcher */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Text style={styles.topLogo}>🌱 AgriLink</Text>
        </View>
        <View style={styles.langRow}>
          {(['en','am','or'] as const).map(l => (
            <TouchableOpacity key={l} onPress={() => setLanguage(l)}
              style={[styles.langBtn, language === l && styles.langBtnActive]}>
              <Text style={[styles.langText, language === l && styles.langTextActive]}>
                {l === 'en' ? 'EN' : l === 'am' ? 'አማ' : 'OR'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Image source={require('../../assets/hero.png')} style={styles.heroImage} resizeMode="contain" />
          <View style={styles.heroOverlay}>
            <View style={styles.badge}><Text style={styles.badgeText}>{tr.badge}</Text></View>
            <Text style={styles.heroTitle}>{tr.heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{tr.heroSubtitle}</Text>
            <View style={styles.trustRow}>
              <TrustPill label={tr.verifiedUsers} />
              <TrustPill label={tr.transparentPricing} />
              <TrustPill label={tr.directContact} />
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.btnPrimaryText}>{tr.getStarted}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.btnSecondaryText}>{tr.alreadyHaveAccount}</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Products */}
        <SectionCard title={tr.adminProducts} subtitle={tr.adminSubtitle} count={adminListings.length} countLabel={tr.items}>
          {adminListings.length === 0
            ? <Text style={styles.empty}>{tr.noAdminListings}</Text>
            : adminListings.map(item => <ListingRow key={item.id} item={item} verifiedLabel={tr.verified} />)}
        </SectionCard>

        {/* Farmer Products */}
        <SectionCard title={tr.featuredProduce} subtitle={tr.featuredSubtitle} count={farmerListings.length} countLabel={tr.items}>
          {farmerListings.length === 0
            ? <Text style={styles.empty}>{tr.noListings}</Text>
            : farmerListings.map(item => <ListingRow key={item} item={item} showFarmer verifiedLabel={tr.verified} />)}
        </SectionCard>

        {/* How it works */}
        <View style={styles.howSection}>
          <Text style={styles.howTitle}>{tr.howItWorks}</Text>
          <View style={styles.stepsRow}>
            <Step icon="🌾" title={tr.farmersListProduce} desc={tr.farmersListDesc} />
            <Step icon="🛒" title={tr.buyersFind} desc={tr.buyersDesc} />
            <Step icon="🚚" title={tr.transportersDeliver} desc={tr.transportersDesc} />
          </View>
        </View>

        {/* Transporters */}
        <SectionCard title={tr.availableTransporters} subtitle={tr.transportersSubtitle} count={transporters.length} countLabel={tr.items}>
          {transporters.length === 0
            ? <Text style={styles.empty}>{tr.noTransporters}</Text>
            : transporters.map(item => <TransporterRow key={item.id} item={item} verifiedLabel={tr.verified} />)}
        </SectionCard>

        {/* Trust section */}
        <View style={styles.trustCard}>
          <Text style={styles.trustIcon}>🛡️</Text>
          <View style={styles.trustBody}>
            <Text style={styles.trustTitle}>{tr.secureMarketplace}</Text>
            <Text style={styles.trustSub}>{tr.secureSubtitle}</Text>
            <View style={styles.trustPills}>
              {[tr.verifiedUsers, tr.transparentPricing, tr.directContact].map(p => (
                <View key={p} style={styles.trustPill}>
                  <Text style={styles.trustPillText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Role cards */}
        <View style={styles.rolesSection}>
          <Text style={styles.rolesTitle}>{tr.continueAs}</Text>
          <Text style={styles.rolesSub}>{tr.chooseRole}</Text>
          <View style={styles.rolesGrid}>
            <RoleCard icon="🌾" title={tr.farmer} desc={tr.farmerDesc} onPress={() => navigation.navigate('Register')} />
            <RoleCard icon="🛒" title={tr.buyer} desc={tr.buyerDesc} onPress={() => navigation.navigate('Register')} />
            <RoleCard icon="🚚" title={tr.transporter} desc={tr.transporterDesc} onPress={() => navigation.navigate('Register')} />
            <RoleCard icon="🤝" title={tr.cooperative} desc={tr.cooperativeDesc} onPress={() => navigation.navigate('Register')} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>🌱 AgriLink Ethiopia</Text>
          <Text style={styles.footerCopy}>© 2026 AgriLink Ethiopia. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function TrustPill({ label }: { label: string }) {
  return (
    <View style={styles.trustPillInline}>
      <Text style={styles.trustLabel}>{label}</Text>
    </View>
  );
}

function ListingRow({ item, showFarmer, verifiedLabel }: { item: Listing; showFarmer?: boolean; verifiedLabel: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowThumb}>
        {item.imageUrl
          ? <Image source={{ uri: item.imageUrl }} style={styles.thumbImg} />
          : <Text style={styles.thumbEmoji}>🌾</Text>}
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowCrop}>{item.cropName}</Text>
          <View style={[styles.statusBadge, item.status === 'active' ? styles.badgeGreen : styles.badgeGray]}>
            <Text style={[styles.badgeText, item.status === 'active' ? styles.badgeTextGreen : styles.badgeTextGray]}>
              {item.status}
            </Text>
          </View>
        </View>
        {showFarmer && (
          <View style={styles.rowDetail}>
            <Text style={styles.rowLabel}>Farmer:</Text>
            <Text style={styles.rowValue}>{item.farmerName}</Text>
          </View>
        )}
        {showFarmer && item.farmerRegion && (
          <View style={styles.rowDetail}>
            <Text style={styles.rowLabel}>Region:</Text>
            <Text style={styles.rowValue}>{item.farmerRegion}</Text>
          </View>
        )}
        <View style={styles.rowDetail}>
          <Text style={styles.rowLabel}>Quantity:</Text>
          <Text style={styles.rowValue}>{item.quantity} {item.unit}</Text>
        </View>
        <View style={styles.rowDetail}>
          <Text style={styles.rowLabel}>Price:</Text>
          <Text style={styles.rowPrice}>{item.pricePerUnit} ETB/{item.unit}</Text>
        </View>
        {item.location && (
          <View style={styles.rowDetail}>
            <Text style={styles.rowLabel}>Location:</Text>
            <Text style={styles.rowValue}>{item.location}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function TransporterRow({ item, verifiedLabel }: { item: TransporterPublic; verifiedLabel: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowThumb}>
        {item.vehicleImageUrl
          ? <Image source={{ uri: item.vehicleImageUrl }} style={styles.thumbImg} />
          : <Text style={styles.thumbEmoji}>🚚</Text>}
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowCrop}>{item.fullName}</Text>
          <View style={[styles.statusBadge, styles.badgeGreen]}>
            <Text style={[styles.badgeText, styles.badgeTextGreen]}>{verifiedLabel}</Text>
          </View>
        </View>
        <View style={styles.rowDetail}>
          <Text style={styles.rowLabel}>Phone:</Text>
          <Text style={styles.rowValue}>{item.phone}</Text>
        </View>
        {item.region && (
          <View style={styles.rowDetail}>
            <Text style={styles.rowLabel}>Region:</Text>
            <Text style={styles.rowValue}>{item.region}</Text>
          </View>
        )}
        {item.vehicleType && (
          <View style={styles.rowDetail}>
            <Text style={styles.rowLabel}>Vehicle Type:</Text>
            <Text style={styles.rowValue}>{item.vehicleType}</Text>
          </View>
        )}
        {item.vehicleCapacity && (
          <View style={styles.rowDetail}>
            <Text style={styles.rowLabel}>Capacity:</Text>
            <Text style={styles.rowPrice}>{item.vehicleCapacity}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function SectionCard({ title, subtitle, count, countLabel, children }: {
  title: string; subtitle: string; count: number; countLabel: string; children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSub}>{subtitle}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count} {countLabel}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function Step({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepIcon}><Text style={styles.stepEmoji}>{icon}</Text></View>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDesc}>{desc}</Text>
    </View>
  );
}

function RoleCard({ icon, title, desc, onPress }: { icon: string; title: string; desc: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.roleCard} onPress={onPress}>
      <Text style={styles.roleIcon}>{icon}</Text>
      <Text style={styles.roleTitle}>{title}</Text>
      <Text style={styles.roleDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const shadow = {
  textShadowColor: 'rgba(0,0,0,0.85)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 8,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  topBar: {
    backgroundColor: colors.primary, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
  },
  logoRow: {},
  topLogo: { fontSize: 18, fontWeight: '800', color: '#fff' },
  langRow: { flexDirection: 'row', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 3 },
  langBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  langBtnActive: { backgroundColor: '#fff' },
  langText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  langTextActive: { color: colors.primary },

  heroContainer: { width, height: HERO_HEIGHT, position: 'relative', backgroundColor: '#000' },
  heroImage: { width, height: HERO_HEIGHT, position: 'absolute', top: 0, left: 0 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600', ...shadow },
  heroTitle: {
    fontSize: 28, fontWeight: '800', color: '#fff',
    textAlign: 'center', marginBottom: 8, lineHeight: 34, ...shadow,
  },
  heroSubtitle: {
    fontSize: 13, color: '#f0fdf4', textAlign: 'center',
    lineHeight: 20, marginBottom: 14, ...shadow,
  },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  trustPillInline: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  trustLabel: { color: '#fff', fontSize: 11, fontWeight: '600', ...shadow },

  cta: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  btnPrimary: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnSecondary: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnSecondaryText: { color: colors.primary, fontSize: 15, fontWeight: '600' },

  sectionCard: {
    backgroundColor: colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', marginHorizontal: 12, marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', padding: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  sectionSub: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  countBadge: {
    backgroundColor: colors.muted, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  countText: { fontSize: 11, color: colors.mutedForeground, fontWeight: '600' },

  row: {
    flexDirection: 'row', 
    alignItems: 'flex-start',
    paddingHorizontal: 14, 
    paddingVertical: 12,
    borderBottomWidth: 1, 
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  rowThumb: {
    width: 56, 
    height: 48, 
    borderRadius: 8,
    backgroundColor: colors.muted, 
    alignItems: 'center',
    justifyContent: 'center', 
    overflow: 'hidden', 
    marginRight: 12,
    flexShrink: 0,
  },
  thumbImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  thumbEmoji: { fontSize: 20 },
  rowBody: { flex: 1 },
  rowHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  rowCrop: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: colors.foreground,
    flex: 1,
    marginRight: 8,
  },
  rowDetail: { 
    flexDirection: 'row', 
    marginBottom: 4,
    alignItems: 'center',
  },
  rowLabel: { 
    fontSize: 11, 
    color: colors.mutedForeground, 
    fontWeight: '600',
    width: 80,
    textTransform: 'uppercase',
  },
  rowValue: { 
    fontSize: 12, 
    color: colors.foreground,
    flex: 1,
  },
  rowPrice: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: colors.primary,
    flex: 1,
  },
  rowMeta: { fontSize: 11, color: colors.mutedForeground, marginTop: 1 },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  rowUnit: { fontSize: 10, color: colors.mutedForeground },

  statusBadge: { 
    borderRadius: 12, 
    paddingHorizontal: 8, 
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },

  badgeGreen: { backgroundColor: '#dcfce7' },
  badgeGray: { backgroundColor: colors.muted },
  badgeTextGreen: { fontSize: 9, fontWeight: '600', color: '#166534', textTransform: 'capitalize' },
  badgeTextGray: { fontSize: 9, fontWeight: '600', color: colors.mutedForeground, textTransform: 'capitalize' },

  empty: { padding: 16, textAlign: 'center', color: colors.mutedForeground, fontSize: 13 },

  howSection: { backgroundColor: colors.muted, padding: 16, marginHorizontal: 12, marginBottom: 12, borderRadius: 14 },
  howTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, textAlign: 'center', marginBottom: 16 },
  stepsRow: { flexDirection: 'row', gap: 8 },
  step: { flex: 1, alignItems: 'center' },
  stepIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  stepEmoji: { fontSize: 18 },
  stepTitle: { fontSize: 11, fontWeight: '700', color: colors.foreground, textAlign: 'center', marginBottom: 2 },
  stepDesc: { fontSize: 10, color: colors.mutedForeground, textAlign: 'center' },

  trustCard: {
    backgroundColor: colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
    padding: 16, flexDirection: 'row', gap: 12, marginHorizontal: 12, marginBottom: 12,
  },
  trustIcon: { fontSize: 36 },
  trustBody: { flex: 1 },
  trustTitle: { fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  trustSub: { fontSize: 12, color: colors.mutedForeground, marginBottom: 10 },
  trustPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  trustPill: {
    backgroundColor: colors.muted, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  trustPillText: { fontSize: 11, color: colors.primary, fontWeight: '600' },

  rolesSection: { padding: 16, marginBottom: 12 },
  rolesTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, textAlign: 'center', marginBottom: 4 },
  rolesSub: { fontSize: 12, color: colors.mutedForeground, textAlign: 'center', marginBottom: 14 },
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleCard: {
    width: '47%', backgroundColor: colors.card, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  roleIcon: { fontSize: 28, marginBottom: 6 },
  roleTitle: { fontSize: 13, fontWeight: '700', color: colors.foreground, marginBottom: 3 },
  roleDesc: { fontSize: 11, color: colors.mutedForeground },

  footer: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, padding: 20, alignItems: 'center', marginBottom: 12 },
  footerLogo: { fontSize: 15, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  footerCopy: { fontSize: 11, color: colors.mutedForeground },
});
