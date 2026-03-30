import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, AlertCircle, CheckCircle, RefreshCcw } from "lucide-react-native";
import {
  getWrongAnswers,
  getFlashcards,
  getQuizzes,
  type Progress,
  type Flashcard,
  type Quiz,
} from "@/utils/storage";
import Colors from "@/constants/colors";

type ReviewItem = {
  progress: Progress;
  content?: Flashcard | Quiz;
  type: "flashcard" | "quiz";
};

export default function MistakesReview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const wrongs = await getWrongAnswers();
      const reviewItems: ReviewItem[] = [];

      for (const p of wrongs) {
        if (p.flashcardId) {
          const allCards = await getFlashcards();
          const card = allCards.find((c) => c.id === p.flashcardId);
          reviewItems.push({ progress: p, content: card, type: "flashcard" });
        } else if (p.quizId) {
          const allQuizzes = await getQuizzes();
          const quiz = allQuizzes.find((q) => q.id === p.quizId);
          reviewItems.push({ progress: p, content: quiz, type: "quiz" });
        }
      }

      setItems(reviewItems.filter((i) => i.content));
      setLoading(false);
    })();
  }, []);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Platform.OS === "web" ? 74 : insets.top + 12 },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mistakes Review</Text>
          <Text style={styles.headerSub}>
            {items.length} item{items.length !== 1 ? "s" : ""} to re-learn
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={Colors.black} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <CheckCircle size={56} color={Colors.success} />
          <Text style={styles.emptyTitle}>All Clear!</Text>
          <Text style={styles.emptySub}>
            No mistakes to review. Keep up the great work!
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item, i) => {
            const { content, type, progress } = item;
            if (!content) return null;

            if (type === "flashcard") {
              const card = content as Flashcard;
              return (
                <View key={progress.id ?? i} style={styles.card}>
                  <View style={styles.cardBadge}>
                    <AlertCircle size={14} color={Colors.danger} />
                    <Text style={styles.cardBadgeText}>Flashcard</Text>
                  </View>
                  <Text style={styles.cardQ}>{card.question}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.answerLabel}>Correct Answer</Text>
                  <Text style={styles.cardA}>{card.answer}</Text>
                  {progress.userAnswer ? (
                    <>
                      <Text style={styles.answerLabel}>Your Answer</Text>
                      <Text style={styles.yourAnswer}>{progress.userAnswer}</Text>
                    </>
                  ) : null}
                </View>
              );
            } else {
              const quiz = content as Quiz;
              return (
                <View key={progress.id ?? i} style={styles.card}>
                  <View style={styles.cardBadge}>
                    <AlertCircle size={14} color={Colors.warning} />
                    <Text style={[styles.cardBadgeText, { color: Colors.warning }]}>
                      Quiz
                    </Text>
                  </View>
                  <Text style={styles.cardQ}>{quiz.question}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.answerLabel}>Correct Answer</Text>
                  <Text style={styles.cardA}>{quiz.answer}</Text>
                  {progress.userAnswer && progress.userAnswer !== quiz.answer ? (
                    <>
                      <Text style={styles.answerLabel}>Your Answer</Text>
                      <Text style={styles.yourAnswer}>{progress.userAnswer}</Text>
                    </>
                  ) : null}
                  <View style={styles.optionsWrap}>
                    {quiz.options.map((opt, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.optionChip,
                          opt === quiz.answer && styles.optionChipCorrect,
                          opt === progress.userAnswer &&
                            opt !== quiz.answer &&
                            styles.optionChipWrong,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionChipText,
                            opt === quiz.answer && { color: Colors.success },
                            opt === progress.userAnswer &&
                              opt !== quiz.answer && { color: Colors.danger },
                          ]}
                        >
                          {opt}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            }
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: "900", color: Colors.black },
  headerSub: { fontSize: 13, color: Colors.textMuted, fontWeight: "600", marginTop: 2 },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  loadingText: { fontSize: 16, color: Colors.textMuted, fontWeight: "600" },
  emptyTitle: {
    fontSize: 24,
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
  backBtn: {
    marginTop: 12,
    backgroundColor: Colors.black,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  backBtnText: { color: Colors.white, fontWeight: "800", fontSize: 14 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 8,
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.danger,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardQ: { fontSize: 16, fontWeight: "700", color: Colors.black },
  divider: { height: 1, backgroundColor: Colors.borderLight },
  answerLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardA: { fontSize: 15, fontWeight: "700", color: Colors.success },
  yourAnswer: { fontSize: 14, fontWeight: "600", color: Colors.danger },
  optionsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  optionChipCorrect: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  optionChipWrong: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.danger,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
});
