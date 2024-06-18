import Taro from "@tarojs/taro"

export async function getOpenIdAndUnion () {
    let _openId = Taro.getStorageSync("openId");
    let _unionId = Taro.getStorageSync("unionId");
    if (!_openId) {
        console.log('call cloud fuction >>> login')
        const res: any = await Taro.shareCloud.callFunction({
            name: 'login'
        });
        _openId = res.result.openid
        _unionId = res.result.unionId
        Taro.setStorageSync("openId", _openId)
        Taro.setStorageSync("unionId", _unionId)
        return {
            openId: _openId,
            unionId: _unionId
        }
    } else {
        return {
            openId: _openId,
            unionId: _unionId
        }
    }
}

export async function getOpenId () {
    let _openId = Taro.getStorageSync("openId");
    if (!_openId) {
        console.log('call cloud fuction >>> login')
        const res: any = await Taro.shareCloud.callFunction({
            name: 'login'
        });
        _openId = res.result.openid
        Taro.setStorageSync("openId", _openId)
    }
    return _openId
}

export async function getUnionId () {
    let _unionId = Taro.getStorageSync("unionId");
    if (!_unionId) {
        console.log('call cloud fuction >>> login')
        const res: any = await Taro.shareCloud.callFunction({
            name: 'login'
        });
        _unionId = res.result.unionId
        Taro.setStorageSync("unionId", _unionId)
    }
    return _unionId
}

export async function getIsAdmin() {
    let isAdmin = Taro.getStorageSync("isAdmin");
    if ((isAdmin+'').length) {
        return !!isAdmin
    } else {
        const res: any = await Taro.shareCloud.callFunction({
            name: 'lucky_is_admin_user'
        });
        const flag = res.result;
        Taro.setStorageSync("isAdmin", ~~flag)
        return flag
    }
}

export async  function initCloud() {
    const cloud = new Taro.cloud.Cloud({
        resourceAppid: 'wx98786041f7a0b60d',
        resourceEnv: 'racing-7gxq1capbac7539a'
    });
    await cloud.init();
    console.log('Taro.shareCloud inited ====')
    Taro.shareCloud = cloud;
    const loginRes: any = await cloud.callFunction({
        name: 'login'
    });
    const { FROM_UNIONID, FROM_OPENID } = loginRes.result;
    Taro.setStorageSync("openId", FROM_OPENID)
    Taro.setStorageSync("unionId", FROM_UNIONID)
    return cloud;
}

export async function getTaroCloud() {
    return new Promise((resolve) => {
        if (!Taro.shareCloud) {
            resolve(initCloud())
        } else {
            resolve(Taro.shareCloud)
        }
    })
}

export function randomScore() {
    return getRandomBetween(90000, 100000)
}

export function sleep(time) {
    return new Promise((resolve) => setTimeout(() => {
        resolve(true)
    }, time))
}

export function UUID(length = 16) {
    // 获取当前时间戳
  const timestamp = Date.now().toString(36); // 转换为36进制字符串
  const randomNumber = Math.random().toString(36).substring(2, 10); // 获取随机数并转换为36进制字符串
  return (timestamp + randomNumber).substring(0, length).toUpperCase();
}

function getRandomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 将毫秒转换成分钟和秒的形式
export function formatMilliseconds(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const remainingMilliseconds = milliseconds % 1000;

    let result = '';

    if (hours > 0) {
        result += `${hours}h`;
    }

    if (minutes > 0) {
        result += `${minutes}'`;
    }

    result += `${seconds}.${remainingMilliseconds.toString().padStart(3, '0')}`;

    return result;
}

export function decodeMillseconds(formattedTime: string) {
    const regex = /^(\d+)'(\d{1,2})\.(\d{1,3})$/;
    const match = formattedTime.match(regex);
    
    if (!match) {
        throw new Error('Invalid formatted time');
    }
    
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const milliseconds = parseInt(match[3], 10);
    
    return (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
} 

// 字符串加密
export function toCode (str) {  //加密字符串
    //定义密钥，36个字母和数字
    var key = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var len = key.length;  //获取密钥的长度
    var a = key.split("");  //把密钥字符串转换为字符数组
    var s = "",b, b1, b2, b3;  //定义临时变量
    for (var i = 0; i <str.length; i ++) {  //遍历字符串
        b = str.charCodeAt(i);  //逐个提取每个字符，并获取Unicode编码值
        b1 = b % len;  //求Unicode编码值得余数
        b = (b - b1) / len;  //求最大倍数
        b2 = b % len;  //求最大倍数的于是
        b = (b - b2) / len;  //求最大倍数
        b3 = b % len;  //求最大倍数的余数
        s += a[b3] + a[b2] + a[b1];  //根据余数值映射到密钥中对应下标位置的字符
    }
    return s;  //返回这些映射的字符
  }
