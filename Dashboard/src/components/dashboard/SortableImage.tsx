import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ✅ แก้ type imageUrl → รับมาเป็น either string (url) หรือ File (object)
interface Props {
  id: string;
  index: number;
  imageUrl: string; // ✅ ส่ง url string ตรง
  onRemove: (index: number) => void;
  onPreview: (url: string) => void;
}

export function SortableImage({ id, imageUrl, index, onRemove, onPreview }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: () => true,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 50ms ease",
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-id={id}
      className="relative border rounded overflow-hidden w-24 h-24"
    >
      <img
        src={imageUrl}
        alt={`Image ${index + 1}`}
        onClick={() => onPreview(imageUrl)}
        className="w-full h-full object-cover cursor-pointer"
      />
      <button
        type="button"
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs z-10"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
      >
        ×
      </button>
      <div
      
        {...attributes}
        {...listeners}
        className="absolute bottom-0 left-0 bg-gray-700 text-white text-xs px-1 rounded cursor-grab"
      >
        ลาก
      </div>
      {/* โชว์ลำดับรูป */}
      <div className="absolute top-0 left-0 bg-gray-700 text-white text-xs px-1 rounded cursor-grab">
        {index + 1}
      </div>
    </div>
  );
}
