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
    Stack,
    Dialog,
    ChoiceGroup,
    PrimaryButton, MessageBar, MessageBarType, ChoiceGroupOption, IChoiceGroupOption
} from "office-ui-fabric-react"
import Layout from "../../components/layout"

import { api } from '../../api';

// import { CheckingAddAdmin } from './addAdmin';
const adminLevels = { 1: '辅导员', 2: '学院管理者', 3: '学生处管理者' }
export const CheckingAddAdmin: React.FunctionComponent = function (props) {
    const [state, setState] = React.useState({} as { msg?, err?}) // 
    return (
        <Stack horizontalAlign="center">
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const form = Object.fromEntries(new FormData(e.currentTarget).entries())
                    const payload = { ...form }
                    console.log(payload);
                    setState({ msg: '正在添加...', err: '' })
                    const ret = await api.POST("/checking/admin", null, payload);
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
                    <TextField name='department' label='部门' />
                    <TextField name='job_id' label='工号' />
                    <TextField name='name' label='姓名' />
                    <br></br>
                    <br></br>
                    <ChoiceGroup name='role' label='角色' required={true}
                        options={Object.entries(adminLevels).map(([key, text]): IChoiceGroupOption => ({ key, text }))} />

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

export interface IDetailsListItem {
    department?: string
    jobId?: string
    name?: string
    role?: number
    role_show?: string
}

const parseAdminInfoToItem = (adminInfo): IDetailsListItem => {
    const { role } = adminInfo;
    return {
        ...adminInfo,
        role_show: (adminLevels[role] || ('等级' + role) || '未知管理等级'),
    }
}

// 操作资源
interface APIResultAdmin { code, msg?, data?: IDetailsListItem }
interface APIResultAdminList { code, msg?, data?: { count: number, students: IDetailsListItem[] } }
const checkingAdmin = {
    // GET /checking/student?q=测试姓名
    // find: (search: { q?: string, index?: number, count?: number }): Promise<APIResultAdminList> =>
    find: (search: {}): Promise<APIResultAdminList> =>
        api.GET('/checking/admin', { search }),
    // GET /checking/admin/1610200302
    findOne: ({ jobId }): Promise<APIResultAdmin> =>
        api.GET(`/checking/admin/${jobId}`),
    // POST /checking/admin
    insertOne: (document: IDetailsListItem) =>
        api.POST('/checking/admin', null, document),
    // PATCH /checking/admin/1610200212
    updateOne: ({ jobId }, document): Promise<APIResultAdmin> =>
        api.PATCH(`/checking/admin/${jobId}`, null, document),
    // DELETE /checking/admin/1000000001
    delete: ({ jobId }) =>
        api.DELETE(`/checking/admin/${jobId}`),
}

export interface IDetailsListBasicExampleState {
    sortedColumnKey?: string;
    selectionCount?: number;
    contextualMenuProps?: IContextualMenuProps;
    items: IDetailsListItem[];
    selectionDetails: string;
    isSortedDescending?: boolean;
    columns: IColumn[];

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
    showAddAdminDialog?: boolean
}

// isSorted: true,
// isSortedDescending: false,
// sortAscendingAriaLabel: 'Sorted A to Z',
// sortDescendingAriaLabel: 'Sorted Z to A',


export class DetailsListBasicExample extends React.Component<{}, IDetailsListBasicExampleState> {
    private _selection: Selection;
    private _allItems: IDetailsListItem[];
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
            ['jobId', '工号',],
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
            this.loadCheckings(this.state).then()
        }
    }

    private refreshItems(state) {
        const { searchByFuzzy } = state
        let items = this._allItems
        if (searchByFuzzy) (items = items.filter(i =>
            searchByFuzzy.split(' ').filter(searchKeyWord =>
                (i.name + '|' + i.jobId + '|' + i.department + '|' + i.name)
                    .toLowerCase().indexOf(searchKeyWord) !== -1
            ).length
        ))
        this.setState({ ...state, items, searchByFuzzy })
    }
    async loadCheckings(state) {
        const { code, data } = await api.GET('/checking/admin')
        if (code) {
            // this.state
            return;
        }
        console.log(data);

        // const {approvedAdmin, approvedTime, college, identity_number, major, name, studentId, uid,} = 
        this._allItems = data.map(parseAdminInfoToItem)
        this.refreshItems(this.state)
    }


    private _getSelectionDetails(): string {
        const selectionCount = this._selection.getSelectedCount();
        this.setState({ selectionCount })
        switch (selectionCount) {
            case 0:
                return `未选择管理员`;
            case 1:
                return `选择了: ` + (this._selection.getSelection()[0] as IDetailsListItem).name;
            default:
                return `选择了 ${selectionCount} 个管理员`;
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

    private _onItemInvoked = (item: IDetailsListItem): void => {
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

    private _toggleCheckingAddAdminDialog = () => {
        this.setState({ showAddAdminDialog: !this.state.showAddAdminDialog })
    }
    private _onClickDeleteAdmin = async () => {
        const resourceName = `管理员`
        const selItemList = this._selection.getSelection() as IDetailsListItem[]
        if (!selItemList.length) {
            alert('未选择${resourceName}')
            return;
        }
        if (!window.confirm(`是否确定删除以下${selItemList.length}个${resourceName}？\n名单：${selItemList.map(({ name }) => name).join('、')}`))
            return
        let flagError = false;

        selItemList.forEach(async ({ jobId }: { jobId: string }) => {
            const { code, data } = await checkingAdmin.delete({ jobId })
            if (code > 0) { if (flagError) return false; flagError = true; alert(`操作出错: 错误代码 ${code}，请联系管理员`); /*continue;*/; return false; }
            if (code < 0) { if (flagError) return false; flagError = true; alert(`网络错误: 错误代码 ${code}，请检查网络连接`); /*break;*/; return false; }
            // replace this item with new info
            console.log('deleted admin data', data);

        })
        //     // refresh
        this.loadCheckings(this.state)
    }


    private _commands_items: ICommandBarItemProps[] = [
    ]
    private _commands_farItems: ICommandBarItemProps[] = [
        // {
        //     key: 'checkingAdminAdd',
        //     text: '十 添加管理员',
        //     onClick: this._toggleCheckingAddAdminDialog,
        // },
    ]
    private _commands_overflowItems: ICommandBarItemProps[] = [
        // {
        //     key: 'deleteAdmin',
        //     text: '一 删除管理员',
        //     onClick: () => (this._onClickDeleteAdmin(), null),
        // },
    ]
    public render(): JSX.Element {
        const { items, selectionDetails } = this.state;
        return (
            <Layout fullscreen={true}><main>
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
                    items={this._commands_items}
                    farItems={this._commands_farItems}
                    overflowItems={this._commands_overflowItems}
                    ariaLabel="Use left and right arrow keys to navigate between commands"
                />
                <Dialog
                    hidden={!this.state.showAddAdminDialog}
                    onDismiss={this._toggleCheckingAddAdminDialog}
                >
                    <CheckingAddAdmin />
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
            </main></Layout>
        );
    }


}
function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
    const key = columnKey as keyof T;
    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}

export default DetailsListBasicExample
