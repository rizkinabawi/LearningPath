import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { X, Plus, Trash2, ChevronDown } from "lucide-react-native";
import { Button } from "@/components/Button";
import {
  getFlashcards,
  saveFlashcard,
  deleteFlashcard,
  generateId,
  type Flashcard,
} from "@/utils/storage";
import Colors from "@/constants/colors";

export default function CreateFlashcardScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tag, setTag] = useState("");
  const [existing, setExisting] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getFlashcards(lessonId);
      setExisting(data);
    })();
  }, [lessonId]);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert("Missing Fields", "Question and answer are required.");
      return;
    }
    setLoading(true);
    const card: Flashcard = {
      id: generateId(),
      lessonId: lessonId ?? "",
      question: question.trim(),
      answer: answer.trim(),
      tag: tag.trim(),
      createdAt: new Date().toISOString(),
    };
    await saveFlashcard(card);
    setExisting((prev) => [...prev, card]);
    setQuestion("");
    setAnswer("");
    setTag("");
    setLoading(false);
    Alert.alert("Saved!", "Flashcard added successfully.");
  };

  const handleDelete = async (id: string) => {
    await deleteFlashcard(id);
    setExisting((prev) => prev.filter((c) => c.id !== id));
  };

  const handleImportJson = async () => {
    try {
      const parsed = JSON.parse(importJson);
      const cards = Array.isArray(parsed) ? parsed : [parsed];
      let count = 0;
      for (const item of cards) {
        if (item.question && item.answer) {
          const card: Flashcard = {
            id: generateId(),
            lessonId: lessonId ?? "",
            question: String(item.question),
            answer: String(item.answer),
            tag: String(item.tag ?? ""),
            createdAt: new Date().toISOString(),
          };
          await saveFlashcard(card);
          setExisting((prev) => [...prev, card]);
          count++;
        }
      }
      setImportJson("");
      setShowImport(false);
      Alert.alert("Imported", `${count} flashcard(s) added.`);
    } catch {
      Alert.alert("Invalid JSON", "Please paste valid JSON array of {question, answer, tag?}");
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
        <Text style={styles.headerTitle}>Add Flashcards</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={Colors.black} />
        </TouchableOpacity>
      </View>
      <Text style={styles.count}>
        {existing.length} card{existing.length !== 1 ? "s" : ""} in this lesson
      </Text>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Question</Text>
          <TextInput
            placeholder="What is JSX?"
            value={question}
            onChangeText={setQuestion}
            style={styles.input}
            placeholderTextColor={Colors.textMuted}
            multiline
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Answer</Text>
          <TextInput
            placeholder="JSX is a syntax extension..."
            value={answer}
            onChangeText={setAnswer}
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholderTextColor={Colors.textMuted}
            multiline
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Tag (optional)</Text>
          <TextInput
            placeholder="e.g. fundamentals"
            value={tag}
            onChangeText={setTag}
            style={styles.input}
            placeholderTextColor={Colors.textMuted}
          />
        </View>
        <Button
          label="Add Flashcard"
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
        <ChevronDown
          size={16}
          color={Colors.primary}
          style={{ transform: [{ rotate: showImport ? "180deg" : "0deg" }] }}
        />
      </TouchableOpacity>

      {showImport && (
        <View style={styles.importBox}>
          <Text style={styles.importHint}>
            Paste a JSON array: {`[{"question":"...","answer":"...","tag":"..."}]`}
          </Text>
          <TextInput
            value={importJson}
            onChangeText={setImportJson}
            style={[styles.input, { height: 120, textAlignVertical: "top" }]}
            placeholder={`[{"question":"...", "answer":"..."}]`}
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

      {/* Existing cards */}
      {existing.length > 0 && (
        <View style={styles.existingSection}>
          <Text style={styles.sectionTitle}>Existing Flashcards</Text>
          {existing.map((card) => (
            <View key={card.id} style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                {card.tag ? (
                  <Text style={styles.cardTag}>{card.tag}</Text>
                ) : null}
                <Text style={styles.cardQ}>{card.question}</Text>
                <Text style={styles.cardA}>{card.answer}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Delete", "Delete this flashcard?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => handleDelete(card.id),
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
  form: { gap: 14, marginBottom: 20 },
  field: { gap: 6 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
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
  cardRow: {
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
  cardTag: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardQ: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  cardA: { fontSize: 13, color: Colors.textSecondary, fontWeight: "500" },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
