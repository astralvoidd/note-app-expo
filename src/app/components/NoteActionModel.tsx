import { Ionicons } from "@expo/vector-icons";
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
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

const NoteActionModal = ({ visible, onEdit, onClose, onDelete }: Props) => {
  const [isMounted, setIsMounted] = useState(visible);
  const progress = useSharedValue(0);
  const hideModal = () => {
    setIsMounted(false);
  };
  useEffect(() => {
    if (visible) {
      setIsMounted(true);

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
      transform: [
        {
          scale: progress.value,
        },
      ],
      opacity: progress.value,
    };
  });
  if (!isMounted) return null;
  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Text style={styles.title}>Choose Action</Text>
        <Text style={styles.subtitle}>What do you want to do?</Text>
        <View style={styles.row}>
          <Pressable style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
            <Text style={[styles.btnText, { color: "#111" }]}>Cancel</Text>
          </Pressable>

          <View style={styles.rightGroup}>
            <Pressable style={[styles.btn, styles.whiteBtn]} onPress={onEdit}>
              <Ionicons name="create-outline" size={18} color="#111" />
              <Text style={styles.btnText}>Edit</Text>
            </Pressable>

            <Pressable style={[styles.btn, styles.whiteBtn]} onPress={onDelete}>
              <Ionicons name="trash-outline" size={18} color="#E53935" />
              <Text style={[styles.btnText, { color: "#E53935" }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "85%",
    height: 180,
    backgroundColor: "#1E1E1E",
    borderRadius: 22,
    padding: 18,
    justifyContent: "space-between",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 48,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rightGroup: {
    flexDirection: "row",
    gap: 10,
  },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },

  whiteBtn: {
    backgroundColor: "#fff",
  },

  cancelBtn: {
    backgroundColor: "#ffffff",
  },

  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
});
export default NoteActionModal;
