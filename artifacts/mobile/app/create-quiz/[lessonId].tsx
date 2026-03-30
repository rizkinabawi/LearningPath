import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { X, Trash2, ChevronDown } from "lucide-react-native";
import { Button } from "@/components/Button";
import {
  getQuizzes,
  saveQuiz,
  deleteQuiz,
  generateId,
  type Quiz,
} from "@/utils/storage";
import Colors from "@/constants/colors";

export default function CreateQuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState<number | null>(null);
  const [existing, setExisting] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getQuizzes(lessonId);
      setExisting(data);
    })();
  }, [lessonId]);

  const handleSave = async () => {
    if (!question.trim()) {
      Alert.alert("Missing Question", "Please enter a question.");
      return;
    }
    const filledOptions = options.filter((o) => o.trim());
    if (filledOptions.length < 2) {
      Alert.alert("Need Options", "Please provide at least 2 answer options.");
      return;
    }
    if (correctOption === null || !options[correctOption]?.trim()) {
      Alert.alert("Select Correct Answer", "Please mark the correct option.");
      return;
    }
    setLoading(true);
    const quiz: Quiz = {
      id: generateId(),
      lessonId: lessonId ?? "",
      question: question.trim(),
      options: options.filter((o) => o.trim()),
      answer: options[correctOption].trim(),
      type: "multiple-choice",
      createdAt: new Date().toISOString(),
    };
    await saveQuiz(quiz);
    setExisting((prev) => [...prev, quiz]);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOption(null);
    setLoading(false);
    Alert.alert("Saved!", "Quiz question added successfully.");
  };

  const handleDelete = async (id: string) => {
    await deleteQuiz(id);
    setExisting((prev) => prev.filter((q) => q.id !== id));
  };

  const handleImportJson = async () => {
    try {
      const parsed = JSON.parse(importJson);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      let count = 0;
      for (const item of items) {
        if (item.question && item.options && item.answer) {
          const quiz: Quiz = {
            id: generateId(),
            lessonId: lessonId ?? "",
            question: String(item.question),
            options: item.options.map(String),
            answer: String(item.answer),
            type: "multiple-choice",
            createdAt: new Date().toISOString(),
          };
          await saveQuiz(quiz);
          setExisting((prev) => [...prev, quiz]);
          count++;
        }
      }
      setImportJson("");
      setShowImport(false);
      Alert.alert("Imported", `${count} question(s) added.`);
    } catch {
      Alert.alert(
        "Invalid JSON",
        'Paste a valid JSON array of {question, options: [...], answer}'
      );
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Platform.OS === "web" ? 80 : insets.top + 16,
          paddingBottom: 60,
        },
      ]}
      bottomOffset={16}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Quiz</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={Colors.black} />
        </TouchableOpacity>
      </View>
      <Text style={styles.count}>
        {existing.length} question{existing.length !== 1 ? "s" : ""} in this lesson
      </Text>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Question</Text>
          <TextInput
            placeholder="What does useState return?"
            value={question}
            onChangeText={setQuestion}
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholderTextColor={Colors.textMuted}
            multiline
          />
        </View>

        <Text style={styles.fieldLabel}>Answer Options</Text>
        <Text style={styles.fieldHint}>Tap an option to mark it as correct</Text>
        {options.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => setCorrectOption(idx)}
            style={[
              styles.optionRow,
              correctOption === idx && styles.optionRowActive,
            ]}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.optionBadge,
                correctOption === idx && styles.optionBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.optionBadgeText,
                  correctOption === idx && { color: Colors.white },
                ]}
              >
                {String.fromCharCode(65 + idx)}
              </Text>
            </View>
            <TextInput
              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
              value={opt}
              onChangeText={(text) => {
                const updated = [...options];
                updated[idx] = text;
                setOptions(updated);
              }}
              style={styles.optionInput}
              placeholderTextColor={Colors.textMuted}
            />
          </TouchableOpacity>
        ))}

        <Button
          label="Add Question"
          loading={loading}
          onPress={handleSave}
          size="lg"
          style={{ borderRadius: 18 }}
        />
      </View>

      {/* Import JSON */}
      <TouchableOpacity
        style={styles.importToggle}
        onPress={() => setShowImport(!showImport)}
      >
        <Text style={styles.importToggleText}>Import from JSON (AI-generated)</Text>
        <ChevronDown size={16} color={Colors.primary} />
      </TouchableOpacity>

      {showImport && (
        <View style={styles.importBox}>
          <Text style={styles.importHint}>
            Format: {`[{"question":"...","options":["A","B","C","D"],"answer":"A"}]`}
          </Text>
          <TextInput
            value={importJson}
            onChangeText={setImportJson}
            style={[styles.input, { height: 120, textAlignVertical: "top" }]}
            placeholder={`[{"question":"...", "options":["A","B","C","D"], "answer":"A"}]`}
            placeholderTextColor={Colors.textMuted}
            multiline
          />
          <Button
            label="Import"
            variant="outline"
            onPress={handleImportJson}
            style={{ borderRadius: 14, marginTop: 8 }}
          />
        </View>
      )}

      {/* Existing */}
      {existing.length > 0 && (
        <View style={styles.existingSection}>
          <Text style={styles.sectionTitle}>Existing Questions</Text>
          {existing.map((q, i) => (
            <View key={q.id} style={styles.questionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.questionNum}>Q{i + 1}</Text>
                <Text style={styles.questionText}>{q.question}</Text>
                <Text style={styles.questionAnswer}>✓ {q.answer}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Delete", "Delete this question?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => handleDelete(q.id),
                    },
                  ]);
                }}
                style={styles.deleteBtn}
              >
                <Trash2 size={16} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerTitle: { fontSize: 24, fontWeight: "900", color: Colors.black },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "600",
    marginBottom: 20,
  },
  form: { gap: 12, marginBottom: 20 },
  field: { gap: 6 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  fieldHint: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 4,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    overflow: "hidden",
  },
  optionRowActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  optionBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionBadgeActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  optionBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textSecondary,
  },
  optionInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  importToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginBottom: 8,
  },
  importToggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  importBox: { gap: 8, marginBottom: 20 },
  importHint: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
    fontStyle: "italic",
  },
  existingSection: { marginTop: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.black,
    marginBottom: 12,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
  },
  questionNum: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  questionText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  questionAnswer: { fontSize: 13, color: Colors.success, fontWeight: "600" },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
