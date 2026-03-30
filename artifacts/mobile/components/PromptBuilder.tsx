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
  Platform,
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
import { Button } from "@/components/Button";
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

export const PromptBuilder = () => {
  const [topic, setTopic] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = (template: string) => {
    if (!topic.trim()) {
      Alert.alert("Topic Required", "Please enter a topic first.");
      return;
    }
    setGeneratedPrompt(generatePrompt(template, topic.trim()));
  };

  const copyToClipboard = async () => {
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
    >
      <View style={styles.header}>
        <Sparkles size={20} color={Colors.primary} />
        <Text style={styles.headerTitle}>AI Prompt Builder</Text>
      </View>
      <Text style={styles.headerSub}>
        Enter a topic, pick a template, and copy the prompt to ChatGPT or Claude.
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="e.g. React Native, JLPT N3, Python..."
          value={topic}
          onChangeText={setTopic}
          style={styles.topicInput}
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <Text style={styles.sectionTitle}>Choose a Template</Text>
      {PROMPT_TEMPLATES.map((t) => (
        <TouchableOpacity
          key={t.id}
          onPress={() => handleGenerate(t.template)}
          style={styles.templateCard}
          activeOpacity={0.75}
        >
          <View style={styles.templateIcon}>
            {CATEGORY_ICONS[t.topic] ?? (
              <BookOpen size={18} color={Colors.primary} />
            )}
          </View>
          <View style={styles.templateInfo}>
            <Text style={styles.templateTitle}>{t.title}</Text>
            <Text style={styles.templateType}>
              {t.topic} · {t.type}
            </Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      ))}

      {!!generatedPrompt && (
        <View style={styles.resultBox}>
          <View style={styles.resultHeader}>
            <Sparkles size={16} color={Colors.primary} />
            <Text style={styles.resultLabel}>Generated Prompt</Text>
          </View>
          <Text style={styles.resultText}>"{generatedPrompt}"</Text>
          <View style={styles.resultActions}>
            <Button
              variant="default"
              size="default"
              onPress={copyToClipboard}
              style={styles.copyBtn}
            >
              <View style={styles.rowCenter}>
                {copied ? (
                  <Check size={18} color="#fff" />
                ) : (
                  <Copy size={18} color="#fff" />
                )}
                <Text style={styles.copyBtnText}>
                  {copied ? "Copied!" : "Copy Prompt"}
                </Text>
              </View>
            </Button>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.shareBtn}
            >
              <Share2 size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.black,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "500",
    marginBottom: 20,
    lineHeight: 18,
  },
  inputRow: {
    marginBottom: 24,
  },
  topicInput: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
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
    fontSize: 15,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 2,
  },
  templateType: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  resultBox: {
    marginTop: 24,
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
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
    fontWeight: "600",
    fontStyle: "italic",
    lineHeight: 22,
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: "row",
    gap: 10,
  },
  copyBtn: {
    flex: 1,
    borderRadius: 14,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  shareBtn: {
    width: 50,
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
});
