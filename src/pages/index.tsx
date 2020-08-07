import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import { Separator, Stack, Text, Link, FontWeights } from "office-ui-fabric-react"
import Img from "gatsby-image"
import "./index.css"
import { cfg } from "../api"

const App: React.FunctionComponent<{children?: React.ReactNode, data: object}> = (props , context?:any) => {
  // const App = (props) => {
  // const srcLogo = props?.data?.file?.childImageSharp?.fluid?.src || ''
  const logined = (cfg._isValid() && cfg.get('token'))
  return (<Layout logined={logined}>
      <Separator> 上应小风筝 </Separator>
      <br></br>
      <div style={{ textAlign: 'center' }}>
        <img
          src='/logos/kite.png'
          alt="logo"
        />
      </div>
      <br></br>
      <Separator> 上应小风筝 v2 </Separator>
    </Layout>
  ) as React.ReactElement
}

// export const query = graphql`query MyQuery {
// 	file (relativePath:{eq:"kite.png"}){
//     childImageSharp {
//       fluid(jpegProgressive: true, quality: 10, jpegQuality: 10) {
//         srcWebp
//         src
//         originalImg
//       }
//     }
//   }
// }`

export default App
