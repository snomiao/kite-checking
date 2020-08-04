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


import { cfg, api } from '../api';
import { CheckingAddStudent } from './checking/add';
const Datastore = require('nedb-promises')
// import * as Datastore from "nedb-promises"
Datastore


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

const checkingChildClass = mergeStyles({
    display: 'block',
    marginBottom: '10px',
});

const textFieldStyles: Partial<ITextFieldStyles> = { root: { maxWidth: '300px' } };

export interface IDetailsListCheckingItem {
    studentId: string
    name: string
    college: string
    major: string
    identity_number: string
    approvedAdmin: string
    approvedTime: string
    approvedTime_str: string
    approvedStatus_str?: string
}

export interface IDetailsListCheckingState {
    sortedColumnKey?: string
    selectionCount?: number
    contextualMenuProps?: IContextualMenuProps
    items: IDetailsListCheckingItem[]
    selectionDetails: string
    isSortedDescending?: boolean
    columns: IColumn[]
    searchByName?: string
    searchByCollege?: string
    showStudentAddDialog?: boolean
}

// isSorted: true,
// isSortedDescending: false,
// sortAscendingAriaLabel: 'Sorted A to Z',
// sortDescendingAriaLabel: 'Sorted Z to A',


const studentKeys = [
    ['studentId', '学号'],
    ['name', '姓名'],
    ['college', '学院'],
    ['Major', '专业'],
    ['identityNumber', '身份证号'],
    ['approvalStatus', '返校状态'],
]

export class CheckingPage extends React.Component<{}, IDetailsListCheckingState> {
    private _selection: Selection;
    private _allItems: IDetailsListCheckingItem[];
    private _columns: IColumn[];
    constructor(props: {}) {
        super(props);
        this._selection = new Selection({
            onSelectionChanged: () => this.setState({ selectionDetails: this._getSelectionDetails() }),
        });
        // Populate with items for demos.
        this._allItems = [];
        this._columns = [
            {
                key: 'studentId', name: '学号', fieldName: 'studentId',
                minWidth: 80, maxWidth: 80, isResizable: true, onColumnClick: this._onColumnClick,
            }, {
                key: 'name', name: '姓名', fieldName: 'name',
                minWidth: 48, maxWidth: 64, isResizable: true, onColumnClick: this._onColumnClick,
            }, {
                key: 'college', name: '学院', fieldName: 'college',
                minWidth: 100, maxWidth: 200, isResizable: true, onColumnClick: this._onColumnClick,
            }, {
                key: 'major', name: '专业', fieldName: 'major',
                minWidth: 32, maxWidth: 200, isResizable: true, onColumnClick: this._onColumnClick, isCollapsable: true,
            }, {
                key: 'identity_number', name: '身份证号', fieldName: 'identity_number',
                minWidth: 60, maxWidth: 150, isResizable: true, onColumnClick: this._onColumnClick,
            }, {
                key: 'approvedAdmin', name: '审核人', fieldName: 'approvedAdmin',
                minWidth: 120, maxWidth: 200, isResizable: true, onColumnClick: this._onColumnClick,
            }, {
                key: 'approvedTime_str', name: '审核时间', fieldName: 'approvedTime_str',
                minWidth: 120, maxWidth: 200, isResizable: true, isSortedDescending: true,
                onColumnClick: this._onColumnClick,
            },
            {
                key: 'approvedStatus_str', name: '审核状态', fieldName: 'approvedStatus_str',
                minWidth: 120, maxWidth: 200, isResizable: true, isSortedDescending: true,
                onColumnClick: this._onColumnClick,
            },
        ];
        // uid暂时没有用
        // 专业可以不显示，或者鼠标放到姓名上之后显示
        // 身份证号平时显示后六位，放上去显示全部
        // 其他的，始终显示姓名学号学院还有审核人（未审核就置空）

        this.state = {
            items: this._allItems,
            columns: this._columns,
            selectionDetails: this._getSelectionDetails(),
        };
        if (typeof window !== 'undefined') {
            this.loadCheckings().then()
        }

        // const isDraggable = true;
        // const dragOptions = {
        //     moveMenuItemText: 'Move',
        //     closeMenuItemText: 'Close',
        //     menu: ContextualMenu,
        // };
        // const modalProps = React.useMemo(
        //     () => ({
        //         // titleAriaId: labelId,
        //         // subtitleAriaId: subTextId,
        //         // isBlocking: false,
        //         // styles: dialogStyles,
        //         dragOptions: isDraggable ? dragOptions : undefined,
        //     }),
        //     // [isDraggable, labelId, subTextId],
        //     [isDraggable],
        // );

    }
    private parseStudentInfoToItem = ({
        approvedAdmin,   //     approvedAdmin: null
        approvedTime,    //     approvedTime: null
        college,         //     college: "机械工程学院"
        identity_number, //     identity_number: "310117199608031814"
        major,           //     major: null
        name,            //     name: "金涛"
        studentId,       //     studentId: "1610200214"
        uid,             //     uid: null
    }): IDetailsListCheckingItem => ({
        name, approvedAdmin,
        approvedTime,
        approvedTime_str: !approvedTime ? '' : new Date(approvedTime).toLocaleString(),
        approvedStatus_str: !!approvedTime ? '通过' : '',
        college, identity_number, major, studentId
    })
    async loadCheckings(searchByName?) {
        const { code, data, err } = await api.get('/checking/student' + (searchByName && ('?q=' + searchByName) || ''))
        if (code) {
            console.error(code, err)
            return false; // fail
        }
        cfg.supply('studentData', data)
        const cache = cfg.get('studentData')
        console.log(174, cache.length, cache);

        const checkingStudents = data
        // const {approvedAdmin, approvedTime, college, identity_number, major, name, studentId, uid,} = 
        this._allItems = checkingStudents.map(this.parseStudentInfoToItem)

        const { searchByCollege } = this.state
        let items = this._allItems
        if (searchByCollege) (items = items.filter(i => i.college.toLowerCase().indexOf(searchByCollege) > -1))
        if (searchByName) (items = items.filter(i => i.college.toLowerCase().indexOf(searchByName) > -1))
        this.setState({ items, searchByName, searchByCollege })
    }
    private _getSelectionDetails(): string {
        const selectionCount = this._selection.getSelectedCount();
        this.setState({ selectionCount })
        switch (selectionCount) {
            case 0:
                return '未选择学生';
            case 1:
                return '选择了: ' + (this._selection.getSelection()[0] as IDetailsListCheckingItem).name;
            default:
                return `选择了 ${selectionCount} 个学生`;
        }
    }
    private _onClickCheckingAllow = async () => {
        const students = this._selection.getSelection() as IDetailsListCheckingItem[]
        if (!students.length) {
            alert('未选择学生')
            return;
        }
        let student: IDetailsListCheckingItem
        students.forEach(async student => {
            const { code, data } = await api.patch('/checking/student/' + student.studentId, { approvalStatus: true })
            if (code > 0) { alert(`操作出错: 错误代码 ${code}，请联系管理员`); /*continue;*/; return; }
            if (code < 0) { alert(`网络错误: 错误代码 ${code}，请检查网络连接`); /*break;*/; return; }
            // replace this student with new info
            const studentToReplace = this.parseStudentInfoToItem(data)
            this._allItems = this._allItems
                .map(student =>
                    (student.studentId != studentToReplace.studentId)
                        ? student
                        : studentToReplace)
            // refresh
            const { searchByName, searchByCollege } = this.state
            let items = this._allItems
            if (searchByCollege) (items = items.filter(i => i.college.toLowerCase().indexOf(searchByCollege) > -1))
            if (searchByName) (items = items.filter(i => i.college.toLowerCase().indexOf(searchByName) > -1))
            this.setState({ items, searchByName, searchByCollege })
        })
        // refresh
        // this.loadCheckings(this.state.searchByName)
    }
    private _onClickCheckingBlock = async () => {
        const students = this._selection.getSelection() as IDetailsListCheckingItem[]
        if (!students.length) {
            alert('未选择学生')
            return;
        }
        let student: IDetailsListCheckingItem
        students.forEach(async student => {
            const { code, data } = await api.patch('/checking/student/' + student.studentId, { approvalStatus: false })
            if (code > 0) { alert(`操作出错: 错误代码 ${code}，请联系管理员`); /*continue;*/; return; }
            if (code < 0) { alert(`网络错误: 错误代码 ${code}，请检查网络连接`); /*break;*/; return; }
            // replace this student with new info
            const studentToReplace = this.parseStudentInfoToItem(data)
            this._allItems = this._allItems
                .map(student =>
                    student.studentId != studentToReplace.studentId
                        ? student : studentToReplace)
            // refresh
            const { searchByName, searchByCollege } = this.state
            let items = this._allItems
            if (searchByCollege) (items = items.filter(i => i.college.toLowerCase().indexOf(searchByCollege) > -1))
            if (searchByName) (items = items.filter(i => i.college.toLowerCase().indexOf(searchByName) > -1))
            this.setState({ items, searchByName, searchByCollege })
        })
        // refresh
        // this.loadCheckings(this.state.searchByName)
    }
    // private _onFilter = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    private _onFilter = (newText: string): void => {
        this.loadCheckings(newText)
    };

    // private _onFilterByCollege = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    private _onFilterByCollege = (newText: string): void => {
        const searchByCollege = newText
        const { searchByName } = this.state

        let items = this._allItems
        if (searchByCollege) (items = items.filter(i => i.college.toLowerCase().indexOf(searchByCollege) > -1))
        if (searchByName) (items = items.filter(i => i.college.toLowerCase().indexOf(searchByName) > -1))
        this.setState({ items, searchByCollege })
    };
    private _onItemInvoked = (item: IDetailsListCheckingItem): void => {
        // alert(`Item invoked: ${item.name}`);
        this._onClickCheckingAllow()
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
        items: IDetailsListCheckingItem[],
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
            //     column.onRender = (item: IDetailsListCheckingItem) => <Link data-selection-invoke={true}>{item.name}</Link>;
            // } else if (column.key === 'key') {
            //     column.columnActionsMode = ColumnActionsMode.disabled;
            //     column.onRender = (item: IDetailsListCheckingItem) => (
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
    private _toggleCheckingStudentAddDialog = () => {
        this.setState({ showStudentAddDialog: !this.state.showStudentAddDialog })
    }
    private _commands: ICommandBarItemProps[] = [
        {
            key: 'checkingAllow',
            text: '✔同意返校',
            // iconProps: { iconName: 'Upload' },
            onClick: () => (this._onClickCheckingAllow(), null),
        },
        {
            key: 'checkingBlock',
            text: '❌拒绝返校',
            // iconProps: { iconName: 'Share' },
            onClick: () => (this._onClickCheckingBlock(), null),
        },
    ]
    private _farCommands: ICommandBarItemProps[] = [
        {
            key: 'checkingStudentAdd',
            text: '十 添加学生',
            // iconProps: { iconName: 'Upload' },
            // href: 'https://developer.microsoft.com/en-us/fluentui',
            onClick: this._toggleCheckingStudentAddDialog,
        },
    ]
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


    public render(): JSX.Element {
        const { items, selectionDetails, selectionCount } = this.state;

        return (
            <Layout>
                <Stack horizontalAlign='center' style={{ padding: '1em', fontSize: '1.5em' }}>
                    返校审批 - 上应小风筝
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
                        <SearchBox
                            // className={checkingChildClass}
                            // label="按学院查找"
                            placeholder="查找学院"
                            onChange={this._onFilterByCollege}
                            styles={textFieldStyles}
                        />
                    </Stack>
                    <Stack>当前{selectionDetails}</Stack>
                </Stack>
                <CommandBar
                    items={this._commands}
                    farItems={this._farCommands}
                    ariaLabel="Use left and right arrow keys to navigate between commands"
                />
                <Dialog
                    hidden={!this.state.showStudentAddDialog}
                    onDismiss={this._toggleCheckingStudentAddDialog}
                >
                    <CheckingAddStudent />
                </Dialog>
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
            </Layout>
        );
    }
}

function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
    const key = columnKey as keyof T;
    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}
export default CheckingPage
