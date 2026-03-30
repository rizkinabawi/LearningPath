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
  FlatList,
} from "react-native";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Code2,
  Cpu,
  Globe,
  Languages,
  MessageSquare,
  Settings,
  BrainCircuit,
  Zap,
  NotebookPen,
  Trash2,
  Sparkles,
  CreditCard,
  HelpCircle,
} from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
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
  deleteModule,
  deleteLesson,
  generateId,
  type LearningPath,
  type Module,
  type Lesson,
} from "@/utils/storage";
import Colors from "@/constants/colors";

const MODULE_ICONS: { name: string; Icon: React.ElementType }[] = [
  { name: "Book", Icon: BookOpen },
  { name: "Code", Icon: Code2 },
  { name: "Logic", Icon: Cpu },
  { name: "Web", Icon: Globe },
  { name: "Lang", Icon: Languages },
  { name: "Chat", Icon: MessageSquare },
  { name: "Setup", Icon: Settings },
  { name: "Brain", Icon: BrainCircuit },
  { name: "Zap", Icon: Zap },
];

const getModuleIcon = (iconName?: string) => {
  const found = MODULE_ICONS.find((i) => i.name === iconName);
  if (!found) return <BookOpen size={16} color={Colors.primary} />;
  const { Icon } = found;
  return <Icon size={16} color={Colors.primary} />;
};

export default function LearnPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [activePath, setActivePath] = useState<LearningPath | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [lessonCounts, setLessonCounts] = useState<Record<string, { fc: number; qz: number }>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const [showCreatePath, setShowCreatePath] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [newPathName, setNewPathName] = useState("");
  const [newPathDesc, setNewPathDesc] = useState("");
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleIcon, setNewModuleIcon] = useState("Book");
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonDesc, setNewLessonDesc] = useState("");
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);

  const loadPaths = async () => {
    const data = await getLearningPaths();
    setPaths(data);
    if (data.length > 0 && !activePath) {
      setActivePath(data[0]);
    }
  };

  const loadModules = async () => {
    if (!activePath) return;
    const data = await getModules(activePath.id);
    const sorted = data.sort((a, b) => a.order - b.order);
    setModules(sorted);
    const lessonsMap: Record<string, Lesson[]> = {};
    const countsMap: Record<string, { fc: number; qz: number }> = {};
    for (const mod of sorted) {
      const l = await getLessons(mod.id);
      lessonsMap[mod.id] = l.sort((a, b) => a.order - b.order);
      let fc = 0;
      let qz = 0;
      for (const lesson of l) {
        const cards = await getFlashcards(lesson.id);
        const quizzes = await getQuizzes(lesson.id);
        fc += cards.length;
        qz += quizzes.length;
      }
      countsMap[mod.id] = { fc, qz };
    }
    setLessons(lessonsMap);
    setLessonCounts(countsMap);
  };

  useFocusEffect(
    useCallback(() => {
      loadPaths();
    }, [])
  );

  useEffect(() => {
    if (activePath) loadModules();
  }, [activePath]);

  const handleCreatePath = async () => {
    if (!newPathName.trim()) return;
    const path: LearningPath = {
      id: generateId(),
      name: newPathName.trim(),
      description: newPathDesc.trim(),
      userId: "local",
      createdAt: new Date().toISOString(),
    };
    await saveLearningPath(path);
    setNewPathName("");
    setNewPathDesc("");
    setShowCreatePath(false);
    const updated = await getLearningPaths();
    setPaths(updated);
    setActivePath(path);
  };

  const handleCreateModule = async () => {
    if (!newModuleName.trim() || !activePath) return;
    const mod: Module = {
      id: generateId(),
      pathId: activePath.id,
      name: newModuleName.trim(),
      description: "",
      icon: newModuleIcon,
      order: modules.length,
      createdAt: new Date().toISOString(),
    };
    await saveModule(mod);
    setNewModuleName("");
    setShowCreateModule(false);
    loadModules();
  };

  const handleCreateLesson = async () => {
    if (!newLessonName.trim() || !targetModuleId) return;
    const lesson: Lesson = {
      id: generateId(),
      moduleId: targetModuleId,
      name: newLessonName.trim(),
      description: newLessonDesc.trim(),
      order: (lessons[targetModuleId] ?? []).length,
      createdAt: new Date().toISOString(),
    };
    await saveLesson(lesson);
    setNewLessonName("");
    setNewLessonDesc("");
    setShowCreateLesson(false);
    loadModules();
  };

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const confirmDeletePath = (path: LearningPath) => {
    Alert.alert("Delete Path", `Delete "${path.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteLearningPath(path.id);
          const updated = await getLearningPaths();
          setPaths(updated);
          setActivePath(updated[0] ?? null);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop:
              Platform.OS === "web" ? 74 : insets.top + 12,
          },
        ]}
      >
        <Text style={styles.headerTitle}>Learn</Text>
        <Button
          size="icon"
          variant="default"
          onPress={() => setShowCreatePath(true)}
          style={styles.addBtn}
        >
          <Plus size={20} color={Colors.white} />
        </Button>
      </View>

      {/* Path Tabs */}
      {paths.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pathTabs}
        >
          {paths.map((path) => (
            <TouchableOpacity
              key={path.id}
              onPress={() => setActivePath(path)}
              onLongPress={() => confirmDeletePath(path)}
              style={[
                styles.pathTab,
                activePath?.id === path.id && styles.pathTabActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pathTabText,
                  activePath?.id === path.id && styles.pathTabTextActive,
                ]}
              >
                {path.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* No paths */}
        {paths.length === 0 && (
          <View style={styles.emptyWrap}>
            <BookOpen size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Learning Paths</Text>
            <Text style={styles.emptySub}>
              Create your first path to start organizing your learning journey.
            </Text>
            <Button
              label="Create Path"
              onPress={() => setShowCreatePath(true)}
              style={{ marginTop: 16, borderRadius: 14 }}
            />
          </View>
        )}

        {/* Modules */}
        {modules.map((mod) => {
          const isExpanded = !!expandedModules[mod.id];
          const modLessons = lessons[mod.id] ?? [];
          const counts = lessonCounts[mod.id] ?? { fc: 0, qz: 0 };
          return (
            <View key={mod.id} style={styles.moduleWrap}>
              <TouchableOpacity
                onPress={() => toggleModule(mod.id)}
                style={styles.moduleHeader}
                activeOpacity={0.7}
              >
                <View style={styles.moduleIconWrap}>
                  {getModuleIcon(mod.icon)}
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleName}>{mod.name}</Text>
                  <Text style={styles.moduleMeta}>
                    {modLessons.length} lessons · {counts.fc} cards · {counts.qz} quizzes
                  </Text>
                </View>
                {isExpanded ? (
                  <ChevronDown size={18} color={Colors.textMuted} />
                ) : (
                  <ChevronRight size={18} color={Colors.textMuted} />
                )}
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.lessonList}>
                  {modLessons.map((lesson) => (
                    <View key={lesson.id} style={styles.lessonRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.lessonName}>{lesson.name}</Text>
                        {lesson.description ? (
                          <Text style={styles.lessonDesc}>{lesson.description}</Text>
                        ) : null}
                      </View>
                      <View style={styles.lessonActions}>
                        <TouchableOpacity
                          onPress={() =>
                            router.push(`/flashcard/${lesson.id}`)
                          }
                          style={[styles.lessonBtn, { backgroundColor: Colors.primaryLight }]}
                        >
                          <CreditCard size={14} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => router.push(`/quiz/${lesson.id}`)}
                          style={[styles.lessonBtn, { backgroundColor: "#F0FDF4" }]}
                        >
                          <HelpCircle size={14} color={Colors.success} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            router.push(`/create-flashcard/${lesson.id}`)
                          }
                          style={[styles.lessonBtn, { backgroundColor: Colors.surface }]}
                        >
                          <Plus size={14} color={Colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addLessonBtn}
                    onPress={() => {
                      setTargetModuleId(mod.id);
                      setShowCreateLesson(true);
                    }}
                  >
                    <Plus size={14} color={Colors.textMuted} />
                    <Text style={styles.addLessonText}>Add Lesson</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* Add Module */}
        {activePath && (
          <TouchableOpacity
            style={styles.addModuleBtn}
            onPress={() => setShowCreateModule(true)}
          >
            <Plus size={16} color={Colors.textMuted} />
            <Text style={styles.addModuleText}>Add Module</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal: Create Path */}
      <Modal visible={showCreatePath} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Learning Path</Text>
            <TextInput
              placeholder="Path name"
              value={newPathName}
              onChangeText={setNewPathName}
              style={styles.modalInput}
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
            <TextInput
              placeholder="Description (optional)"
              value={newPathDesc}
              onChangeText={setNewPathDesc}
              style={styles.modalInput}
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.modalBtns}>
              <Button
                variant="outline"
                label="Cancel"
                onPress={() => setShowCreatePath(false)}
                style={{ flex: 1 }}
              />
              <Button
                label="Create"
                onPress={handleCreatePath}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Create Module */}
      <Modal visible={showCreateModule} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Module</Text>
            <TextInput
              placeholder="Module name"
              value={newModuleName}
              onChangeText={setNewModuleName}
              style={styles.modalInput}
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
            <Text style={styles.modalSectionLabel}>Pick an Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.iconRow}>
                {MODULE_ICONS.map((item) => {
                  const { Icon, name } = item;
                  return (
                    <TouchableOpacity
                      key={name}
                      onPress={() => setNewModuleIcon(name)}
                      style={[
                        styles.iconOption,
                        newModuleIcon === name && styles.iconOptionActive,
                      ]}
                    >
                      <Icon
                        size={18}
                        color={
                          newModuleIcon === name ? Colors.primary : Colors.textMuted
                        }
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.modalBtns}>
              <Button
                variant="outline"
                label="Cancel"
                onPress={() => setShowCreateModule(false)}
                style={{ flex: 1 }}
              />
              <Button
                label="Create"
                onPress={handleCreateModule}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Create Lesson */}
      <Modal visible={showCreateLesson} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Lesson</Text>
            <TextInput
              placeholder="Lesson name"
              value={newLessonName}
              onChangeText={setNewLessonName}
              style={styles.modalInput}
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
            <TextInput
              placeholder="Description (optional)"
              value={newLessonDesc}
              onChangeText={setNewLessonDesc}
              style={styles.modalInput}
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.modalBtns}>
              <Button
                variant="outline"
                label="Cancel"
                onPress={() => setShowCreateLesson(false)}
                style={{ flex: 1 }}
              />
              <Button
                label="Create"
                onPress={handleCreateLesson}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
  },
  headerTitle: { fontSize: 28, fontWeight: "900", color: Colors.black },
  addBtn: { width: 38, height: 38, borderRadius: 12 },
  pathTabs: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexDirection: "row",
  },
  pathTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pathTabActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  pathTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  pathTabTextActive: { color: Colors.white },
  scroll: { flex: 1 },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
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
  moduleWrap: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  moduleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleInfo: { flex: 1 },
  moduleName: { fontSize: 15, fontWeight: "800", color: Colors.black },
  moduleMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  lessonList: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 10,
  },
  lessonName: { fontSize: 14, fontWeight: "700", color: Colors.black },
  lessonDesc: { fontSize: 12, color: Colors.textMuted, fontWeight: "500", marginTop: 2 },
  lessonActions: { flexDirection: "row", gap: 6 },
  lessonBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addLessonBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
  },
  addLessonText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  addModuleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    marginBottom: 20,
  },
  addModuleText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.black,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  iconRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  iconOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  modalBtns: { flexDirection: "row", gap: 10 },
});
