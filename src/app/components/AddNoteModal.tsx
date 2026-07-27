import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import ThemeImages from "../../../data/ThemeImages";
import Note from "../../../types/note";
type Theme = (typeof ThemeImages)[number];

type Props = {
  visible: boolean;
  onSave: (title: string, content: string, selectedTheme: Theme | null) => void;

  onClose: () => void;
  editData?: Note | null;
};

export default function AddNoteModal({
  visible,
  onSave,
  onClose,
  editData,
}: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isMounted, setIsMounted] = useState(visible);

  type Theme = (typeof ThemeImages)[number];

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const progress = useSharedValue(0);
  useEffect(() => {
    if (!visible) return;

    if (editData) {
      setTitle(editData.title);
      setContent(editData.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [editData, visible]);

  const hideModal = () => {
    setIsMounted(false);
  };
  useEffect(() => {
    if (visible) {
      setIsMounted(true);

      progress.value = withTiming(1, {
        duration: 300,
      });
    } else {
      progress.value = withTiming(
        0,
        {
          duration: 300,
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
        { translateY: interpolate(progress.value, [0, 1], [600, 0]) },
      ],
    };
  });
  if (!isMounted) return null;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable onPress={() => {}}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={styles.handle} />

          <Text style={styles.title}>New Note</Text>

          <TextInput
            autoFocus
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Write something..."
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            style={styles.textArea}
          />

          <Text style={styles.label}>Choose Color</Text>

          <View style={styles.colors}>
            {ThemeImages.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  setSelectedTheme(item);
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={[
                    styles.color,
                    {
                      borderWidth: selectedTheme?.id === item.id ? 2 : 0,
                      borderColor: "#111",
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.saveButton}
            onPress={() => {
              if (!title.trim() || !content.trim()) return;

              onSave(title, content, selectedTheme);
              Keyboard.dismiss();

              setTitle("");
              setContent("");

              onClose();
            }}
          >
            <Ionicons name="checkmark" size={22} color="#FFF" />
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: "#e8e8e8",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },

  handle: {
    width: 60,
    height: 5,
    borderRadius: 100,
    backgroundColor: "#DDD",
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },

  input: {
    height: 55,
    borderRadius: 16,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  textArea: {
    height: 140,
    borderRadius: 16,
    backgroundColor: "#F2F2F2",
    padding: 16,
  },

  label: {
    marginTop: 20,
    marginBottom: 14,
    fontWeight: "600",
    fontSize: 16,
  },

  colors: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },

  color: {
    width: 56,
    height: 56,
    borderRadius: 17,
  },

  saveButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  saveText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 17,
  },
});
