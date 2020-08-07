import * as React from 'react';
import Layout from "../components/layout"
import { Stack, Text, Link, FontWeights, TextField, PrimaryButton, Button, List } from "office-ui-fabric-react"
import { cfg } from "../api"
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
export interface IUserData {
    uid?: string
    nick_name?: string
    avatar?: string
    is_admin?: number
    country?: string
    province?: string
    city?: string
    language?: string
    createTime?: string
}

class AccountPage extends React.Component<{}, ILoginState> {
    constructor(props) {
        super(props);
        this.state = {}
        if (!cfg._isValid()) return;
        const userData = cfg.get('userData') as IUserData
        if (!userData) {
            cfg.set('token', null)
            return;
            // and need login
        }
        const { uid, nick_name, createTime } = userData
        const accountInfo = {
            用户ID: uid, 昵称: nick_name, 注册时间: new Date((createTime + 'Z').replace('ZZ', 'Z')).toLocaleDateString()
        }
        this.state = { accountInfo }
    }
    render() {
        const { accountInfo } = this.state
        return (
            <Layout title="账号信息"><main>
                <Stack horizontalAlign='center' style={{ maxWidth: '30em', padding: '2em' }} >

                    <h2>账号信息</h2>
                    <br></br>
                    {KeyValueTable(accountInfo)}
                    <br></br>
                    {/* <PrimaryButton>
                    
                </PrimaryButton> */}
                    <Stack horizontalAlign='center' >
                        <PrimaryButton
                            onClick={() => {
                                cfg.set('token', null)
                                location.href = '/'
                            }}
                        >退出登录</PrimaryButton>
                    </Stack>
                    <br></br>
                    <br></br>
                </Stack>
            </main></Layout>
        )
    }
}
export default AccountPage
