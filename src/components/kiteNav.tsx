import * as React from 'react';
import { Nav, INavStyles, INavLinkGroup } from 'office-ui-fabric-react/lib/Nav';
import { cfg } from '../api';
import { HighContrastSelectorWhite } from 'office-ui-fabric-react';

const navStyles: Partial<INavStyles> = {
    root: {
        // width: 280,
        maxWidth: 280,

        maxHeight: '100vh',
        overflowY: 'auto',
        minHeight: `100vh`,

        minWidth: `8rem`,
        // width: `calc(10vw + 5em)`,
        width: `calc(20vw - 5em)`,

        backgroundColor: `#FFFFFFEF`,

        // backgroundBlendMode: 'blur',
    }
};

const navLinkGroups: INavLinkGroup[] = ([
    {
        name: '上应小风筝 · 管理系统',
        links: [
            { key: 'index', name: '首页', url: '/', }
        ]
    }
]).concat(
    !((typeof window !== 'undefined') && cfg.get('token'))
        ? [
            {
                name: '个人',
                links: [
                    { key: 'login', name: '登录', url: '/login', },
                ],
            },
        ]
        : [{
            name: '返校管理',
            links: [
                { key: 'Checking', name: '返校审批', url: '/checking', },
                // { key: 'CheckingAdd', name: '添加返校学生', url: '/checking/add', },
                { key: 'CollegeAdmin', name: '审批者管理', url: '/college_admin', },
            ],
        },
        {
            name: '个人',
            links: [
                { key: 'account', name: '账号', url: '/account', },
                // { key: 'logout', url: '/logout', name: '退出登录', },
            ],
        },]
)

export const KiteNav: React.FunctionComponent = () => {
    return (
        <Nav styles={navStyles} groups={navLinkGroups} />
    );
};

export default KiteNav