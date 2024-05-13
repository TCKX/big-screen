import { apiRequest } from "../axios";

//获取系统监控列表
const getListInfo = async (data: any) => apiRequest({ url: "host/list", data });

//获取host ip列表
const getHostIpInfo = async (data: any) => apiRequest({ url: "host/hostIpListV3", data });

/**
 * 获取终端详细信息
 * @param data id
 * @returns 
 */
const detailNodeInfo = async (data: any) => apiRequest({ url: "host/v4/memInfo", data });

export default { getListInfo,getHostIpInfo,detailNodeInfo };
