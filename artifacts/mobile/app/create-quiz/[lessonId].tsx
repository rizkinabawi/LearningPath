import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { X, Trash2, ChevronDown, ImagePlus } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Button } from "@/components/Button";
import {
  getQuizzes,
  saveQuiz,
  deleteQuiz,
  generateId,
  type Quiz,
} from "@/utils/storage";
import Colors from "@/constants/colors";

const IMAGE_DIR = (FileSystem.documentDirectory ?? "") + "quiz-images/";

const ensureImageDir = async () => {
  if (Platform.OS === "web") return;
  const info = await FileSystem.getInfoAsync(IMAGE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  }
};

const saveImageToLocal = async (uri: string, id: string): Promise<string> => {
  if (Platform.OS === "web") return uri;
  await ensureImageDir();
  const ext = uri.split(".").pop()?.split("?")[0] ?? "jpg";
  const dest = IMAGE_DIR + id + "." + ext;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
};

export default function CreateQuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
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

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Diperlukan", "Izinkan akses galeri untuk upload gambar.");
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!question.trim()) {
      Alert.alert("Isi Pertanyaan", "Pertanyaan tidak boleh kosong.");
      return;
    }
    const filledOptions = options.filter((o) => o.trim());
    if (filledOptions.length < 2) {
      Alert.alert("Minimal 2 Pilihan", "Isi minimal 2 pilihan jawaban.");
      return;
    }
    if (correctOption === null || !options[correctOption]?.trim()) {
      Alert.alert("Pilih Jawaban Benar", "Tandai salah satu pilihan sebagai jawaban benar.");
      return;
    }
    setLoading(true);
    const id = generateId();
    let savedImage: string | undefined;
    if (imageUri) {
      try {
        savedImage = await saveImageToLocal(imageUri, id);
      } catch {
        savedImage = imageUri;
      }
    }
    const quiz: Quiz = {
      id,
      lessonId: lessonId ?? "",
      question: question.trim(),
      options: options.filter((o) => o.trim()),
      answer: options[correctOption].trim(),
      type: "multiple-choice",
      image: savedImage,
      createdAt: new Date().toISOString(),
    };
    await saveQuiz(quiz);
    setExisting((prev) => [...prev, quiz]);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOption(null);
    setImageUri(null);
    setLoading(false);
    Alert.alert("Tersimpan!", "Soal berhasil ditambahkan.");
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
      Alert.alert("Berhasil Import", `${count} soal ditambahkan.`);
    } catch {
      Alert.alert(
        "JSON Tidak Valid",
        'Format: [{"question":"...","options":["A","B","C","D"],"answer":"A"}]'
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
        <Text style={styles.headerTitle}>Tambah Soal Quiz</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={Colors.black} />
        </TouchableOpacity>
      </View>
      <Text style={styles.count}>
        {existing.length} soal di pelajaran ini
      </Text>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Pertanyaan</Text>
          <TextInput
            placeholder="Contoh: Apa yang dikembalikan useState?"
            value={question}
            onChangeText={setQuestion}
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholderTextColor={Colors.textMuted}
            multiline
          />
        </View>

        {/* Image Picker */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Gambar Soal (opsional)</Text>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.imagePicker}
            activeOpacity={0.75}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImagePlus size={28} color={Colors.textMuted} />
                <Text style={styles.imagePlaceholderText}>
                  Tap untuk upload gambar soal
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUri && (
            <TouchableOpacity
              onPress={() => setImageUri(null)}
              style={styles.removeImage}
            >
              <Text style={styles.removeImageText}>Hapus gambar</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.fieldLabel}>Pilihan Jawaban</Text>
        <Text style={styles.fieldHint}>
          Tap salah satu pilihan untuk menandai sebagai jawaban benar
        </Text>
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
              placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
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
          label="Tambah Soal"
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
        <Text style={styles.importToggleText}>Import dari JSON (hasil AI)</Text>
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
          <Text style={styles.sectionTitle}>Soal yang Ada</Text>
          {existing.map((q, i) => (
            <View key={q.id} style={styles.questionRow}>
              {q.image && (
                <Image
                  source={{ uri: q.image }}
                  style={styles.cardThumb}
                  resizeMode="cover"
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.questionNum}>Soal {i + 1}</Text>
                <Text style={styles.questionText}>{q.question}</Text>
                <Text style={styles.questionAnswer}>✓ {q.answer}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Hapus", "Hapus soal ini?", [
                    { text: "Batal", style: "cancel" },
                    {
                      text: "Hapus",
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
  headerTitle: { fontSize: 22, fontWeight: "900", color: Colors.black },
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
  imagePicker: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    backgroundColor: Colors.surface,
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 14,
  },
  imagePlaceholder: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  removeImage: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  removeImageText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: "700",
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
  cardThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: Colors.surface,
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
