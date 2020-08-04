import * as React from 'react';
import Layout from "../components/layout"
import { Stack, Text, Link, FontWeights, TextField, PrimaryButton, Button, List, MessageBar, MessageBarType } from "office-ui-fabric-react"
import { cfg, loginAndRedirect } from "../api"

export interface ILoginState {
    msg?: string
    err?: string
}

class LoginPage extends React.Component<{}, ILoginState> {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <Layout title="登录">
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const { username, password } = Object.fromEntries(new FormData(e.currentTarget).entries())
                    this.setState({ msg: '登录中' })
                    const { msg, err } = await loginAndRedirect(username.toString(), password.toString())
                    this.setState({ msg, err })
                }}>
                    <TextField name="username" label="账号"
                        // errorMessage={this.state.校验错误?.账号?.join('，')}
                        placeholder="用户名/学号/工号" />
                    <TextField name="password" type="password" label="密码"
                        // errorMessage={this.state.校验错误?.密码?.join('，')}
                        placeholder="密码" />
                    {this.state.msg ? <MessageBar messageBarType={MessageBarType.info}>{this.state.msg}</MessageBar> : undefined}
                    {this.state.err ? <MessageBar messageBarType={MessageBarType.error}>{this.state.err}</MessageBar> : undefined}
                    <div>
                        <br></br>
                        <PrimaryButton type="submit" text="登录" />
                    </div>
                </form>
            </Layout>
        )
    }
}
export default LoginPage
