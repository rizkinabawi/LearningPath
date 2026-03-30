import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import {
  getUser, getLearningPaths, getStats, getWrongAnswers,
  type User, type LearningPath, type Stats,
} from "@/utils/storage";
import Colors, { shadow, shadowSm, CARD_GRADIENTS } from "@/constants/colors";
import { ProgressBar } from "@/components/ProgressBar";

const { width } = Dimensions.get("window");
const CARD_W = width * 0.72;

const COURSE_ICONS: React.ComponentProps<typeof Feather>["name"][] = [
  "book", "code", "globe", "cpu", "layers", "award",
];

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [u, p, s, w] = await Promise.all([
      getUser(), getLearningPaths(), getStats(), getWrongAnswers(),
    ]);
    if (!u) { router.replace("/onboarding"); return; }
    setUser(u); setPaths(p); setStats(s); setWrongCount(w.length);
  };

  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const accuracy = stats && stats.totalAnswers > 0
    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam";
  const firstName = user?.name?.split(" ")[0] ?? "Learner";

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* ── HEADER ── */}
        <LinearGradient
          colors={["#4C6FFF", "#7C47FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: Platform.OS === "web" ? 56 : insets.top + 16 }]}
        >
          <View style={styles.hBlob1} />
          <View style={styles.hBlob2} />
          <View style={styles.hBlob3} />

          {/* Top row */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greet}>{greet} 👋</Text>
              <Text style={styles.name}>{firstName}</Text>
            </View>
            <View style={styles.headerRight}>
              {wrongCount > 0 && (
                <TouchableOpacity
                  style={styles.bellWrap}
                  onPress={() => router.push("/mistakes-review" as any)}
                >
                  <Feather name="bell" size={20} color="#fff" />
                  <View style={styles.bellDot} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.avatar}>
                <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress summary strip */}
          <View style={styles.statsStrip}>
            {[
              { icon: "activity" as const, val: `${stats?.streak ?? 0}`, sub: "Hari Streak" },
              { icon: "check-circle" as const, val: `${accuracy}%`, sub: "Akurasi" },
              { icon: "message-square" as const, val: `${stats?.totalAnswers ?? 0}`, sub: "Jawaban" },
              { icon: "book" as const, val: `${paths.length}`, sub: "Kursus" },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <View style={styles.statIconWrap}>
                  <Feather name={s.icon} size={14} color="rgba(255,255,255,0.85)" />
                </View>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ── CONTINUE LEARNING ── */}
        {paths.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Lanjutkan Belajar</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/learn")} style={styles.seeAll}>
                <Text style={styles.seeAllText}>Lihat Semua</Text>
                <Feather name="chevron-right" size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push("/(tabs)/learn")}
              style={[styles.continueCard, shadow]}
            >
              <LinearGradient
                colors={CARD_GRADIENTS[0]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.continueGrad}
              >
                <View style={styles.cBlob1} />
                <View style={styles.cBlob2} />
                <View style={styles.continueTop}>
                  <View style={styles.continueBadge}>
                    <Feather name="play" size={10} color="#fff" />
                    <Text style={styles.continueBadgeText}>Lanjutkan</Text>
                  </View>
                  <View style={styles.continueArrow}>
                    <Feather name="arrow-right" size={16} color="#fff" />
                  </View>
                </View>
                <Text style={styles.continueName} numberOfLines={2}>{paths[0].name}</Text>
                <Text style={styles.continueSub} numberOfLines={1}>{paths[0].description || user?.topic || "Kursus aktif"}</Text>
                <View style={styles.continueProgress}>
                  <View style={styles.continueBar}>
                    <View style={[styles.continueBarFill, { width: `${Math.min(accuracy, 100)}%` }]} />
                  </View>
                  <Text style={styles.continueBarText}>{accuracy}% selesai</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MISTAKES ALERT ── */}
        {wrongCount > 0 && (
          <View style={styles.sectionPad}>
            <TouchableOpacity
              onPress={() => router.push("/mistakes-review" as any)}
              activeOpacity={0.85}
              style={[styles.alertCard, shadow]}
            >
              <View style={styles.alertIconWrap}>
                <Feather name="alert-circle" size={18} color={Colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>{wrongCount} soal perlu direview</Text>
                <Text style={styles.alertSub}>Perkuat pemahaman kamu sekarang</Text>
              </View>
              <View style={styles.alertPill}>
                <Text style={styles.alertPillText}>Review</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MY COURSES ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Koleksi Kursus</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/learn")} style={styles.seeAll}>
              <Text style={styles.seeAllText}>+ Tambah</Text>
            </TouchableOpacity>
          </View>

          {paths.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.courseScroll}
            >
              {paths.map((path, i) => (
                <TouchableOpacity
                  key={path.id}
                  activeOpacity={0.85}
                  onPress={() => router.push("/(tabs)/learn")}
                  style={[styles.courseCard, shadowSm]}
                >
                  <LinearGradient
                    colors={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
                    style={styles.courseIconWrap}
                  >
                    <Feather name={COURSE_ICONS[i % COURSE_ICONS.length]} size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.courseName} numberOfLines={2}>{path.name}</Text>
                  <Text style={styles.courseSub} numberOfLines={1}>{path.description || user?.topic || "—"}</Text>
                  <View style={styles.courseFooter}>
                    <Feather name="chevron-right" size={13} color={Colors.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
              {/* Add new */}
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/learn")}
                style={[styles.courseCardAdd, shadowSm]}
                activeOpacity={0.8}
              >
                <View style={styles.addIcon}>
                  <Feather name="plus" size={22} color={Colors.primary} />
                </View>
                <Text style={styles.addText}>Tambah{"\n"}Kursus</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/learn")}
              activeOpacity={0.85}
              style={[styles.emptyCard, shadow]}
            >
              <LinearGradient colors={["#4C6FFF", "#7C47FF"]} style={styles.emptyGrad}>
                <View style={styles.cBlob1} /><View style={styles.cBlob2} />
                <Feather name="plus-circle" size={34} color="rgba(255,255,255,0.9)" />
                <Text style={styles.emptyTitle}>Buat Kursus Pertama</Text>
                <Text style={styles.emptySub}>Tap untuk memulai jalur belajarmu</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* ── DAILY CHALLENGE ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Challenge</Text>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/(tabs)/practice")}
            style={[styles.challengeCard, shadow]}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF9500"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.challengeGrad}
            >
              <View style={styles.cBlob1} /><View style={styles.cBlob2} />
              <View style={styles.challengeLeft}>
                <View style={styles.challengeIconWrap}>
                  <Feather name="zap" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.challengeTitle}>5 Soal Kilat</Text>
                  <Text style={styles.challengeSub}>~10 menit · Semua topik</Text>
                </View>
              </View>
              <View style={styles.challengeBtn}>
                <Text style={styles.challengeBtnText}>Mulai</Text>
                <Feather name="arrow-right" size={14} color="#FF6B6B" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── QUICK ACTIONS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu Cepat</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: "credit-card" as const, label: "Flashcard", color: Colors.primary, bg: Colors.primaryLight, route: "/(tabs)/practice" },
              { icon: "help-circle" as const, label: "Quiz", color: Colors.amber, bg: Colors.amberLight, route: "/(tabs)/practice" },
              { icon: "bar-chart-2" as const, label: "Progress", color: Colors.teal, bg: Colors.tealLight, route: "/(tabs)/progress" },
              { icon: "file-text" as const, label: "PDF Report", color: Colors.purple, bg: Colors.purpleLight, route: "/(tabs)/progress" },
            ].map((q, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => router.push(q.route as any)}
                style={[styles.quickItem, shadowSm]}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIcon, { backgroundColor: q.bg }]}>
                  <Feather name={q.icon} size={20} color={q.color} />
                </View>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── GOAL CARD ── */}
        {user?.goal && (
          <View style={styles.section}>
            <View style={[styles.goalCard, shadowSm]}>
              <View style={[styles.goalIcon, { backgroundColor: Colors.primaryLight }]}>
                <Feather name="target" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.goalLabel}>Target Belajar</Text>
                <Text style={styles.goalText} numberOfLines={2}>{user.goal}</Text>
                <Text style={styles.goalMeta}>{user.topic} · {user.level}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  /* header */
  header: { paddingHorizontal: 20, paddingBottom: 24, overflow: "hidden" },
  hBlob1: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.08)", top: -70, right: -60 },
  hBlob2: { position: "absolute", width: 130, height: 130, borderRadius: 65, backgroundColor: "rgba(255,255,255,0.06)", top: 30, right: 60 },
  hBlob3: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.04)", bottom: 10, left: 30 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 22 },
  greet: { fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: "600", marginBottom: 2 },
  name: { fontSize: 28, fontWeight: "900", color: "#fff", letterSpacing: -0.6 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  bellWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  bellDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF6B6B", position: "absolute", top: 7, right: 7, borderWidth: 1.5, borderColor: "#4C6FFF" },
  avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" },
  avatarText: { fontSize: 17, fontWeight: "900", color: "#fff" },
  statsStrip: { flexDirection: "row", gap: 0, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 18, overflow: "hidden" },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 12, gap: 2 },
  statIconWrap: { width: 26, height: 26, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 2 },
  statVal: { fontSize: 15, fontWeight: "900", color: "#fff" },
  statSub: { fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: "700", textTransform: "uppercase", textAlign: "center" },

  /* sections */
  section: { paddingHorizontal: 16, marginTop: 22 },
  sectionPad: { paddingHorizontal: 16, marginTop: 14 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: Colors.dark, letterSpacing: -0.4, marginBottom: 0 },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { fontSize: 13, fontWeight: "700", color: Colors.primary },

  /* continue learning */
  continueCard: { borderRadius: 24, overflow: "hidden" },
  continueGrad: { padding: 22, minHeight: 160, overflow: "hidden" },
  cBlob1: { position: "absolute", width: 130, height: 130, borderRadius: 65, backgroundColor: "rgba(255,255,255,0.1)", top: -30, right: -30 },
  cBlob2: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.07)", bottom: -20, left: 20 },
  continueTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  continueBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  continueBadgeText: { fontSize: 11, fontWeight: "800", color: "#fff" },
  continueArrow: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  continueName: { fontSize: 20, fontWeight: "900", color: "#fff", letterSpacing: -0.4, marginBottom: 4 },
  continueSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: "500", marginBottom: 14 },
  continueProgress: { flexDirection: "row", alignItems: "center", gap: 10 },
  continueBar: { flex: 1, height: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.25)" },
  continueBarFill: { height: "100%", borderRadius: 999, backgroundColor: "#fff" },
  continueBarText: { fontSize: 11, fontWeight: "800", color: "rgba(255,255,255,0.85)" },

  /* alert */
  alertCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.dangerLight, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  alertIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  alertTitle: { fontSize: 14, fontWeight: "800", color: Colors.danger },
  alertSub: { fontSize: 12, color: Colors.textSecondary, fontWeight: "500", marginTop: 2 },
  alertPill: { backgroundColor: Colors.danger, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  alertPillText: { fontSize: 12, fontWeight: "800", color: "#fff" },

  /* courses */
  courseScroll: { gap: 10, paddingRight: 4 },
  courseCard: { width: 150, borderRadius: 20, backgroundColor: Colors.white, padding: 16, gap: 8 },
  courseIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  courseName: { fontSize: 14, fontWeight: "800", color: Colors.dark, lineHeight: 20 },
  courseSub: { fontSize: 11, color: Colors.textMuted, fontWeight: "600" },
  courseFooter: { flexDirection: "row", justifyContent: "flex-end", marginTop: 4 },
  courseCardAdd: { width: 110, borderRadius: 20, backgroundColor: Colors.white, padding: 16, alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: Colors.border, borderStyle: "dashed" },
  addIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center" },
  addText: { fontSize: 12, fontWeight: "800", color: Colors.primary, textAlign: "center" },

  /* empty */
  emptyCard: { borderRadius: 24, overflow: "hidden" },
  emptyGrad: { padding: 30, alignItems: "center", gap: 10, minHeight: 160, overflow: "hidden" },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#fff" },
  emptySub: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: "500" },

  /* challenge */
  challengeCard: { borderRadius: 22, overflow: "hidden" },
  challengeGrad: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, overflow: "hidden" },
  challengeLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  challengeIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  challengeTitle: { fontSize: 17, fontWeight: "900", color: "#fff" },
  challengeSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "500", marginTop: 2 },
  challengeBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  challengeBtnText: { fontSize: 14, fontWeight: "800", color: "#FF6B6B" },

  /* quick actions */
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickItem: { width: (width - 32 - 10) / 2, backgroundColor: Colors.white, borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  quickIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 14, fontWeight: "800", color: Colors.dark, flex: 1 },

  /* goal */
  goalCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", gap: 14 },
  goalIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  goalLabel: { fontSize: 10, fontWeight: "800", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  goalText: { fontSize: 14, fontWeight: "700", color: Colors.dark, lineHeight: 20 },
  goalMeta: { fontSize: 11, color: Colors.textMuted, fontWeight: "600", marginTop: 3, textTransform: "capitalize" },
});
