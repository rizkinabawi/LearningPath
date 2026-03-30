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
import { X, Trash2, ChevronDown, ImagePlus, Image as ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Button } from "@/components/Button";
import {
  getFlashcards,
  saveFlashcard,
  deleteFlashcard,
  generateId,
  type Flashcard,
} from "@/utils/storage";
import Colors from "@/constants/colors";

const IMAGE_DIR = (FileSystem.documentDirectory ?? "") + "flashcard-images/";

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

export default function CreateFlashcardScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tag, setTag] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
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
    if (!question.trim() || !answer.trim()) {
      Alert.alert("Lengkapi Form", "Pertanyaan dan jawaban wajib diisi.");
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
    const card: Flashcard = {
      id,
      lessonId: lessonId ?? "",
      question: question.trim(),
      answer: answer.trim(),
      tag: tag.trim(),
      image: savedImage,
      createdAt: new Date().toISOString(),
    };
    await saveFlashcard(card);
    setExisting((prev) => [...prev, card]);
    setQuestion("");
    setAnswer("");
    setTag("");
    setImageUri(null);
    setLoading(false);
    Alert.alert("Tersimpan!", "Flashcard berhasil ditambahkan.");
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
      Alert.alert("Berhasil Import", `${count} flashcard ditambahkan.`);
    } catch {
      Alert.alert("JSON Tidak Valid", 'Format: [{"question":"...","answer":"...","tag":"..."}]');
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
        <Text style={styles.headerTitle}>Tambah Flashcard</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={Colors.dark} />
        </TouchableOpacity>
      </View>
      <Text style={styles.count}>
        {existing.length} kartu di pelajaran ini
      </Text>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Pertanyaan</Text>
          <TextInput
            placeholder="Contoh: Apa itu JSX?"
            value={question}
            onChangeText={setQuestion}
            style={styles.input}
            placeholderTextColor={Colors.textMuted}
            multiline
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Jawaban</Text>
          <TextInput
            placeholder="Contoh: JSX adalah ekstensi sintaks..."
            value={answer}
            onChangeText={setAnswer}
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholderTextColor={Colors.textMuted}
            multiline
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Tag (opsional)</Text>
          <TextInput
            placeholder="Contoh: dasar, syntax"
            value={tag}
            onChangeText={setTag}
            style={styles.input}
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Image Picker */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Gambar (opsional)</Text>
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
                  Tap untuk upload gambar
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

        <Button
          label="Tambah Flashcard"
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
            Format: {`[{"question":"...","answer":"...","tag":"..."}]`}
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
          <Text style={styles.sectionTitle}>Flashcard yang Ada</Text>
          {existing.map((card) => (
            <View key={card.id} style={styles.cardRow}>
              {card.image && (
                <Image
                  source={{ uri: card.image }}
                  style={styles.cardThumb}
                  resizeMode="cover"
                />
              )}
              <View style={{ flex: 1 }}>
                {card.tag ? (
                  <Text style={styles.cardTag}>{card.tag}</Text>
                ) : null}
                <Text style={styles.cardQ}>{card.question}</Text>
                <Text style={styles.cardA}>{card.answer}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Hapus", "Hapus flashcard ini?", [
                    { text: "Batal", style: "cancel" },
                    {
                      text: "Hapus",
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
  headerTitle: { fontSize: 22, fontWeight: "900", color: Colors.dark },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.background,
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
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imagePicker: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    backgroundColor: Colors.background,
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
  importToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
    color: Colors.dark,
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
    borderColor: Colors.border,
    gap: 12,
  },
  cardThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: Colors.background,
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
    color: Colors.dark,
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
