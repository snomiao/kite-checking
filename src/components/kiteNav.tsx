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

        backgroundColor: `#FFFFFFAA`,

        // backgroundBlendMode: 'blur',
    }
};

const navLinkNeedLogin: INavLinkGroup[] = ([
    {
        name: '上应小风筝 · 管理系统',
        links: [
            { key: 'index', name: '首页', url: '/', }
        ]
    },
    {
        name: '个人',
        links: [
            {
                key: 'login', name: '登录', url: '/login',
                // onClick: () => (location.href = '/login', null)
            },
        ],
    }
])
const navLinkLogined: INavLinkGroup[] = ([
    {
        name: '上应小风筝 · 管理系统',
        links: [
            { key: 'index', name: '首页', url: '/', }
        ]
    },
    {
        name: '返校管理',
        links: [
            {
                key: 'Checking', name: '返校审批', url: '/checking/student',
                // onClick: () => (location.href = '/checking/student', null)
            },
            // { key: 'CheckingAdd', name: '添加返校学生', url: '/checking/add', },
            { key: 'CollegeAdmin', name: '审批者管理', url: '/checking/admin', },
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

export const KiteNav: React.FunctionComponent<{ logined?}> = (props) => {
    const logined = props.logined ?? !!(cfg._isValid() && cfg.get('token'))
    const [state, setState] = React.useState({ logined } as { logined?:boolean})
    setTimeout(() => {
        const logined = props.logined ?? !!(cfg._isValid() && cfg.get('token'))
        setState({ logined })
    }, 0)
    // const ret = <>
    //     <div hidden={!logined}><Nav styles={navStyles} groups={navLinkLogined} /></div>
    //     <div hidden={logined}><Nav styles={navStyles} groups={navLinkNeedLogin} /></div>
    // </>
    // const ret =
    // console.log('logined', logined, ret);
    return <>
        <Nav styles={navStyles} groups={!state.logined ? navLinkNeedLogin : navLinkLogined} />
    </>
};

export default KiteNav