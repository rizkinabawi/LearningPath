import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  Share,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import {
  getUser, getStats, getLearningPaths,
  clearAllData, type User as UserType, type Stats,
} from "@/utils/storage";
import Colors, { shadow } from "@/constants/colors";

export default function ProfileTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pathCount, setPathCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [u, s, paths] = await Promise.all([getUser(), getStats(), getLearningPaths()]);
        setUser(u); setStats(s); setPathCount(paths.length);
      })();
    }, [])
  );

  const accuracy = stats && stats.totalAnswers > 0
    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;

  const STAT_ITEMS = [
    { label: "Jalur", value: pathCount, emoji: "📚" },
    { label: "Jawaban", value: stats?.totalAnswers ?? 0, emoji: "💬" },
    { label: "Akurasi", value: `${accuracy}%`, emoji: "🎯" },
    { label: "Streak", value: stats?.streak ?? 0, emoji: "🔥" },
  ];

  const MENU: { icon: string; label: string; color: string; onPress: () => void }[] = [
    {
      icon: "share-2", label: "Bagikan Progress", color: Colors.primary,
      onPress: async () => {
        await Share.share({ message: `Saya sudah menjawab ${stats?.totalAnswers ?? 0} soal dengan akurasi ${accuracy}% di Mobile Learning! 📚` });
      },
    },
    {
      icon: "refresh-cw", label: "Reset Profil", color: Colors.warning,
      onPress: () =>
        Alert.alert("Reset Profil", "Profil akan direset, data belajar tetap ada.", [
          { text: "Batal", style: "cancel" },
          {
            text: "Reset",
            onPress: async () => {
              const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
              await AsyncStorage.removeItem("user");
              router.replace("/onboarding");
            },
          },
        ]),
    },
    {
      icon: "trash-2", label: "Hapus Semua Data", color: Colors.danger,
      onPress: () =>
        Alert.alert(
          "Hapus Semua Data",
          "Semua jalur belajar, flashcard, kuis, dan progress akan dihapus. Tidak bisa dibatalkan.",
          [
            { text: "Batal", style: "cancel" },
            { text: "Hapus", style: "destructive", onPress: async () => { await clearAllData(); router.replace("/onboarding"); } },
          ]
        ),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Platform.OS === "web" ? 80 : insets.top + 16, paddingBottom: 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero profile card */}
      <View style={styles.heroCard}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarEmoji}>🎓</Text>
        </View>
        <Text style={styles.profileName}>{user?.name ?? "Learner"}</Text>
        <Text style={styles.profileSub}>{user?.topic ?? "—"}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{user?.level ?? "beginner"}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsCard}>
        {STAT_ITEMS.map((s, i) => (
          <React.Fragment key={s.label}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
            {i < STAT_ITEMS.length - 1 && <View style={styles.statDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Goal card */}
      {user?.goal && (
        <View style={styles.goalCard}>
          <View style={styles.goalIcon}>
            <Text style={{ fontSize: 24 }}>🎯</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.goalLabel}>Target Belajar</Text>
            <Text style={styles.goalText}>{user.goal}</Text>
          </View>
        </View>
      )}

      {/* Menu */}
      <Text style={styles.sectionTitle}>Pengaturan</Text>
      <View style={styles.menuCard}>
        {MENU.map((item, i) => (
          <React.Fragment key={item.label}>
            <TouchableOpacity
              onPress={item.onPress}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}>
                <Feather name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, item.color === Colors.danger && { color: Colors.danger }]}>
                {item.label}
              </Text>
              <Feather name="chevron-right" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            {i < MENU.length - 1 && <View style={styles.menuDivider} />}
          </React.Fragment>
        ))}
      </View>

      <Text style={styles.footer}>Mobile Learning · v1.0 · Made with ❤️</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  heroCard: {
    backgroundColor: Colors.dark,
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    marginBottom: 16,
    ...shadow,
    shadowColor: Colors.dark,
    shadowOpacity: 0.3,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarEmoji: { fontSize: 40 },
  profileName: { fontSize: 24, fontWeight: "900", color: Colors.white, marginBottom: 4 },
  profileSub: { fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: "500", marginBottom: 12 },
  levelBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  levelText: { fontSize: 12, fontWeight: "800", color: Colors.white, textTransform: "capitalize" },
  statsCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    ...shadow,
    shadowOpacity: 0.06,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: 20, fontWeight: "900", color: Colors.dark },
  statLabel: { fontSize: 11, fontWeight: "700", color: Colors.textMuted, textTransform: "uppercase" },
  statDivider: { width: 1, backgroundColor: Colors.border },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadow,
    shadowOpacity: 0.04,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  goalLabel: { fontSize: 11, fontWeight: "800", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  goalText: { fontSize: 14, fontWeight: "700", color: Colors.dark },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: Colors.dark, marginBottom: 10 },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    ...shadow,
    shadowOpacity: 0.06,
  },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 18, gap: 14 },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "700", color: Colors.dark },
  menuDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 18 },
  footer: { textAlign: "center", fontSize: 12, color: Colors.textMuted, fontWeight: "500" },
});
