"use client";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy,} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {GripVertical} from "lucide-react";
import {Header} from "@/lib/metadata/defaults";
import {getLabel} from "@/lib/metadata/labels";

type Props = {
    columns: Header[]
    setColumns(value: Header[] | ((prevState: Header[]) => Header[])): void
}

export default function ColumnOrderer(props: Props) {
    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 5}}));

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (!over || active.id === over.id) return;

        // Only reorder within the same group
        const groupIndex = props.columns.findIndex((g) => g.keys.includes(String(active.id)));
        const overGroupIndex = props.columns.findIndex((g) => g.keys.includes(String(over.id)));
        if (groupIndex === -1 || overGroupIndex === -1 || groupIndex !== overGroupIndex) return;

        props.setColumns((prev) => {
            const next = [...prev];
            const group = next[groupIndex];
            const items = [...group.keys];
            const oldIndex = items.indexOf(String(active.id));
            const newIndex = items.indexOf(String(over.id));
            next[groupIndex] = { ...group, keys: arrayMove(items, oldIndex, newIndex) };
            return next;
        });
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}>
            <div className="font-bold p-2">Ordem</div>
            <div className="max-h-124 overflow-auto">
                {props.columns.map((group) => (
                    <SortableGroup key={group.group} group={group}/>
                ))}
            </div>
        </DndContext>
    );
}

function SortableRow({id, children}: { id: string; children: React.ReactNode }) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id});
    const style = {transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1};
    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 text-sm font-mono">
            <button {...attributes} {...listeners} className="cursor-grab touch-none">
                <GripVertical className="h-4 w-4"/>
            </button>
            {children}
        </div>
    );
}

function SortableGroup({group}: { group: Header }) {
    return (
        <div className="p-3 space-y-2">
            <div className="font-semibold text-sm">{group.group}</div>
            <SortableContext items={group.keys} strategy={verticalListSortingStrategy}>
                {group.keys.map((item) => (
                    <SortableRow key={item} id={item}>{label(item)}</SortableRow>
                ))}
            </SortableContext>
        </div>
    );
}

function label(item: string) {
    return getLabel(item).short
}

