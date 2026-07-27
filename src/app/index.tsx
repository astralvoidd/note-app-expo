import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, FlatList, StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import ThemeImages from "../../data/ThemeImages";
import Note from "../../types/note";
import AddNoteModal from "./components/AddNoteModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import EmptyState from "./components/EmptyState";
import FABOverlay from "./components/FABoverlay";
import FloatingButton from "./components/FloatingButton";
import Header from "./components/header";
import NoteCard from "./components/NoteCard";
import SearchBar from "./components/SearchBar";
import SelectionBottomSheet from "./components/SelectionBottomSheet";

export default function Index() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isDark, toggleTheme } = useTheme();
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [isExpanding, setIsExpanding] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const progress = useSharedValue(0);

  const filteredNotes = notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(searchText.toLowerCase()) ||
      note.content.toLowerCase().includes(searchText.toLowerCase())
    );
  });
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ["#e9e6e6", "#0F0F0F"],
      ),
    };
  });

  type Theme = (typeof ThemeImages)[number];

  const addOrUpdateNote = (
    title: string,
    content: string,
    selectedTheme: Theme | null,
  ) => {
    const isEditing = editingNote !== null;
    const currentEditingNote = editingNote;

    setNotes((prev) => {
      if (isEditing && currentEditingNote) {
        return prev
          .map((note) =>
            note.id === currentEditingNote.id
              ? {
                  ...note,
                  title,
                  content,
                  date: Date.now(),

                  themeImage: selectedTheme?.image,
                  titleColor: selectedTheme?.titleColor,
                  contentColor: selectedTheme?.contentColor,
                  dateColor: selectedTheme?.dateColor,
                  iconColor: selectedTheme?.iconColor,
                  useDefaultTheme: selectedTheme === null,
                }
              : note,
          )
          .sort((a, b) => b.date - a.date);
      }
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
      return [newNote, ...prev];
    });

    setEditingNote(null);
    setVisible(false);
  };
  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };
  const deleteSelectedNotes = () => {
    setNotes((prev) =>
      prev.filter((note) => !selectedNoteIds.includes(note.id)),
    );

    setSelectedNoteIds([]);
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);
  const isSearching = searchText.trim().length > 0;
  const saveNotes = async (notesToSave: Note[]) => {
    const data = JSON.stringify(notesToSave);
    await AsyncStorage.setItem("notes", data);
  };
  useEffect(() => {
    if (!isLoaded) return;

    saveNotes(notes);
  }, [notes, isLoaded]);
  const loadNotes = async () => {
    const data = await AsyncStorage.getItem("notes");

    if (data) {
      setNotes(JSON.parse(data));
    } else {
      setNotes([]);
    }

    setIsLoaded(true);
    setLoading(false);
  };
  useFocusEffect(
    useCallback(() => {
      setIsExpanding(false);
      loadNotes();
    }, []),
  );
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (selectedNoteIds.length > 0) {
          setSelectedNoteIds([]);
          return true;
        }

        return false;
      },
    );

    return () => subscription.remove();
  }, [selectedNoteIds]);
  if (loading) {
    return null;
  }
  const theme = {
    background: isDark ? "#0F0F0F" : "#ffffff",
    text: isDark ? "#FFFFFF" : "#111111",
    card: isDark ? "#1C1C1C" : "#FFFFFF",
    search: isDark ? "#1A1A1A" : "#ffffff",
  };
  const handleToggleTheme = () => {
    toggleTheme();

    progress.value = withTiming(!isDark ? 1 : 0, {
      duration: 300,
    });
  };
  const isSelectionMode = selectedNoteIds.length > 0;
  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.background },
        animatedStyle,
      ]}
    >
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 18 }}>
        <Header
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          theme={theme}
        />
        <FlatList
          data={filteredNotes}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={
            <>
              <SearchBar
                value={searchText}
                onChangeText={setSearchText}
                theme={theme}
              />
            </>
          }
          ListHeaderComponentStyle={{ marginBottom: -16 }}
          contentContainerStyle={{
            paddingBottom: 50,
          }}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            isSearching ? (
              <EmptyState
                icon={"search-outline"}
                title="No notes found"
                subtitle="Try searching with another keyword."
                theme={theme}
              />
            ) : (
              <EmptyState
                icon={"document-text-outline"}
                title="No notes yet"
                subtitle="Tap the + button to create your first note."
                theme={theme}
              />
            )
          }
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              theme={theme}
              isSelected={selectedNoteIds.includes(item.id)}
              onDelete={deleteNote}
              onEdit={() => {
                setEditingNote(item);
                setVisible(true);
              }}
              onLongPress={() => {
                if (selectedNoteIds.length === 0) {
                  setSelectedNoteIds([item.id]);
                }
              }}
              onPress={() => {
                if (isSelectionMode) {
                  setSelectedNoteIds((prev) => {
                    if (prev.includes(item.id)) {
                      return prev.filter((id) => id !== item.id);
                    }

                    return [...prev, item.id];
                  });

                  return;
                }

                router.push({
                  pathname: "/note/[id]",
                  params: {
                    id: item.id,
                  },
                });
              }}
            />
          )}
        />
        {isExpanding && (
          <FABOverlay
            mode="expand"
            trigger={true}
            targetColor={theme.background}
            onFinished={() => {
              setIsExpanding(false);
            }}
          />
        )}

        <FloatingButton
          onPress={() => {
            setIsExpanding(true);
            router.push("/new");
          }}
          visible={visible}
          theme={theme}
        />
        <AddNoteModal
          visible={visible}
          onSave={addOrUpdateNote}
          onClose={() => {
            setVisible(false);
            setEditingNote(null);
          }}
          editData={editingNote}
        />
        <SelectionBottomSheet
          visible={selectedNoteIds.length > 0}
          onDelete={() => {
            setDeleteConfirmVisible(true);
          }}
        />
        <DeleteConfirmModal
          visible={deleteConfirmVisible}
          count={selectedNoteIds.length}
          onCancel={() => {
            setDeleteConfirmVisible(false);
          }}
          onDelete={() => {
            setNotes((prev) =>
              prev.filter((note) => !selectedNoteIds.includes(note.id)),
            );

            setSelectedNoteIds([]);
            setDeleteConfirmVisible(false);
          }}
        />
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    justifyContent: "space-between",
    marginTop: 40,
    gap: 15,
  },
});
