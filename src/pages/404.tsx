import * as React from 'react';
import Layout from "../components/layout"
import { Stack, Text, Link, FontWeights, TextField, PrimaryButton, Button, List, MessageBar, MessageBarType } from "office-ui-fabric-react"
import { cfg, api } from "../api"

export interface ILoginState {
    msg?: string
    err?: string
}
const loginAndRedirect = async (account: string, credential) => {
    const ret = await api.POST("/session", null, { loginType: '1', account, credential })
    if (ret.code) { // fail
        return { msg: '', err: ret.msg || ('错误代码：' + ret.code) }
    }
    // set token
    const { token, data } = ret.data
    console.assert(token)
    console.assert(data)
    cfg.set('token', token)
    cfg.mix('userData', data)
    // go back
    const Search = Object.fromEntries(new URLSearchParams(location.search).entries())
    location.href = Search.referer || '/'
    return { msg: '登录成功， 正在进入系统……' }
}


class LoginPage extends React.Component<{}, ILoginState> {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <Layout title="404">
                <main>
                    你来到了……没有小风筝的荒原。
                </main>
            </Layout>
        )
    }
}
export default LoginPage
