import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  onPress?: () => void;
  visible: boolean;
  theme: {
    background: string;
    text: string;
    card: string;
    search: string;
  };
};

export default function FloatingButton({ onPress, visible, theme }: Props) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: 200,
    });
  }, [visible]);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg`,
        },
      ],
    };
  });
  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: "#ecc816",
        },
      ]}
      onPress={onPress}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons name="add" size={40} color="#FFFF" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 40,
    bottom: 80,

    width: 64,
    height: 64,
    borderRadius: 32,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#111",
  },
});
