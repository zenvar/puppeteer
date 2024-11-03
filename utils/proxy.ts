import { get } from 'mongoose';

async function getProxy() {
    const proxies = await import('fs/promises');
    const proxyList = (await proxies.readFile('./proxies.txt', 'utf8')).split('\n');
    const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    return randomProxy;
}

export default getProxy;