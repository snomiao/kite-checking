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
    MessageBar,
    MessageBarType,
    Checkbox,
} from "office-ui-fabric-react"

import Layout from "../../components/layout"
// const Datastore = require('nedb-promises')
// import * as Datastore from "nedb-promises"

export interface IDetailsListItem {
    // raw data
    studentId?: string
    name?: string
    college?: string
    major?: string
    identity_number?: string
    approvedAdmin?: string
    approvedTime?: string
    approvalStatus?: boolean
    // show
    approvedTime_str?: string
    approvalStatus_str?: string
}
const parseStudentInfoToItem = (studentInfo
    //     approvedAdmin: null
    //     approvedTime: null
    //     college: "机械工程学院"
    //     identity_number: "310117199608031814"
    //     major: null
    //     name: "金涛"
    //     studentId: "1610200214"
    //     uid: null
): IDetailsListItem => {
    const { approvedTime, approvalStatus } = studentInfo;
    return {
        ...studentInfo,
        approvedTime_str: !approvedTime ? '' : new Date((approvedTime + 'Z').replace('ZZ', 'Z')).toLocaleString(),
        approvalStatus_str: (approvalStatus && '通过') ?? !!approvedTime ? '通过' : '',
    }
}

export interface IDetailsListCheckingState {
    // list view
    columns: IColumn[]
    items: IDetailsListItem[]
    // item prop
    selectionCount?: number
    selectionDetails: string
    // column action
    sortedColumnKey?: string
    isSortedDescending?: boolean
    contextualMenuProps?: IContextualMenuProps
    // search
    searchByFuzzy?: string
    searchByCollege?: string
    // paging
    pageIndex?: number
    pageCount?: number
    pageItemCount?: number
    // message
    msg?: string
    err?: string
    // other functrion
    showStudentAddDialog?: boolean
}
export const CheckingAddStudent: React.FunctionComponent = function (props) {
    const [state, setState] = React.useState({} as { msg?, err?}) // 
    return (
        <Stack horizontalAlign="center">
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const form = Object.fromEntries(new FormData(e.currentTarget).entries())
                    const payload = { ...form, approvalStatus: !!form.approvalStatus }
                    console.log(payload);
                    setState({ msg: '正在添加学生...', err: '' })
                    const ret = await api.POST("/checking/student", null, payload);
                    if (ret.code) { // fail
                        setState({ msg: '', err: ret.msg || `错误代码：3FM0#${ret.code}，请联系管理员` })
                        return ret
                    }
                    setState({ msg: '添加成功！', err: '' });
                    // 清内容
                    // [...e?.currentTarget?.querySelectorAll('input')].forEach(e => e.value = '')
                    // 清不了……刷新吧
                    location.href = location.href
                }}
                style={{
                    maxWidth: '30em',
                    width: '100%'
                }}>
                <Stack>
                    <TextField name='studentId' label='学号' />
                    <TextField name='name' label='姓名' />
                    <TextField name='college' label='学院' />
                    <TextField name='Major' label='专业' />
                    {/* <TextField name='identityNumber' label='身份证号' pattern='^([0-9]){7,18}(x|X)?$' /> */}
                    <TextField name='identityNumber' label='身份证号' />
                    <br></br>
                    <br></br>
                    <Checkbox name='approvalStatus' label='允许返校' />
                </Stack>
                {state.msg && <MessageBar messageBarType={MessageBarType.info}>{state.msg}</MessageBar>}
                {state.err && <MessageBar messageBarType={MessageBarType.error}>{state.err}</MessageBar>}
                <Stack>
                    <PrimaryButton type='submit'>添加</PrimaryButton>
                </Stack>
            </form>
        </Stack>
    )
}

import { cfg, api } from '../../api';
import { IUserData } from '../account';

// api.

// API
// 
// 表格功能：过滤、排序、分页、


interface IStudentQuery {
    // | 参数  | 类型   | 必填 | 释义             | 合法值 |
    // | ----- | ------ | ---- | ---------------- | ------ |
    // | q     | string | 否   | 模糊查询学生姓名 |        |
    // | index | int    | 否   | 页号             | 大于0  |
    // | count | int    | 否   | 单页条目数       | 0~50   |
    q?: string,
    index?: number,
    count?: number,
}
// 操作资源
interface APIResultStudent { code, msg?, data?: IDetailsListItem }
interface APIResultStudentList { code, msg?, data?: { count: number, students: IDetailsListItem[] } }
const checkingStudent = {
    // GET /checking/student?q=测试姓名
    find: (search: { q?: string, index?: number, count?: number }): Promise<APIResultStudentList> =>
        api.GET('/checking/student', search),
    // GET /checking/student/1610200302
    findOne: ({ studentId }): Promise<APIResultStudent> =>
        api.GET(`/checking/student/${studentId}`),
    // POST /checking/student
    insertOne: (document: IDetailsListItem) =>
        api.POST('/checking/student', null, document),
    // PATCH /checking/student/1610200212
    updateOne: ({ studentId }, document): Promise<APIResultStudent> =>
        api.PATCH(`/checking/student/${studentId}`, null, document),
    // DELETE /checking/student/1000000001
    delete: ({ studentId }) =>
        api.DELETE(`/checking/student/${studentId}`),
}

// {checking:{student:{studentId,name,college,major,identityNumber,approvalStatus}}}
// 请求逻辑：
// 请求错误：显示错误信息
// 请求成功：更新表格

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


// isSorted: true,
// isSortedDescending: false,
// sortAscendingAriaLabel: 'Sorted A to Z',
// sortDescendingAriaLabel: 'Sorted Z to A',


const studentKeys = [
    ['studentId', '学号'],
    ['name', '姓名'],
    ['college', '学院'],
    ['major', '专业'],
    ['identityNumber', '身份证号'],
    ['approvalStatus', '返校状态'],
]

export class CheckingPage extends React.Component<{}, IDetailsListCheckingState> {
    private _selection: Selection;
    private _allItems: IDetailsListItem[];
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
                key: 'approvalStatus_str', name: '审核状态', fieldName: 'approvalStatus_str',
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
            pageIndex: 1, pageItemCount: 20,
        };
        if (!cfg._isValid) return;
        this.loadItems(this.state).then()
        // const userData = cfg.get('userData') as IUserData
        // userData.
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

    private refreshItems(state) {
        const { searchByFuzzy, searchByCollege } = state
        let items = this._allItems
        if (searchByFuzzy) (items = items.filter(i =>
            searchByFuzzy.split(' ').filter(searchKeyWord =>
                (i.name + '|' + i.studentId + '|' + i.major + '|' + i.identity_number)
                    .toLowerCase().indexOf(searchKeyWord) !== -1
            ).length
        ))
        this.setState({ ...state, items, searchByFuzzy, searchByCollege })
    }

    private loadItems = async (state: {
        // searchByFuzzy?: string, searchByCollege?: string
        searchByFuzzy?: string, searchByCollege?: string
        pageCount?: number, pageIndex?: number, pageItemCount?: number,
    }) => {
        if (!cfg._isValid) return;
        const { pageIndex, pageItemCount } = state
        const { searchByFuzzy, searchByCollege } = state
        const { code, data, msg } = await checkingStudent.find({
            ...searchByFuzzy ? { q: searchByFuzzy } : {},
            index: pageIndex,
            count: pageItemCount
        })
        // const { code, data, msg } = await api.GET('/checking/student' + (searchByFuzzy && ('?q=' + searchByFuzzy) || ''))
        if (code) {
            this.setState({ err: msg })
            return false; // fail
        }
        console.log(357, data);

        // cfg.supply('checkingStudentList', data.students)
        // const cache = cfg.get('checkingStudentList')
        // console.log(174, cache.length, cache);
        const { count, students } = data

        const checkingStudents = students
        // const {approvedAdmin, approvedTime, college, identity_number, major, name, studentId, uid,} = 
        this._allItems = checkingStudents.map(parseStudentInfoToItem)
        // let items = this._allItems
        // if (searchByCollege) (items = items.filter(i => i.college.toLowerCase().indexOf(searchByCollege) > -1))
        // if (searchByFuzzy) (items = items.filter(i => i.name.toLowerCase().indexOf(searchByFuzzy) > -1))
        // this.setState({ items, searchByFuzzy, searchByCollege, pageCount: Math.ceil(count / pageItemCount) })
        const pageCount = Math.ceil(count / pageItemCount)
        console.log(372, count, pageCount, Math.ceil(count / pageItemCount));

        this.refreshItems({ ...state, pageCount })
    }
    private _goPage = async (newPageIndex: number) => {
        const { pageCount, ...state } = this.state
        newPageIndex = Math.max(1, newPageIndex)
        newPageIndex = pageCount ? Math.min(newPageIndex, pageCount) : newPageIndex
        this.loadItems({ ...state, pageCount, pageIndex: newPageIndex })
    }
    private _goPrevPage = async () => {
        this._goPage(this.state.pageIndex - 1)
    }
    private _goNextPage = async () => {
        this._goPage(this.state.pageIndex + 1)
    }
    private _getSelectionDetails(): string {
        const selectionCount = this._selection.getSelectedCount();
        this.setState({ selectionCount })
        switch (selectionCount) {
            case 0:
                return '未选择学生';
            case 1:
                return '选择了: ' + (this._selection.getSelection()[0] as IDetailsListItem).name;
            default:
                return `选择了 ${selectionCount} 个学生`;
        }
    }

    private _onClickDeleteStudent = async () => {
        const resourceName = `学生`
        const selItemList = this._selection.getSelection() as IDetailsListItem[]
        if (!selItemList.length) {
            alert(`未选择${resourceName}`)
            return;
        }
        if (!window.confirm(`是否确定删除以下${selItemList.length}个${resourceName}？\n名单：${selItemList.map(({ name }) => name).join('、')}`))
            return
        let flagError = false;
        await Promise.all(selItemList.map(async ({ studentId }: { studentId: string }) => {
            const { code, data } = await checkingStudent.delete({ studentId })
            if (code > 0) { if (flagError) return false; flagError = true; alert(`操作出错: 错误代码 ${code}，请联系管理员`); /*continue;*/; return false; }
            if (code < 0) { if (flagError) return false; flagError = true; alert(`网络错误: 错误代码 ${code}，请检查网络连接`); /*break;*/; return false; }
            console.log('deleted student data', data);
            // this._allItems = this._allItems
            //     .filter(student => (student.studentId != studentId))
        }))
        //     // refresh
        this.loadItems(this.state)
    }
    private _patchSeletion = async (document: object) => {
        const students = this._selection.getSelection() as IDetailsListItem[]
        if (!students.length) {
            alert('未选择学生')
            return;
        }
        await Promise.all(students.map(async (student: { studentId: string }) => {
            const { code, data, msg } = await checkingStudent.updateOne(student, document)
            if (code > 0) { alert(`操作出错，请联系管理员：错误代码 ${code} - ${msg}`); /*continue;*/; return; }
            if (code < 0) { alert(`网络错误: 错误代码 ${code}，请检查网络连接`); /*break;*/; return; }
            // replace this student with new info
            const studentToReplace = parseStudentInfoToItem(data)
            this._allItems = this._allItems
                .map(student =>
                    (student.studentId != studentToReplace.studentId)
                        ? student : studentToReplace)
            // refresh
            this.refreshItems(this.state)
        }))

    }
    private _onClickCheckingAllow = async () => {
        this._patchSeletion({ approvalStatus: true })
    }
    private _onClickCheckingBlock = async () => {
        this._patchSeletion({ approvalStatus: false })
    }
    // private _onFilter = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    private _onFilter = (searchByFuzzy: string): void => {
        // this.refreshItems(this.state)
        this.loadItems({ ...this.state, searchByFuzzy })
    };

    // private _onFilterByCollege = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    private _onFilterByCollege = (searchByCollege: string): void => {
        this.loadItems({ ...this.state, searchByCollege })
    };
    private _onItemInvoked = (item: IDetailsListItem): void => {
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
        items: IDetailsListItem[],
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
            // } else
            // if (column.key === 'name') {
            //     column.onRender = (item: IDetailsListItem) => <Link data-selection-invoke={true}>{item.name}</Link>;
            // }
            // else if (column.key === 'key') {
            //     column.columnActionsMode = ColumnActionsMode.disabled;
            //     column.onRender = (item: IDetailsListItem) => (
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
    private _getContextualMenuProps(ev: React.MouseEvent<HTMLElement>, column: IColumn): IContextualMenuProps {
        const items = [
            {
                key: 'aToZ',
                name: '顺序排列',
                iconProps: { iconName: 'SortUp' },
                canCheck: true,
                checked: column.isSorted && !column.isSortedDescending,
                onClick: () => this._onSortColumn(column.key, false),
            },
            {
                key: 'zToA',
                name: '倒序排列',
                iconProps: { iconName: 'SortDown' },
                canCheck: true,
                checked: column.isSorted && column.isSortedDescending,
                onClick: () => this._onSortColumn(column.key, true),
            },
        ];
        // if (isGroupable(column.key)) {
        //     items.push({
        //         key: 'groupBy',
        //         name: 'Group by ' + column.name,
        //         iconProps: { iconName: 'GroupedDescending' },
        //         canCheck: true,
        //         checked: column.isGrouped,
        //         onClick: () => this._onGroupByColumn(column),
        //     });
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

    private _commands_items: ICommandBarItemProps[] = [
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
    private _commands_farItems: ICommandBarItemProps[] = [
        {
            key: 'checkingStudentAdd',
            text: '十 添加学生',
            // iconProps: { iconName: 'Upload' },
            // href: 'https://developer.microsoft.com/en-us/fluentui',
            onClick: this._toggleCheckingStudentAddDialog,
        },
    ]
    private _commands_overflowItems: ICommandBarItemProps[] = [
        {
            key: 'checkingStudentAdd',
            text: '一 删除学生',
            // iconProps: { iconName: 'Upload' },
            // href: 'https://developer.microsoft.com/en-us/fluentui',
            onClick: () => (this._onClickDeleteStudent(), null),
        },
    ]
    public render(): JSX.Element {
        const { items, selectionDetails, selectionCount,
            pageCount, pageIndex, pageItemCount,
            msg, err,
        } = this.state;
        return (
            <Layout fullscreen={true}>
                <main>
                    <Stack horizontalAlign='center' style={{ padding: '1em', fontSize: '1.5em' }}>
                        返校审批 - 上应小风筝
                    </Stack>
                    <Stack horizontalAlign='center' verticalAlign='center' style={{ padding: '1em' }}>
                        <Stack>查找：</Stack>
                        <Stack horizontal>
                            <TextField
                                className={checkingChildClass}
                                label="按姓名、学号、学院模糊查找："
                                placeholder="查找姓名、学号、学院"
                                onChange={(_, newText) => this._onFilter(newText)}
                                styles={textFieldStyles}
                            />
                        </Stack>
                        <Stack>当前{selectionDetails}</Stack>
                        {msg && <MessageBar
                            onDismiss={() => this.setState({ msg: '' })}
                            messageBarType={MessageBarType.info}
                        >{msg}</MessageBar>}
                        {err && <MessageBar
                            onDismiss={() => this.setState({ err: '' })}
                            messageBarType={MessageBarType.error}
                        >{err}</MessageBar>}
                    </Stack>

                    <CommandBar
                        items={this._commands_items}
                        farItems={this._commands_farItems}
                        overflowItems={this._commands_overflowItems}
                    // ariaLabel="Use left and right arrow keys to navigate between commands"
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
                            // ariaLabelForSelectionColumn="Toggle selection"
                            // ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                            // checkButtonAriaLabel="Row checkbox"
                            onItemInvoked={this._onItemInvoked}
                        />
                    </MarqueeSelection>
                    {/* TODO: 加載分頁 */}
                    {pageCount
                        ?
                        <Stack horizontalAlign='center' verticalAlign='center' style={{ padding: '1em' }}>
                            <Button onClick={this._goPrevPage}> 上一页 </Button>
                            <Stack> 当前第{pageIndex}页，共{pageCount}页 </Stack>
                            <Button onClick={this._goNextPage}> 下一页 </Button>
                        </Stack>
                        : undefined
                    }
                    <Separator> 上应小风筝 </Separator>
                </main>
            </Layout>
        );
    }
}

function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
    const key = columnKey as keyof T;
    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}
export default CheckingPage
