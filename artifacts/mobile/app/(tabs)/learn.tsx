import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getLearningPaths,
  getModules,
  getLessons,
  getFlashcards,
  getQuizzes,
  saveLearningPath,
  saveModule,
  saveLesson,
  deleteLearningPath,
  generateId,
  type LearningPath,
  type Module,
  type Lesson,
} from "@/utils/storage";
import Colors, { shadow, CARD_COLORS } from "@/constants/colors";

const ICONS = ["📘", "🎨", "🌐", "🧠", "⚗️", "📐", "💻", "🎯", "🔬"];

export default function LearnPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [activePath, setActivePath] = useState<LearningPath | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [counts, setCounts] = useState<Record<string, { fc: number; qz: number }>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const [showCreatePath, setShowCreatePath] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [newPathName, setNewPathName] = useState("");
  const [newPathDesc, setNewPathDesc] = useState("");
  const [newModuleName, setNewModuleName] = useState("");
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonDesc, setNewLessonDesc] = useState("");
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);

  const loadPaths = async () => {
    const data = await getLearningPaths();
    setPaths(data);
    if (data.length > 0 && !activePath) setActivePath(data[0]);
  };

  const loadModules = async () => {
    if (!activePath) return;
    const mods = (await getModules(activePath.id)).sort((a, b) => a.order - b.order);
    setModules(mods);
    const lMap: Record<string, Lesson[]> = {};
    const cMap: Record<string, { fc: number; qz: number }> = {};
    for (const mod of mods) {
      const ls = await getLessons(mod.id);
      lMap[mod.id] = ls.sort((a, b) => a.order - b.order);
      let fc = 0, qz = 0;
      for (const l of ls) {
        fc += (await getFlashcards(l.id)).length;
        qz += (await getQuizzes(l.id)).length;
      }
      cMap[mod.id] = { fc, qz };
    }
    setLessons(lMap);
    setCounts(cMap);
  };

  useFocusEffect(useCallback(() => { loadPaths(); }, []));
  useEffect(() => { if (activePath) loadModules(); }, [activePath]);

  const createPath = async () => {
    if (!newPathName.trim()) return;
    const p: LearningPath = {
      id: generateId(), name: newPathName.trim(),
      description: newPathDesc.trim(), userId: "local",
      createdAt: new Date().toISOString(),
    };
    await saveLearningPath(p);
    setNewPathName(""); setNewPathDesc("");
    setShowCreatePath(false);
    const updated = await getLearningPaths();
    setPaths(updated); setActivePath(p);
  };

  const createModule = async () => {
    if (!newModuleName.trim() || !activePath) return;
    const m: Module = {
      id: generateId(), pathId: activePath.id,
      name: newModuleName.trim(), description: "",
      order: modules.length, createdAt: new Date().toISOString(),
    };
    await saveModule(m);
    setNewModuleName(""); setShowCreateModule(false);
    loadModules();
  };

  const createLesson = async () => {
    if (!newLessonName.trim() || !targetModuleId) return;
    const l: Lesson = {
      id: generateId(), moduleId: targetModuleId,
      name: newLessonName.trim(), description: newLessonDesc.trim(),
      order: (lessons[targetModuleId] ?? []).length,
      createdAt: new Date().toISOString(),
    };
    await saveLesson(l);
    setNewLessonName(""); setNewLessonDesc("");
    setShowCreateLesson(false); loadModules();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 74 : insets.top + 12 }]}>
        <View>
          <Text style={styles.headerSub}>Kurikulum</Text>
          <Text style={styles.headerTitle}>My Courses</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCreatePath(true)}
          style={styles.addBtn}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Path tabs */}
      {paths.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pathTabs}
        >
          {paths.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setActivePath(p)}
              onLongPress={() =>
                Alert.alert("Hapus", `Hapus "${p.name}"?`, [
                  { text: "Batal", style: "cancel" },
                  {
                    text: "Hapus", style: "destructive",
                    onPress: async () => {
                      await deleteLearningPath(p.id);
                      const u = await getLearningPaths();
                      setPaths(u); setActivePath(u[0] ?? null);
                    },
                  },
                ])
              }
              style={[styles.pathTab, activePath?.id === p.id && styles.pathTabActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.pathTabText, activePath?.id === p.id && styles.pathTabTextActive]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {paths.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 56 }}>📚</Text>
            <Text style={styles.emptyTitle}>Belum Ada Kursus</Text>
            <Text style={styles.emptySub}>Buat jalur belajar pertamamu dan mulai mengisi konten.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreatePath(true)}>
              <Text style={styles.emptyBtnText}>Buat Jalur Belajar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modules as course cards */}
        {modules.map((mod, mi) => {
          const isExpanded = !!expandedModules[mod.id];
          const modLessons = lessons[mod.id] ?? [];
          const cnt = counts[mod.id] ?? { fc: 0, qz: 0 };
          const cardColor = CARD_COLORS[mi % CARD_COLORS.length];
          return (
            <View key={mod.id} style={[styles.moduleCard, { borderLeftColor: cardColor }]}>
              <TouchableOpacity
                onPress={() => setExpandedModules((p) => ({ ...p, [mod.id]: !p[mod.id] }))}
                style={styles.moduleHeader}
                activeOpacity={0.7}
              >
                <View style={[styles.modIconWrap, { backgroundColor: cardColor + "20" }]}>
                  <Text style={{ fontSize: 20 }}>{ICONS[mi % ICONS.length]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleName}>{mod.name}</Text>
                  <Text style={styles.moduleMeta}>
                    {modLessons.length} pelajaran · {cnt.fc} kartu · {cnt.qz} kuis
                  </Text>
                </View>
                <Feather
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.lessonList}>
                  {modLessons.map((lesson, li) => (
                    <View key={lesson.id} style={styles.lessonRow}>
                      <View style={[styles.lessonNum, { backgroundColor: cardColor }]}>
                        <Text style={styles.lessonNumText}>{li + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.lessonName}>{lesson.name}</Text>
                        {lesson.description ? (
                          <Text style={styles.lessonDesc}>{lesson.description}</Text>
                        ) : null}
                      </View>
                      <View style={styles.lessonBtns}>
                        <TouchableOpacity
                          onPress={() => router.push(`/flashcard/${lesson.id}`)}
                          style={[styles.lessonActionBtn, { backgroundColor: Colors.primaryLight }]}
                        >
                          <Text style={{ fontSize: 14 }}>🃏</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => router.push(`/quiz/${lesson.id}`)}
                          style={[styles.lessonActionBtn, { backgroundColor: Colors.accentLight }]}
                        >
                          <Text style={{ fontSize: 14 }}>❓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => router.push(`/create-flashcard/${lesson.id}`)}
                          style={[styles.lessonActionBtn, { backgroundColor: Colors.background }]}
                        >
                          <Feather name="plus" size={14} color={Colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.addLessonRow}
                    onPress={() => { setTargetModuleId(mod.id); setShowCreateLesson(true); }}
                  >
                    <Feather name="plus-circle" size={16} color={Colors.primary} />
                    <Text style={styles.addLessonText}>Tambah Pelajaran</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {activePath && (
          <TouchableOpacity
            style={styles.addModuleBtn}
            onPress={() => setShowCreateModule(true)}
          >
            <Feather name="plus" size={16} color={Colors.primary} />
            <Text style={styles.addModuleText}>Tambah Modul</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modals */}
      {[
        { visible: showCreatePath, title: "Jalur Belajar Baru", onClose: () => setShowCreatePath(false), onSave: createPath,
          body: (
            <>
              <TextInput placeholder="Nama jalur" value={newPathName} onChangeText={setNewPathName}
                style={styles.modalInput} placeholderTextColor={Colors.textMuted} autoFocus />
              <TextInput placeholder="Deskripsi (opsional)" value={newPathDesc} onChangeText={setNewPathDesc}
                style={styles.modalInput} placeholderTextColor={Colors.textMuted} />
            </>
          )
        },
        { visible: showCreateModule, title: "Modul Baru", onClose: () => setShowCreateModule(false), onSave: createModule,
          body: (
            <TextInput placeholder="Nama modul" value={newModuleName} onChangeText={setNewModuleName}
              style={styles.modalInput} placeholderTextColor={Colors.textMuted} autoFocus />
          )
        },
        { visible: showCreateLesson, title: "Pelajaran Baru", onClose: () => setShowCreateLesson(false), onSave: createLesson,
          body: (
            <>
              <TextInput placeholder="Nama pelajaran" value={newLessonName} onChangeText={setNewLessonName}
                style={styles.modalInput} placeholderTextColor={Colors.textMuted} autoFocus />
              <TextInput placeholder="Deskripsi (opsional)" value={newLessonDesc} onChangeText={setNewLessonDesc}
                style={styles.modalInput} placeholderTextColor={Colors.textMuted} />
            </>
          )
        },
      ].map((m) => (
        <Modal key={m.title} visible={m.visible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{m.title}</Text>
              {m.body}
              <View style={styles.modalBtns}>
                <TouchableOpacity onPress={m.onClose} style={styles.modalBtnCancel}>
                  <Text style={styles.modalBtnCancelText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={m.onSave} style={styles.modalBtnPrimary}>
                  <Text style={styles.modalBtnPrimaryText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  headerSub: { fontSize: 12, color: Colors.textMuted, fontWeight: "700" },
  headerTitle: { fontSize: 26, fontWeight: "900", color: Colors.dark },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  pathTabs: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  pathTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pathTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pathTabText: { fontSize: 13, fontWeight: "700", color: Colors.textMuted },
  pathTabTextActive: { color: Colors.white },
  scroll: { flex: 1 },
  emptyWrap: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: "900", color: Colors.dark, marginTop: 12 },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: "center", fontWeight: "500", lineHeight: 20 },
  emptyBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  emptyBtnText: { color: Colors.white, fontWeight: "800", fontSize: 14 },
  moduleCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    ...shadow,
    shadowOpacity: 0.05,
  },
  moduleHeader: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  modIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleName: { fontSize: 15, fontWeight: "800", color: Colors.dark },
  moduleMeta: { fontSize: 11, color: Colors.textMuted, fontWeight: "500", marginTop: 2 },
  lessonList: { borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: 16, paddingBottom: 12 },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  lessonNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonNumText: { fontSize: 12, fontWeight: "900", color: Colors.white },
  lessonName: { fontSize: 14, fontWeight: "700", color: Colors.dark },
  lessonDesc: { fontSize: 12, color: Colors.textMuted, fontWeight: "500", marginTop: 1 },
  lessonBtns: { flexDirection: "row", gap: 6 },
  lessonActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addLessonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  addLessonText: { fontSize: 13, color: Colors.primary, fontWeight: "700" },
  addModuleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    marginBottom: 20,
  },
  addModuleText: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  modalOverlay: { flex: 1, backgroundColor: "rgba(10,37,64,0.45)", justifyContent: "flex-end" },
  modalBox: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: "900", color: Colors.dark, marginBottom: 4 },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
  },
  modalBtnCancelText: { fontWeight: "700", color: Colors.textSecondary, fontSize: 14 },
  modalBtnPrimary: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  modalBtnPrimaryText: { fontWeight: "800", color: Colors.white, fontSize: 14 },
});
