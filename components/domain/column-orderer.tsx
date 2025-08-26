"use client";

import {useState} from "react";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverlay,
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
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 5}}));

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (!over || active.id === over.id) return;

        const sourceGroupIndex = props.columns.findIndex(
            (g) => g.keys.includes(String(active.id)) || g.group === active.id
        );
        const targetGroupIndex = props.columns.findIndex(
            (g) => g.keys.includes(String(over.id)) || (g.group + "-dropzone") === over.id
        );

        // Reorder groups
        if (props.columns.some((g) => g.group === active.id) && props.columns.some((g) => g.group === over.id)) {
            props.setColumns((prev) => arrayMove(prev, sourceGroupIndex, targetGroupIndex));
            return;
        }

        // Reorder/move items
        if (sourceGroupIndex !== -1 && targetGroupIndex !== -1) {
            props.setColumns((prev) => {
                const newGroups = [...prev];
                const source = newGroups[sourceGroupIndex];
                const target = newGroups[targetGroupIndex];
                const sourceItems = [...source.keys];
                const targetItems = [...target.keys];
                const activeIdStr = String(active.id);
                const overIdStr = String(over.id);

                if (sourceGroupIndex === targetGroupIndex) {
                    // Same group: just reorder
                    const oldIndex = sourceItems.indexOf(activeIdStr);
                    const newIndex = targetItems.indexOf(overIdStr);
                    newGroups[sourceGroupIndex] = {
                        ...source,
                        keys: arrayMove(sourceItems, oldIndex, newIndex),
                    };
                } else {
                    // Different groups: remove + insert
                    sourceItems.splice(sourceItems.indexOf(activeIdStr), 1);

                    if (overIdStr.endsWith("-dropzone")) {
                        targetItems.push(activeIdStr);
                    } else {
                        const insertIndex = targetItems.indexOf(overIdStr);
                        targetItems.splice(insertIndex, 0, activeIdStr);
                    }

                    newGroups[sourceGroupIndex] = {...source, keys: sourceItems};
                    newGroups[targetGroupIndex] = {...target, keys: targetItems};
                }

                return newGroups;
            });
        }
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter}
                    onDragStart={({active}) => setActiveId(String(active.id))}
                    onDragEnd={(event) => { handleDragEnd(event); setActiveId(null) }}
                    onDragCancel={() => setActiveId(null)}>
            <div className="font-bold p-2">Ordenar</div>
            <div className="max-h-124 overflow-auto">
                <SortableContext items={props.columns.map((g) => g.group)} strategy={verticalListSortingStrategy}>
                    {props.columns.map((group) => (
                        <SortableGroup key={group.group} group={group}/>
                    ))}
                </SortableContext>
            </div>

            <DragOverlay>
                {activeId ? (
                    <div className="p-2 border shadow-lg w-full" style={{transform: "translate(-210%, -300%)"}}>
                        {label(activeId)}
                    </div>
                ) : null}
            </DragOverlay>
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
            <SortableContext items={group.keys.length > 0 ? group.keys : [group.group + "-dropzone"]}
                             strategy={verticalListSortingStrategy}>
                {group.keys.length > 0 ? (
                    group.keys.map((item) => {
                        return <SortableRow key={item} id={item}>{label(item)}</SortableRow>;
                    })
                ) : (
                    <SortableDropzone key={group.group + "-dropzone"} id={group.group + "-dropzone"}/>
                )}
            </SortableContext>
        </div>
    );
}

function SortableDropzone({id}: { id: string }) {
    const {setNodeRef} = useSortable({id}); // <-- this makes it a valid drop target
    return (
        <div ref={setNodeRef}
             className="h-10 flex items-center justify-center border border-dashed rounded text-sm text-muted-foreground">
            Drop here
        </div>
    );
}

function label(item: string) {
    return getLabel(item).short
}

