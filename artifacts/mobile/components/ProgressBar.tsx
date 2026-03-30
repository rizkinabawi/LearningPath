import React from "react";
import { View, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface ProgressBarProps {
  value: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  borderRadius?: number;
}

export const ProgressBar = ({
  value,
  color = Colors.primary,
  backgroundColor = Colors.border,
  height = 8,
  borderRadius = 999,
}: ProgressBarProps) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  return (
    <View
      style={[
        styles.track,
        { backgroundColor, height, borderRadius },
      ]}
    >
      <View
        style={[
          styles.fill,
          { backgroundColor: color, width: `${clampedValue}%`, borderRadius },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
