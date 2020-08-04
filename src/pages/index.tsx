import * as React from "react"
// import { graphql } from "gatsby"
import Layout from "../components/layout"
import { Separator, Stack, Text, Link, FontWeights } from "office-ui-fabric-react"
import Img from "gatsby-image"
import "./index.css"

// const boldStyle = { root: { fontWeight: FontWeights.semibold } }

// const App = ({ data }) => {
  const App = ({ }) => {
  // checkLoginAndRedirectIfNeeded().then()
  return (
    <Layout>
      <Separator> 上应小风筝 </Separator>
      <br></br>
      <div style={{ textAlign: 'center' }}>
         <img
          // src={data.file.fixed.base64}
          src='/logos/kite.png'
          alt="logo"
        />
      </div>
      <br></br>
      <Separator> 上应小风筝 </Separator>
    </Layout>
  )
}

// export const query = graphql`
//   query {
//     file(relativePath: { eq: "kite.png" }) {
//       childImageSharp {
//         fixed(width: 125, height: 125) {
//           ...GatsbyImageSharpFixed
//         }
//       }
//     }
//   }
// `

// export const query = graphql`
//   query {
//     file(relativePath: {eq: "kite.png"}) {
//       childImageSharp {
//         fixed {
//           tracedSVG
//         }
//       }
//     }
//   }
// `

export default App
