import React, { useState, useEffect } from "react";
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
import { BookOpen, User as UserIcon, Target, Brain } from "lucide-react-native";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { saveUser, getUser, generateId, type User } from "@/utils/storage";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";

type Level = "beginner" | "intermediate" | "advanced";

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (user) router.replace("/(tabs)");
    })();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !goal.trim() || !topic.trim()) {
      Alert.alert("Missing Info", "Please fill in all fields to start your journey!");
      return;
    }
    setLoading(true);
    const user: User = {
      id: generateId(),
      name: name.trim(),
      goal: goal.trim(),
      topic: topic.trim(),
      level,
      createdAt: new Date().toISOString(),
    };
    await saveUser(user);
    setLoading(false);
    router.replace("/(tabs)");
  };

  const LevelButton = ({
    val,
    label,
  }: {
    val: Level;
    label: string;
  }) => (
    <TouchableOpacity
      onPress={() => setLevel(val)}
      style={[
        styles.levelBtn,
        level === val && styles.levelBtnActive,
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.levelBtnText,
          level === val && styles.levelBtnTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop:
            Platform.OS === "web" ? 80 : insets.top + 24,
          paddingBottom: 40,
        },
      ]}
      bottomOffset={16}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoWrap}>
        <View style={styles.logo}>
          <BookOpen size={40} color="#fff" />
        </View>
        <Text style={styles.title}>Ayo Mulai!</Text>
        <Text style={styles.subtitle}>
          Rancang perjalanan belajarmu yang fleksibel dan personal.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <UserIcon size={14} color={Colors.black} />
            <Text style={styles.label}>Siapa namamu?</Text>
          </View>
          <TextInput
            placeholder="Masukkan namamu"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Target size={14} color={Colors.black} />
            <Text style={styles.label}>Apa target belajarmu?</Text>
          </View>
          <TextInput
            placeholder="Contoh: Kuasai React Native, Lulus JLPT N3"
            value={goal}
            onChangeText={setGoal}
            style={styles.input}
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Brain size={14} color={Colors.black} />
            <Text style={styles.label}>Topik utama yang ingin dipelajari?</Text>
          </View>
          <TextInput
            placeholder="Contoh: React Native, Bahasa Jepang"
            value={topic}
            onChangeText={setTopic}
            style={styles.input}
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { marginBottom: 10 }]}>
            Levelmu saat ini?
          </Text>
          <View style={styles.levelRow}>
            <LevelButton val="beginner" label="Pemula" />
            <LevelButton val="intermediate" label="Menengah" />
            <LevelButton val="advanced" label="Lanjut" />
          </View>
        </View>

        <Button
          size="lg"
          loading={loading}
          onPress={handleSubmit}
          label="Mulai Belajar 🚀"
          style={styles.submitBtn}
        />
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { paddingHorizontal: 24 },
  logoWrap: { alignItems: "center", marginBottom: 36 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: Colors.black,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  form: { gap: 20 },
  field: {},
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.black,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  levelRow: {
    flexDirection: "row",
    gap: 10,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: "center",
  },
  levelBtnActive: {
    borderColor: Colors.black,
    backgroundColor: Colors.black,
  },
  levelBtnText: {
    fontWeight: "700",
    fontSize: 13,
    color: Colors.textMuted,
  },
  levelBtnTextActive: { color: Colors.white },
  submitBtn: { marginTop: 8, borderRadius: 20 },
});
