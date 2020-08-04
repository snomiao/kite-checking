import * as React from "react"
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
initializeIcons(/* optional base url */);

// import BackgroundImage from 'gatsby-background-image'

import {
    Pivot, PivotItem, Label, Stack, IStyleSet, ILabelStyles,
    Text, Link, FontWeights, TextField, Nav
} from "office-ui-fabric-react"
import './layout.css'
import { checkLoginAndRedirectIfNeeded } from '../api'
import KiteNav from "./kiteNav";

const labelStyles: Partial<IStyleSet<ILabelStyles>> = {
    root: { marginTop: 10 },

};
const bgList = `
/hezii/hezii (5).jpg
/hezii/hezii (6).jpg
/hezii/hezii (1).jpg
/yiban/_DSC2412.JPG
/yiban/_DSC2411.JPG
/yiban/_DSC2410.JPG
/yiban/_DSC2409.JPG
/yiban/_DSC2407.JPG
/yiban/_DSC2408.JPG
/yiban/_DSC2406.JPG
/yiban/_DSC2405.JPG
/yiban/_DSC2404.JPG
/yiban/_DSC2403.JPG
/yiban/_DSC2400.JPG
/yiban/_DSC2402.JPG
/yiban/_DSC2401.JPG
/yiban/_DSC2398.JPG
/yiban/_DSC2399.JPG
/yiban/_DSC2397.JPG
/yiban/_DSC2394.JPG
/yiban/_DSC2395.JPG
/yiban/_DSC2396.JPG
/yiban/_DSC2393.JPG
/yiban/_DSC2390.JPG
/yiban/_DSC2389.JPG
/yiban/_DSC2392.JPG
/yiban/_DSC2391.JPG
/yiban/_DSC2387.JPG
/yiban/IMG_3815.JPG
/yiban/IMG_3816.JPG
/yiban/_DSC2386.JPG
/yiban/IMG_3813.JPG
/yiban/IMG_3814.JPG
/hezii/hezii (4).jpg
/hezii/DSC_0719.JPG
/hezii/DSC_0568.jpg
/hezii/hezii (2).jpg
/hezii/hezii (3).jpg
/maps/map2019.jpg
/maps/map2018.jpg
/maps/maps_by_chem.jpg
/maps/map2017.png
/sit/25.jpg
/sit/24.jpg
/sit/23.jpg
/sit/21.jpg
/sit/22.jpg
/sit/18.jpg
/sit/17.jpg
/sit/16.jpg
/sit/15.jpg
/sit/14.jpg
/sit/13.jpg
/sit/12.jpg
/sit/11.jpg
`.trim().split(/\r?\n/)

class App extends React.Component<{ title?, dontCheckLogin?}, { interval?, bgUrl?}> {
    constructor(props) {
        super(props);
        // const interval = setInterval(this.updateBackground, 600e3)
        if (typeof window !== 'undefined' && !props?.dontCheckLogin) {
            // this.updateBackground()
            checkLoginAndRedirectIfNeeded().then()
        }
        this.state = {  };
    }
    // componentWillUnmount() {
    //     clearInterval(this.state.interval);
    // }
    // updateBackground = () => {
    //     const bgIndex = (+new Date() / 600e3 | 0) % bgList.length   // 5min ??
    //     const bgUrl = bgList[bgIndex];

    //     console.log(bgIndex, bgUrl);
    //     this.setState({ bgUrl })
    // }
    render() {
        const { bgUrl } = this.state
        const { title } = this.props
        return (
            // <BackgroundImage >
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
                <KiteNav />
                <Stack
                    horizontalAlign="center"
                    // verticalAlign="center"
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
                        verticalFill
                        styles={{
                            root: {
                                // maxWidth: "90em",
                                // 还是不限了

                                width: '100%',
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
                        <main>{this.props.children}</main>
                    </Stack>
                </Stack>
            </Stack >
        )
    }
}
export default App
