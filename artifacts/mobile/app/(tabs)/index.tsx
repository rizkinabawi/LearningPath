import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  StyleSheet,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import {
  Play,
  ArrowRight,
  BookOpen,
  Flame,
  Target,
  TrendingUp,
  AlertCircle,
} from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, CardContent } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import {
  getUser,
  getLearningPaths,
  getStats,
  getWrongAnswers,
  type User,
  type LearningPath,
  type Stats,
} from "@/utils/storage";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [userData, allPaths, statsData, wrongs] = await Promise.all([
      getUser(),
      getLearningPaths(),
      getStats(),
      getWrongAnswers(),
    ]);
    if (!userData) {
      router.replace("/onboarding");
      return;
    }
    setUser(userData);
    setPaths(allPaths);
    setStats(statsData);
    setWrongCount(wrongs.length);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const today = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    weekday: "short",
  });

  const accuracy =
    stats && stats.totalAnswers > 0
      ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop:
            Platform.OS === "web" ? 80 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 : 30,
        },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.dateText}>{today}</Text>
          <Text style={styles.greeting}>
            Hi, {user?.name?.split(" ")[0] ?? "Learner"} 👋
          </Text>
        </View>
        <View style={styles.avatar}>
          <BookOpen size={22} color={Colors.white} />
        </View>
      </View>

      {/* Hero Banner */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/learn")}
        activeOpacity={0.8}
        style={styles.heroBanner}
      >
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>
            What would you{"\n"}like to learn today?
          </Text>
          <View style={styles.heroBtn}>
            <Play size={14} color={Colors.primary} />
            <Text style={styles.heroBtnText}>Get started</Text>
          </View>
        </View>
        <View style={styles.heroIcon}>
          <Text style={{ fontSize: 60 }}>📚</Text>
        </View>
      </TouchableOpacity>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Flame size={20} color="#F59E0B" />
          <Text style={styles.statValue}>{stats?.streak ?? 0}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Target size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{accuracy}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={20} color={Colors.success} />
          <Text style={styles.statValue}>{stats?.totalAnswers ?? 0}</Text>
          <Text style={styles.statLabel}>Answers</Text>
        </View>
      </View>

      {/* Mistakes Alert */}
      {wrongCount > 0 && (
        <TouchableOpacity
          onPress={() => router.push("/mistakes-review")}
          activeOpacity={0.8}
          style={styles.mistakeCard}
        >
          <View style={styles.mistakeLeft}>
            <View style={styles.mistakeIconWrap}>
              <AlertCircle size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.mistakeLabel}>Needs Attention</Text>
              <Text style={styles.mistakeTitle}>Review Mistakes</Text>
              <Text style={styles.mistakeSub}>
                {wrongCount} items to re-learn
              </Text>
            </View>
          </View>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Goal */}
      {user?.goal && (
        <View style={styles.goalCard}>
          <Text style={styles.goalLabel}>Your Goal</Text>
          <Text style={styles.goalText}>{user.goal}</Text>
          <View style={styles.goalMeta}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{user.level}</Text>
            </View>
            <Text style={styles.topicText}>{user.topic}</Text>
          </View>
        </View>
      )}

      {/* Learning Paths */}
      <Text style={styles.sectionTitle}>Learning Paths</Text>
      {paths.length === 0 ? (
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/learn")}
          style={styles.emptyCard}
          activeOpacity={0.8}
        >
          <BookOpen size={36} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No paths yet</Text>
          <Text style={styles.emptySub}>
            Create your first learning path to get started
          </Text>
          <View style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Create Path</Text>
          </View>
        </TouchableOpacity>
      ) : (
        paths.map((path, i) => (
          <TouchableOpacity
            key={path.id}
            style={styles.pathCard}
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/learn")}
          >
            <View style={styles.pathCardLeft}>
              <View
                style={[
                  styles.pathIndex,
                  { backgroundColor: i === 0 ? Colors.primary : Colors.surface },
                ]}
              >
                <Text
                  style={{
                    color: i === 0 ? Colors.white : Colors.textSecondary,
                    fontWeight: "800",
                    fontSize: 13,
                  }}
                >
                  {i + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pathName}>{path.name}</Text>
                {path.description ? (
                  <Text style={styles.pathDesc} numberOfLines={1}>
                    {path.description}
                  </Text>
                ) : null}
              </View>
            </View>
            <ArrowRight size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))
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
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "700",
    marginBottom: 2,
  },
  greeting: { fontSize: 28, fontWeight: "900", color: Colors.black },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBanner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    marginBottom: 16,
    overflow: "hidden",
  },
  heroTextWrap: { flex: 1, justifyContent: "center" },
  heroTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.black,
    lineHeight: 26,
    marginBottom: 14,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.white,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  heroBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primary,
  },
  heroIcon: {
    width: 80,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.black,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  mistakeCard: {
    backgroundColor: Colors.danger,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  mistakeLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  mistakeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  mistakeLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  mistakeTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: Colors.white,
  },
  mistakeSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  goalLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  goalText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 10,
  },
  goalMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
  levelBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  topicText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.black,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.black,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    fontWeight: "500",
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: Colors.black,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: { color: Colors.white, fontWeight: "800", fontSize: 13 },
  pathCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pathCardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  pathIndex: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pathName: { fontSize: 15, fontWeight: "800", color: Colors.black },
  pathDesc: { fontSize: 12, color: Colors.textMuted, fontWeight: "500", marginTop: 2 },
});
