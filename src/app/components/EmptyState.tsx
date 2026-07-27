import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  theme: {
    background: string;
    text: string;
    card: string;
    search: string;
  };
};
const EmptyState = ({ icon, title, subtitle, theme }: Props) => {
  return (
    <View style={styles.container}>
      <Ionicons
        name={icon}
        size={70}
        color={theme.text === "#FFFFFF" ? "#666" : "#A8A8A8"}
      />
      <Text
        style={[
          styles.title,
          {
            color: theme.text,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: theme.text === "#FFFFFF" ? "#888" : "#777",
          },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 250,
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#777",
  },
});
export default EmptyState;
