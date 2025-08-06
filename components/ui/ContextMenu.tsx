import {forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {CellMouseArgs, CellMouseEvent} from "react-data-grid";
import styles from './ContextMenu.module.css';

type Props = {
    ticker: string;
    top: number;
    left: number;
}

type RefParams = { insertRow: (ticker: string) => void, deleteRow: (ticker: string) => void };
export type MenuHandler = (args: CellMouseArgs<any, unknown>, event: CellMouseEvent) => void;

export const ContextMenu = forwardRef(({insertRow, deleteRow}: RefParams, ref) => {
    const [props, setProps] = useState<Props | null>(null);
    const menuRef = useRef<HTMLMenuElement>(null);
    const isContextMenuOpen = props !== null;

    useImperativeHandle(ref, () => ({
        onCellContextMenu(args: CellMouseArgs<any, unknown>, event: CellMouseEvent) {
            event.preventGridDefault();
            event.preventDefault();
            setProps({ticker: args.row.ticker, top: event.clientY, left: event.clientX});
        }
    }));

    useLayoutEffect(() => {
        if (!isContextMenuOpen) return;

        function onMouseDown(event: MouseEvent) {
            if (event.target instanceof Node && menuRef.current?.contains(event.target)) {
                return;
            }
            setProps(null);
        }

        addEventListener('mousedown', onMouseDown);
        return () => {
            removeEventListener('mousedown', onMouseDown);
        };
    }, [isContextMenuOpen]);

    // const rowKeyGetter = (row: any) => row.ticker;

    return isContextMenuOpen && createPortal(
        <menu
            ref={menuRef}
            className={styles.primary}
            style={{
                top: props.top,
                left: props.left
            }}
        >
            <li>
                <button
                    type="button"
                    onClick={() => {
                        const {ticker} = props;
                        deleteRow(ticker)
                        setProps(null);
                    }}
                >
                    Delete Row
                </button>
            </li>
            <li>
                <button
                    type="button"
                    onClick={() => {
                        const {ticker} = props;
                        insertRow(ticker);
                        setProps(null);
                    }}
                >
                    Insert Row
                </button>
            </li>
        </menu>,
        document.body
    )
});

export default ContextMenu;