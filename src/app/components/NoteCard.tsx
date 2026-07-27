import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { ImageBackground, Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Note from "../../../types/note";

type Props = {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: () => void;
  onLongPress: () => void;
  onPress: () => void;
  isSelected: boolean;
  theme: {
    background: string;
    text: string;
    card: string;
    search: string;
  };
};

export default function NoteCard({
  note,
  onDelete,
  onEdit,
  theme,
  onLongPress,
  onPress,
  isSelected,
}: Props) {
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
  const scale = useSharedValue(1);
  const checkOpacity = useSharedValue(0);
  useEffect(() => {
    scale.value = withTiming(isSelected ? 0.9 : 1, {
      duration: 180,
    });

    checkOpacity.value = withTiming(isSelected ? 1 : 0, {
      duration: 180,
    });
  }, [isSelected]);
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scale.value,
        },
      ],
    };
  });

  const checkAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: checkOpacity.value,
    };
  });
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(250)}
      layout={LinearTransition.springify()}
      style={[
        styles.container,
        cardAnimatedStyle,
        {
          backgroundColor: note.useDefaultTheme
            ? theme.card
            : note.themeImage
              ? "transparent"
              : theme.card,
        },
      ]}
    >
      <ImageBackground
        source={
          note.useDefaultTheme
            ? undefined
            : note.themeImage
              ? { uri: note.themeImage }
              : undefined
        }
        imageStyle={{ borderRadius: 28 }}
        style={{ flex: 1, padding: 18, borderRadius: 28, paddingBottom: 10 }}
      >
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          style={styles.cardContent}
        >
          <Text
            numberOfLines={2}
            style={[
              styles.title,
              {
                color: note.useDefaultTheme
                  ? theme.text
                  : (note.titleColor ?? theme.text),
              },
            ]}
          >
            {note.title}
          </Text>
          <Text
            numberOfLines={4}
            style={[
              styles.content,
              {
                color: note.useDefaultTheme
                  ? theme.text
                  : (note.contentColor ?? theme.text),
              },
            ]}
          >
            {note.content}
          </Text>

          <Text
            style={[
              styles.date,
              {
                color: note.useDefaultTheme
                  ? theme.text
                  : (note.dateColor ?? theme.text),
              },
            ]}
          >
            {formatDate(note.date)}
          </Text>
          <Animated.View style={[styles.checkContainer, checkAnimatedStyle]}>
            <Ionicons name="ellipse" size={28} color="#FFD60A" />

            <Ionicons
              name="checkmark"
              size={18}
              color="#FFFFFF"
              style={{
                position: "absolute",
                top: 5,
                left: 5,
              }}
            />
          </Animated.View>
        </Pressable>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "48%",
    borderRadius: 28,
    height: 190,

    marginBottom: -25,
  },
  cardContent: {
    flex: 1,
  },
  checkContainer: {
    position: "absolute",
    top: 2,
    right: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  content: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  date: {
    marginTop: "auto",
    fontSize: 13,
    color: "#555",
  },
});
