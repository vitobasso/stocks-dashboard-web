import {DataGrid as RDataGrid, DataGridProps} from 'react-data-grid';
import styles from './DataGrid.module.css';

type Key = string | number | bigint;

export function DataGrid<R extends { ticker: string }, SR, K extends Key>(props: DataGridProps<R, SR, K>) {
    return (
        <RDataGrid<R, SR, K>
            {...props}
            rowClass={(row) => {
                console.log("rowClass", props.selectedRows, row.ticker);
                return (props.selectedRows?.has(row.ticker)) ? styles.selectedRow : ''
            }}
        />
    );
}
