<template>
  <div class="timeLine">
    <div v-if="ifNoData" class="noData">
      <img :src="require('@/assets/nodata.png')" />
    </div>
    <el-card v-else>
      <div class="right-title">
        <div v-for="m in rightItem">
          <div class="item-detail">
            <div
              :style="`background-color:${m.color};height:${
                m.key == 0 ? '10px' : '20px'
              };width:${m.key == 0 ? '10px' : '20px'};border-radius:50%`"
            ></div>
            <div style="margin-left: 10px">{{ m.val }}</div>
          </div>
        </div>
      </div>
      <div id="chart" class="charts-style"></div>
      <div id="tooltip" class="tooltip"></div>
      <div class="bottomInfo" v-if="ifShowBottom">
        <div>
          <div class="title">恶意行为取证</div>
          <div class="rightClose" @click="ifShowBottom = false">X</div>
        </div>
        <div class="content">
          <div class="card-item-style">
            异常函数
            <div class="bottom-item">
              <div v-for="m in gotInfo">
                <el-button
                  type="primary"
                  style="margin-right: 10px"
                  @click="logicNameFun(m)"
                  >{{ m.funcname ? m.funcname : m.saddr }}</el-button
                >
              </div>
            </div>
          </div>
          <div class="card-item-style">
            <div>注入代码段</div>
            <div class="bottom-item">{{ gotRightInfo.binary }}</div>
          </div>
          <div class="card-item-style">
            <div>异常函数指令序列</div>
            <div class="bottom-item">{{ gotRightInfo.assemb }}</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { onMounted, reactive, toRefs } from "vue";
import attckBacktrackApi from "@/api/attckBacktrack";
import * as d3 from "d3";

export default {
  name: "TimeLineVisual",
  setup() {
    const state = reactive({
      ifNoData: false,
      ifShowBottom: false,
      charts: null,
      page: 1,
      total: 0,
      size: 10,
      pageSizes: [10, 20, 50, 100],
      data: [],
      rightItem: [],
      dataInfoData: null,
      timeRange: [],
      nodeId: "",
      logicName: "",
      gotInfo: [],
      gotRightInfo: {
        binary: "",
        assemb: "",
      },
    });
    const funMethods = {
      show(dataInfo: any) {
        // funMethods.initCharts(dataInfo);
        // state.dataInfoData = dataInfo;
        state.rightItem = dataInfo;
      },
      showData(timeInfo: any, nodeId: any) {
        state.ifShowBottom = false;
        state.timeRange = timeInfo;
        state.nodeId = nodeId;
        // state.data = data;
      },
      logicNameFun(info) {
        state.gotRightInfo = info;
      },
      initCharts(data: any) {
        debugger;
        d3.selectAll("svg").remove();
        d3.selectAll(".axis").remove();
        d3.selectAll("circle").remove();
        const width = 2400;
        const height = 1000;
        const marginRight = -60;
        const marginLeft = -60;
        if (data.length === 0 || data.code === 602) {
          state.ifNoData = true;
          return;
        } else {
          state.ifNoData = false;
          // 去除后端返回null的数据
          let newData = data.filter((m) => m !== null);

          const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
          const newExtent = d3.extent(newData, (d) => parseTime(d.time));

          let newMinTime = new Date(newExtent[0]);
          let newMaxTime = new Date(newExtent[1]);

          const margin = { top: 20, right: 20, bottom: 30, left: 50 };
          const innerWidth = width - margin.left - margin.right;
          const innerHeight = height - margin.top - margin.bottom;

          const x = d3
            .scaleTime()
            .domain([newMinTime, newMaxTime])
            .range([0, innerWidth]);

          const y = d3
            .scaleBand()
            .domain(newData.map((d) => d.name))
            .range([0, innerHeight])
            .padding(1);

          let svgContainer = d3.select("#chart");
          let svg = svgContainer.select("svg");
          if (svg.empty()) {
            svg = svgContainer
              .append("svg")
              .attr("viewBox", `0 0 ${width} ${height}`)
              .attr("width", "100%")
              .attr("height", "100%")
              .attr("style", `max-width: 100%`);
          }
          const timeFormat = d3.timeFormat("%m-%d %H:%M:%S");

          svg
            .append("g")
            .attr("transform", `translate(0, 30)`)
            .style("font-size", "28px")
            .call(d3.axisTop(x).tickFormat(timeFormat).ticks(6))
            .call((g) => g.select(".domain").remove());

          svg
            .append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${marginLeft},0)`)
            .style("font-size", "28px")
            .call(d3.axisLeft(y))
            .call((g) => g.select(".domain").remove());

          svg
            .selectAll(".grid-line.x")
            .data(x.ticks())
            .enter()
            .append("line")
            .attr("class", "grid-line x")
            .attr("x1", (d) => x(d))
            .attr("y1", 0)
            .attr("x2", (d) => x(d))
            .attr("y2", height + 20)
            .attr("stroke", "lightgrey")
            .attr("stroke-opacity", 0.3)
            .attr("shape-rendering", "crispEdges");

          svg
            .selectAll(".grid-line.y")
            .data(y.domain())
            .enter()
            .append("line")
            .attr("class", "grid-line")
            .attr("x1", marginLeft)
            .attr("y1", (d) => y(d))
            .attr("x2", width - marginRight)
            .attr("y2", (d) => y(d))
            .attr("stroke", "lightgrey")
            .attr("stroke-opacity", 0.3)
            .attr("shape-rendering", "crispEdges");

          const circlesGroup = svg.append("g").attr("class", "circles");
          circlesGroup.selectAll(".circle").remove();

          const tooltip = d3.select("#tooltip");
          const uniqueColors = [...new Set(newData.map((d) => d.color))];

          const colorScale = d3
            .scaleOrdinal()
            .domain(newData.map((d) => d.behavior))
            .range(uniqueColors);

          const circles = circlesGroup
            .selectAll(".circle")
            .data(newData, (d) => d.id || d.name);

          const circlesEnter = circles
            .enter()
            .append("circle")
            .attr("class", "circle")
            .style("cursor", "pointer");

          circlesEnter
            .merge(circles)
            .attr("cx", (d) => x(parseTime(d.time)))
            .attr("cy", (d) => y(d.name))
            .attr("fill", (d) => colorScale(d.behavior))
            .attr("r", (d) => (d.behavior === "0" ? 4 : 8))
            .on("click", async (d, nodes) => {
              state.ifShowBottom = true;
              const payload = {
                hostId: state.nodeId,
                pid: nodes.pid,
                time: nodes.time,
              };
              const res = await attckBacktrackApi.timeLineBottomInfo(payload);
              if (res.length > 0) {
                state.gotInfo = res[0].list;
                state.gotRightInfo = res[0].list[0];
              } else {
                state.gotInfo = [];
                state.gotRightInfo = {
                  binary: "",
                  assemb: "",
                };
              }
            })
            .on("mouseover", (d, nodes) => {
              const title = state.rightItem.filter(
                (m) => m.key == nodes.behavior
              );
              tooltip
                .html(
                  `<span style='color:#118cfe;font-size:26px;font-weight:bold;'>${title[0].val}</span><br/>进程名称: ${nodes.name}<br/>发生时间: ${nodes.time}<br/>行为描述: ${nodes.desc}`
                )
                .style("left", d.x - 280 + "px")
                .style("top", d.y - 80 + "px")
                .style("display", "block");
            })
            .on("mouseout", () => {
              tooltip.style("display", "none");
            });

          return Object.assign(svg);
        }
      },
    };
    const requestMethods = {};

    onMounted(() => {});
    // 第一次数据为空，更新数据且数据有效，散点图不显示，再次更新数据且数据有效，散点图显示

    return {
      ...toRefs(state),
      ...funMethods,
      ...requestMethods,
    };
  },
};
</script>

<style lang="scss" scoped>
:deep(.el-card) {
  background-color: transparent;
  border: #021438;
  color: #fff;
}
:deep(.el-card__header) {
  border-bottom: 1px solid #333333;
}

:deep(.el-input__wrapper) {
  background-color: #021438;
  color: #fff;
}

:deep(.el-date-editor .el-range-input) {
  color: #fff;
}

:deep(.el-date-editor .el-range-separator) {
  color: #fff;
}

// :deep(.el-picker-panel__footer){
//   background-color: #021438;
// }

.timeLine {
  position: relative;
  color: #fff;
  margin-top: 40px;
  margin-left: 30px;
  margin-right: 30px;
  background: #021438;
  height: 87vh;
  opacity: 1;
  border-radius: 6px;
}

.right-title {
  display: flex;
  flex-direction: row;
  justify-content: center;
  .item-detail {
    display: flex;
    flex-direction: row;
    margin-left: 30px;
    align-items: center;
  }
}

.charts-style {
  width: 80vw;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px;
  margin-left: 40px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-right: 150px;
}

.tootipStyle {
  height: 40px;
  width: 100px;
  background-color: red;
}

.tooltip {
  pointer-events: none; /* 避免tooltip阻挡鼠标事件 */
  /* 其他样式如字体、边框等 */
  // &:hover{
  //   cursor: pointer;
  // }
  background-color: #012e5a !important;
  // border: 1px solid #05162f !important;
  box-shadow: 2px 2px 2px #012e5c;
  opacity: 0.8;
  border-radius: 6px;
  color: #fff;
  width: 400px;
  height: 200px;
  line-height: 30px;
  position: absolute;
  display: none;
  background: #fff;
  // border: 1px solid #000;
  padding: 5px;
  padding-left: 20px;
  padding-top: 10px;
  z-index: 9999;
}
.noData {
  height: 60vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bottomInfo {
  border: 1px solid #012e5c;
  height: 400px;
  width: 98%;
  padding: 10px;
  border-radius: 6px;
}

.rightClose {
  float: right;
  &:hover {
    cursor: pointer;
  }
}
.title {
  float: left;
  font-size: 20px;
  color: #118cfe;
  margin-bottom: 10px;
}

.content {
  display: flex;
  flex-direction: row;
  height: 360px;
  margin-top: 30px;
  .card-item-style {
    flex: 1;
    background-color: #012e5c;
    border-radius: 6px;
    width: 660px;
    min-width: 660px;
    max-width: 660px;
    white-space: normal;
    word-break: break-all;
    white-space: pre-line;
    line-height: 26px;
    padding: 20px;
    &:nth-child(1) {
      margin-right: 10px;
    }
    &:nth-child(2) {
      margin-right: 10px;
    }
  }
}

.bottom-item {
  border: 1px solid #024b93;
  padding: 10px;
  height: 260px;
  overflow-y: auto;
}
</style>
