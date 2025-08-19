import {useEffect} from "react";

type Props = {
    selectedVersion: string;
    setSelectedVersion(value: string): void;
    versions: string[];
}

export default function VersionSelector(props: Props) {

    useEffect(() => {
        if (props.selectedVersion) return;
        props.setSelectedVersion(props.versions[props.versions.length -1])
    }, [props.versions]);

    return  <select value={props.selectedVersion}
                    onChange={e => props.setSelectedVersion(e.target.value)}>
        {props.versions.map(v => (
            <option key={v} value={v}>{v}</option>
        ))}
    </select>
}
