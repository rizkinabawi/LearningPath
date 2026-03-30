import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import {
  getUser, getLearningPaths, getStats, getWrongAnswers,
  type User, type LearningPath, type Stats,
} from "@/utils/storage";
import Colors from "@/constants/colors";
import { ProgressBar } from "@/components/ProgressBar";

const { width } = Dimensions.get("window");

const GRAD_PALETTE = [
  ["#4A9EFF", "#6C63FF"],
  ["#FF6B6B", "#FF9500"],
  ["#0AD3C1", "#00B4D8"],
  ["#7C3AED", "#A855F7"],
  ["#059669", "#10B981"],
];

function GradientCard({
  gradient, emoji, title, subtitle, onPress,
}: {
  gradient: string[];
  emoji: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.courseCard}>
      <LinearGradient
        colors={gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.courseGradient}
      >
        {/* Decorative circles */}
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
        <Text style={styles.courseEmoji}>{emoji}</Text>
        <Text style={styles.courseTitle} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={styles.courseSub} numberOfLines={1}>{subtitle}</Text> : null}
        <View style={styles.courseArrow}>
          <Feather name="arrow-right" size={14} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    const [u, p, s, w] = await Promise.all([getUser(), getLearningPaths(), getStats(), getWrongAnswers()]);
    if (!u) { router.replace("/onboarding"); return; }
    setUser(u); setPaths(p); setStats(s); setWrongCount(w.length);
  };

  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const accuracy = stats && stats.totalAnswers > 0 ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;
  const filtered = paths.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}
    >
      {/* ===== GRADIENT HEADER ===== */}
      <LinearGradient
        colors={["#0A1628", "#0D2045", "#1A3066"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGrad, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 16 }]}
      >
        {/* Background dots */}
        <View style={styles.hdot1} />
        <View style={styles.hdot2} />
        <View style={styles.hdot3} />

        {/* Top row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetSub}>{greet} 👋</Text>
            <Text style={styles.greetName}>{user?.name?.split(" ")[0] ?? "Learner"}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            style={styles.avatarBtn}
          >
            <LinearGradient colors={["#4A9EFF", "#6C63FF"]} style={styles.avatarGrad}>
              <Text style={styles.avatarInitial}>
                {(user?.name ?? "L").charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { val: stats?.streak ?? 0, label: "Streak", icon: "🔥" },
            { val: `${accuracy}%`, label: "Akurasi", icon: "🎯" },
            { val: stats?.totalAnswers ?? 0, label: "Dijawab", icon: "💬" },
            { val: paths.length, label: "Kursus", icon: "📚" },
          ].map((s, i) => (
            <View key={i} style={styles.statChip}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* ===== SEARCH ===== */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={Colors.textMuted} />
          <TextInput
            placeholder="Cari kursus..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor={Colors.textMuted}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ===== MISTAKES ALERT ===== */}
      {wrongCount > 0 && (
        <TouchableOpacity onPress={() => router.push("/mistakes-review")} activeOpacity={0.85} style={styles.mistakeWrap}>
          <LinearGradient colors={["#EF4444", "#DC2626"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mistakeGrad}>
            <View style={styles.mistakeIconWrap}><Feather name="alert-circle" size={18} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mistakeTitle}>⚠️ {wrongCount} soal salah perlu direview</Text>
              <Text style={styles.mistakeSub}>Tap untuk mulai review sekarang</Text>
            </View>
            <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* ===== COURSES ===== */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Kursus Aktif</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/learn")} style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
            <Feather name="chevron-right" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {filtered.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courseScroll}>
            {filtered.map((path, i) => (
              <GradientCard
                key={path.id}
                gradient={GRAD_PALETTE[i % GRAD_PALETTE.length]}
                emoji={["📘", "🎨", "🌐", "🧠", "⚗️"][i % 5]}
                title={path.name}
                subtitle={path.description || user?.topic}
                onPress={() => router.push("/(tabs)/learn")}
              />
            ))}
          </ScrollView>
        ) : (
          <TouchableOpacity onPress={() => router.push("/(tabs)/learn")} activeOpacity={0.85}>
            <LinearGradient colors={["#4A9EFF", "#6C63FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emptyGrad}>
              <View style={styles.decCircle1} />
              <View style={styles.decCircle2} />
              <Feather name="plus-circle" size={32} color="rgba(255,255,255,0.9)" />
              <Text style={styles.emptyGradTitle}>Buat Kursus Pertama</Text>
              <Text style={styles.emptyGradSub}>Mulai jalur belajarmu sekarang</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* ===== QUICK ACTIONS ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu Cepat</Text>
        <View style={styles.quickGrid}>
          {[
            { icon: "book-open", label: "Flashcard", color: "#4A9EFF", bg: "#EBF5FF", route: "/(tabs)/learn" },
            { icon: "help-circle", label: "Quiz", color: "#FF9500", bg: "#FFF8EB", route: "/(tabs)/learn" },
            { icon: "trending-up", label: "Progress", color: "#0AD3C1", bg: "#E0FAF8", route: "/(tabs)/progress" },
            { icon: "cpu", label: "AI Prompt", color: "#7C3AED", bg: "#F5F3FF", route: "/(tabs)/progress" },
          ].map((q) => (
            <TouchableOpacity
              key={q.label}
              onPress={() => router.push(q.route as any)}
              style={[styles.quickCard, { backgroundColor: q.bg }]}
              activeOpacity={0.78}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: q.color }]}>
                <Feather name={q.icon as any} size={18} color="#fff" />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ===== GOAL ===== */}
      {user?.goal && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Belajar</Text>
          <LinearGradient colors={["#0A1628", "#1A2E5A"]} style={styles.goalCard}>
            <View style={styles.goalLeft}>
              <Text style={{ fontSize: 28 }}>🎯</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalText}>{user.goal}</Text>
              <Text style={styles.goalMeta}>{user.topic} · {user.level}</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerGrad: { paddingHorizontal: 20, paddingBottom: 20, overflow: "hidden" },
  hdot1: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(74,158,255,0.12)", top: -60, right: -60 },
  hdot2: { position: "absolute", width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(108,99,255,0.1)", top: 20, right: 60 },
  hdot3: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(10,211,193,0.08)", bottom: 0, left: 40 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  greetSub: { fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: "600", marginBottom: 2 },
  greetName: { fontSize: 26, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  avatarBtn: { borderRadius: 999 },
  avatarGrad: { width: 44, height: 44, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 18, fontWeight: "900", color: "#fff" },
  statsRow: { flexDirection: "row", gap: 8 },
  statChip: { flex: 1, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 14, paddingVertical: 10, alignItems: "center", gap: 2 },
  statIcon: { fontSize: 16 },
  statVal: { fontSize: 16, fontWeight: "900", color: "#fff" },
  statLbl: { fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: "700", textTransform: "uppercase" },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.background },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1.5, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 14, fontWeight: "600", color: Colors.dark },
  mistakeWrap: { marginHorizontal: 16, marginBottom: 8, borderRadius: 16, overflow: "hidden" },
  mistakeGrad: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  mistakeIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  mistakeTitle: { fontSize: 13, fontWeight: "800", color: "#fff" },
  mistakeSub: { fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: "500", marginTop: 2 },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "900", color: Colors.dark, letterSpacing: -0.3, marginBottom: 10 },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { fontSize: 13, fontWeight: "700", color: Colors.primary },
  courseScroll: { gap: 12, paddingRight: 4 },
  courseCard: { width: 180, borderRadius: 22, overflow: "hidden" },
  courseGradient: { padding: 18, minHeight: 150, justifyContent: "flex-end", overflow: "hidden" },
  decCircle1: { position: "absolute", width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.08)", top: -20, right: -20 },
  decCircle2: { position: "absolute", width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.06)", top: 30, right: 20 },
  courseEmoji: { fontSize: 28, marginBottom: 8 },
  courseTitle: { fontSize: 15, fontWeight: "900", color: "#fff", lineHeight: 20 },
  courseSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "600", marginTop: 4 },
  courseArrow: { position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  emptyGrad: { borderRadius: 22, padding: 28, alignItems: "center", gap: 8, overflow: "hidden", minHeight: 140 },
  emptyGradTitle: { fontSize: 17, fontWeight: "900", color: "#fff" },
  emptyGradSub: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: "500" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickCard: { width: (width - 32 - 10) / 2, borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  quickIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 14, fontWeight: "800", color: Colors.dark },
  goalCard: { borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", gap: 14, overflow: "hidden" },
  goalLeft: { width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  goalText: { fontSize: 14, fontWeight: "700", color: "#fff", marginBottom: 4 },
  goalMeta: { fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: "600", textTransform: "capitalize" },
});
