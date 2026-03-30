import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PromptBuilder } from "@/components/PromptBuilder";
import { getStats, getProgress, type Stats, type Progress } from "@/utils/storage";
import { ProgressBar } from "@/components/ProgressBar";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

export default function ProgressTab() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<Stats | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [tab, setTab] = useState<"stats" | "prompts">("stats");

  useFocusEffect(useCallback(() => {
    (async () => {
      const [s, p] = await Promise.all([getStats(), getProgress()]);
      setStats(s); setProgress(p);
    })();
  }, []));

  const accuracy = stats && stats.totalAnswers > 0 ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;
  const wrong = (stats?.totalAnswers ?? 0) - (stats?.correctAnswers ?? 0);

  const recent = [...progress]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  return (
    <View style={styles.container}>
      {/* GRADIENT HEADER */}
      <LinearGradient
        colors={["#0A1628", "#0D2045", "#1A3066"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGrad, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 12 }]}
      >
        <View style={styles.hdot1} />
        <View style={styles.hdot2} />

        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSub}>Perkembanganmu</Text>
            <Text style={styles.headerTitle}>Progress</Text>
          </View>
        </View>

        {/* Big accuracy ring visual (text-based) */}
        <View style={styles.accuracyHero}>
          <View style={styles.ringWrap}>
            <Text style={styles.ringVal}>{accuracy}%</Text>
            <Text style={styles.ringLabel}>Akurasi</Text>
          </View>
          <View style={styles.heroStats}>
            {[
              { val: stats?.totalAnswers ?? 0, label: "Total Jawaban", icon: "💬", color: "#4A9EFF" },
              { val: stats?.correctAnswers ?? 0, label: "Benar", icon: "✅", color: "#0AD3C1" },
              { val: wrong, label: "Salah", icon: "❌", color: "#FF6B6B" },
              { val: `${stats?.streak ?? 0}d`, label: "Streak", icon: "🔥", color: "#FF9500" },
            ].map((s, i) => (
              <View key={i} style={styles.heroStatItem}>
                <Text style={styles.heroStatIcon}>{s.icon}</Text>
                <Text style={[styles.heroStatVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.heroStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          {([["stats", "📊 Statistik"], ["prompts", "✨ AI Prompt"]] as const).map(([t, lbl]) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>{lbl}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {tab === "stats" ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* Accuracy progress bar card */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Akurasi Keseluruhan</Text>
              <Text style={styles.cardTitleVal}>{accuracy}%</Text>
            </View>
            <ProgressBar
              value={accuracy}
              color={accuracy >= 80 ? "#0AD3C1" : accuracy >= 50 ? "#FF9500" : "#FF6B6B"}
              height={10}
            />
            <Text style={styles.cardSub}>{stats?.correctAnswers ?? 0} benar dari {stats?.totalAnswers ?? 0} jawaban</Text>
          </View>

          {/* Weekly activity heatmap-style */}
          {recent.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Aktivitas Terbaru</Text>
              <View style={styles.activityGrid}>
                {recent.map((p, i) => (
                  <View
                    key={p.id ?? i}
                    style={[
                      styles.activityDot,
                      { backgroundColor: p.isCorrect ? "#0AD3C1" : "#FF6B6B" },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.activityLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#0AD3C1" }]} />
                  <Text style={styles.legendText}>Benar</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#FF6B6B" }]} />
                  <Text style={styles.legendText}>Salah</Text>
                </View>
              </View>
            </View>
          )}

          {/* Recent log */}
          {recent.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Log Jawaban</Text>
              {recent.slice(0, 10).map((p, i) => (
                <View key={p.id ?? i} style={[styles.logRow, i < Math.min(recent.length, 10) - 1 && styles.logRowBorder]}>
                  <View style={[styles.logDot, { backgroundColor: p.isCorrect ? "#0AD3C1" : "#FF6B6B" }]} />
                  <Text style={styles.logDate}>
                    {new Date(p.timestamp).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </Text>
                  <Text style={[styles.logResult, { color: p.isCorrect ? "#059669" : "#DC2626" }]}>
                    {p.isCorrect ? "✓ Benar" : "✗ Salah"}
                  </Text>
                  {p.userAnswer && <Text style={styles.logAnswer} numberOfLines={1}>{p.userAnswer}</Text>}
                </View>
              ))}
            </View>
          )}

          {recent.length === 0 && (
            <LinearGradient colors={["#0A1628", "#1A3066"]} style={styles.emptyCard}>
              <View style={styles.hdot1} /><View style={styles.hdot2} />
              <Text style={{ fontSize: 48 }}>📈</Text>
              <Text style={styles.emptyTitle}>Belum Ada Data</Text>
              <Text style={styles.emptySub}>Kerjakan flashcard atau kuis untuk melihat statistikmu</Text>
            </LinearGradient>
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
  headerGrad: { paddingHorizontal: 20, paddingBottom: 0, overflow: "hidden" },
  hdot1: { position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(74,158,255,0.1)", top: -40, right: -40 },
  hdot2: { position: "absolute", width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(10,211,193,0.07)", bottom: -20, left: 20 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  accuracyHero: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  ringWrap: { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 3, borderColor: "rgba(74,158,255,0.5)", alignItems: "center", justifyContent: "center" },
  ringVal: { fontSize: 22, fontWeight: "900", color: "#fff" },
  ringLabel: { fontSize: 9, color: "rgba(255,255,255,0.55)", fontWeight: "700", textTransform: "uppercase" },
  heroStats: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  heroStatItem: { width: "46%", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 10, gap: 2 },
  heroStatIcon: { fontSize: 14 },
  heroStatVal: { fontSize: 18, fontWeight: "900" },
  heroStatLabel: { fontSize: 9, color: "rgba(255,255,255,0.55)", fontWeight: "700", textTransform: "uppercase" },
  tabRow: { flexDirection: "row", gap: 0, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", marginTop: 4 },
  tabBtn: { flex: 1, paddingVertical: 13, alignItems: "center" },
  tabBtnActive: { borderBottomWidth: 2.5, borderBottomColor: Colors.primary },
  tabBtnText: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.45)" },
  tabBtnTextActive: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 13, fontWeight: "800", color: Colors.dark, textTransform: "uppercase", letterSpacing: 0.5 },
  cardTitleVal: { fontSize: 20, fontWeight: "900", color: Colors.dark },
  cardSub: { fontSize: 12, color: Colors.textMuted, fontWeight: "600" },
  activityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  activityDot: { width: 22, height: 22, borderRadius: 6 },
  activityLegend: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 11, color: Colors.textMuted, fontWeight: "600" },
  logRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  logRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  logDot: { width: 8, height: 8, borderRadius: 4 },
  logDate: { fontSize: 11, color: Colors.textMuted, fontWeight: "700", width: 50 },
  logResult: { fontSize: 12, fontWeight: "800", width: 60 },
  logAnswer: { flex: 1, fontSize: 11, color: Colors.textSecondary, fontWeight: "500" },
  emptyCard: { borderRadius: 22, padding: 36, alignItems: "center", gap: 10, overflow: "hidden" },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#fff" },
  emptySub: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: "500", textAlign: "center", lineHeight: 20 },
});
