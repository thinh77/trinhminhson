export interface Note {
  id: number;
  content: string;
  color: string;
  textColor: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  x: number;
  y: number;
  rotation: number;
  isLocked: boolean;
  createdAt: Date;
}

export interface NoteColor {
  bg: string;
  name: string;
}

export interface TextColor {
  color: string;
  name: string;
}

export interface FontFamily {
  value: string;
  name: string;
}

export interface FontWeight {
  value: string;
  name: string;
}

export interface FontSize {
  value: string;
  name: string;
}
