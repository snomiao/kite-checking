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
        const logined = (cfg._isValid() && cfg.get('token'))
        if(logined){
            location.href = '/checking/student'
        }
    }
    render() {
        return (
            <Layout title="登录">
                <main>
                    <Stack horizontalAlign='center' style={{ maxWidth: '30em', padding: '2em' }} horizontal>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const { username, password } = Object.fromEntries(new FormData(e.currentTarget).entries())
                                this.setState({ msg: '登录中' })
                                const { msg, err } = await loginAndRedirect(username.toString(), password.toString())
                                this.setState({ msg, err })
                            }}>
                            <TextField name="username" label="账号"
                                // errorMessage={this.state.校验错误?.账号?.join('，')}
                                // style={{width: 'max-content'}}
                                placeholder="用户名/学号/工号" />
                            <TextField name="password" type="password" label="密码"
                                // errorMessage={this.state.校验错误?.密码?.join('，')}
                                // style={{width: 'max-content'}}
                                placeholder="密码" />
                            <div><br></br></div>
                            {this.state.err && <MessageBar messageBarType={MessageBarType.error}>{this.state.err}</MessageBar>}
                            <div><br></br></div>
                            {this.state.msg && <MessageBar messageBarType={MessageBarType.info}>{this.state.msg}</MessageBar>}
                            <div><br></br></div>
                            <PrimaryButton type="submit" text="登录" style={{ width: '100%' }} />
                        </form>
                    </Stack>
                </main>
            </Layout>
        )
    }
}
export default LoginPage
