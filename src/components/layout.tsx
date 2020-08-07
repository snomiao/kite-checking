import * as React from "react"
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
initializeIcons(/* optional base url */);

// import BackgroundImage from 'gatsby-background-image'

import {
    Pivot, PivotItem, Label, Stack, IStyleSet, ILabelStyles,
    Text, Link, FontWeights, TextField, Nav
} from "office-ui-fabric-react"
import './layout.css'
import { checkLoginAndRedirectIfNeeded, cfg } from '../api'
import KiteNav from "./kiteNav";
import { StaticQuery, graphql } from "gatsby";

const labelStyles: Partial<IStyleSet<ILabelStyles>> = {
    root: { marginTop: 10 },

};
// [前端关于获取网络时间的方法 api （直接获取时间戳）_cccyyy辰的博客-CSDN博客_js获取网络时间]( https://blog.csdn.net/weixin_44143512/article/details/98028856 )
// const bgList = data.allFile.nodes.map(e=>childImageSharp)
// 淘宝
// http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp
// 苏宁
// http://quan.suning.com/getSysTime.do
// QQ
// http://cgi.im.qq.com/cgi-bin/cgi_svrtime
// fetch('https://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp').then(
//      console.log
// ).catch(
//      console.error
// )

const staticQuery = graphql`
query {
    allFile(limit: 3, filter: {relativeDirectory: {regex: "/^background//"}}) {
        nodes{
            childImageSharp {
                fluid(
                    maxWidth: 800
                    maxHeight: 800
                    jpegQuality: 100
                    toFormat: JPG
                    ) {
                    src
                }
            }
        }
    }
}`

// const build_time = new Date().toISOString()

export const KiteBackgroundImage: React.FunctionComponent<{}> = ({ children }) => {
    // console.log('page_build_time', build_time)

    const [state, setState] = React.useState({} as { bgUrl?: string, timeout?: any });
    const interval = 86400e3
    const showBg = async (data) => {
        if (typeof window === 'undefined') return;
        const bgList = data.allFile.nodes.map(e => e.childImageSharp.fluid.srcWebp || e.childImageSharp.fluid.src || e.childImageSharp.fluid.originImg)
        const bgIndex = ((+new Date() / interval + 0.5) | 0) % bgList.length   // 5min ??
        const bgUrl = bgList[bgIndex];
        if (bgUrl != state.bgUrl) {
            console.log(+new Date(), (+new Date() / interval + 0.5) | 0, bgIndex, bgUrl);
            const timeout = setTimeout(() => showBg(data), interval - (+new Date() % interval)) // 对齐到下一秒的0毫秒触发
            setTimeout(() => setState({ bgUrl, timeout }), 0)
        }
        // <a href="https://time.is/China" id="time_is_link" rel="nofollow" style="font-size:36px">中国 での時間:</a>
        // <span id="China_z43d" style="font-size:36px"></span>
        // <script src="//widget.time.is/t.js"></script>
        // <script>
        // time_is_widget.init({China_z43d:{}});
        // </script>
    }
    React.useEffect(() => {
        return () => {
            state.timeout && clearTimeout(state.timeout)
        };
    }, []);
    return (
        <StaticQuery
            query={staticQuery}
            render={data => {
                // console.log(bgUrl)?
                data && showBg(data)

                return (
                    <div style={state.bgUrl && {
                        backgroundImage: `url(${state.bgUrl})`,
                        backgroundSize: `cover`,
                        backgroundPosition: `center`,
                    } || {}}>
                        {children}
                    </div>
                )
            }
            }
        />
    )
}
class App extends React.Component<{ title?, fullscreen?: boolean, logined?, dontCheckLogin?}, { interval?, bgUrl?}> {
    constructor(props) {
        super(props);
        // const interval = setInterval(this.updateBackground, 600e3)
        if (typeof window !== 'undefined' && !props?.dontCheckLogin) {
            // this.updateBackground()
            checkLoginAndRedirectIfNeeded().then()
        }
        this.state = {};
    }
    // componentWillUnmount() {
    //     clearInterval(this.state.interval);
    // }
    // updateBackground = () => {
    //     const bgIndex = (+new Date() / 600e3 | 0) % bgList.length   // 5min ??

    //     console.log(bgIndex, bgUrl);
    //     this.setState({ bgUrl })
    // }
    render() {
        const { bgUrl } = this.state
        const { title } = this.props
        return (
            <KiteBackgroundImage>
                <Stack
                    horizontal
                    className="App"
                    styles={{
                        root: {
                            // maxWidth: "960px",
                            maxHeight: '100vh',
                            maxWidth: '100vw',
                            // minWidth: 'calc(300px + 30em)',
                            overflow: 'hidden',
                            margin: "0 auto",
                            // textAlign: "center",
                            color: "#605e5c",
                            backgroundImage: bgUrl ? `url("images${encodeURI(bgUrl)}")` : '',
                            backgroundSize: `cover`,
                            backgroundPosition: `center`,
                            filter: `drop-shadow(1px 2px 3px rgba(0,0,0,0.3))`,
                        },
                    }}>
                    <title>{title && `${title} - ` || ''}上应小风筝</title>
                    <KiteNav logined={this.props.logined ?? (cfg._isValid() && cfg.get('token'))} />
                    <Stack
                        horizontalAlign="center"
                        verticalAlign="center"
                        verticalFill
                        styles={{
                            root: {
                                // minWidth: "50vw",
                                width: '100%',

                                height: '100vh',
                                // maxWidth: "100vw",
                                overflowX: "auto",
                                overflowY: "auto",
                                // minWidth: "30em",
                                margin: "0 auto",
                            },
                        }}
                    >
                        <Stack
                            // verticalFill
                            styles={{
                                root: {
                                    // maxWidth: "90em",
                                    maxWidth: "100%",
                                    ...this.props.fullscreen ? { width: '100%' } : {},
                                    // 还是不限了
                                    // width: '100%',
                                    // width: 'max-content',
                                    minWidth: "10em",
                                    overflowX: "auto",
                                    overflowY: "visible",
                                    maxHeight: '100vh',
                                    margin: "0 auto",
                                    color: "#605e5c",
                                    // backgroundColor: '#FFFFFFDD',
                                },
                            }}
                        >
                            {this.props.children}
                        </Stack>
                    </Stack>
                </Stack >
            </KiteBackgroundImage>
        )
    }
}
export default App
