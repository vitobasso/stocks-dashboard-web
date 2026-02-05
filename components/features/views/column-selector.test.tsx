import React from "react";
import {describe, jest, test} from "@jest/globals";
import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import '@testing-library/jest-dom'

import {ColumnSelector} from "./column-selector";

type TestLabel = {short: string; long: string};

const allKeys = [
    "alpha.foo",
    "alpha.sub1.bar",
    "alpha.sub1.baz",
    "alpha.sub2.qux",
    "alpha.derived.d1",
    "beta.bat",
    "beta.sub.long.y",
];

const labels: Record<string, TestLabel> = {
    //groups
    "alpha": {short: "Alpha", long: "Alpha group"},
    "beta": {short: "Beta", long: "Beta group"},

    //subgroups
    "alpha.sub1": {short: "Sub 1", long: ""},
    "alpha.sub2": {short: "Sub 2", long: ""},
    "alpha.derived": {short: "Derived", long: ""},
    "beta.sub.long": {short: "Sub Long", long: ""},

    //keys (children)
    "alpha.foo": {short: "FOO", long: "Foo"},
    "alpha.sub1.bar": {short: "BAR", long: "Bar"},
    "alpha.sub1.baz": {short: "BAZ", long: "Baz"},
    "alpha.sub2.qux": {short: "QUX", long: "Qux"},
    "alpha.derived.d1": {short: "D1", long: "Derived 1"},
    "beta.bat": {short: "BAT", long: "Bat"},
    "beta.sub.long.y": {short: "Y", long: "Why"},
};

describe("ColumnSelector", () => {
    test("renders accordion groups with keys and subgroups according to allKeys hierarchy", async () => {
        renderWithState([]);

        // accordion groups are visible
        expect(screen.getByRole("button", {name: /Alpha/i})).toBeVisible();
        expect(screen.getByRole("button", {name: /Beta/i})).toBeVisible();

        // open the groups
        fireEvent.click(screen.getByRole("button", {name: /Alpha/i}));
        fireEvent.click(screen.getByRole("button", {name: /Beta/i}));
        const alphaContent = findAccordionContent(/Alpha/i)
        const betaContent = findAccordionContent(/Beta/i)

        // children are visible and in the right group
        expect(within(alphaContent).getByText("FOO")).toBeVisible();
        expect(within(alphaContent).getByText("BAR")).toBeVisible();
        expect(within(alphaContent).getByText("BAZ")).toBeVisible();
        expect(within(alphaContent).getByText("QUX")).toBeVisible();
        expect(within(alphaContent).getByText("D1")).toBeVisible();
        expect(within(betaContent).getByText("BAT")).toBeVisible();
        expect(within(betaContent).getByText("Y")).toBeVisible();

        // subgroups are visible and in the right group
        expect(within(alphaContent).getByText("Sub 1")).toBeVisible();
        expect(within(alphaContent).getByText("Sub 2")).toBeVisible();
        expect(within(alphaContent).getByText("Derived")).toBeVisible();
        expect(within(betaContent).getByText("Sub Long")).toBeVisible();
    });

    test("accordion groups open and close in response to clicks", async () => {
        renderWithState([]);

        // accordion is initially closed
        expectHiddenOrAbsent("BAR");

        // click to open
        const alphaTrigger = screen.getByRole("button", {name: /Alpha/i});
        fireEvent.click(alphaTrigger);
        expect(screen.getByText("BAR")).toBeVisible();

        // click to close
        fireEvent.click(alphaTrigger);
        expectHiddenOrAbsent("BAR");
    });

    test("checkbox states are initialized", async () => {
        renderWithState(["alpha.sub1.bar", "beta.bat"]);

        // open both accordion groups
        fireEvent.click(screen.getByRole("button", {name: /Alpha/i}));
        fireEvent.click(screen.getByRole("button", {name: /Beta/i}));

        const alphaTrigger = screen.getByRole("button", {name: /Alpha/i});
        const betaTrigger = screen.getByRole("button", {name: /Beta/i});
        //parent checkbox each partially selected
        expect(within(alphaTrigger).getByRole("checkbox")).toHaveAttribute("data-state", "indeterminate");
        expect(within(betaTrigger).getByRole("checkbox")).toHaveAttribute("data-state", "indeterminate");

        //child checkboxes are checked according to initial state
        expectChildCheckboxState("BAR", "checked");
        expectChildCheckboxState("FOO", "unchecked");
        expectChildCheckboxState("BAT", "checked");
        expectChildCheckboxState("Y", "unchecked");
    });

    test("child checkboxes toggle via label click and setColumns is called", async () => {
        const {setColumnsSpy} = renderWithState(["alpha.sub1.bar"]);

        // open the accordion group
        const alphaTrigger = screen.getByRole("button", {name: /Alpha/i});
        fireEvent.click(alphaTrigger);
        await waitFor(() => expect(screen.getByText("FOO")).toBeVisible());

        // toggle child checkbox on
        setColumnsSpy.mockClear();
        fireEvent.click(screen.getByText("FOO"));
        expectChildCheckboxState("FOO", "checked");
        expect(setColumnsSpy).toHaveBeenCalledWith(expect.arrayContaining(["alpha.foo", "alpha.sub1.bar"]));

        // toggle child checkbox off
        setColumnsSpy.mockClear();
        const fooRow = screen.getByText("FOO").closest("label");
        if (!fooRow) throw new Error("FOO row not found");
        fireEvent.click(within(fooRow).getByRole("checkbox"));
        expectChildCheckboxState("FOO", "unchecked");
        expect(setColumnsSpy).toHaveBeenCalledWith(expect.arrayContaining(["alpha.sub1.bar"]));
    });

    test("toggling parent checkbox selects all children", async () => {
        const {setColumnsSpy} = renderWithState(["alpha.sub1.bar"]);

        // open group accordion
        const alphaTrigger = screen.getByRole("button", {name: /Alpha/i});
        fireEvent.click(screen.getByText("Alpha"));
        expect(within(alphaTrigger).getByRole("checkbox")).toHaveAttribute("data-state", "indeterminate");
        expectChildCheckboxState("FOO", "unchecked");
        expectChildCheckboxState("BAR", "checked");
        expectChildCheckboxState("BAZ", "unchecked");
        expectChildCheckboxState("QUX", "unchecked");
        expectChildCheckboxState("D1", "unchecked");
        expect(setColumnsSpy).not.toHaveBeenCalled();

        // toggle parent checkbox on
        setColumnsSpy.mockClear();
        fireEvent.click(within(alphaTrigger).getByRole("checkbox"));
        expect(within(alphaTrigger).getByRole("checkbox")).toHaveAttribute("data-state", "checked");
        expectChildCheckboxState("FOO", "checked");
        expectChildCheckboxState("BAR", "checked");
        expectChildCheckboxState("BAZ", "checked");
        expectChildCheckboxState("QUX", "checked");
        expectChildCheckboxState("D1", "checked");
        expect(setColumnsSpy).toHaveBeenCalledWith(
            expect.arrayContaining([
                "alpha.foo",
                "alpha.sub1.bar",
                "alpha.sub1.baz",
                "alpha.sub2.qux",
                "alpha.derived.d1",
            ])
        );

        // toggle parent checkbox off
        setColumnsSpy.mockClear();
        fireEvent.click(within(alphaTrigger).getByRole("checkbox"));
        expect(within(alphaTrigger).getByRole("checkbox")).toHaveAttribute("data-state", "unchecked");
        expectChildCheckboxState("FOO", "unchecked");
        expectChildCheckboxState("BAR", "unchecked");
        expectChildCheckboxState("BAZ", "unchecked");
        expectChildCheckboxState("QUX", "unchecked");
        expectChildCheckboxState("D1", "unchecked");
        expect(setColumnsSpy).toHaveBeenCalledWith(
            expect.arrayOf([])
        );
    });

    test("search opens matching accordion groups and hides non-matching children and groups", async () => {
        renderWithState([]);

        // search by child label "Bar"
        const input = screen.getByPlaceholderText("Buscar...");
        fireEvent.change(input, {target: {value: "Bar"}});
        expect(screen.getByRole("button", {name: /Alpha/i})).toBeVisible(); // matching group visible
        expect(screen.queryByRole("button", {name: /Beta/i})).toBeNull(); // non-matching group hidden
        expect(screen.getByText("BAR")).toBeVisible(); // matching child visible
        expectHiddenOrAbsent("FOO"); // non-matching child hidden
        expectHiddenOrAbsent("BAZ");

        // search by group label "Beta"
        fireEvent.change(input, {target: {value: "Beta"}});
        expect(screen.getByRole("button", {name: /Beta/i})).toBeVisible(); // matching group visible
        expect(screen.queryByRole("button", {name: /Alpha/i})).toBeNull(); // non-matching group hidden
        expect(screen.getByText("BAT")).toBeVisible(); // matching child visible
        expect(screen.getByText("Y")).toBeVisible();
        expectHiddenOrAbsent("BAR"); // non-matching child hidden
        expectHiddenOrAbsent("FOO");
        expectHiddenOrAbsent("BAZ");
    });

    test("accordion groups still open and close while searching", async () => {
        renderWithState([]);

        // search to open accordion automatically
        const input = screen.getByPlaceholderText("Buscar...");
        fireEvent.change(input, {target: {value: "Bar"}});
        expect(screen.getByText("BAR")).toBeVisible();
        expectHiddenOrAbsent("BAZ"); //non-matching child hidden

        // close accordion
        const alphaTrigger = screen.getByRole("button", {name: /Alpha/i});
        fireEvent.click(alphaTrigger);
        expectHiddenOrAbsent("BAR");
        expectHiddenOrAbsent("BAZ");

        // open accordion again
        fireEvent.click(alphaTrigger);
        expect(screen.getByText("BAR")).toBeVisible();
        expectHiddenOrAbsent("BAZ"); //non-matching child still hidden
    });


    test("partial search opens all matching children", async () => {
        renderWithState([]);

        // search by partial child label "Ba"
        const input = screen.getByPlaceholderText("Buscar...");
        fireEvent.change(input, {target: {value: "Ba"}});

        // both groups open, only matching children are visible
        expect(screen.getByRole("button", {name: /Alpha/i})).toBeVisible();
        expect(screen.queryByRole("button", {name: /Beta/i})).toBeVisible();
        expect(screen.getByText("BAR")).toBeVisible();
        expect(screen.getByText("BAZ")).toBeVisible();
        expect(screen.getByText("BAT")).toBeVisible();
        expectHiddenOrAbsent("FOO");
        expectHiddenOrAbsent("QUX");
        expectHiddenOrAbsent("D1");
        expectHiddenOrAbsent("Y");
    });

    test("erasing search term restores accordion groups visible and closed", async () => {
        renderWithState([]);

        // search to open accordion automatically
        const input = screen.getByPlaceholderText("Buscar...");
        const alphaTrigger = screen.getByRole("button", {name: /Alpha/i});
        fireEvent.change(input, {target: {value: "Bar"}});

        // manually close and re-open accordion
        fireEvent.click(alphaTrigger);
        fireEvent.click(alphaTrigger);

        // erase search term to restore initial state
        fireEvent.change(input, {target: {value: ""}});
        expect(screen.getByRole("button", {name: /Alpha/i})).toBeVisible();
        expect(screen.queryByRole("button", {name: /Beta/i})).toBeVisible();
        expectHiddenOrAbsent("BAR");
    });
});

function renderWithState(initialColumns: string[]) {
    const setColumnsSpy = jest.fn((args: string[]) => {});

    function Wrapper() {
        const [columns, setColumns] = React.useState<string[]>(initialColumns);
        return (
            <ColumnSelector
                columns={columns}
                setColumns={(next) => {
                    setColumnsSpy(next);
                    setColumns(next);
                }}
                allKeys={allKeys}
                labeler={labeler}
            />
        );
    }

    render(<Wrapper />);
    return {setColumnsSpy};
}

function labeler(path: string): TestLabel {
    return labels[path] ?? {short: path, long: path};
}

function expectHiddenOrAbsent(text: string) {
    const el = screen.queryByText(text);
    if (!el) return;
    expect(el).not.toBeVisible();
}

function expectChildCheckboxState(childText: string, expectedState: string) {
    const childRow = screen.getByText(childText).closest("label");
    if (!childRow) throw new Error(`${childText} child row not found`);
    expect(within(childRow).getByRole("checkbox")).toHaveAttribute("data-state", expectedState);
}

function findAccordionContent(groupTitle: RegExp): HTMLElement {
    const trigger = screen.getByRole("button", {name: groupTitle})
    const item = trigger.closest('[data-slot="accordion-item"]');
    if (!item) throw new Error('Accordion item not found for trigger');
    let content = item.querySelector('[data-slot="accordion-content"]');
    if (!content) throw new Error('Accordion content not found for trigger');
    return content as HTMLElement;
}