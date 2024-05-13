<template>
  <div class="rules-man">
    <el-tabs type="border-card">
      <el-tab-pane label="中心规则"> <CenterRules /> </el-tab-pane>
      <!-- <el-tab-pane label="终端规则"> <NodeRules /> </el-tab-pane>
      <el-tab-pane label="管理"> <Manage /> </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs } from "vue";
import CenterRules from "./components/CenterRules.vue";
import NodeRules from "./components/NodeRules.vue";
import Manage from "./components/Manage.vue";
import './index.scss';

export default {
  name: "RulesMan",
  components: { CenterRules, NodeRules, Manage },
  setup() {
    const state = reactive({});
    const funMethods = {};
    const requestMethods = {};

    return {
      ...toRefs(state),
      ...funMethods,
      ...requestMethods,
    };
  },
};
</script>

<style lang="scss" scoped>
.rules-man {
  height: calc(100vh - 100px);
  width: calc(100% - 40px);
  padding-left: 20px;
  padding-right: 20px;
  background-image: url("../../assets/bigScreen/menu/backImg.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  color: #fff;
}
</style>
