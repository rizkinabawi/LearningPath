import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  PressableProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import Colors from "@/constants/colors";

type Variant = "default" | "outline" | "ghost" | "danger";
type Size = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends PressableProps {
  children?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  label?: string;
  style?: ViewStyle;
}

export const Button = ({
  children,
  variant = "default",
  size = "default",
  loading = false,
  label,
  style,
  disabled,
  ...props
}: ButtonProps) => {
  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}` as keyof typeof styles] as ViewStyle,
    styles[`variant_${variant}` as keyof typeof styles] as ViewStyle,
    disabled || loading ? styles.disabled : {},
    style ?? {},
  ];

  const textColor =
    variant === "default"
      ? "#fff"
      : variant === "danger"
      ? "#fff"
      : variant === "outline"
      ? Colors.black
      : Colors.textSecondary;

  return (
    <Pressable
      style={({ pressed }) => [
        ...containerStyle,
        pressed && !disabled && !loading ? styles.pressed : {},
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "default" ? "#fff" : Colors.black} />
      ) : label ? (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.5 },
  label: {
    fontWeight: "800",
    fontSize: 15,
    textAlign: "center",
  },
  size_default: { height: 48 },
  size_sm: { height: 40, paddingHorizontal: 12 },
  size_lg: { height: 56, paddingHorizontal: 32, borderRadius: 20 },
  size_icon: { height: 40, width: 40, padding: 0, paddingHorizontal: 0 },
  variant_default: { backgroundColor: Colors.black },
  variant_outline: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  variant_ghost: { backgroundColor: "transparent" },
  variant_danger: { backgroundColor: Colors.danger },
});
