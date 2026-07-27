import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Colors from "../constants/colors";

type Props = {
  isDark: boolean;
  onToggleTheme: () => void;
  theme: {
    background: string;
    text: string;
    card: string;
    search: string;
  };
};

const Header = ({ isDark, onToggleTheme, theme }: Props) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scale.value,
        },
      ],
    };
  });
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: theme.text,
          },
        ]}
      >
        Notes
      </Text>

      <Pressable
        onPress={() => {
          scale.value = 0.8;

          scale.value = withSpring(1, {
            damping: 12,
            stiffness: 180,
            mass: 0.7,
          });

          onToggleTheme();
        }}
      >
        <Animated.View style={animatedStyle}>
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={24}
            color={isDark ? "#FFF" : "#111"}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 18,
  },

  title: {
    fontSize: 35,
    fontWeight: "700",
    color: Colors.light.text,
  },

  themeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.search,
  },
});
export default Header;
