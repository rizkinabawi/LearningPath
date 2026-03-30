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
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getUser, getStats, getLearningPaths, clearAllData,
  type User as UserType, type Stats,
} from "@/utils/storage";
import Colors from "@/constants/colors";

export default function ProfileTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pathCount, setPathCount] = useState(0);

  useFocusEffect(useCallback(() => {
    (async () => {
      const [u, s, paths] = await Promise.all([getUser(), getStats(), getLearningPaths()]);
      setUser(u); setStats(s); setPathCount(paths.length);
    })();
  }, []));

  const accuracy = stats && stats.totalAnswers > 0 ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;

  const MENU = [
    { icon: "share-2" as const, label: "Bagikan Progress", sub: "Ceritakan pencapaianmu", color: "#4A9EFF", onPress: async () => Share.share({ message: `Akurasi saya ${accuracy}% dengan ${stats?.totalAnswers ?? 0} jawaban di Mobile Learning! 🎓` }) },
    { icon: "refresh-cw" as const, label: "Reset Profil", sub: "Data belajar tetap tersimpan", color: "#FF9500", onPress: () => Alert.alert("Reset Profil", "Reset profil pengguna?", [
      { text: "Batal", style: "cancel" },
      { text: "Reset", onPress: async () => { const AS = (await import("@react-native-async-storage/async-storage")).default; await AS.removeItem("user"); router.replace("/onboarding"); } },
    ])},
    { icon: "trash-2" as const, label: "Hapus Semua Data", sub: "Tindakan ini tidak bisa dibatalkan", color: "#EF4444", onPress: () => Alert.alert("Hapus Semua Data", "Semua data akan dihapus permanen.", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: async () => { await clearAllData(); router.replace("/onboarding"); } },
    ]) },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* GRADIENT HEADER */}
      <LinearGradient
        colors={["#0A1628", "#0D2045", "#1A3066"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGrad, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 12 }]}
      >
        <View style={styles.hdot1} /><View style={styles.hdot2} />
        <View style={styles.profileHero}>
          <LinearGradient colors={["#4A9EFF", "#6C63FF"]} style={styles.avatarGrad}>
            <Text style={styles.avatarInitial}>{(user?.name ?? "L").charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.name ?? "Learner"}</Text>
            <View style={styles.profileBadges}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user?.level ?? "beginner"}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: "rgba(10,211,193,0.25)" }]}>
                <Text style={styles.badgeText}>{user?.topic ?? "—"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats bar */}
        <View style={styles.statsBar}>
          {[
            { val: pathCount, lbl: "Kursus" },
            { val: stats?.totalAnswers ?? 0, lbl: "Dijawab" },
            { val: `${accuracy}%`, lbl: "Akurasi" },
            { val: `${stats?.streak ?? 0}🔥`, lbl: "Streak" },
          ].map((s, i) => (
            <View key={i} style={[styles.statItem, i < 3 && styles.statItemBorder]}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Goal card */}
        {user?.goal && (
          <View style={styles.goalCard}>
            <View style={styles.goalIcon}>
              <Text style={{ fontSize: 22 }}>🎯</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalLabel}>Target Belajar</Text>
              <Text style={styles.goalText}>{user.goal}</Text>
            </View>
          </View>
        )}

        {/* Progress summary */}
        <View style={styles.progressCard}>
          <View style={styles.progressCardHead}>
            <Text style={styles.progressCardTitle}>Ringkasan Progress</Text>
            <Text style={styles.progressCardVal}>{accuracy}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${accuracy}%` as any, backgroundColor: accuracy >= 80 ? "#0AD3C1" : accuracy >= 50 ? "#FF9500" : "#FF6B6B" }]} />
          </View>
          <Text style={styles.progressCardSub}>{stats?.correctAnswers ?? 0} benar · {(stats?.totalAnswers ?? 0) - (stats?.correctAnswers ?? 0)} salah</Text>
        </View>

        {/* Menu */}
        <Text style={styles.menuLabel}>Pengaturan</Text>
        <View style={styles.menuCard}>
          {MENU.map((item, i) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity onPress={item.onPress} style={styles.menuItem} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + "18" }]}>
                  <Feather name={item.icon} size={18} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuItemTitle, item.color === "#EF4444" && { color: "#EF4444" }]}>{item.label}</Text>
                  <Text style={styles.menuItemSub}>{item.sub}</Text>
                </View>
                <Feather name="chevron-right" size={15} color={Colors.textMuted} />
              </TouchableOpacity>
              {i < MENU.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.footer}>Mobile Learning · v1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerGrad: { paddingHorizontal: 20, paddingBottom: 0, overflow: "hidden" },
  hdot1: { position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(74,158,255,0.1)", top: -40, right: -40 },
  hdot2: { position: "absolute", width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(108,99,255,0.08)", top: 10, right: 60 },
  profileHero: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  avatarGrad: { width: 68, height: 68, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 28, fontWeight: "900", color: "#fff" },
  profileName: { fontSize: 22, fontWeight: "900", color: "#fff", marginBottom: 8 },
  profileBadges: { flexDirection: "row", gap: 8 },
  badge: { backgroundColor: "rgba(74,158,255,0.25)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "800", color: "#fff", textTransform: "capitalize" },
  statsBar: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  statItem: { flex: 1, paddingVertical: 14, alignItems: "center" },
  statItemBorder: { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.1)" },
  statVal: { fontSize: 18, fontWeight: "900", color: "#fff" },
  statLbl: { fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: "700", textTransform: "uppercase", marginTop: 2 },
  body: { padding: 16, gap: 12 },
  goalCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#fff", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border },
  goalIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.accentLight, alignItems: "center", justifyContent: "center" },
  goalLabel: { fontSize: 10, fontWeight: "800", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  goalText: { fontSize: 14, fontWeight: "700", color: Colors.dark },
  progressCard: { backgroundColor: "#fff", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  progressCardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressCardTitle: { fontSize: 12, fontWeight: "800", color: Colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  progressCardVal: { fontSize: 22, fontWeight: "900", color: Colors.dark },
  progressBarTrack: { height: 8, backgroundColor: Colors.border, borderRadius: 999, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 999 },
  progressCardSub: { fontSize: 12, color: Colors.textMuted, fontWeight: "600" },
  menuLabel: { fontSize: 12, fontWeight: "800", color: Colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: -4 },
  menuCard: { backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: Colors.border },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuItemTitle: { fontSize: 14, fontWeight: "800", color: Colors.dark },
  menuItemSub: { fontSize: 11, color: Colors.textMuted, fontWeight: "500", marginTop: 1 },
  menuDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  footer: { textAlign: "center", fontSize: 11, color: Colors.textMuted, fontWeight: "600", paddingTop: 8, paddingBottom: 24 },
});
