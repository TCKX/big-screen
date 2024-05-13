<template>
  <div class="content">
    <div v-if="ifShowTime == true" class="show-time"></div>
    <el-tabs type="border-card" @tab-change="handleClick">
      <el-tab-pane label="系统调用预警">
        <TableWapper
          style="height: 600px; overflow-y: auto"
          :colConfigs="colConfigs"
          :tableData="tableData"
        >
          <template #alarm_level>
            <el-table-column label="告警等级" v-slot="scope" width="150">
              <el-tag type="success">
                {{ levelEnum[scope.row.alarm_level] }}
              </el-tag>
            </el-table-column>
          </template>
          <template #extra_args>
            <el-table-column label="启动参数" v-slot="scope">
              {{ scope.row.extra_args }}
            </el-table-column>
          </template>
          <template #attck_desc>
            <el-table-column style="width: 200px" label="描述" v-slot="scope">
              {{ scope.row.attck_desc }}
            </el-table-column>
          </template>
          <!-- <template #opt>
            <el-table-column style="width: 200px" label="操作" v-slot="scope">
              <el-button link @click="handleFun(scope.row.id)">处置</el-button>
            </el-table-column>
          </template> -->
        </TableWapper>
        <div class="pagination">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="size"
            :page-sizes="pageSizes"
            :total="total"
            layout="total, prev, pager, next,sizes"
            @current-change="currentFun"
            @size-change="sizeChangeFun"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="内存行为预警">
        <TableWapper
          style="height: 600px; overflow-y: auto"
          :colConfigs="colConfigs1"
          :tableData="tableData1"
        >
          <!-- <template #desc>
            <el-table-column style="width: 200px" label="描述" v-slot="scope">
              {{ scope.row.desc }}
            </el-table-column>
          </template> -->
          <template #alarm_level>
            <el-table-column label="告警等级" v-slot="scope" width="150">
              <el-tag type='success'>
                {{ levelEnum[scope.row.alarm_level] }}
              </el-tag>
            </el-table-column>
          </template>
        </TableWapper>
        <div class="pagination">
          <el-pagination
            v-model:current-page="page1"
            v-model:page-size="size1"
            :page-sizes="pageSizes1"
            :total="total1"
            layout="total, prev, pager, next,sizes"
            @current-change="currentFun1"
            @size-change="sizeChangeFun1"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="攻击回溯预警">
        <TableWapper
          style="height: 600px; overflow-y: auto"
          :colConfigs="colConfigs3"
          :tableData="tableData3"
        >
          <!-- <template #desc>
            <el-table-column style="width: 400px" label="描述" v-slot="scope">
              {{ scope.row.desc }}
            </el-table-column>
          </template> -->
          <template #alarm_level>
            <el-table-column label="告警等级" v-slot="scope" width="150">
              <el-tag type="success">
                {{ levelEnum[scope.row.alarm_level] }}
              </el-tag>
            </el-table-column>
          </template>
        </TableWapper>
        <div class="pagination">
          <el-pagination
            v-model:current-page="page3"
            v-model:page-size="size3"
            :page-sizes="pageSizes2"
            :total="total3"
            layout="total, prev, pager, next,sizes"
            @current-change="currentFun3"
            @size-change="sizeChangeFun3"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="基础可信预警">
        <TableWapper
          style="height: 600px; overflow-y: auto"
          :colConfigs="colConfigs2"
          :tableData="tableData2"
        >
          <!-- <template #desc>
            <el-table-column style="width: 400px" label="描述" v-slot="scope">
              {{ scope.row.desc }}
            </el-table-column>
          </template> -->
          <template #severity>
            <el-table-column label="告警等级" v-slot="scope">
              <el-tag type="success">
                {{ scope.row.severity }}
              </el-tag>
            </el-table-column>
          </template>
        </TableWapper>
        <div class="pagination">
          <el-pagination
            v-model:current-page="page2"
            v-model:page-size="size2"
            :page-sizes="pageSizes2"
            :total="total2"
            layout="total, prev, pager, next,sizes"
            @current-change="currentFun2"
            @size-change="sizeChangeFun2"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { onMounted, reactive, toRefs } from "vue";
import { ElMessage } from "element-plus";
import TableWapper from "@/components/Table/index.vue";
import detectApi from "@/api/bigScreen/index";
import attackApi from "@/api/attckBacktrack/index";

export default {
  name: "Content",
  props: ["formInfo"],
  emits: ["onChangeTab"],
  components: { TableWapper },
  setup(props, { emit }) {
    const levelEnum = {
      1: "低级",
      2: "中级",
      3: "高级",
      4: "严重",
    };
    const state = reactive({
      activeName: "first",
      levelEnum,
      selectTime: "",
      timeOptions: [],
      colConfigs: [
        { slot: "index" },
        { slot: "alarm_level" },
        { label: "主机IP", prop: "hostip" },
        { label: "风险分数", prop: "alert_score" },
        { label: "行为分析", prop: "behavior_analyse" },
        { label: "场景关联", prop: "sceneRef" },
        { label: "主体名称", prop: "name" },
        { label: "客体名称", prop: "object" },
        { label: "操作", prop: "op" },
        { label: "启动参数", prop: "extra_args", width: "600px" },
        { label: "描述", prop: "attck_desc", width: "600px" },
        { label: "上报时间", prop: "record_time", width: "200px" },
      ],
      tableData: [],
      page: 1,
      total: 0,
      size: 10,
      pageSizes: [10, 20, 50, 100],
      page1: 1,
      total1: 0,
      size1: 10,
      pageSizes1: [10, 20, 50, 100],
      colConfigs1: [
        { slot: "index" },
        { slot: "alarm_level" },
        { label: "主机IP", prop: "hostip" },
        { label: "风险分数", prop: "alert_score" },
        { label: "战术", prop: "tactics" },
        { label: "技术", prop: "techniques" },
        { label: "子技术", prop: "subtechniques" },
        { label: "度量对象", prop: "subject" },
        { label: "描述", prop: "desc", width: "400px" },
        { label: "上报时间", prop: "@timestamp" },
      ],
      tableData1: [],
      page2: 1,
      total2: 0,
      size2: 10,
      pageSizes2: [10, 20, 50, 100],
      colConfigs2: [
        { slot: "index" },
        { slot: "severity" },
        { label: "主机IP", prop: "hostIp" },
        { label: "风险分数", prop: "risk_score" },
        { label: "客体", prop: "desc" },
        { label: "告警原因", prop: "reason", width: "700px" },
        { label: "上报时间", prop: "@timestamp" },
      ],
      tableData2: [],
      colConfigs3: [
        { slot: "index" },
        { slot: "alarm_level" },
        { label: "主机IP", prop: "machine_ip" },
        { label: "风险分数", prop: "alert_score" },
        { label: "战术", prop: "tactics",width: "400px" },
        { label: "技术", prop: "techniques",width: "400px" },
        { label: "子技术", prop: "subtechniques",width: "400px" },
        // { label: "客体名称", prop: "object" },
        // { label: "操作", prop: "op" },
        // { label: "启动参数", prop: "extra_args", width: "600px" },
        { label: "描述", prop: "desc", width: "400px" },
        { label: "上报时间", prop: "record_time" },
      ],
      tableData3: [],
      page3: 1,
      size3: 10,
      total3: 0,
      payloadDim: 4,
      ifShowTime: false,
    });
    const funMethods = {
      async handleFun(rowId: any) {
        // 调处置的接口
        await detectApi.handle({});
        ElMessage.success("处置成功");
      },
      handleClick(tab: any, event: any) {
        const getHomeIp = sessionStorage.getItem("toSysIp");
        if (tab == 0) {
          state.ifShowTime = false;
          requestMethods.getSysInfoFun({
            ...props.formInfo,
            ip: props.formInfo.ip.ip ==null ? '' :getHomeIp?props.formInfo.ip.ip:props.formInfo.ip.ip[0],
            page: state.page,
            size: state.size,
            dimensionality: state.payloadDim,
          });
          emit("onChangeTab", state.ifShowTime);
        } else if (tab == 1) {
          state.ifShowTime = false;
          requestMethods.getCycleInfoFun({
            ...props.formInfo,
            ip: props.formInfo.ip.ip ==null ? '' :getHomeIp?props.formInfo.ip.ip:props.formInfo.ip.ip[0],
            page: state.page1,
            size: state.size1,
          });
          emit("onChangeTab", state.ifShowTime);
        } else if (tab == 2) {
          state.ifShowTime = true;
          requestMethods.getAttackFun({
            hostIp: props.formInfo.ip.ip ==null ? '' :getHomeIp?props.formInfo.ip.ip:props.formInfo.ip.ip[0],
            page: state.page3,
            size: state.size3,
          });
          requestMethods.getTimeFun(); 
          emit("onChangeTab", state.ifShowTime);
        } else if (tab == 3) {
          state.ifShowTime = false;
          requestMethods.getTrustInfoFun({
            ...props.formInfo,
            ip: props.formInfo.ip.ip ==null ? '' :getHomeIp?props.formInfo.ip.ip:props.formInfo.ip.ip[0],
            page: state.page2,
            size: state.size2,
          });
          emit("onChangeTab", state.ifShowTime);
        }
        
      },
      currentFun(val: any) {
        state.page = val;
        state.size = 10;
        requestMethods.getSysInfoFun({
          page: state.page,
          size: state.size,
          dimensionality: state.payloadDim,
        });
      },
      currentFun1(val: any) {
        state.page1 = val;
        state.size1 = 10;
        requestMethods.getCycleInfoFun({
          page: state.page1,
          size: state.size1,
        });
      },
      currentFun2(val: any) {
        state.page1 = val;
        state.size1 = 10;
        requestMethods.getTrustInfoFun({
          page: state.page2,
          size: state.size2,
        });
      },
      currentFun3(val: any) {
        state.page3 = val;
        state.size3 = 10;
        requestMethods.getAttackFun({
          page: state.page3,
          size: state.size3,
        });
      },
      sizeChangeFun(val: any) {
        state.size = val;
        state.page = 1;
        requestMethods.getSysInfoFun({
          page: state.page,
          size: state.size,
          dimensionality: 4,
        });
      },
      sizeChangeFun1(val: any) {
        state.size1 = val;
        state.page1 = 1;
        requestMethods.getCycleInfoFun({
          page: state.page1,
          size: state.size1,
        });
      },
      sizeChangeFun2(val: any) {
        state.size2 = val;
        state.page2 = 1;
        requestMethods.getTrustInfoFun({
          page: state.page2,
          size: state.size2,
        });
      },
      sizeChangeFun3(val: any) {
        state.size = val;
        state.page = 1;
        requestMethods.getAttackFun({
          page: state.page3,
          size: state.size3,
        });
      },
    };
    const requestMethods = {
      // todo 系统调用的接口  listA
      async getSysInfoFun(payload: any) {
        payload = {
          ...payload,
          page: state.page,
          size: state.size,
        };
        state.payloadDim = payload.dimensionality;
        const res: any = await detectApi.warnList(payload);
        const newData = res.list.map((m) => {
          return {
            ...m,
            behavior_analyse: m.behavior_analyse.result,
            sceneRef: m.attck.sceneRef,
            hostip: m.machine_ip,
            name: m.attck.name,
            object: m.attck.object,
            op: m.attck.op,
            extra_args: m.attck.extra_args,
            attck_desc: m.attck.desc.info,
          };
        });
        state.tableData = newData;
        state.total = res.total;
      },
      // todo  周期性接口  listB
      async getCycleInfoFun(payload: any) {
        payload = {
          ...payload,
          page: state.page1,
          size: state.size1,
        };
        const res: any = await detectApi.warnInfoList(payload);
        const newData = res.list.map((m: any) => {
          return {
            ...m,
            hostip: m.machine_ip,
            subject: m.subject.name,
          };
        });
        state.tableData1 = newData;
        state.total1 = res.total;
      },

      // todo 可信告警接口  listC
      async getTrustInfoFun(payload: any) {
        payload = {
          ...payload,
          page: state.page2,
          size: state.size2,
        };
        const res: any = await detectApi.newTrust(payload);
        const newData = res.list.map((m: any) => {
          return {
            ...m,
            reason: m.signal.reason,
            hostIp: m.machine_ip,
            severity: m.signal.rule.severity,
            risk_score: m.signal.rule.risk_score,
          };
        });
        state.tableData2 = newData;
        state.total2 = res.total;
      },

      // todo 攻击回溯接口  listD
      async getAttackFun(payload: any) {
        const res: any = await detectApi.attackBackList(payload);
        state.tableData3 = res.list;
        state.total3 = res.total;
      },

      // 获取攻击回溯的时间下拉框
      async getTimeFun() {
        const payload = {
          id: props.formInfo.ip.id || "",
          page: 1,
          size: 1000,
        };
        const res = await attackApi.getProcessInfo(payload);
        state.timeOptions = res.list.map((m: any) => {
          return {
            label: m["@timestamp"],
            value: m._id,
          };
        });
      },
      changeTimeFun(val: any) {
        requestMethods.getAttackFun({
          id: val,
          hostIp: props.formInfo.ip,
          page: state.page3,
          size: state.size3,
        });
      },
    };

    onMounted(() => {
      const getHomeIp = sessionStorage.getItem("toSysIp");
      if (!getHomeIp) {
        requestMethods.getSysInfoFun({
          ...props.formInfo,
          ip: getHomeIp,
          page: state.page,
          size: state.size,
          dimensionality: state.payloadDim,
        });
      }
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
.content {
  position: relative;
  width: calc(100% - 40px);
  margin-left: 20px;
  margin-right: 20px;
  height: calc(100% - 480px);
  background-color: #05162f;
  margin-top: 30px;
  color: #4f87ad;
  .el-tabs--border-card {
    background-color: #05162f;
    border: 1px solid #05162f;
  }

  .pagination {
    float: right;
  }

  .show-time {
    position: absolute;
    z-index: 9999;
    left: 600px;
    color: red;
  }
}
</style>
