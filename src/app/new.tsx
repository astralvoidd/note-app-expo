import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import { useTheme } from "../../context/ThemeContext";
import ThemeImages from "../../data/ThemeImages";
import Note from "../../types/note";
import ThemePicker from "./components/ThemePicker";
const AnimatedImage = Animated.createAnimatedComponent(Image);
export default function NewNote() {
  const { isDark } = useTheme();

  const [title, setTitle] = useState("");
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const isNoteEmpty = title.trim() === "" && content.trim() === "";
  const characterCount = content.length;

  type Theme = (typeof ThemeImages)[number];

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  const [themeVisible, setThemeVisible] = useState(false);
  const saveNote = async () => {
    // Don't create an empty note
    if (isNoteEmpty) {
      screenProgress.value = withTiming(
        0,
        {
          duration: 250,
        },
        (finished) => {
          if (finished) {
            runOnJS(router.back)();
          }
        },
      );

      return;
    }

    const data = await AsyncStorage.getItem("notes");

    const notes: Note[] = data ? JSON.parse(data) : [];

    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      date: Date.now(),

      themeImage: selectedTheme?.image,
      titleColor: selectedTheme?.titleColor,
      contentColor: selectedTheme?.contentColor,
      dateColor: selectedTheme?.dateColor,
      iconColor: selectedTheme?.iconColor,
      useDefaultTheme: selectedTheme === null,
    };

    notes.unshift(newNote);

    await AsyncStorage.setItem("notes", JSON.stringify(notes));

    router.back();
  };

  const handleBack = () => {
    if (isNoteEmpty) {
      screenProgress.value = withTiming(
        0,
        {
          duration: 250,
        },
        (finished) => {
          if (finished) {
            runOnJS(router.back)();
          }
        },
      );
      return;
    }

    Alert.alert("Discard note?", "Your changes will not be saved.", [
      {
        text: "Keep Editing",
        style: "cancel",
      },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          screenProgress.value = withTiming(
            0,
            {
              duration: 250,
            },
            (finished) => {
              if (finished) {
                runOnJS(router.back)();
              }
            },
          );
        },
      },
    ]);
  };
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          handleBack();
          return true;
        },
      );

      return () => subscription.remove();
    }, [title, content, selectedTheme]),
  );
  const screenProgress = useSharedValue(0);
  useEffect(() => {
    screenProgress.value = withTiming(1, {
      duration: 320,
    });
  }, []);
  const screenAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: screenProgress.value,

      transform: [
        {
          scale: 0.98 + screenProgress.value * 0.02,
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          flex: 1,
        },
        screenAnimatedStyle,
      ]}
    >
      {selectedTheme && (
        <Animated.View
          key={selectedTheme.image}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(800)}
          style={StyleSheet.absoluteFill}
        >
          <AnimatedImage
            source={selectedTheme.image}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        </Animated.View>
      )}
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: selectedTheme
            ? "transparent"
            : isDark
              ? "#0F0F0F"
              : "#FFFFFF",
        }}
      >
        <View style={styles.editorContainer}>
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
                  Keyboard.dismiss();

                  setTimeout(() => {
                    setThemeVisible((prev) => !prev);
                  }, 150);
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
              selectedTheme ? selectedTheme.dateColor : isDark ? "#777" : "#999"
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
              {`${new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
              })} ${new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}`}
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
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
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
          </KeyboardAvoidingView>
        </View>

        <ThemePicker
          visible={themeVisible}
          selectedTheme={selectedTheme}
          onSelect={(theme) => setSelectedTheme(theme)}
          onClose={() => setThemeVisible(false)}
        />
      </SafeAreaView>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  editorContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
  },

  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    minHeight: 44,
  },
  infoRow: {
    flexDirection: "row",

    alignItems: "center",
    marginTop: 8,
    gap: 5,
  },

  date: {
    marginLeft: 6,
    fontSize: 15,
  },
  characters: {
    marginLeft: 6,
    fontSize: 13,
  },

  content: {
    flex: 1,
    marginTop: 14,
    fontSize: 18,
    lineHeight: 28,
    paddingBottom: 40,
  },
});
