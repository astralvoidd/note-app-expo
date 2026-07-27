import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

type Props = {
  visible: boolean;
  count: number;
  onCancel: () => void;
  onDelete: () => void;
};

export default function DeleteConfirmModal({
  visible,
  count,
  onCancel,
  onDelete,
}: Props) {
  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);
  const hideModal = () => {
    setMounted(false);
  };

  useEffect(() => {
    if (visible) {
      setMounted(true);

      progress.value = withTiming(1, {
        duration: 220,
      });
    } else {
      progress.value = withTiming(
        0,
        {
          duration: 220,
        },
        (finished) => {
          if (finished) {
            scheduleOnRN(hideModal);
          }
        },
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,

      transform: [
        {
          translateY: (1 - progress.value) * 200,
        },
        {
          scale: 0.9 + progress.value * 0.1,
        },
      ],
    };
  });

  if (!mounted) return null;

  return (
    <Pressable style={styles.overlay} onPress={onCancel}>
      <Pressable>
        <Animated.View style={[styles.container, animatedStyle]}>
          <Text style={styles.title}>Delete notes</Text>

          <Text style={styles.subtitle}>
            Delete {count} {count === 1 ? "item" : "items"}?
          </Text>

          <View style={styles.row}>
            <Pressable style={styles.cancel} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.delete} onPress={onDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 50,
  },

  container: {
    width: "102%",
    backgroundColor: "#fefefe",
    borderRadius: 36,
    padding: 22,
    height: 200,
    justifyContent: "space-between",
  },

  title: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    color: "#545454",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
  },

  cancel: {
    backgroundColor: "#e3e3e3fc",
    width: "45%",
    height: 45,
    borderRadius: 999,

    justifyContent: "center",
    alignItems: "center",
  },
  delete: {
    backgroundColor: "#e3e3e3fc",
    width: "45%",
    height: 45,
    borderRadius: 999,

    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    color: "#111",
    fontWeight: "600",
    fontSize: 17,
  },

  deleteText: {
    color: "#ff0000",
    fontWeight: "600",
    fontSize: 17,
  },
});
