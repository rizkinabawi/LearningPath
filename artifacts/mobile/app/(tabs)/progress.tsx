import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PromptBuilder } from "@/components/PromptBuilder";
import {
  getStats,
  getProgress,
  type Stats,
  type Progress,
} from "@/utils/storage";
import { ProgressBar } from "@/components/ProgressBar";
import Colors from "@/constants/colors";
import { TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react-native";

export default function ProgressTab() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<Stats | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [activeTab, setActiveTab] = useState<"stats" | "prompts">("stats");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [s, p] = await Promise.all([getStats(), getProgress()]);
        setStats(s);
        setProgress(p);
      })();
    }, [])
  );

  const accuracy =
    stats && stats.totalAnswers > 0
      ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
      : 0;

  const recentProgress = [...progress]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop:
              Platform.OS === "web" ? 74 : insets.top + 12,
          },
        ]}
      >
        <Text style={styles.headerTitle}>Progress</Text>
        <View style={styles.tabRow}>
          <TabPill
            label="Stats"
            active={activeTab === "stats"}
            onPress={() => setActiveTab("stats")}
          />
          <TabPill
            label="AI Prompts"
            active={activeTab === "prompts"}
            onPress={() => setActiveTab("prompts")}
          />
        </View>
      </View>

      {activeTab === "stats" ? (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Overall Stats */}
          <View style={styles.statsGrid}>
            <StatTile
              icon={<TrendingUp size={20} color={Colors.primary} />}
              value={`${accuracy}%`}
              label="Overall Accuracy"
              color={Colors.primaryLight}
            />
            <StatTile
              icon={<CheckCircle size={20} color={Colors.success} />}
              value={stats?.correctAnswers ?? 0}
              label="Correct"
              color="#F0FDF4"
            />
            <StatTile
              icon={<XCircle size={20} color={Colors.danger} />}
              value={(stats?.totalAnswers ?? 0) - (stats?.correctAnswers ?? 0)}
              label="Wrong"
              color={Colors.dangerLight}
            />
            <StatTile
              icon={<Clock size={20} color={Colors.warning} />}
              value={`${stats?.totalStudyTime ?? 0}m`}
              label="Study Time"
              color="#FFFBEB"
            />
          </View>

          {/* Accuracy Bar */}
          {(stats?.totalAnswers ?? 0) > 0 && (
            <View style={styles.accuracyCard}>
              <Text style={styles.cardLabel}>Accuracy Breakdown</Text>
              <View style={styles.accuracyRow}>
                <Text style={styles.accuracyValue}>{accuracy}%</Text>
                <Text style={styles.accuracySub}>
                  {stats?.correctAnswers ?? 0} / {stats?.totalAnswers ?? 0} correct
                </Text>
              </View>
              <ProgressBar
                value={accuracy}
                color={
                  accuracy >= 80
                    ? Colors.success
                    : accuracy >= 50
                    ? Colors.warning
                    : Colors.danger
                }
                height={10}
              />
            </View>
          )}

          {/* Recent Activity */}
          {recentProgress.length > 0 && (
            <View style={styles.recentCard}>
              <Text style={styles.cardLabel}>Recent Activity</Text>
              {recentProgress.map((p, i) => (
                <View key={p.id ?? i} style={styles.activityRow}>
                  <View
                    style={[
                      styles.activityDot,
                      {
                        backgroundColor: p.isCorrect
                          ? Colors.success
                          : Colors.danger,
                      },
                    ]}
                  />
                  <Text style={styles.activityTime}>
                    {new Date(p.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Text style={styles.activityResult}>
                    {p.isCorrect ? "Correct" : "Wrong"}
                    {p.userAnswer ? ` · "${p.userAnswer}"` : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Empty state */}
          {recentProgress.length === 0 && (
            <View style={styles.emptyWrap}>
              <TrendingUp size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Activity Yet</Text>
              <Text style={styles.emptySub}>
                Start studying flashcards and quizzes to see your progress here.
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <PromptBuilder />
      )}
    </View>
  );
}

const TabPill = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <View
    style={[styles.pill, active && styles.pillActive]}
    // @ts-ignore
    onClick={onPress}
  >
    <Text
      onPress={onPress}
      style={[styles.pillText, active && styles.pillTextActive]}
    >
      {label}
    </Text>
  </View>
);

const StatTile = ({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}) => (
  <View style={[styles.statTile, { backgroundColor: color }]}>
    {icon}
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.black,
    marginBottom: 12,
  },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  pillActive: { backgroundColor: Colors.black },
  pillText: { fontSize: 13, fontWeight: "700", color: Colors.textMuted },
  pillTextActive: { color: Colors.white },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statTile: {
    width: "47%",
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  statValue: { fontSize: 24, fontWeight: "900", color: Colors.black },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
  },
  accuracyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 10,
  },
  accuracyRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  accuracyValue: { fontSize: 32, fontWeight: "900", color: Colors.black },
  accuracySub: { fontSize: 13, color: Colors.textMuted, fontWeight: "500" },
  cardLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  recentCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 2,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityTime: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
    width: 60,
  },
  activityResult: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500",
    flex: 1,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.black,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
});
