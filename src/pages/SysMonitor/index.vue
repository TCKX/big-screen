<template>
  <div class="sys-monitor">
    <div class="content">
      <div class="content-left-list">
        <div class="node-title">终端列表</div>
        <div v-for="m in nodeList">
          <div
            :class="nodeId && m.id == nodeId ? 'node-item node-select' : 'node-item' "
            @click="changeNodeFun(m.id)"
          >
            <div>{{ m.name }}</div>
            <div>{{ "(" + m.ip + ")" }}</div>
          </div>
        </div>
      </div>
      <div class="content-right">
        <div class="item-content left">
          <div class="left-item">
            <el-tabs
              v-model="activeName"
              class="demo-tabs"
              @tab-change="handleClick"
            >
              <el-tab-pane label="进程列表" name="processList"></el-tab-pane>
              <el-tab-pane label="跟踪点" name="trackPoint"> </el-tab-pane>
              <el-tab-pane label="可信通路" name="trustChannel"> </el-tab-pane>
              <el-tab-pane label="内核代码区" name="kernelCode"> </el-tab-pane>
            </el-tabs>
            <div class="cards-style" v-show="activeName == 'processList'">
              <div class="card-items">
                <div class="left-img">
                  <img
                    style="width: 80px"
                    :src="require('@/assets/sysMonitor/first.png')"
                  />
                </div>
                <div class="right-info">
                  <div class="top-font">进程总数</div>
                  <div class="bootom-font">{{ topInfo.total }}</div>
                </div>
              </div>
              <div class="card-items">
                <div class="left-img">
                  <img
                    style="width: 80px"
                    :src="require('@/assets/sysMonitor/second.png')"
                  />
                </div>
                <div class="right-info">
                  <div class="top-font">异常进程总数</div>
                  <div class="bootom-font" style="color: red">
                    {{ topInfo.eCount }}
                  </div>
                </div>
              </div>
              <div class="card-items">
                <div class="right-info">
                  <div class="top-font">异常进程占比</div>
                  <div class="bootom-font">
                    {{ topInfo.eCount }} / {{ topInfo.total }}
                  </div>
                </div>
                <div class="right-img">
                  <dv-active-ring-chart
                    :config="configTop"
                    style="width: 150px; height: 150px"
                  />
                </div>
              </div>
            </div>
            <TableWapper
              class="newTable"
              :colConfigs="colConfigs"
              :tableData="tableData"
              :loading="loading"
            >
              <template v-if="activeName == 'processList'" #name>
                <el-table-column>
                  <template #header>
                    <div
                      style="
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                      "
                    >
                      <div style="margin-right: 20px; width: 40px">名称</div>
                      <el-input
                        clearable
                        v-model="searchProcName"
                        placeholder="请输入名称"
                        @keyup.enter.native="seachNameFun"
                        @clear="seachNameFun"
                      />
                    </div>
                  </template>
                  <template #default="scope">
                    <div
                      v-if="scope.row.is_exception == 1"
                      style="color: red; font-weight: bold"
                    >
                      {{ scope.row.name }}
                    </div>
                    <div v-else style="color: #fff; font-weight: none">
                      {{ scope.row.name }}
                    </div>
                  </template>
                </el-table-column>
              </template>
              <template v-if="activeName == 'trackPoint'" #addr>
                <el-table-column label="跟踪点" v-slot="scope">
                  <div
                    v-if="scope.row.is_exception == 1"
                    style="color: red; font-weight: bold"
                  >
                    {{ scope.row.addr }}
                  </div>
                  <div v-else style="color: #fff; font-weight: none">
                    {{ scope.row.addr }}
                  </div>
                </el-table-column>
              </template>
              <template #option>
                <el-table-column label="操作" v-slot="scope" width="210px">
                  <div style="display: flex; flex-direction: row">
                    <div
                      v-if="activeName == 'processList'"
                      class="realTime"
                      title="实时行为监控"
                      @click="realTimeAction(scope.row)"
                    >
                      实时行为监控
                    </div>
                    <div
                      v-if="scope.row.name || scope.row.type"
                      class="detail"
                      title="详情"
                      @click="
                        activeName == 'processList'
                          ? processOneFun(scope.row)
                          : activeName == 'trackPoint'
                          ? trackFun(scope.row)
                          : attrListFun(scope.row.pointer)
                      "
                    >
                      详情
                    </div>
                  </div>
                </el-table-column>
              </template>
            </TableWapper>
            <div class="pagination">
              <el-pagination
                v-model:current-page="page"
                v-model:page-size="size"
                :page-sizes="eCountizes"
                :total="total"
                layout="total, prev, pager, next,sizes"
                @current-change="currentFun"
                @size-change="sizeChangeFun"
              />
            </div>
            <div v-if="visible" class="realTimeNew">实时行为监控</div>
            <div v-if="visible">
              <el-tabs
                type="border-card"
                class="demo-tabs"
                closable
                @tab-remove="closeFun"
                @tab-change="changeTabFun"
                v-model="editableTabsValue"
              >
                <el-tab-pane
                  v-for="item in editableTabs"
                  :key="item.name"
                  :label="item.title"
                  :name="item.name"
                >
                </el-tab-pane>
                <dv-scroll-board
                  :config="config"
                  style="width: 1600px; height: 330px"
                />
                <div v-if="ifShowNoData" class="ifShowNoData">
                  <img :src="require('@/assets/nodata.png')" />
                </div>
              </el-tabs>
            </div>
          </div>
        </div>
        <div class="item-content">
          <div v-if="showDetail == true">
            <div class="detal-title-style">详细信息</div>
            <div>
              <div v-for="m in detailInfoData">
                <Description :label="m.label" :value="m.value" />
              </div>
            </div>
          </div>
          <div v-if="showOneDetail == true">
            <div class="oneDetail">
              {{
                activeName == "processList" ? "异常进程信息" : "异常跟踪点信息"
              }}
            </div>
            <ProcessDetail
              v-if="activeName == 'processList'"
              :rowInfos="rowInfo"
              ref="processRef"
            />
            <TrackDetail v-else ref="trackRef" />
          </div>
        </div>
      </div>
    </div>

    <!-- <el-dialog
      v-model="visible"
      title="实时行为监控"
      width="1200"
      draggable
      @close="closeFun"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
    >
      <el-card class="bottom">
        <dv-scroll-board
          :config="config"
          style="width: 1100px; height: 450px"
        />
      </el-card>
    </el-dialog> -->
    <!-- <TableWapper
      :ref="tableRef"
      :colConfigs="colConfigsDia"
      :tableData="tableDataDia"
    ></TableWapper> -->
  </div>
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted, reactive, toRefs } from "vue";
import sysMonitorApi from "@/api/sysMonitor";
import TableWapper from "@/components/Table/index.vue";
import Description from "@/components/Descriptions/index.vue";
import trustEnums from "@/utils/enum";
import ProcessDetail from "./components/processDetail.vue";
import TrackDetail from "./components/trackDetail.vue";
import "./index.scss";

export default {
  name: "SysMonitor",
  components: { TableWapper, Description, ProcessDetail, TrackDetail },
  setup() {
    const state = reactive({
      loading: false,
      searchProcName: "",
      topInfo: {
        eCount: 0,
        total: 0,
      },
      ifShowNoData: false,
      editableTabs: [],
      tableDataDia: [],
      configTop: {
        lineWidth: 10,
        data: [],
        digitalFlopStyle: {
          fontSize: 0,
          fill: "#012e5c",
        },
        color: ["#d81e06", "#5c9ff7"],
      },
      config: {
        header: [
          "行为时间",
          "进程名称",
          "进程号",
          "动作名称",
          "操作客体",
          "描述",
        ],
        data: [],
        columnWidth: [190, 300, 200, 180, 210, 350],
        waitTime: 3000,
        rowNum: 6,
        headerBGC: "#012e5c",
        oddRowBGC: "rgba(3, 103, 132, 0.25)",
        evenRowBGC: "rgba(0,186,244,0.05)",
      },
      colConfigsDia: [
        { slot: "index" },
        { label: "进程名称", prop: "process" },
        { label: "进程号", prop: "pid" },
        { label: "动作名称", prop: "action" },
        { label: "操作主体", prop: "object" },
        { label: "行为时间", prop: "time", width: 160 },
        { label: "描述", prop: "desc", width: 300 },
      ],
      tyepEnum: {
        processList: 1,
        trackPoint: 2,
        trustChannel: 3,
        kernelCode: 4,
      },
      visible: false, //是否展示弹窗
      // 详细信息
      detailInfoData: [],
      nodeList: [],
      colConfigs: [
        { slot: "index" },
        { slot: "name" },
        { label: "进程ID", prop: "pid" },
        { label: "父进程ID", prop: "ppid" },
        { label: "上报时间", prop: "record_time" },
        { slot: "option" },
      ],
      tableData: [],
      activeName: "processList",
      activeName1: "filesystem",
      nodeId: "",
      showDetail: false,
      showOneDetail: true,
      rowInfo: {},
      processRef: null,
      trackRef: null,
      page: 1,
      total: 0,
      size: 10,
      eCountizes: [10, 20, 50, 100],
      timer: null,
      pid: "",
      newTimer: null,
      tableRef: null,
      editableTabsValue: 0,
      newTabData: [],
    });
    const funMethods = {
      currentFun(val) {
        state.page = val;
        requestMethods.getDetailFun(state.activeName);
      },

      sizeChangeFun(val) {
        state.page = 1;
        state.size = val;
        requestMethods.getDetailFun(state.activeName);
      },
      handleClick(name: any) {
        state.colConfigs = [];
        if (name == "processList") {
          state.colConfigs = [
            { slot: "index" },
            { slot: "name" },
            { label: "进程ID", prop: "pid" },
            { label: "父进程ID", prop: "ppid" },
            { label: "上报时间", prop: "record_time" },
            { slot: "option" },
          ];
        } else if (name == "trackPoint") {
          state.colConfigs = [
            { slot: "index" },
            { slot: "addr" },
            { label: "类型", prop: "type" },
            { slot: "option" },
          ];
        } else if (name == "trustChannel") {
          state.colConfigs = [
            { slot: "index" },
            { label: "名称", prop: "name" },
            { label: "下一层名称", prop: "exname" },
            { label: "属性", prop: "type" },
            { slot: "option" },
          ];
        } else if (name == "kernelCode") {
          state.colConfigs = [
            { slot: "index" },
            { label: "模块名", prop: "name" },
            { label: "开始地址", prop: "start" },
            { label: "结束地址", prop: "lend" },
          ];
        }
        state.showDetail = false;
        state.showOneDetail = false;
        state.visible = false;
        state.page = 1;
        state.size = 10;
        state.activeName = name;
        requestMethods.getDetailFun(name);
      },
      realTimeAction(info: any) {
        state.visible = true;
        clearInterval(this.timer);
        state.editableTabsValue = info.pid;
        const ifHas =
          state.editableTabs.length > 0 &&
          state.newTabData.filter((m) => m.name == info.pid);

        if (ifHas[0]) {
          state.editableTabsValue = info.pid;
          return;
        }
        const newObj = {
          title: info.name,
          name: info.pid,
        };
        state.newTabData.push(newObj);
        state.editableTabs.push(newObj);
        funMethods.getRealFun(info);
        funMethods.getReloadFun(info);
        state.timer = setInterval(async () => {
          funMethods.getReloadFun(info);
        }, 3000);
      },

      async getRealFun(info) {
        state.ifShowNoData = false;
        await sysMonitorApi.getRealTimeList({
          pid: info.pid,
          flag: 1,
        });
      },

      async getReloadFun(info) {
        const res = await sysMonitorApi.reloadRealList({
          hostId: state.nodeId,
          pid: info.pid,
        });
        state.config.data = [];
        state.config = { ...state.config };
        state.pid = info.pid;
        state.tableDataDia = res;
        if (res.length == 0) {
          state.ifShowNoData = true;
          return;
        } else {
          state.ifShowNoData = false;
        }
        const newData = res.map((m) => {
          return [m.time, m.process, m.pid, m.action, m.object, m.desc];
        });
        state.config.data = newData;
        state.config = { ...state.config };
      },

      changeTabFun(info) {
        clearInterval(state.timer);
        funMethods.getReloadFun({ pid: info });
        state.timer = setInterval(async () => {
          funMethods.getReloadFun({ pid: info });
        }, 3000);
      },

      async closeFun(targetName) {
        const res = await sysMonitorApi.getRealTimeList({
          pid: targetName,
          flag: 0,
        });
        state.tableDataDia = res;
        const tabs = state.editableTabs;

        let activeName = state.editableTabsValue;
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
              const nextTab = tabs[index + 1] || tabs[index - 1];
              if (nextTab) {
                activeName = nextTab.name;
              }
            }
          });
        }
        state.editableTabsValue = activeName;
        state.editableTabs = tabs.filter((tab) => tab.name !== targetName);
        if (state.editableTabs.length == 0) {
          state.newTabData = [];
          state.config.data = [];
          state.config = { ...state.config };
          state.visible = false;
        }
        clearInterval(state.timer);
      },

      changeNodeFun(id: any) {
        clearInterval(state.timer);
        const otherName = state.editableTabs.map((m) => m.name);
        otherName.map((m) => {
          funMethods.closeFun(m);
        });
        // state.showDetail = false;
        state.showOneDetail = true;
        state.activeName = "processList";
        // state.activeName1 = "filesystem";
        state.nodeId = id;
        requestMethods.getDetailFun(state.activeName);
      },
      async trackFun(info: any) {
        // 跟踪点的信息
        state.showDetail = false;
        const res = await sysMonitorApi.getTrackDetail({ saddr: info.addr });
        if (!res) {
          return;
        }
        state.showOneDetail = true;
        state.trackRef.show(res);
      },
      async processOneFun(info: any) {
        state.showOneDetail = true;
        state.showDetail = false;
        const res = await sysMonitorApi.getNewDetail({
          hostId: state.nodeId,
          pid: info.pid,
          time: info.record_time ? info.record_time : "",
        });
        if (res) {
          state.processRef.show(res[0]);
        } else {
          state.processRef.show();
        }
      },
      processFun(info: any) {
        state.showDetail = true;
        state.showOneDetail = false;
        state.detailInfoData = [
          { label: "名称", value: info.name },
          { label: "进程id", value: info.pid },
          { label: "父进程id", value: info.ppid },
          { label: "用户id", value: info.uid },
          { label: "当前用户id", value: info.uid },
          { label: "组id", value: info.uid },
          { label: "栈起始地址", value: info.stack_start },
          { label: "映射基址", value: info.mmap_base },
          { label: "堆地址", value: info.start_brk + "-" + info.brk },
          { label: "数据段地址", value: info.start_data + "-" + info.end_data },
          { label: "代码段地址", value: info.start_code + "-" + info.end_data },
          { label: "环境变量地址", value: info.env_start + "-" + info.env_end },
          { label: "页表", value: info.pgd },
          { label: "调试状态", value: info.ptrace },
          { label: "当前状态", value: info.state },
          { label: "退出状态", value: info.exit_state },
          { label: "退出码", value: info.exit_code },
        ];
      },
      attrListFun(info: any) {
        state.showDetail = true;
        state.showOneDetail = false;
        if (!info) {
          return;
        }
        const newData = info.split(",");
        let newArry = [];
        if (state.activeName1 == "filesystem") {
          newArry = trustEnums.filesystemEnum.map((m, i) => {
            return {
              label: m,
              value: newData[i],
            };
          });
        } else if (state.activeName1 == "blockdriver") {
          newArry = trustEnums.blockdriverEnum.map((m, i) => {
            return {
              label: m,
              value: newData[i],
            };
          });
        } else {
          newArry = trustEnums.scsidriverEnum.map((m, i) => {
            return {
              label: m,
              value: newData[i],
            };
          });
        }
        state.detailInfoData = newArry;
      },
    };
    const requestMethods = {
      seachNameFun() {
        requestMethods.getDetailFun(state.activeName);
      },
      // 获取终端列表
      async getNode() {
        const params = {
          page: 1,
          size: 1000,
        };
        const res = await sysMonitorApi.getHostIpInfo(params);
        state.nodeList = res.list.map((m: any) => {
          return {
            name: m.hostInfo.name,
            id: m.hostInfo.id,
            state: m.hostInfo.state,
            ip: m.hostInfo.ip[0],
          };
        });
        const getHomeIp = sessionStorage.getItem("toSysIp");
        if (getHomeIp) {
          // 当前终端不匹配
          const newObj: any = state.nodeList.filter((m) => m.ip == getHomeIp);
          state.nodeId = newObj[0].id;
        } else {
          state.nodeId = state.nodeList.length > 0 ? state.nodeList[0].id : "";
        }
        requestMethods.getDetailFun(state.activeName);
      },
      // 获取终端详细信息
      async getDetailFun(name: any) {
        const payload: any = {
          id: state.nodeId,
          flag: state.tyepEnum[state.activeName],
          page: state.page,
          size: state.size,
        };

        if (state.activeName == "processList") {
          payload.name = state.searchProcName;
        } else {
          delete payload.name;
        }
        const res = await sysMonitorApi.detailNodeInfo(payload);
        if (res.length == 0) {
          state.tableData = [];
          return;
        }
        state.total = res.total;
        if (state.activeName == "processList") {
          state.showOneDetail = true;
          state.topInfo.total = res.total;
          state.topInfo.eCount = res.eCount;
          state.configTop.data = [
            { name: "进程总数", value: res.eCount },
            { name: "异常进程", value: res.total == 0 ? 1 : res.total },
          ];
          state.configTop = { ...state.configTop };

          state.tableData = res.list;
        } else if (state.activeName == "trackPoint") {
          state.showOneDetail = true;
          clearInterval(this.timer);
          const otherName = state.editableTabs.map((m) => m.name);
          otherName.map((m) => {
            funMethods.closeFun(m);
          });
          state.tableData = res.list;
        } else if (state.activeName == "trustChannel") {
          clearInterval(this.timer);
          const otherName = state.editableTabs.map((m) => m.name);
          otherName.map((m) => {
            funMethods.closeFun(m);
          });
          state.tableData = res.list.map((m) => {
            return {
              ...m,
              pointer: m.pointers.join(","),
            };
          });
        } else if (state.activeName == "kernelCode") {
          clearInterval(this.timer);
          const otherName = state.editableTabs.map((m) => m.name);
          otherName.map((m) => {
            funMethods.closeFun(m);
          });
          state.tableData = res.list;
        }
      },
    };

    onMounted(() => {
      requestMethods.getNode();
    });

    onBeforeUnmount(() => {
      sessionStorage.removeItem("toSysIp");
      clearInterval(state.timer);
      const otherName = state.editableTabs.map((m) => m.name);
      otherName.map((m) => {
        funMethods.closeFun(m);
      });
    });

    return {
      ...toRefs(state),
      ...funMethods,
      ...requestMethods,
    };
  },
};
</script>

<style lang="scss" scoped>
.sys-monitor {
  height: calc(100vh - 100px);
  width: 100%;
  background-image: url("../../assets/bigScreen/menu/backImg.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  color: #fff;

  .content {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    height: calc(100% - 20px);

    .title {
      color: #fff;
      font-size: 18px;
      &:nth-child(1),
      &:nth-child(2) {
        margin-bottom: 20px;
      }
    }

    .content-left-list {
      width: 300px;
      border-right: 1px solid #fff;
      padding-top: 20px;
      .node-title {
        text-align: center;
        margin-bottom: 30px;
        font-size: 18px;
      }

      .node-item {
        padding-left: 30px;
        height: 40px;
        line-height: 40px;
        background-color: #050d24;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding-right: 10px;
        &:hover {
          color: #118cfe;
          cursor: pointer;
          background-color: #2c4672;
        }
      }

      .node-select {
        color: #118cfe;
        background-color: #2c4672;
        border-radius: 4px;
      }
    }

    .content-right {
      width: calc(100% - 302px);
      display: flex;
      flex-direction: row;
      height: 90vh;
      overflow-y: auto;
      .item-content {
        flex: 1;
        background-color: #050d24;
        overflow-y: auto;
        &:nth-child(1) {
          flex: 3;
          border-right: 1px solid #fff;
        }
      }
      .left {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
        .left-item {
          flex: 1;
          background-color: #021438;
          margin-bottom: 10px;
          padding: 10px 20px;
          &:nth-child(4) {
            margin-bottom: 0px;
          }
        }
      }
    }
  }
}

.detail {
  color: #118cfe;
  &:hover {
    cursor: pointer;
  }
}

.detal-title-style {
  padding-left: 40px;
  font-size: 18px;
}

.newTable {
  height: 36vh;
  max-height: 36vh;
  min-height: 36vh;
  overflow-y: auto;
}

.oneDetail {
  font-size: 18px;
  margin-bottom: 20px;
  margin-left: 10px;
}

.realTime {
  margin-right: 20px;
  color: #118cfe;
  &:hover {
    cursor: pointer;
  }
}

:deep(.el-descriptions__body) {
  background-color: #021438;
}

:deep(.el-descriptions__label) {
  color: #fff;
}
:deep(.el-card) {
  background-color: #021438;
  border: #021438;
  color: #fff;
}

:deep(.el-descriptions__title) {
  color: gray;
  font-size: 18px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: -20px;
}

.cards-style {
  display: flex;
  flex-direction: row;
  // margin-top: 10px;
  margin-bottom: 10px;
  position: relative;
  .card-items {
    flex: 1;
    background-color: #012e5c;
    display: flex;
    flex-direction: row;
    border-radius: 6px;
    padding: 20px;
    .left-img {
      margin-left: 20px;
    }
    .right-info {
      margin-left: 30px;
      .top-font {
        color: #999;
      }
      .bootom-font {
        font-size: 24px;
        font-weight: bold;
        margin-top: 20px;
      }
    }
    &:nth-child(1) {
      margin-right: 10px;
    }
    &:nth-child(2) {
      margin-right: 10px;
    }
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 0px;
  background-color: #012e5c;
  border-bottom: none;
  color: #fff;
}

:deep(.el-tabs--border-card) {
  background-color: #021438;
  border: 2px solid #012e5c;
  border-radius: 6px;
}

:deep(.el-tabs--border-card > .el-tabs__header) {
  border-bottom: 1px solid #021438;
  background-color: #021438;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border: 1px solid #72767b;
  border-bottom: none;
}

.ifShowNoData {
  position: absolute;
  bottom: 108px;
  left: 40%;
  z-index: 9999;
}

.realTimeNew {
  color: #118cfe;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  margin-top: 4px;
}

.right-img {
  position: absolute;
  top: -10px;
  right: 20px;
}

:deep(.el-scrollbar) {
  background-color: #021438;
}

:deep(.el-loading-mask) {
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0.9;
}
</style>
