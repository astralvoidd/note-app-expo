import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import ThemeImages from "../../../data/ThemeImages";

type Theme = (typeof ThemeImages)[number];

type Props = {
  visible: boolean;
  selectedTheme: Theme | null;
  onSelect: (theme: Theme | null) => void;
  onClose: () => void;
};
export default function ThemePicker({
  visible,
  selectedTheme,
  onSelect,
  onClose,
}: Props) {
  const [isMounted, setIsMounted] = useState(visible);

  const progress = useSharedValue(0);

  const hideModal = () => {
    setIsMounted(false);
  };

  useEffect(() => {
    if (visible) {
      setIsMounted(true);

      progress.value = withTiming(1, {
        duration: 380,
      });
    } else {
      progress.value = withTiming(
        0,
        {
          duration: 380,
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
          translateY: interpolate(progress.value, [0, 1], [350, 0]),
        },
      ],
    };
  });

  if (!isMounted) return null;
  const themeData = [
    {
      id: "default",
      image: null,
    },
    ...ThemeImages,
  ];
  function ThemeItem({
    theme,
    selected,
  }: {
    theme: Theme | null;
    selected: boolean;
  }) {
    const handlePress = () => {
      onSelect(theme);
    };
    const borderOpacity = useSharedValue(0);
    const borderAnimatedStyle = useAnimatedStyle(() => ({
      opacity: borderOpacity.value,
    }));

    useEffect(() => {
      borderOpacity.value = withTiming(selected ? 1 : 0, {
        duration: 380,
      });
    }, [selected]);
    return (
      <Pressable onPress={handlePress}>
        <View style={styles.imageWrapper}>
          {selected && (
            <Animated.View
              style={[styles.selectedBorder, borderAnimatedStyle]}
            />
          )}

          {theme ? (
            <Animated.Image
              source={{ uri: theme.image }}
              style={styles.image}
            />
          ) : (
            <View style={styles.defaultCard}>
              <View style={styles.lightHalf} />
              <View style={styles.darkHalf} />
            </View>
          )}
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable onPress={() => {}}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <FlatList
            horizontal
            data={themeData}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isDefault = item.id === "default";

              const theme = isDefault ? null : (item as Theme);

              return (
                <ThemeItem
                  theme={theme}
                  selected={
                    isDefault
                      ? selectedTheme === null
                      : selectedTheme?.id === theme?.id
                  }
                />
              );
            }}
          />
        </Animated.View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
    position: "absolute",
  },

  container: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingVertical: 30,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingTop: 40,
    paddingBottom: 70,
  },

  list: {
    paddingHorizontal: 22,
    gap: 12,
  },
  defaultCard: {
    width: 74,
    height: 74,
    borderRadius: 18,
    overflow: "hidden",
    flexDirection: "row",
  },

  lightHalf: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  darkHalf: {
    flex: 1,
    backgroundColor: "#111111",
  },
  imageWrapper: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  selectedBorder: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: "#FFD84D",
    pointerEvents: "none",
  },
  image: {
    width: 74,
    height: 74,
    borderRadius: 18,
    overflow: "hidden",
    flexDirection: "row",
  },
});
