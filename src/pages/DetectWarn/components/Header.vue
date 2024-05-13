<template>
  <div class="detectWarn">
    <div class="warnItem header">
      <div class="search-form">
        <el-form :inline='true' :model="form">
          <el-form-item label="主机IP：">
            <!-- <el-input v-model="form.ip" placeholder="请输入主机IP" /> -->
            <el-select v-model="form.ip.ip" clearable @change="changeIpFun">
              <div v-for="m in ipOptions" :key="m.value">
                <el-option :label="m.label" :value="m.value" />
              </div>
            </el-select>
          </el-form-item>
          <el-form-item label="时间点" v-if="ifShowTime == true">
            <el-select v-model="selectTime" clearable @change="changeTimeFun">
              <div v-for="m in timeSelectOptions" :key="m.value">
                <el-option :label="m.label" :value="m.value" />
              </div>
            </el-select>
          </el-form-item>
          <el-form-item label="告警等级：">
            <el-select v-model="form.severity" clearable>
              <div v-for="m in warnLevelOptions" :key="m.value">
                <el-option :label="m.label" :value="m.value" />
              </div>
            </el-select>
          </el-form-item>
          <el-form-item label="时间类型：">
            <el-select
              v-model="form.newTimeType"
              clearable
              @change="newTimeFun"
            >
              <div v-for="m in newTimeOptions" :key="m.value">
                <el-option :label="m.label" :value="m.value" />
              </div>
            </el-select>
          </el-form-item>
          <div v-show="ifAuto">
            <el-form-item label="时间方向：">
              <el-select v-model="form.timearrows" clearable>
                <div v-for="m in timeOptions" :key="m.value">
                  <el-option :label="m.label" :value="m.value" />
                </div>
              </el-select>
            </el-form-item>
            <el-form-item label="时间偏移量：">
              <div class="time-style">
                <el-input
                  v-model="form.timeoffsetIpt"
                  placeholder="请输入偏移量"
                />
                <el-select v-model="form.timeoffset" clearable>
                  <div v-for="m in timeOffsetOptions" :key="m.value">
                    <el-option :label="m.label" :value="m.value" />
                  </div>
                </el-select>
              </div>
            </el-form-item>
            <el-form-item label="时间点：">
              <el-date-picker
                v-model="form.timepoint"
                type="datetime"
                placeholder="请选择开始日期"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </div>
          <el-button type="primary" @click="getLineListFun">查询</el-button>
          <el-button type="default" @click="resetFun">重置</el-button>
        </el-form>
      </div>
      <div class="content">
        <div class="left">
          <HeaderLeft ref="leftRef" />
        </div>
        <div class="right">
          <HeaderRight ref="rightRef" />
        </div>
      </div>
    </div>
    <div class="warnItem">
      <Content ref="cotentRef" :formInfo="form" @onChangeTab="onChangeTab" />
    </div>
  </div>
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted, reactive, toRefs } from "vue";
import "../../SysMonitor/index.scss";
import HeaderLeft from "./HeaderLeft.vue";
import HeaderRight from "./HeaderRight.vue";
import Content from "./Content.vue";
import ipApi from "@/api/attckBacktrack/index";
import "../index.scss";
import attackApi from "@/api/attckBacktrack/index";

export default {
  name: "Header",
  components: { HeaderLeft, HeaderRight, Content },
  setup() {
    const state = reactive({
      selectTime: "",
      ifShowTime: false,
      timeSelectOptions: [],
      form: {
        ip: {
          ip: null,
          id: null,
        }, //主机ip
        timearrows: "", //时间方向
        severity: "", //告警等级
        timeoffsetIpt: "", //时间偏移量(输入框)
        timeoffset: "", //时间偏移量(下拉框)
        timepoint: "", //时间点
        newTimeType: "4",
      },
      checkList: [],
      timeOptions: [
        { label: "向前", value: "-1" },
        { label: "向后", value: "1" },
      ],
      newTimeOptions: [
        { label: "年", value: "1" },
        { label: "月", value: "2" },
        { label: "日", value: "3" },
        { label: "周", value: "4" },
        { label: "自定义", value: "5" },
      ],
      timeOffsetOptions: [
        { label: "分钟", value: "m" },
        { label: "小时", value: "h" },
        { label: "日", value: "d" },
        { label: "月", value: "M" },
        { label: "年", value: "y" },
      ],
      warnLevelOptions: [
        { value: 1, label: "低级" },
        { value: 2, label: "中级" },
        { value: 3, label: "高级" },
        { value: 4, label: "严重" },
      ],
      ipOptions: [],
      // 右侧柱状图的state
      charts2: null,
      xData1: [],
      yData1: [],
      leftRef: null, //左侧的ref
      rightRef: null, //右侧的ref
      cotentRef: null, //下边的ref
      ifAuto: false,
    });
    const funMethods = {
      resetFun() {
        state.form = {
          severity: "",
          ip: {
            ip: null,
            id: null,
          },
          timearrows: "",
          timeoffsetIpt: "",
          timeoffset: "",
          timepoint: "",
          newTimeType: "4",
        };

        state.selectTime='';
        state.ifAuto = false;
        requestMethods.getLineListFun();
      },
      newTimeFun(val: any) {
        if (val == "5") {
          state.ifAuto = true;
        } else {
          state.ifAuto = false;
        }
      },
    };
    const requestMethods = {
      changeTimeFun(val: any) {
        // state.cotentRef.getAttackFun({
        //   id: val,
        //   hostIp: state.form.ip.ip[0],
        //   page: 1,
        //   size: 1000,
        // });
      },
      getLineListFun() {
        let payload ={
          dimensionality: state.form.newTimeType,
          hostIp: "",
          severity: state.form.severity,
          timearrows: state.form.timearrows,
          timeoffset: state.form.timeoffsetIpt + state.form.timeoffset,
          timepoint: state.form.timepoint,
        }
        let newLayout = {
          hostIp:"" ,
          id: state.selectTime,
        };
        const getHomeIp = sessionStorage.getItem("toSysIp");
        if(getHomeIp ){
          payload.hostIp = getHomeIp
          newLayout.hostIp = getHomeIp
        }else{
          payload.hostIp = state.form.ip.ip ? state.form.ip.ip.ip[0] :"";
          newLayout.hostIp = state.form.ip.ip ? state.form.ip.ip.ip[0] :"" 
        }

        if(newLayout.id){
          delete newLayout.hostIp
        }
        
        state.leftRef.getLineListChartFun(payload);
        state.rightRef.getLineListChartFun(payload);
        state.cotentRef.getSysInfoFun(payload);
        state.cotentRef.getCycleInfoFun(payload);
        state.cotentRef.getTrustInfoFun(payload);
        state.cotentRef.getAttackFun(newLayout);
        state.cotentRef.getTimeFun();
        sessionStorage.setItem("search", JSON.stringify(payload));
      },
      changeIpFun(info: any) {
        requestMethods.getTimeFun(info.id);
      },
      onChangeTab(val: any) {
        state.ifShowTime = val;
      },
      // 获取攻击回溯的时间下拉框
      async getTimeFun(id: any) {
        if (!id) {
          return;
        }
        const payload = {
          id: id,
          page: 1,
          size: 1000,
        };
        const res = await attackApi.getProcessInfo(payload);
        state.timeSelectOptions = res.list.map((m: any) => {
          return {
            label: m["@timestamp"],
            value: m._id,
          };
        });
      },

      // 获取ip列表
      async getIpFun() {
        const res = await ipApi.getHostIpInfo({ page: 1, size: 1000 });
        const newData = res.list.map((m: any) => {
          return {
            label: m.hostInfo.ip[0],
            value: m.hostInfo,
          };
        });
        state.ipOptions = newData;
        // state.ipOptions = [
        //   {label: "192.168.1.159", value: {ip:['192.168.1.159']}}
        // ];
      },
    };

    onMounted(() => {
      const getHomeIp = sessionStorage.getItem("toSysIp");
      const getHomeId = sessionStorage.getItem("toSysId");
      if (getHomeIp) {
        state.form.ip.ip = [getHomeIp];
        state.form.ip = {
          ip: state.form.ip.ip[0],
          id: getHomeId,
        };
        requestMethods.getLineListFun();
        requestMethods.getIpFun();
        requestMethods.getTimeFun(getHomeId);
      } else {
        requestMethods.getIpFun();
      }
    });

    onBeforeUnmount(() => {
      sessionStorage.removeItem("toSysIp");
      sessionStorage.removeItem("toSysId");
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
.detectWarn {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  .warnItem {
    flex: 1;
  }
  .warnItem:nth-child(2) {
    flex: 1.5;
  }
}

.header {
  display: flex;
  flex-direction: column;
  .search-form {
    margin-left: 20px;
    margin-right: 20px;
    padding-left: 20px;
    padding-right: 20px;
    height: 66px;
    width: calc(100% - 80px);
    background-color: #05162f;
    display: flex;
    flex-direction: row;
    align-items: center;

    .time-style {
      display: flex;
      flex-direction: row;
    }
  }
  .content {
    height: 27.6vh;
    display: flex;
    flex-direction: row;
    width: calc(100% - 40px);
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 30px;
    color: #fff;

    .content-title {
      margin-top: 20px;
      margin-left: 20px;
      line-height: 20px;
      height: 20px;
      display: flex;
      &::before {
        content: "";
        display: inline-block;
        width: 4px;
        height: 20px;
        background: linear-gradient(to bottom, #0bcc9b 30%, #0248d1 70%);
        transition: background-image 5s;
        margin-right: 10px;
      }
    }
    .left {
      flex: 1;
      background-color: #05162f;
      height: 29vh;
    }
    .right {
      flex: 1;
      height: 29vh;
      background-color: #05162f;
      margin-left: 30px;
    }
  }
}
</style>
