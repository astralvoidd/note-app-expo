import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";
import Colors from "../constants/colors";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  theme: {
    background: string;
    text: string;
    card: string;
    search: string;
  };
};
export default function SearchBar({ value, onChangeText, theme }: Props) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.search,
        },
      ]}
    >
      <Ionicons name="search-outline" size={22} color={theme.text} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search your notes..."
        placeholderTextColor="#777"
        style={[
          styles.input,
          {
            color: theme.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.search,
    borderRadius: 180,
    paddingHorizontal: 16,
    height: 56,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
});
