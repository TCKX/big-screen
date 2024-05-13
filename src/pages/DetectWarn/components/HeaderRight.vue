<template>
  <div class="header-left">
    <div class="content-title">告警统计</div>
    <div id="rightEcharts" style="width: 100%; height: 90%"></div>
  </div>
</template>

<script lang="ts">
import { markRaw, onMounted, reactive, toRefs } from "vue";
import detectApi from "@/api/bigScreen/index";
import * as echarts from "echarts";
import {newDataEnum} from "@/utils/enum";

export default {
  name: "HeaderLeft",
  setup() {
    const state = reactive({
      charts1: null,
      newDataEnum,
      xData: [],
      yData: [],
    });
    const funMethods = {
      // 初始化折线图参数配置
      initLeftCharts() {
        state.charts1 = markRaw(echarts.init(
          document.getElementById("rightEcharts") as any
        ));
        state.charts1.setOption(
          {
            color:['#1370fb'],
            xAxis: {
              type: "category",
              data: state.xData,
              axisLabel: {
                textStyle: {
                  color: "#fff",
                },
              },
            },
            tooltip: {
              trigger: "item",
            },
            toolbox: {
              feature: {
                saveAsImage: {},
              },
            },
            yAxis: {
              type: "value",
              axisLabel: {
                color: "#c8c8c8",
              },
              splitLine: {
                show: true,
                lineStyle: {
                  color: ["#062641"],
                },
              },
            },
            series: [
              {
                data: state.yData,
                type: "bar",
                barWidth:"10%",
                smooth: true,
                lineStyle: {
                  color: "#1370fb",
                },
              },
            ],
          },
          true
        );
        window.onresize = function () {
          state.charts1.resize();
        };
      },
    };
    const requestMethods = {
      // todo 右侧折线图的接口
      async getLineListChartFun(payload:any) {
        const res:any = await detectApi.sysCall(payload, () => {});
        state.yData = res.map((m: any) => m.count);
        state.xData = res.map((m: any) => newDataEnum[m.name]);
        funMethods.initLeftCharts();
      },
    };
    onMounted(() => {
      //   const newDate = new Date();
      //   console.log(newDate.getTime().toString().format('yyyy-MM-dd'));
      // requestMethods.getLineListFun({});
      const getHomeIp = sessionStorage.getItem('toSysIp');
      if(!getHomeIp){
        requestMethods.getLineListChartFun({});
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
.header-left {
  height: 100%;
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
}
</style>
