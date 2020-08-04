import * as React from 'react';
import Layout from "../../components/layout"
import { Nav, INavStyles, INavLinkGroup } from 'office-ui-fabric-react/lib/Nav';
import { api, checkLoginAndRedirectIfNeeded } from '../../api';
import { Panel, Stack, TextField, Button, Toggle, Checkbox, PrimaryButton, MessageBar, MessageBarType } from 'office-ui-fabric-react';

export const CheckingAddStudent: React.FunctionComponent = function (props) {
    const [state, setState] = React.useState({ msg: '', err: '' })
    return (
        <Stack horizontalAlign="center">
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const form = Object.fromEntries(new FormData(e.currentTarget).entries())
                    const payload = { ...form, approvalStatus: !!form.approvalStatus }
                    console.log(payload);
                    setState({ msg: '正在添加学生...', err: '' })
                    const ret = await api.post("/checking/student", payload);
                    if (ret.code) { // fail
                        setState({ msg: '', err: ret.msg || ret.code || '' })
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
                {state.msg ? <MessageBar messageBarType={MessageBarType.info}>{state.msg}</MessageBar> : undefined}
                {state.err ? <MessageBar messageBarType={MessageBarType.error}>{state.err}</MessageBar> : undefined}
                <Stack>
                    <PrimaryButton type='submit'>添加</PrimaryButton>
                </Stack>
            </form>
        </Stack>
    )
}
const App = () => {
    // checkLoginAndRedirectIfNeeded().then()
    return <Layout>
        <CheckingAddStudent />
    </Layout>
}
export default App
