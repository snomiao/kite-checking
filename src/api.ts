
const mixin = require('mixin-deep');
const cacheTimeKey = `cacheTime`
const convertToTable = (list: any[], idKey: string) => Object.fromEntries(list.map(item => [item[idKey], item]))
const convertToArray = (table: object) => Object.entries(table).map(e => e[1])
const isRunningOnBrowser = typeof window !== 'undefined'

export const cfg = {
    _isValid: () => typeof window !== "undefined" && !!localStorage,
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

const apiPath = `/api/v1`

let coll = []
const sow = (x) => (coll = x, x)
const watch = (input: any) => (console.log(input), input)

const handleError = (err) => // TODO: error type
    // FetchError
    (/json/i.test(err.toString())
        && { code: err.status || -1, msg: `服务器内部错误，请联系管理员。` + (e => e ? `错误代码: ${e}` : '')(err.type || err.status || err.message), err, coll })
    || (/network|socket/i.test(err.toString())
        && { code: err.status || -1, msg: `网络错误，请联系管理员。` + (e => e ? `错误代码: ${e}` : '')(err.type || err.status || err.message), err, coll })
    || { code: err.status || -1, msg: '网络错误', err }

const obj2url = (payload, prefix = '') => payload ? prefix + new URLSearchParams(payload).toString() : ''
const fetchParams = (method: string, payload = null) => {
    const token = cfg.get('token')
    return mixin(
        { method },
        payload && { headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: obj2url(payload) },
        token && { headers: { Authorization: "Bearer " + token } } || {})
}
interface apiResult {
    code: number
    msg?: string
    data?: any
}
const uriSearch = (uri, search: object = null) =>
    apiPath + uri + obj2url(search, '?');
export const api = {
    GET: (uri: string, search: object = null): Promise<apiResult> =>
        fetch(uriSearch(uri, search), fetchParams('GET'))
            .then(r => sow(r).json()).catch(handleError),
    POST: (uri: string, search: object = null, payload: object = null): Promise<apiResult> =>
        fetch(uriSearch(uri, search), fetchParams("POST", payload))
            .then(r => sow(r).json()).catch(handleError),
    PATCH: (uri: string, search: object = null, payload: object = null): Promise<apiResult> =>
        fetch(uriSearch(uri, search), fetchParams("PATCH", payload))
            .then(r => sow(r).json()).catch(handleError),
    DELETE: (uri: string, search: object = null): Promise<apiResult> =>
        fetch(uriSearch(uri, search), fetchParams("DELETE"))
            .then(r => sow(r).json()).catch(handleError),
}

// go check in /docs/checking.http

const checkDomain = async () => {
    // location.hostname
}
const CookieStringify = (CookieObj: object) => Object.entries((CookieObj || {})).map(([k, v]) => k + '=' + v).join('; ')
const CookieParse = (CookieStr: string) => Object.fromEntries((CookieStr || '').split(/; ?/).map(s => s.split('=')).map(l => [l[0], l.slice(1).join('=')]))
export const checkLoginAndRedirectIfNeeded = async () => {
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

// export { checkLoginAndRedirectIfNeeded, loginAndRedirect, cfg, api }
