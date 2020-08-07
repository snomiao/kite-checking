import * as React from "react"
import Layout from "../components/layout"
import { Stack, Text, Link, FontWeights, TextField, PrimaryButton, Button, List } from "office-ui-fabric-react"
import { cfg, logoutAndRedirect } from "../api"
const KeyValueTable = (obj) => {
    return (<table>
        {Object.entries(obj || {}).map(([k, v]) => {
            return <tr key={k}><td>{k}</td><td>{v}</td></tr>
        })}
    </table>)
}
class Logout extends React.Component<{}, { msg, err }> {
    constructor(props) {
        super(props);
        if (typeof window !== 'undefined') {
            // logoutAndRedirect()
            location.href = '/'
            cfg.set('token', null)
        }
    }
    render() {
        return (
            <Layout title="登录" dontCheckLogin={true}><main>
                <span>正在登出...</span>
            </main></Layout>
        )
    }
}
export default Logout
