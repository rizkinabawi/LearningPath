import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PromptBuilder } from "@/components/PromptBuilder";
import { getStats, getProgress, type Stats, type Progress } from "@/utils/storage";
import { ProgressBar } from "@/components/ProgressBar";
import Colors, { shadow } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";

export default function ProgressTab() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<Stats | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [activeTab, setActiveTab] = useState<"stats" | "prompts">("stats");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [s, p] = await Promise.all([getStats(), getProgress()]);
        setStats(s); setProgress(p);
      })();
    }, [])
  );

  const accuracy = stats && stats.totalAnswers > 0
    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;

  const recentProgress = [...progress]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);

  const STAT_TILES = [
    { emoji: "🎯", value: `${accuracy}%`, label: "Akurasi", bg: Colors.primaryLight, textColor: Colors.primaryDark },
    { emoji: "✅", value: stats?.correctAnswers ?? 0, label: "Benar", bg: "#F0FDF4", textColor: "#15803D" },
    { emoji: "❌", value: (stats?.totalAnswers ?? 0) - (stats?.correctAnswers ?? 0), label: "Salah", bg: Colors.dangerLight, textColor: Colors.danger },
    { emoji: "🔥", value: `${stats?.streak ?? 0}`, label: "Streak", bg: Colors.accentLight, textColor: "#B45309" },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 74 : insets.top + 12 }]}>
        <View>
          <Text style={styles.headerSub}>Perkembanganmu</Text>
          <Text style={styles.headerTitle}>Progress</Text>
        </View>
        <View style={styles.tabToggle}>
          {([["stats", "📊"], ["prompts", "✨"]] as const).map(([tab, ico]) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.toggleBtn, activeTab === tab && styles.toggleBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, activeTab === tab && styles.toggleTextActive]}>
                {ico} {tab === "stats" ? "Statistik" : "AI Prompt"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === "stats" ? (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Stat tiles 2x2 */}
          <View style={styles.tilesGrid}>
            {STAT_TILES.map((t) => (
              <View key={t.label} style={[styles.tile, { backgroundColor: t.bg }]}>
                <Text style={styles.tileEmoji}>{t.emoji}</Text>
                <Text style={[styles.tileValue, { color: t.textColor }]}>{t.value}</Text>
                <Text style={styles.tileLabel}>{t.label}</Text>
              </View>
            ))}
          </View>

          {/* Accuracy bar */}
          {(stats?.totalAnswers ?? 0) > 0 && (
            <View style={styles.accuracyCard}>
              <View style={styles.accuracyTop}>
                <View>
                  <Text style={styles.cardLabel}>Akurasi Keseluruhan</Text>
                  <Text style={styles.accuracyValue}>{accuracy}%</Text>
                </View>
                <Text style={{ fontSize: 40 }}>
                  {accuracy >= 80 ? "🏆" : accuracy >= 50 ? "💪" : "📖"}
                </Text>
              </View>
              <ProgressBar
                value={accuracy}
                color={accuracy >= 80 ? Colors.success : accuracy >= 50 ? Colors.warning : Colors.danger}
                height={10}
                backgroundColor={Colors.border}
              />
              <Text style={styles.accuracySub}>
                {stats?.correctAnswers ?? 0} benar dari {stats?.totalAnswers ?? 0} jawaban
              </Text>
            </View>
          )}

          {/* Recent activity */}
          {recentProgress.length > 0 && (
            <View style={styles.activityCard}>
              <Text style={styles.cardLabel}>Aktivitas Terbaru</Text>
              {recentProgress.map((p, i) => (
                <View key={p.id ?? i} style={styles.activityRow}>
                  <View
                    style={[
                      styles.activityDot,
                      { backgroundColor: p.isCorrect ? Colors.success : Colors.danger },
                    ]}
                  />
                  <Text style={styles.activityDate}>
                    {new Date(p.timestamp).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short",
                    })}
                  </Text>
                  <Text style={styles.activityResult}>
                    {p.isCorrect ? "✅ Benar" : "❌ Salah"}
                    {p.userAnswer ? ` · ${p.userAnswer}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Empty */}
          {recentProgress.length === 0 && (
            <View style={styles.emptyWrap}>
              <Text style={{ fontSize: 56 }}>📈</Text>
              <Text style={styles.emptyTitle}>Belum Ada Aktivitas</Text>
              <Text style={styles.emptySub}>
                Mulai kerjakan flashcard atau kuis untuk melihat statistikmu di sini.
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  headerSub: { fontSize: 12, color: Colors.textMuted, fontWeight: "700" },
  headerTitle: { fontSize: 26, fontWeight: "900", color: Colors.dark, marginBottom: 12 },
  tabToggle: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: "flex-start",
    gap: 4,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  toggleBtnActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: 12, fontWeight: "700", color: Colors.textMuted },
  toggleTextActive: { color: Colors.white },
  tilesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  tile: {
    width: "47%",
    borderRadius: 20,
    padding: 18,
    gap: 4,
    ...shadow,
    shadowOpacity: 0.04,
  },
  tileEmoji: { fontSize: 24, marginBottom: 4 },
  tileValue: { fontSize: 28, fontWeight: "900" },
  tileLabel: { fontSize: 12, fontWeight: "700", color: Colors.textSecondary, textTransform: "uppercase" },
  accuracyCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    gap: 12,
    ...shadow,
    shadowOpacity: 0.06,
  },
  accuracyTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  accuracyValue: { fontSize: 36, fontWeight: "900", color: Colors.dark },
  accuracySub: { fontSize: 12, color: Colors.textMuted, fontWeight: "600" },
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    gap: 4,
    ...shadow,
    shadowOpacity: 0.06,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityDate: { fontSize: 12, color: Colors.textMuted, fontWeight: "700", width: 56 },
  activityResult: { fontSize: 13, color: Colors.text, fontWeight: "500", flex: 1 },
  emptyWrap: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: "900", color: Colors.dark, marginTop: 12 },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: "center", fontWeight: "500", lineHeight: 20 },
});
