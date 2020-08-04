import * as React from 'react';
import {
    ICommandBarItemProps,
    IColumn,
    Selection,
    ITextFieldStyles,
    DetailsListLayoutMode,
    Announced,
    TextField,
    DetailsList,
    MarqueeSelection, Separator,
    Fabric,
    SearchBox,
    mergeStyles,
    mergeStyleSets,
    IContextualMenuProps,
    IContextualMenuItem,
    DirectionalHint,
    ContextualMenu,
    CheckboxVisibility,
    ColumnActionsMode,
    ConstrainMode,
    IGroup,
    SelectionMode,
    buildColumns,
    IDetailsColumnProps,
    getTheme,
    CommandBar,
    Button,
    PrimaryButton,
    Stack,
    Layer,
    ShimmeredDetailsList,
    IDetailsItemProps,
    Dialog,
    DialogFooter,
} from "office-ui-fabric-react"


import Layout from "../components/layout"
import { api, checkLoginAndRedirectIfNeeded } from '../api';


const theme = getTheme();
const headerDividerClass = 'DetailsListAdvancedExample-divider';
const classNames = mergeStyleSets({
    headerDivider: {
        display: 'inline-block',
        height: '100%',
    },
    headerDividerBar: [
        {
            display: 'none',
            background: theme.palette.themePrimary,
            position: 'absolute',
            top: 16,
            bottom: 0,
            width: '1px',
            zIndex: 5,
        },
        headerDividerClass,
    ],
    linkField: {
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
    },
    root: {
        selectors: {
            [`.${headerDividerClass}:hover + .${headerDividerClass}`]: {
                display: 'inline',
            },
        },
    },
});


const exampleChildClass = mergeStyles({
    display: 'block',
    marginBottom: '10px',
});

const textFieldStyles: Partial<ITextFieldStyles> = { root: { maxWidth: '300px' } };

export interface IDetailsListBasicExampleItem {
    department: string
    job_id: string
    name: string
    role: number
    role_show: string
}

export interface IDetailsListBasicExampleState {
    sortedColumnKey?: string;
    selectionCount?: number;
    contextualMenuProps?: IContextualMenuProps;
    items: IDetailsListBasicExampleItem[];
    selectionDetails: string;
    isSortedDescending?: boolean;
    columns: IColumn[];
}

// isSorted: true,
// isSortedDescending: false,
// sortAscendingAriaLabel: 'Sorted A to Z',
// sortDescendingAriaLabel: 'Sorted Z to A',


export class DetailsListBasicExample extends React.Component<{}, IDetailsListBasicExampleState> {
    private _selection: Selection;
    private _allItems: IDetailsListBasicExampleItem[];
    private _columns: IColumn[];
    constructor(props: {}) {
        super(props);
        // checkLoginAndRedirectIfNeeded().then()

        this._selection = new Selection({
            onSelectionChanged: () => this.setState({ selectionDetails: this._getSelectionDetails() }),
        });
        // Populate with items for demos.
        this._allItems = [];

        this._columns = [
            ['department', '部门',],
            ['job_id', '工号',],
            ['name', '姓名',],
            ['role_show', '角色',],
        ].map(([key, name]) => (({
            key, name, fieldName: key,
            minWidth: 80, maxWidth: 100, isResizable: true, onColumnClick: this._onColumnClick,
        })))
        // uid暂时没有用
        // 专业可以不显示，或者鼠标放到姓名上之后显示
        // 身份证号平时显示后六位，放上去显示全部
        // 其他的，始终显示姓名学号学院还有审核人（未审核就置空）

        this.state = {
            items: this._allItems,
            columns: this._columns,
            selectionDetails: this._getSelectionDetails(),
        };
        if (typeof window !== "undefined") {
            this.loadCheckings().then()
        }
    }

    async loadCheckings() {
        const { code, data } = await api.get('/checking/admin')
        if (code) {
            // this.state
            return;
        }
        console.log(data);

        // const {approvedAdmin, approvedTime, college, identity_number, major, name, studentId, uid,} = 

        this._allItems = data.map(({
            department, // department: "机械工程学院"
            job_id, // job_id: "1234"
            name, // name: "测试号"
            role, // role: 2
            uid, // uid: 1
        }) => ({
            uid,
            department,
            job_id,
            name,
            role,
            role_show: ({ 1: '辅导员', 2: '学院管理者', 3: '学生处管理者' }[role] || ('等级' + role)),
        }))
        this.setState({ items: this._allItems, })
    }

    public render(): JSX.Element {
        const { items, selectionDetails } = this.state;
        return (
            /* <Layout>
                <Fabric>
                    <div className={exampleChildClass}>{selectionDetails}</div>
                    <Announced message={selectionDetails} />
                    <TextField
                        // className={exampleChildClass}
                        placeholder="查找姓名"
                        onChange={this._onFilter}
                        styles={textFieldStyles}
                    />
                    <Announced message={`Number of items after filter applied: ${items.length}.`} />
                    <MarqueeSelection selection={this._selection}>
                        <DetailsList
                            isHeaderVisible={true}
                            items={items}
                            columns={this._columns}
                            setKey="set"
                            layoutMode={DetailsListLayoutMode.justified}
                            selection={this._selection}
                            selectionPreservedOnEmptyClick={true}
                            ariaLabelForSelectionColumn="Toggle selection"
                            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                            checkButtonAriaLabel="Row checkbox"
                            onItemInvoked={this._onItemInvoked}
                        />
                    </MarqueeSelection>
                </Fabric>
                <Separator> 上应小风筝 </Separator> 
            </Layout>*/

            <Layout>
                <Stack horizontalAlign='center' style={{ padding: '1em', fontSize: '1.5em' }}>
                    审核者管理 - 上应小风筝
                </Stack>
                <Stack horizontalAlign='center' verticalAlign='center' style={{ padding: '1em' }}>
                    <Stack>查找：</Stack>
                    <Stack horizontal>
                        <SearchBox
                            // className={checkingChildClass}
                            // label="按姓名查找"
                            placeholder="查找姓名"
                            onChange={this._onFilter}
                            styles={textFieldStyles}
                        />
                        {/* <SearchBox
                            // className={checkingChildClass}
                            // label="按学院查找"
                            placeholder="查找学院"
                            onChange={this._onFilterByCollege}
                            styles={textFieldStyles}
                        /> */}
                    </Stack>
                    <Stack>当前{selectionDetails}</Stack>
                </Stack>
                <CommandBar
                    items={this._commands}
                    farItems={this._farCommands}
                    ariaLabel="Use left and right arrow keys to navigate between commands"
                />
                <MarqueeSelection selection={this._selection}>
                    <DetailsList
                        // enableShimmer={!!isLoadingData}
                        isHeaderVisible={true}
                        items={items}
                        columns={this._columns}
                        setKey="set"
                        layoutMode={DetailsListLayoutMode.justified}
                        selection={this._selection}
                        selectionPreservedOnEmptyClick={true}
                        ariaLabelForSelectionColumn="Toggle selection"
                        ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                        checkButtonAriaLabel="Row checkbox"
                        onItemInvoked={this._onItemInvoked}
                    />
                </MarqueeSelection>
                <Separator> 上应小风筝 </Separator>
            </Layout >
        );
    }

    private _getSelectionDetails(): string {
        const selectionCount = this._selection.getSelectedCount();

        switch (selectionCount) {
            case 0:
                return 'No items selected';
            case 1:
                return '1 item selected: ' + (this._selection.getSelection()[0] as IDetailsListBasicExampleItem).name;
            default:
                return `${selectionCount} items selected`;
        }
    }
    // private _onFilter = (text: string): void => {
    //     this.setState({
    //         items: text ? this._allItems.filter(i => i.name.toLowerCase().indexOf(text) > -1) : this._allItems,
    //     });
    // };


    // private _onFilter = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    private _onFilter = (text: string): void => {
        this.setState({
            items: text ? this._allItems.filter(i => i.name.toLowerCase().indexOf(text) > -1) : this._allItems,
        });
    };

    private _onItemInvoked = (item: IDetailsListBasicExampleItem): void => {
        alert(`Item invoked: ${item.name}`);
    };

    private _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
        const { columns, items } = this.state;
        const newColumns: IColumn[] = columns.slice();
        const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
        newColumns.forEach((newCol: IColumn) => {
            if (newCol === currColumn) {
                currColumn.isSortedDescending = !currColumn.isSortedDescending;
                currColumn.isSorted = true;
                // this.setState({
                //     announcedMessage: `${currColumn.name} is sorted ${
                //         currColumn.isSortedDescending ? 'descending' : 'ascending'
                //         }`,
                // });
            } else {
                newCol.isSorted = false;
                newCol.isSortedDescending = true;
            }
        });
        const newItems = _copyAndSort(items, currColumn.fieldName!, currColumn.isSortedDescending);
        this.setState({
            columns: newColumns,
            items: newItems,
        });
    };

    private _onSortColumn = (columnKey: string, isSortedDescending: boolean): void => {
        const sortedItems = _copyAndSort(this._allItems, columnKey, isSortedDescending);

        this.setState({
            items: sortedItems,
            columns: this._buildColumns(
                sortedItems,
                true,
                this._onColumnClick,
                columnKey,
                isSortedDescending,
                undefined,
                this._onColumnContextMenu,
            ),
            isSortedDescending: isSortedDescending,
            sortedColumnKey: columnKey,
        });
    };
    private _buildColumns(
        items: IDetailsListBasicExampleItem[],
        canResizeColumns?: boolean,
        onColumnClick?: (ev: React.MouseEvent<HTMLElement>, column: IColumn) => any,
        sortedColumnKey?: string,
        isSortedDescending?: boolean,
        groupedColumnKey?: string,
        onColumnContextMenu?: (column: IColumn, ev: React.MouseEvent<HTMLElement>) => any,
    ) {
        const columns = buildColumns(
            items,
            canResizeColumns,
            onColumnClick,
            sortedColumnKey,
            isSortedDescending,
            groupedColumnKey,
        );

        columns.forEach(column => {
            column.onRenderDivider = this._onRenderDivider;
            column.onColumnContextMenu = onColumnContextMenu;
            column.ariaLabel = `Operations for ${column.name}`;
            // if (column.key === 'thumbnail') {
            //     column.iconName = 'Picture';
            //     column.isIconOnly = true;
            // } else if (column.key === 'description') {
            //     column.isMultiline = true;
            //     column.minWidth = 200;
            // } else if (column.key === 'name') {
            //     column.onRender = (item: IDetailsListBasicExampleItem) => <Link data-selection-invoke={true}>{item.name}</Link>;
            // } else if (column.key === 'key') {
            //     column.columnActionsMode = ColumnActionsMode.disabled;
            //     column.onRender = (item: IDetailsListBasicExampleItem) => (
            //         <Link className={classNames.linkField} href="https://microsoft.com" target="_blank" rel="noopener">
            //             {item.key}
            //         </Link>
            //     );
            //     column.minWidth = 90;
            //     column.maxWidth = 90;
            // }
        });

        return columns;
    }
    private _onRenderDivider = (
        columnProps: IDetailsColumnProps,
        defaultRenderer: (props?: IDetailsColumnProps) => JSX.Element | null,
    ): JSX.Element => {
        const { columnIndex } = columnProps;
        return (
            <React.Fragment key={`divider-wrapper-${columnIndex}`}>
                <span className={classNames.headerDivider}>{defaultRenderer(columnProps)}</span>
                <span className={classNames.headerDividerBar} />
            </React.Fragment>
        );
    };
    private _onColumnContextMenu = (column: IColumn, ev: React.MouseEvent<HTMLElement>): void => {
        if (column.columnActionsMode !== ColumnActionsMode.disabled) {
            this.setState({
                contextualMenuProps: this._getContextualMenuProps(ev, column),
            });
        }
    };
    private _getContextualMenuProps(ev: React.MouseEvent<HTMLElement>, column: IColumn): IContextualMenuProps {
        const items = [
            {
                key: 'aToZ',
                name: 'A to Z',
                iconProps: { iconName: 'SortUp' },
                canCheck: true,
                checked: column.isSorted && !column.isSortedDescending,
                onClick: () => this._onSortColumn(column.key, false),
            },
            {
                key: 'zToA',
                name: 'Z to A',
                iconProps: { iconName: 'SortDown' },
                canCheck: true,
                checked: column.isSorted && column.isSortedDescending,
                onClick: () => this._onSortColumn(column.key, true),
            },
        ];
        // if (isGroupable(column.key)) {
        //   items.push({
        //     key: 'groupBy',
        //     name: 'Group by ' + column.name,
        //     iconProps: { iconName: 'GroupedDescending' },
        //     canCheck: true,
        //     checked: column.isGrouped,
        //     onClick: () => this._onGroupByColumn(column),
        //   });
        // }
        return {
            items: items,
            target: ev.currentTarget as HTMLElement,
            directionalHint: DirectionalHint.bottomLeftEdge,
            gapSpace: 10,
            isBeakVisible: true,
            onDismiss: this._onContextualMenuDismissed,
        };
    }
    private _onContextualMenuDismissed = (): void => {
        this.setState({
            contextualMenuProps: undefined,
        });
    };
    private _commands: ICommandBarItemProps[] = [
        // {
        //     key: 'checkingAllow',
        //     text: '✔同意返校',
        //     // iconProps: { iconName: 'Upload' },
        //     onClick: () => (this._onClickCheckingAllow(), null),
        // },
        // {
        //     key: 'checkingBlock',
        //     text: '删除管理员',
        //     // iconProps: { iconName: 'Share' },
        //     onClick: () => (this._onClickCheckingBlock(), null),
        // },
    ]
    private _farCommands: ICommandBarItemProps[] = [
        // {
        //     key: 'checkingStudentAdd',
        //     text: '十 添加学生',
        //     // iconProps: { iconName: 'Upload' },
        //     // href: 'https://developer.microsoft.com/en-us/fluentui',
        //     onClick: this._toggleCheckingStudentAddDialog,
        // },
    ]


}
function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
    const key = columnKey as keyof T;
    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}

export default DetailsListBasicExample
