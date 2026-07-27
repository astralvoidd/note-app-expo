import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

type Props = {
  mode: "expand" | "shrink";
  trigger: boolean;
  onFinished: () => void;
  targetColor: string;
};

export default function FABOverlay({
  mode,
  trigger,

  onFinished,
  targetColor,
}: Props) {
  const progress = useSharedValue(mode === "expand" ? 0 : 1);

  useEffect(() => {
    if (!trigger) return;

    progress.value = withTiming(
      mode === "expand" ? 1 : 0,
      {
        duration: 400,
      },
      (finished) => {
        if (finished) {
          runOnJS(onFinished)();
        }
      },
    );
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(progress.value, [0, 1], [1, 35]),
        },
      ],

      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ["#FFD60A", targetColor],
      ),
    };
  });

  return <Animated.View style={[styles.overlay, animatedStyle]} />;
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",

    right: 40,
    bottom: 80,

    width: 64,
    height: 64,

    borderRadius: 32,

    backgroundColor: "#FFD60A",
  },
});
