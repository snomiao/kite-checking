# design view

view and process on
/login
    账号密码输入
    POST /session
    get auth 
    成功跳转referer或首页
/
    登录检查跳转
    overviews...
/checking? q index count
    登录检查跳转
    加一层不可操作的缓存
    [GET] /checking 内容做个 table 列出来
        [GET] /checking/{uid}
        [POST] /checking? studentId name college major
        [DELETE] /checking/{id}
/checking? uid
    登录检查跳转
    [GET] /checking/{uid}
    [POST] /checking? studentId name college major
    [DELETE] /checking/{id}
