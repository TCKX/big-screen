import { apiRequest } from "../axios";

//获取host ip列表
const getHostIpInfo = async (data: any) => apiRequest({ url: "host/hostIpListV3", data });

// 获取进程数据
const getProcessInfo = async (data: any) => apiRequest({ url: "host/processSnapshootV3", data });

// 获取树节点的数据
const getNodeInfo = async (data: any) => apiRequest({ url: "host/processTreeByIdV3",dataType:"form", data });

export default {
  getHostIpInfo,
  getProcessInfo,
  getNodeInfo,
};
