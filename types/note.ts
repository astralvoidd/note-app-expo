type Note = {
  id: string;
  title: string;
  content: string;
  date: number;

  themeImage?: string;

  titleColor?: string;
  contentColor?: string;
  dateColor?: string;
  iconColor?: string;
  useDefaultTheme?: boolean;
};

export default Note;
