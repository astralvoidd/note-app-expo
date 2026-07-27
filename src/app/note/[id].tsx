import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { runOnJS } from "react-native-worklets";
import { useTheme } from "../../../context/ThemeContext";
import ThemeImages from "../../../data/ThemeImages";
import Note from "../../../types/note";
import ThemePicker from "../components/ThemePicker";
const AnimatedImage = Animated.createAnimatedComponent(Image);
export default function NoteScreen() {
  const { isDark } = useTheme();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const characterCount = content.length;

  const [themeVisible, setThemeVisible] = useState(false);
  type Theme = (typeof ThemeImages)[number];
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [closing, setClosing] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();
  useEffect(() => {
    const loadNote = async () => {
      const data = await AsyncStorage.getItem("notes");

      if (!data) return;

      const notes: Note[] = JSON.parse(data);

      const selected = notes.find((item) => item.id === id);

      setNote(selected ?? null);
    };

    loadNote();
  }, [id]);
  useEffect(() => {
    if (!note) return;

    setTitle(note.title);
    setContent(note.content);
    if (note.useDefaultTheme) {
      setSelectedTheme(null);
    } else {
      if (note.useDefaultTheme) {
        setSelectedTheme(null);
      } else {
        const theme =
          ThemeImages.find((item) => item.image === note.themeImage) ?? null;

        setSelectedTheme(theme);
      }
    }
  }, [note]);
  const formatDate = (timestamp: number) => {
    const now = new Date();
    const date = new Date(timestamp);

    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    if (days === 1) {
      return `Yesterday • ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    }

    if (days < 7) {
      return `${date.toLocaleDateString("en-US", {
        weekday: "long",
      })} • ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    }

    return `${date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    })} • ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  };
  const isNoteEmpty = title.trim() === "" && content.trim() === "";

  const saveNote = async () => {
    if (!note) return;

    const data = await AsyncStorage.getItem("notes");

    if (!data) return;

    const notes: Note[] = JSON.parse(data);
    if (isNoteEmpty) {
      const updatedNotes = notes.filter((item) => item.id !== note.id);

      await AsyncStorage.setItem("notes", JSON.stringify(updatedNotes));

      closeScreen();
      return;
    }
    const hasChanges =
      title.trim() !== note.title ||
      content.trim() !== note.content ||
      (selectedTheme?.image ?? null) !== (note.themeImage ?? null) ||
      (selectedTheme === null) !== note.useDefaultTheme;
    if (!hasChanges) {
      closeScreen();
      return;
    }
    const updatedNotes = notes
      .map((item) =>
        item.id === note.id
          ? {
              ...item,
              title,
              content,
              useDefaultTheme: selectedTheme === null,
              themeImage: selectedTheme?.image,
              titleColor: selectedTheme?.titleColor,
              contentColor: selectedTheme?.contentColor,
              dateColor: selectedTheme?.dateColor,
              iconColor: selectedTheme?.iconColor,
              date: Date.now(),
            }
          : item,
      )
      .sort((a, b) => b.date - a.date);

    await AsyncStorage.setItem("notes", JSON.stringify(updatedNotes));

    closeScreen();
  };
  const contentOpacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const imageOpacity = useSharedValue(0);
  useEffect(() => {
    contentOpacity.value = 0;
    translateY.value = 20;

    contentOpacity.value = withTiming(1, {
      duration: 280,
    });

    translateY.value = withTiming(0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const closeScreen = () => {
    contentOpacity.value = withTiming(0, {
      duration: 250,
    });

    translateY.value = withTiming(
      20,
      {
        duration: 180,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(router.back)();
        }
      },
    );
  };

  useEffect(() => {
    imageOpacity.value = 0;

    imageOpacity.value = withTiming(1, {
      duration: 300,
    });
  }, [selectedTheme]);
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));
  const handleBack = async () => {
    await saveNote();
  };
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBack();
        return true; // Prevent the default back action
      },
    );

    return () => subscription.remove();
  }, [title, content, selectedTheme, note]);
  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      exiting={FadeOut.duration(300)}
      style={[
        styles.container,
        {
          backgroundColor: selectedTheme
            ? "transparent"
            : isDark
              ? "#0F0F0F"
              : "#FFFFFF",
        },
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill]}>
        {selectedTheme && (
          <Animated.View
            key={selectedTheme.image}
            exiting={FadeOut.duration(800)}
            style={StyleSheet.absoluteFill}
          >
            <AnimatedImage
              source={selectedTheme.image}
              style={[StyleSheet.absoluteFill, imageAnimatedStyle]}
              contentFit="cover"
            />
          </Animated.View>
        )}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView>
            <SafeAreaView style={{ flex: 1 }}>
              <Animated.View
                style={[styles.editorContainer, contentAnimatedStyle]}
              >
                <View style={styles.header}>
                  <Pressable onPress={handleBack}>
                    <Ionicons
                      name="arrow-back"
                      size={28}
                      color={
                        selectedTheme
                          ? selectedTheme.iconColor
                          : isDark
                            ? "#FFFFFF"
                            : "#111111"
                      }
                    />
                  </Pressable>

                  <View style={styles.rightButtons}>
                    <Pressable
                      onPress={() => {
                        setThemeVisible((prev) => !prev);
                      }}
                    >
                      <Ionicons
                        name="image-outline"
                        size={25}
                        color={
                          selectedTheme
                            ? selectedTheme.iconColor
                            : isDark
                              ? "#FFFFFF"
                              : "#111111"
                        }
                      />
                    </Pressable>

                    <Pressable onPress={saveNote}>
                      <Ionicons
                        name="checkmark"
                        size={30}
                        color={
                          selectedTheme
                            ? selectedTheme.iconColor
                            : isDark
                              ? "#FFFFFF"
                              : "#111111"
                        }
                      />
                    </Pressable>
                  </View>
                </View>
                <TextInput
                  placeholder="Title"
                  placeholderTextColor={
                    selectedTheme
                      ? selectedTheme.dateColor
                      : isDark
                        ? "#777"
                        : "#999"
                  }
                  value={title}
                  onChangeText={setTitle}
                  style={[
                    styles.title,
                    {
                      color: selectedTheme
                        ? selectedTheme.titleColor
                        : isDark
                          ? "#FFFFFF"
                          : "#111111",
                    },
                  ]}
                />

                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.date,
                      {
                        color: selectedTheme
                          ? selectedTheme.dateColor
                          : isDark
                            ? "#BBBBBB"
                            : "#777777",
                      },
                    ]}
                  >
                    {note
                      ? `${new Date(note.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                        })} ${new Date(note.date).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}`
                      : ""}
                  </Text>
                  <Text
                    style={[
                      styles.date,
                      {
                        color: selectedTheme
                          ? selectedTheme.dateColor
                          : isDark
                            ? "#BBBBBB"
                            : "#777777",
                      },
                    ]}
                  >
                    |
                  </Text>

                  <Text
                    style={[
                      styles.characters,
                      {
                        color: selectedTheme
                          ? selectedTheme.dateColor
                          : isDark
                            ? "#BBBBBB"
                            : "#777777",
                      },
                    ]}
                  >
                    {characterCount} characters
                  </Text>
                </View>

                <TextInput
                  placeholder="Start typing"
                  placeholderTextColor={
                    selectedTheme
                      ? selectedTheme.placeholderColor
                      : isDark
                        ? "#777"
                        : "#999"
                  }
                  value={content}
                  onChangeText={setContent}
                  multiline
                  textAlignVertical="top"
                  scrollEnabled={false}
                  style={[
                    styles.content,
                    {
                      color: selectedTheme
                        ? selectedTheme.contentColor
                        : isDark
                          ? "#EEEEEE"
                          : "#222222",
                    },
                  ]}
                />
              </Animated.View>
            </SafeAreaView>
          </ScrollView>
        </KeyboardAvoidingView>
        <ThemePicker
          visible={themeVisible}
          selectedTheme={selectedTheme}
          onSelect={(theme) => setSelectedTheme(theme)}
          onClose={() => setThemeVisible(false)}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },

  editorContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  infoRow: {
    flexDirection: "row",

    alignItems: "center",
    marginTop: 8,
    gap: 5,
  },
  characters: {
    marginLeft: 6,
    fontSize: 13,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
  },

  date: {
    color: "#777",
    fontSize: 15,
    marginLeft: 6,
  },
  content: {
    flex: 1,
    marginTop: 14,
    fontSize: 18,
    lineHeight: 28,
  },

  themeContainer: {
    flex: 2,
    justifyContent: "flex-end",
    paddingBottom: 22,
  },

  themeList: {
    paddingVertical: 58,
  },

  themeImage: {
    width: 70,
    height: 70,
    borderRadius: 18,
    marginRight: 12,
  },
});
