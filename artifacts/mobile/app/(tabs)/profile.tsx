import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  Share,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  BookOpen,
  Trash2,
  ChevronRight,
  Share2,
  RefreshCcw,
  Star,
} from "lucide-react-native";
import {
  getUser,
  getStats,
  getLearningPaths,
  clearAllData,
  type User as UserType,
  type Stats,
} from "@/utils/storage";
import Colors from "@/constants/colors";

export default function ProfileTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pathCount, setPathCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [u, s, paths] = await Promise.all([
          getUser(),
          getStats(),
          getLearningPaths(),
        ]);
        setUser(u);
        setStats(s);
        setPathCount(paths.length);
      })();
    }, [])
  );

  const accuracy =
    stats && stats.totalAnswers > 0
      ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
      : 0;

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will erase all your learning paths, flashcards, quizzes, and progress. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    await Share.share({
      message: `I've studied ${stats?.totalAnswers ?? 0} questions with ${accuracy}% accuracy using Mobile Learning! 📚`,
    });
  };

  const MenuItem = ({
    icon,
    label,
    onPress,
    danger = false,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: danger
              ? Colors.dangerLight
              : Colors.surface,
          },
        ]}
      >
        {icon}
      </View>
      <Text
        style={[
          styles.menuLabel,
          danger && { color: Colors.danger },
        ]}
      >
        {label}
      </Text>
      <ChevronRight size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop:
            Platform.OS === "web" ? 80 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 : 30,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <User size={32} color={Colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user?.name ?? "Learner"}</Text>
          <Text style={styles.profileSub}>{user?.topic ?? "—"}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{user?.level ?? "beginner"}</Text>
          </View>
        </View>
      </View>

      {/* Goal */}
      {user?.goal && (
        <View style={styles.goalCard}>
          <Text style={styles.sectionLabel}>Learning Goal</Text>
          <Text style={styles.goalText}>{user.goal}</Text>
        </View>
      )}

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{pathCount}</Text>
          <Text style={styles.statLabel}>Paths</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats?.totalAnswers ?? 0}</Text>
          <Text style={styles.statLabel}>Answers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{accuracy}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats?.streak ?? 0}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      {/* Menu */}
      <Text style={styles.sectionTitle}>Options</Text>
      <View style={styles.menuCard}>
        <MenuItem
          icon={<Star size={18} color={Colors.warning} />}
          label="Rate the App"
          onPress={() => {}}
        />
        <View style={styles.menuDivider} />
        <MenuItem
          icon={<Share2 size={18} color={Colors.primary} />}
          label="Share My Progress"
          onPress={handleShare}
        />
        <View style={styles.menuDivider} />
        <MenuItem
          icon={<RefreshCcw size={18} color={Colors.textSecondary} />}
          label="Reset Onboarding"
          onPress={() => {
            Alert.alert(
              "Reset Profile",
              "This will reset your profile info but keep your learning data.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  onPress: async () => {
                    const AsyncStorage = (
                      await import("@react-native-async-storage/async-storage")
                    ).default;
                    await AsyncStorage.removeItem("user");
                    router.replace("/onboarding");
                  },
                },
              ]
            );
          }}
        />
        <View style={styles.menuDivider} />
        <MenuItem
          icon={<Trash2 size={18} color={Colors.danger} />}
          label="Clear All Data"
          onPress={handleClearData}
          danger
        />
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Mobile Learning · v1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { fontSize: 20, fontWeight: "900", color: Colors.black, marginBottom: 2 },
  profileSub: { fontSize: 13, color: Colors.textMuted, fontWeight: "500", marginBottom: 6 },
  levelBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  levelText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  goalText: { fontSize: 15, fontWeight: "600", color: Colors.black },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "900", color: Colors.black },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  statDivider: { width: 1, backgroundColor: Colors.borderLight, height: "100%" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.black,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.black },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
    marginBottom: 20,
  },
});
