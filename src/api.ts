
const mixin = require('mixin-deep');
// const res = mixin({ a: { foo: true } }, { a: { bar: true } }, { a: { baz: true } });

// console.log(res);


const cacheTimeKey = `cacheTime`
const convertToTable = (list, idKey: string) => Object.fromEntries(list.map(item => [item[idKey], item]))
const convertToArray = (table) => Object.entries(table).map(e => e[1])
const runningOnBrowser = typeof window !== 'undefined'
const cfg = {
    get: (k) => { try { return JSON.parse(localStorage?.getItem(k)) } catch (e) { console.error(e); return null } },
    set: (k, v) => { try { localStorage?.setItem(k, JSON.stringify(v)) } catch (e) { console.error(e); } },
    mix: (k, v: {}) => { try { cfg.set(k, mixin(cfg.get(k) || {}, v)) } catch (e) { cfg.set(k, v) } },
    supply: (k, v: { _id }[]) => { cfg.set(k, convertToArray({ ...(cfg.get(k) || []), ...convertToTable(v, '_id') })) },
    cache: (k: string, expireIn = 0, expiredCallback = async () => { return false }) => {
        // find cache check if it's dirt.
        const tNow = +new Date()
        const expireAt = cfg.get(cacheTimeKey)?.[k] || 0;
        if (tNow > expireAt) {
            expiredCallback()
                .then((succ) => succ && cfg.expire(k, +new Date() + expireIn)) // dont wait
        }
        return cfg.get(k)
    },
    expire: (k, tExpire) => cfg.mix(cacheTimeKey, { [k]: tExpire })
}
// const runningOnBrowser = typeof window !== 'undefined'
// const cfg = runningOnBrowser ? {
//     get: (k) => { try { return JSON.parse(localStorage?.getItem(k)) } catch (e) { console.error(e); return null } },
//     set: (k, v) => { try { localStorage?.setItem(k, JSON.stringify(v)) } catch (e) { console.error(e); } },
//     mix: (k, v: {}) => { try { cfg.set(k, mixin(cfg.get(k) || {}, v)) } catch (e) { cfg.set(k, v) } },
//     supply: (k, v: { _id }[]) => {
//         cfg.set(k, convertToArray({ ...cfg.get('checkingStudents'), ...convertToTable(v, '_id') }))
//     },
//     cache: (k: string, expireIn = 0, expiredCallback = async () => { return false }) => {
//         // find cache check if it's dirt.
//         const tNow = +new Date()
//         const expireAt = cfg.get(cacheTimeKey)?.[k] || 0;
//         if (tNow > expireAt) {
//             expiredCallback()
//                 .then((succ) => succ && cfg.expire(k, +new Date() + expireIn)) // dont wait
//         }
//         return cfg.get(k)
//     },
//     expire: (k, tExpire) => cfg.mix(cacheTimeKey, { [k]: tExpire })
// } : {
//         get: () => null,
//         set: () => null,
//         mix: () => null,
//         supply: () => null,
//         cache: () => null,
//         expire: () => null,
//     }

const apiPath = `/api/v1`

// const apiPath = `https://kite.sunnysab.cn/api/v1`
// const apiPath = `https://local-kite.sunnysab.cn:8443/api/v1`
// const apiPath = `https://xxwl.snomiao.com:58443/api/v1`
// const apiPath = `https://localhost:8443/api/v1`
let coll = []
const sow = (x) => (coll = x, x)
const watch = (input) => (console.log(input), input)
const handleError = err =>
    // FetchError
    (/json/i.test(err.toString())
        && { code: err.status || -1, msg: `服务器内部错误，请联系管理员。` + (e => e ? `错误代码: ${e}` : '')(err.type || err.status || err.message), err, coll })
    || (/network|socket/i.test(err.toString())
        && { code: err.status || -1, msg: `网络错误，请联系管理员。` + (e => e ? `错误代码: ${e}` : '')(err.type || err.status || err.message), err, coll })
    || { code: err.status || -1, msg: '网络错误', err }
const fetchParams = (method, payload = null) => {
    const token = cfg.get('token')
    return mixin(
        { method },
        payload && { headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(payload).toString() },
        token && { headers: { Authorization: "Bearer " + token } } || {})
}

const api = {
    get: (uri) =>
        fetch(encodeURI(apiPath + uri), fetchParams('GET'))
            .then(r => sow(r).json()).catch(handleError),
    post: (uri, payload = {}) =>
        fetch(encodeURI(apiPath + uri), fetchParams("POST", payload))
            .then(r => sow(r).json()).catch(handleError),
    patch: (uri, payload) =>
        fetch(encodeURI(apiPath + uri), fetchParams("PATCH", payload))
            .then(r => sow(r).json()).catch(handleError),
    delete: (uri) =>
        fetch(encodeURI(apiPath + uri), fetchParams("DELETE"))
            .then(r => sow(r).json()).catch(handleError),
}


// ### 列出申请返校的学生
// GET https://localhost:8443/api/v1/checking/student
// ### 搜索申请返校的学生
// GET https://localhost:8443/api/v1/checking/student?q=测试姓名
// ### 获取用户审核状态
// GET https://localhost:8443/api/v1/checking/student/1610200302
// ### 添加学生信息
// POST https://localhost:8443/api/v1/checking/student
// ### 更新学生审核状态
// PATCH https://localhost:8443/api/v1/checking/student/1610200212
// ### 删除记录
// DELETE https://localhost:8443/api/v1/checking/student/1000000001
// ### 列出同级及下一级的管理员
// GET https://localhost:8443/api/v1/checking/admin
// ### 删除管理员
// DELETE https://localhost:8443/api/v1/checking/admin/0001

// ### [POST]   /session
// | 参数       | 类型   | 必填 | 释义               | 合法值                                    |
// | ---------- | ------ | ---- | ------------------ | ----------------------------------------- |
// | loginType  | int    | 是   | 登录方式           | 0 微信登录<br/>1 用户名密码登录（网页版） |
// | account    | string | 否   | 用户名             | 仅用户名密码方式登录有效                  |
// | credential | string | 否   | 密码               | 仅用户名密码方式登录有效                  |
// | wxCode     | string | 否   | 微信的临时登录代码 | 仅微信登录有效                            |
// 响应示例
// ```json
// // 该 JWT secret 为测试用
// {
//     "code":0,
//     "data":{
//         "token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjQsImlzX2FkbWluIjpmYWxzZX0.avXJGQiCDd_5XaQrkUssvMBtx79zi1cEnk3M6aSxA5k",
// eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjEsImlzX2FkbWluIjp0cnVlfQ._0bsWTSV1PEpsvtbT0FyJF5rMuv2bA0zjHpGvedeA7k
//         "data":{
//             "uid":4,
//             "nick_name":"NewUser",
//             "avatar":"https://kite.sunnysab.cn/static/icon.png",
//             "is_disabled":false,
//             "is_admin":false,
//             "country":null,
//             "province":null,
//             "city":null,
//             "language":null,
//             "createTime":"2020-07-12T02:30:37.880591"
//         }
//     }
// }
// ```
const loginAndRedirect = async (account, credential) => {
    const ret = await api.post("/session", { loginType: '1', account, credential })
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
    return ret
}
const CookieStringify = CookieObj => Object.entries((CookieObj || {})).map(([k, v]) => k + '=' + v).join('; ')
const CookieParse = CookieStr => Object.fromEntries((CookieStr || '').split(/; ?/).map(s => s.split('=')).map(l => [l[0], l.slice(1).join('=')]))
const checkLoginAndRedirectIfNeeded = async () => {
    if (location.pathname == '')
        return;
    if (location.pathname == '/')
        return;
    if (location.pathname.startsWith('/login'))
        return;
    // 
    const userData = cfg.get('userData')
    if (!userData) cfg.set('token', null)
    // 
    const token = cfg.get('token')
    if (!token) {
        location.href = `/login?referer=${encodeURIComponent(location.href)}`;
    }
}
export const logoutAndRedirect = async () => {
    cfg.set('token', null)
    // alert('logout1')
    // location.href = '/'
    // alert('logout2')
}

export { checkLoginAndRedirectIfNeeded, loginAndRedirect, cfg, api }
