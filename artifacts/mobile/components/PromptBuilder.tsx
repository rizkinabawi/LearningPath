import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  StyleSheet,
  Animated,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  Copy,
  Share2,
  Sparkles,
  Check,
  ChevronRight,
  BookOpen,
  Code2,
  Languages,
  Globe,
  Calculator,
  Brain,
} from "lucide-react-native";
import { generatePrompt, PROMPT_TEMPLATES } from "@/utils/prompt-templates";
import Colors from "@/constants/colors";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Programming: <Code2 size={18} color={Colors.primary} />,
  Language: <Languages size={18} color={Colors.primary} />,
  Science: <Brain size={18} color={Colors.primary} />,
  Math: <Calculator size={18} color={Colors.primary} />,
  History: <Globe size={18} color={Colors.primary} />,
  General: <BookOpen size={18} color={Colors.primary} />,
};

const TEMPLATE_GROUPS = [
  {
    group: "Flashcards",
    items: PROMPT_TEMPLATES.filter((t) => t.type === "Flashcards"),
  },
  {
    group: "Quiz",
    items: PROMPT_TEMPLATES.filter((t) => t.type === "Quiz"),
  },
  {
    group: "Other",
    items: PROMPT_TEMPLATES.filter(
      (t) => t.type !== "Flashcards" && t.type !== "Quiz"
    ),
  },
].filter((g) => g.items.length > 0);

export const PromptBuilder = () => {
  const [topic, setTopic] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const handleGenerate = async (template: string, id: string) => {
    if (!topic.trim()) {
      Alert.alert("Isi Topik Dulu", "Masukkan topik sebelum memilih template.");
      return;
    }
    const prompt = generatePrompt(template, topic.trim());
    setGeneratedPrompt(prompt);
    setActiveTemplateId(id);

    // Auto-copy
    await Clipboard.setStringAsync(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const copyManual = async () => {
    await Clipboard.setStringAsync(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await Share.share({ message: generatedPrompt });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Sparkles size={18} color={Colors.primary} />
        <Text style={styles.headerTitle}>AI Prompt Builder</Text>
      </View>
      <Text style={styles.headerSub}>
        Isi topik, pilih template — prompt langsung tersalin otomatis ke clipboard. Tinggal paste ke ChatGPT atau Claude!
      </Text>

      {/* Topic Input */}
      <View style={styles.topicBox}>
        <Text style={styles.fieldLabel}>Topik</Text>
        <TextInput
          placeholder="Contoh: React Native, JLPT N3, Fotosintesis..."
          value={topic}
          onChangeText={setTopic}
          style={styles.topicInput}
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Auto-copy notice */}
      {copied && (
        <View style={styles.copiedBanner}>
          <Check size={14} color={Colors.success} />
          <Text style={styles.copiedText}>Prompt tersalin! Buka ChatGPT/Claude dan paste.</Text>
        </View>
      )}

      {/* Generated Prompt */}
      {!!generatedPrompt && (
        <View style={styles.resultBox}>
          <View style={styles.resultHeader}>
            <Sparkles size={14} color="#1E40AF" />
            <Text style={styles.resultLabel}>Prompt yang Digenerate</Text>
          </View>
          <Text style={styles.resultText}>{generatedPrompt}</Text>
          <View style={styles.resultActions}>
            <TouchableOpacity
              onPress={copyManual}
              style={styles.copyBtn}
              activeOpacity={0.7}
            >
              {copied ? (
                <Check size={16} color={Colors.white} />
              ) : (
                <Copy size={16} color={Colors.white} />
              )}
              <Text style={styles.copyBtnText}>
                {copied ? "Tersalin!" : "Salin Ulang"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.shareBtn}
              activeOpacity={0.7}
            >
              <Share2 size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Template Groups */}
      {TEMPLATE_GROUPS.map((group) => (
        <View key={group.group} style={styles.groupWrap}>
          <Text style={styles.groupLabel}>{group.group}</Text>
          {group.items.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => handleGenerate(t.template, t.id)}
              style={[
                styles.templateCard,
                activeTemplateId === t.id && styles.templateCardActive,
              ]}
              activeOpacity={0.75}
            >
              <View style={styles.templateIcon}>
                {CATEGORY_ICONS[t.topic] ?? (
                  <BookOpen size={18} color={Colors.primary} />
                )}
              </View>
              <View style={styles.templateInfo}>
                <Text style={styles.templateTitle}>{t.title}</Text>
                <Text style={styles.templateType}>{t.topic}</Text>
              </View>
              {activeTemplateId === t.id ? (
                <Check size={16} color={Colors.success} />
              ) : (
                <ChevronRight size={16} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: Colors.black,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "500",
    marginBottom: 18,
    lineHeight: 19,
  },
  topicBox: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  topicInput: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  copiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  copiedText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#15803D",
    flex: 1,
  },
  resultBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: 10,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E40AF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  resultText: {
    fontSize: 14,
    color: "#1E3A8A",
    fontWeight: "500",
    lineHeight: 22,
  },
  resultActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  copyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.black,
    paddingVertical: 12,
    borderRadius: 12,
  },
  copyBtnText: {
    color: Colors.white,
    fontWeight: "800",
    fontSize: 13,
  },
  shareBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.white,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  groupWrap: { marginBottom: 20 },
  groupLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    gap: 12,
  },
  templateCardActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  templateIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  templateInfo: { flex: 1 },
  templateTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 2,
  },
  templateType: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
  },
});
