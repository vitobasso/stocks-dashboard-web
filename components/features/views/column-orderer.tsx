"use client";
import {closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors,} from "@dnd-kit/core";
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy,} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {GripVertical, XIcon} from "lucide-react";
import {Label} from "@/lib/metadata/labels";
import React from "react";

type Props = {
    columns: string[]
    setColumns(c: React.SetStateAction<string[]>): void
    labeler(path: string): Label
}

export default function ColumnOrderer(props: Props) {
    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 5}}));

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (!over || active.id === over.id) return;

        props.setColumns((prev) => {
            const oldIndex = prev.indexOf(String(active.id));
            const newIndex = prev.indexOf(String(over.id));
            return arrayMove(prev, oldIndex, newIndex);
        });
    }

    function handleRemove(item: string) {
        props.setColumns(() => props.columns.filter(v => v != item))
    }

    return <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="font-bold p-2">Ordem</div>
        <SortableContext items={props.columns} strategy={verticalListSortingStrategy}>
            {props.columns.map((item) => (
                <SortableRow key={item} id={item}>
                    <div className="flex items-center gap-2 group">
                        <div className="flex-1 cursor-default">{props.labeler(item).short}</div>
                        <XIcon className="size-4 opacity-0 group-hover:opacity-100 transition-opacity"
                               onClick={() => handleRemove(item)}/>
                    </div>
                </SortableRow>
            ))}
        </SortableContext>
    </DndContext>
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


