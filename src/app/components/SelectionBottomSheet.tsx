import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../../context/ThemeContext";

type Props = {
  visible: boolean;
  onDelete: () => void;
};

export default function SelectionBottomSheet({ visible, onDelete }: Props) {
  const progress = useSharedValue(0);
  const { isDark } = useTheme();

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: 250,
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: (1 - progress.value) * 120,
        },
      ],
      opacity: progress.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(66, 66, 66, 0.45)"
            : "rgba(211, 206, 206, 0.79)",
        },
        animatedStyle,
      ]}
    >
      <Pressable style={styles.deleteButton} onPress={onDelete}>
        <Ionicons name="trash-outline" size={28} color="#FF3B30" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 42,

    height: 82,

    borderRadius: 24,

    backgroundColor: "rgba(24,24,24,0.82)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    justifyContent: "center",
    alignItems: "center",
  },

  deleteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,

    justifyContent: "center",
    alignItems: "center",
  },
});
