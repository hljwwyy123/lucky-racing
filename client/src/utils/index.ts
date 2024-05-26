import moment from "moment";
import Taro from "@tarojs/taro"
import { REAL_SCORE_ITEM } from "../type";

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
        _unionId = res.result.openid
        Taro.setStorageSync("unionId", _unionId)
    }
    return _unionId
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
