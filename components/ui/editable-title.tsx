import {useEffect, useRef, useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {PencilIcon} from "lucide-react";

type EditableTitleProps = {
    title: string;
    onTitleChange: (newTitle: string) => void;
    onEnter?: () => void;
    className?: string;
};

export function EditableTitle({ title, onTitleChange, onEnter, className = "" }: EditableTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(title);
    const [inputWidth, setInputWidth] = useState(100);
    const inputRef = useRef<HTMLInputElement>(null);

    const updateInputWidth = (text: string) => {
        if (inputRef.current) {
            const tempSpan = document.createElement('span');
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.position = 'absolute';
            tempSpan.style.padding = '0';
            tempSpan.style.fontSize = window.getComputedStyle(inputRef.current).fontSize;
            tempSpan.style.fontFamily = window.getComputedStyle(inputRef.current).fontFamily;
            tempSpan.style.whiteSpace = 'pre';
            tempSpan.textContent = text || ' ';
            document.body.appendChild(tempSpan);
            setInputWidth(Math.max(100, tempSpan.offsetWidth + 20));
            document.body.removeChild(tempSpan);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        updateInputWidth(newValue);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (inputValue.trim() && inputValue !== title) {
            onTitleChange(inputValue.trim());
        } else {
            setInputValue(title);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
            onEnter?.();
        } else if (e.key === 'Escape') {
            setInputValue(title);
            setIsEditing(false);
        }
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            updateInputWidth(inputValue);
        }
    }, [isEditing, inputValue]);

    useEffect(() => {
        setInputValue(title);
    }, [title]);

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <div className="relative inline-flex items-center">
                {isEditing ? (
                    <Input
                        ref={inputRef}
                        className="absolute left-0 h-auto p-0 bg-transparent border-none focus:outline-none focus-visible:ring-0 rounded-none text-lg md:text-lg font-semibold"
                        style={{ width: `${inputWidth}px` }}
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                    />
                ) : null}
                <span className={isEditing ? 'invisible' : ''} style={{ minWidth: '1px' }}>
                    {inputValue || ' '}
                </span>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 flex-shrink-0"
            >
                <PencilIcon className="size-4" />
            </Button>
        </div>
    );
}
