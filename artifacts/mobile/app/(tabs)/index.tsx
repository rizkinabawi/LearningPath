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
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import {
  getUser,
  getLearningPaths,
  getStats,
  getWrongAnswers,
  type User,
  type LearningPath,
  type Stats,
} from "@/utils/storage";
import Colors, { shadow, CARD_COLORS } from "@/constants/colors";
import { ProgressBar } from "@/components/ProgressBar";

const { width } = Dimensions.get("window");
const CARD_W = width * 0.68;

const CATEGORIES = ["Semua", "Populer", "Terbaru", "Lanjutan"];

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const loadData = async () => {
    const [u, p, s, w] = await Promise.all([
      getUser(), getLearningPaths(), getStats(), getWrongAnswers(),
    ]);
    if (!u) { router.replace("/onboarding"); return; }
    setUser(u); setPaths(p); setStats(s); setWrongCount(w.length);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = async () => {
    setRefreshing(true); await loadData(); setRefreshing(false);
  };

  const accuracy = stats && stats.totalAnswers > 0
    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;

  const filtered = paths.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Platform.OS === "web" ? 80 : insets.top + 20, paddingBottom: 30 },
      ]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingSub}>{greeting} 👋</Text>
          <Text style={styles.greetingName}>
            {user?.name?.split(" ")[0] ?? "Learner"}
          </Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.8}>
          <Text style={styles.avatarEmoji}>🎓</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color={Colors.textMuted} />
          <TextInput
            placeholder="Cari kursus..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor={Colors.textMuted}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
          <Feather name="sliders" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Stats banner */}
      {(stats?.totalAnswers ?? 0) > 0 && (
        <View style={styles.statsBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.statsBannerSub}>Progress hari ini</Text>
            <Text style={styles.statsBannerTitle}>
              {accuracy}% akurasi · {stats?.streak ?? 0} hari streak 🔥
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/progress")}
              style={styles.statsBannerBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.statsBannerBtnText}>Lihat Detail</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 52 }}>📊</Text>
        </View>
      )}

      {/* Mistakes alert */}
      {wrongCount > 0 && (
        <TouchableOpacity
          onPress={() => router.push("/mistakes-review")}
          style={styles.mistakeBanner}
          activeOpacity={0.85}
        >
          <Text style={styles.mistakeEmoji}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.mistakeTitle}>Review Kesalahan</Text>
            <Text style={styles.mistakeSub}>{wrongCount} soal perlu diulangi</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.white} />
        </TouchableOpacity>
      )}

      {/* Category pills */}
      <Text style={styles.sectionTitle}>Kursus</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.catPill,
              activeCategory === cat && styles.catPillActive,
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.catPillText,
                activeCategory === cat && styles.catPillTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Course cards horizontal */}
      {filtered.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.courseRow}
          decelerationRate="fast"
          snapToInterval={CARD_W + 16}
        >
          {filtered.map((path, i) => (
            <TouchableOpacity
              key={path.id}
              style={[
                styles.courseCard,
                { backgroundColor: CARD_COLORS[i % CARD_COLORS.length] },
              ]}
              onPress={() => router.push("/(tabs)/learn")}
              activeOpacity={0.85}
            >
              <Text style={styles.courseCardEmoji}>
                {["📘", "🎨", "🌐", "🧠", "⚗️", "📐"][i % 6]}
              </Text>
              <Text style={styles.courseCardTitle}>{path.name}</Text>
              {path.description ? (
                <Text style={styles.courseCardSub} numberOfLines={2}>
                  {path.description}
                </Text>
              ) : null}
              <View style={styles.courseCardBottom}>
                <View style={styles.courseCardTag}>
                  <Text style={styles.courseCardTagText}>
                    {user?.topic ?? "Belajar"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/learn")}
          style={styles.emptyCard}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 40 }}>📚</Text>
          <Text style={styles.emptyTitle}>Belum ada kursus</Text>
          <Text style={styles.emptySub}>Buat jalur belajar pertamamu sekarang</Text>
          <View style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Buat Sekarang</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Recent / Goal */}
      {user?.goal && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.sectionTitle}>Target Belajarmu</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalLeft}>
              <Text style={styles.goalEmoji}>🎯</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalText}>{user.goal}</Text>
              <Text style={styles.goalMeta}>{user.topic} · {user.level}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greetingSub: { fontSize: 13, color: Colors.textMuted, fontWeight: "600", marginBottom: 2 },
  greetingName: { fontSize: 28, fontWeight: "900", color: Colors.dark },
  avatarBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 24 },
  searchRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadow,
    shadowOpacity: 0.04,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: "600", color: Colors.dark },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  statsBanner: {
    backgroundColor: Colors.dark,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statsBannerSub: { fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: "700", marginBottom: 4 },
  statsBannerTitle: { fontSize: 14, fontWeight: "800", color: Colors.white, lineHeight: 20, marginBottom: 14 },
  statsBannerBtn: {
    alignSelf: "flex-start",
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statsBannerBtnText: { fontSize: 12, fontWeight: "800", color: Colors.white },
  mistakeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.danger,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    ...shadow,
  },
  mistakeEmoji: { fontSize: 28 },
  mistakeTitle: { fontSize: 15, fontWeight: "900", color: Colors.white },
  mistakeSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "500" },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: Colors.dark, marginBottom: 14 },
  categoryRow: { gap: 8, paddingBottom: 16, flexDirection: "row" },
  catPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  catPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catPillText: { fontSize: 13, fontWeight: "700", color: Colors.textSecondary },
  catPillTextActive: { color: Colors.white },
  courseRow: { paddingRight: 20, gap: 16 },
  courseCard: {
    width: CARD_W,
    borderRadius: 24,
    padding: 22,
    gap: 8,
    ...shadow,
    shadowOpacity: 0.18,
  },
  courseCardEmoji: { fontSize: 36 },
  courseCardTitle: { fontSize: 18, fontWeight: "900", color: Colors.white, lineHeight: 24 },
  courseCardSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "500", lineHeight: 18 },
  courseCardBottom: { marginTop: 8 },
  courseCardTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  courseCardTagText: { fontSize: 11, fontWeight: "800", color: Colors.white },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadow,
    shadowOpacity: 0.04,
  },
  emptyTitle: { fontSize: 17, fontWeight: "900", color: Colors.dark, marginTop: 8 },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: "center", fontWeight: "500" },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  emptyBtnText: { color: Colors.white, fontWeight: "800", fontSize: 13 },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadow,
    shadowOpacity: 0.05,
  },
  goalLeft: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  goalEmoji: { fontSize: 24 },
  goalText: { fontSize: 14, fontWeight: "700", color: Colors.dark, marginBottom: 4 },
  goalMeta: { fontSize: 12, color: Colors.textMuted, fontWeight: "600", textTransform: "capitalize" },
});
