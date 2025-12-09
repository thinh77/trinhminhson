# Board.tsx Refactoring Guide

## Created Hooks

### 1. `/hooks/useZoom.ts`
**Purpose:** Handle zoom functionality for the board
**Exports:**
- `MIN_ZOOM` (0.25)
- `MAX_ZOOM` (2)
- `ZOOM_STEP` (0.1)
- `useZoom(boardRef, panOffset, zoom, setZoom, setPanOffset)` - Returns `{ handleZoom, zoomRef }`

**Features:**
- Center-based zoom with `handleZoom(newZoom)`
- Cursor-based wheel zoom (auto-attached)
- Keeps zoom point stationary during zoom

### 2. `/hooks/usePinchZoom.ts`
**Purpose:** Handle mobile pinch zoom gestures
**Exports:**
- `usePinchZoom({ boardRef, zoom, setZoom, panOffset, setPanOffset, isPanning, setIsPanning })`
- Returns `{ initialPanBeforePinchRef }`

**Features:**
- Two-finger pinch zoom
- Prevents jump when transitioning from pan to pinch
- Zooms at touch center point
- Auto-attaches touch event listeners

### 3. `/hooks/usePan.ts`
**Purpose:** Handle canvas panning (mouse and touch)
**Exports:**
- `usePan({ boardRef, panOffset, setPanOffset, isPanning, setIsPanning, initialPanBeforePinchRef })`
- Returns `{ handlePanStart }` (for mouse pan initialization)

**Features:**
- Mouse drag panning on empty board
- Single-finger touch panning
- Stops panning when pinch starts
- Saves initial pan for pinch zoom
- Auto-attaches event listeners

### 4. `/hooks/useNoteDrag.ts`
**Purpose:** Handle dragging individual notes
**Exports:**
- `useNoteDrag({ boardRef, zoom, panOffset, notes, setNotes })`
- Returns `{ handleDragStart, handleTouchStart }`

**Features:**
- Mouse and touch drag support
- Respects zoom/pan transform
- Saves position to API on drag end
- No boundary clamping (infinite canvas)
- Auto-attaches window-level event listeners

### 5. `/hooks/useNoteManagement.ts`
**Purpose:** Manage note CRUD operations
**Exports:**
- `Note` type (with Date objects)
- `useNoteManagement({ zoomRef, panOffsetRef, boardRef })`

**Returns:**
```typescript
{
  notes,
  setNotes,
  isLoading,
  highlightedNoteId,
  loadNotes,
  getViewportCenterPosition,
  handleCreateNote,
  handleDeleteNote,
  handleLockNote,
  clearHighlight,
  handleClearAll,
}
```

**Features:**
- Loads notes from API
- Creates notes at viewport center
- Highlights new notes for 3s
- Respects locked status
- Handles all API interactions

## Integration Steps

### Step 1: Update imports in board.tsx
```typescript
import { useZoom, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from "@/hooks/useZoom";
import { usePinchZoom } from "@/hooks/usePinchZoom";
import { usePan } from "@/hooks/usePan";
import { useNoteDrag } from "@/hooks/useNoteDrag";
import { useNoteManagement } from "@/hooks/useNoteManagement";
import { noteColors, textColors, fontFamilies, fontWeights, fontSizes } from "@/constants/noteStyles";
```

### Step 2: Replace state declarations
Remove old state and replace with hook calls:

```typescript
// Remove old zoom/pan/note state
// Add refs
const boardRef = useRef<HTMLDivElement>(null);
const zoomRef = useRef(1);
const panOffsetRef = useRef({ x: 0, y: 0 });

// Zoom state
const [zoom, setZoom] = useState(1);
const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
const [isPanning, setIsPanning] = useState(false);

// Use hooks
const { handleZoom } = useZoom({
  boardRef,
  panOffset,
  zoom,
  setZoom,
  setPanOffset,
});

const { initialPanBeforePinchRef } = usePinchZoom({
  boardRef,
  zoom,
  setZoom,
  panOffset,
  setPanOffset,
  isPanning,
  setIsPanning,
});

const { handlePanStart } = usePan({
  boardRef,
  panOffset,
  setPanOffset,
  isPanning,
  setIsPanning,
  initialPanBeforePinchRef,
});

const {
  notes,
  setNotes,
  isLoading,
  highlightedNoteId,
  loadNotes,
  getViewportCenterPosition,
  handleCreateNote,
  handleDeleteNote,
  handleLockNote,
  clearHighlight,
  handleClearAll,
} = useNoteManagement({ zoomRef, panOffsetRef, boardRef });

const { handleDragStart, handleTouchStart } = useNoteDrag({
  boardRef,
  zoom,
  panOffset,
  notes,
  setNotes,
});
```

### Step 3: Update zoom refs sync
Keep zoom and pan refs in sync:
```typescript
useEffect(() => {
  zoomRef.current = zoom;
}, [zoom]);

useEffect(() => {
  panOffsetRef.current = panOffset;
}, [panOffset]);
```

### Step 4: Update create note handler
```typescript
const handleCreateNoteClick = async () => {
  if (!newNote.content.trim()) return;
  
  try {
    const position = getViewportCenterPosition();
    await handleCreateNote({
      content: newNote.content,
      color: newNote.color,
      textColor: newNote.textColor,
      fontFamily: newNote.fontFamily,
      fontWeight: newNote.fontWeight,
      fontSize: newNote.fontSize,
      x: position.x,
      y: position.y,
      rotation: Math.random() * 10 - 5,
      isLocked: false,
    });
    
    setNewNote({ 
      content: "", 
      color: noteColors[0].bg, 
      textColor: textColors[0].color,
      fontFamily: fontFamilies[0].value,
      fontWeight: fontWeights[1].value,
      fontSize: fontSizes[1].value,
    });
    setIsCreating(false);
  } catch (error) {
    alert("Không thể tạo ghi chú. Vui lòng thử lại.");
  }
};
```

### Step 5: Update JSX event handlers
- Board pan: `onMouseDown={handlePanStart}`
- Note drag: `onMouseDown={(e) => handleDragStart(note.id, e)}`
- Note touch: `onTouchStart={(e) => handleTouchStart(note.id, e)}`

### Step 6: Remove old function definitions
Delete these from board.tsx (now in hooks):
- `handleZoom`
- `handleWheel`
- `handlePinchStart/Move/End`
- `handlePanStart/Move/End`
- `handlePanTouchStart/Move`
- `handleDragStart/handleTouchStart`
- `handleDrag/handleTouchMove/handleDragEnd`
- `loadNotes`
- `getViewportCenterPosition`
- `handleCreateNote`
- `handleDeleteNote`
- `handleLockNote`
- All related refs and state

## Benefits
- **Separation of Concerns:** Each hook handles one responsibility
- **Reusability:** Hooks can be used in other components
- **Testability:** Individual hooks can be tested in isolation
- **Maintainability:** Easier to find and fix bugs
- **Type Safety:** Full TypeScript support throughout
- **Performance:** Refs prevent unnecessary re-renders

## Files Created
1. `/types/note.ts` - Type definitions
2. `/constants/noteStyles.ts` - Style constants
3. `/hooks/useZoom.ts` - Zoom logic
4. `/hooks/usePinchZoom.ts` - Pinch zoom logic
5. `/hooks/usePan.ts` - Pan logic
6. `/hooks/useNoteDrag.ts` - Note dragging logic
7. `/hooks/useNoteManagement.ts` - CRUD operations

## Next Steps
1. Update board.tsx to use the new hooks
2. Test all functionality (zoom, pan, drag, CRUD)
3. Consider extracting UI components:
   - `NoteCard.tsx`
   - `CreateNoteModal.tsx`
   - `BoardControls.tsx`
   - `BoardHeader.tsx`
