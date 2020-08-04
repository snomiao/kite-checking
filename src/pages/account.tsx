import * as React from 'react';
import Layout from "../components/layout"
import { Stack, Text, Link, FontWeights, TextField, PrimaryButton, Button, List } from "office-ui-fabric-react"
import { cfg, loginAndRedirect } from "../api"
// import { Stack, Text, Link, FontWeights } from "office-ui-fabric-react"
// import "./index.css"
// const boldStyle = { root: { fontWeight: FontWeights.semibold } }
const KeyValueTable = (obj) => {
    return (<table>
        {Object.entries(obj || {}).map(([k, v]) => {
            return <tr key={k}><td>{k}</td><td>{v}</td></tr>
        })}
    </table>)
}
export interface ILoginState {
    accountInfo?
}

class AccountPage extends React.Component<{}, ILoginState> {
    constructor(props) {
        super(props);
        this.state = {}
        if (typeof window === 'undefined')
            return;

        const userData = cfg.get('userData')
        if (!userData) {
            cfg.set('token', null)
            return;
            // and need login
        }
        const { uid, nick_name, avatar, is_admin, country, province, city, language, createTime } = cfg.get('userData')
        const accountInfo = {
            用户ID: uid, 昵称: nick_name, 注册时间: new Date(createTime).toLocaleDateString()
        }
        this.state = { accountInfo }
    }
    render() {
        const { accountInfo } = this.state
        return (
            <Layout title="账号信息">
                <h2>账号信息</h2>
                <br></br>
                {KeyValueTable(accountInfo)}
                <br></br>
                {/* <PrimaryButton>
                    
                </PrimaryButton> */}
                <Stack horizontalAlign='center' >
                    <Button
                        onClick={() => {
                            cfg.set('token', null)
                            location.href = '/'
                        }}
                    >退出登录</Button>
                </Stack>
                <br></br>
                <br></br>
            </Layout >
        )
    }
}
export default AccountPage
