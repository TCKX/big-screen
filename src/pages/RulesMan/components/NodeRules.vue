<template>
  <div class="center-rules">
    <el-form :inline="true" :model="form" class="title">
      <el-form-item label="规则名称：">
        <el-input v-model="form.name" placeholder="请输入规则名称" />
      </el-form-item>
      <div style="margin-top: -12px;">
        <el-button type="primary" @click="getListFun">查询</el-button>
        <el-button type="default" @click="resetFun">重置</el-button>
      </div>
    </el-form>
    <div class="content">
      <div class="content-title">规则列表</div>
      <div class="btns">
        <el-button type="primary" @click="importFun">导入规则</el-button>
        <el-dropdown style="margin-left: 10px">
          <el-button type="primary" >批量操作<el-icon class="el-icon--right"><arrow-down /></el-icon></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :disabled="'true'">启用选中</el-dropdown-item>
              <el-dropdown-item :disabled="'true'">禁用选中</el-dropdown-item>
              <el-dropdown-item :disabled="'true'">删除选中</el-dropdown-item>
              <el-dropdown-item :disabled="'true'">导出选中</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <TableWapper
        class="table-style"
        :colConfigs="colConfigs"
        :tableData="tableData"
      />
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
    </div>
    <ImportDia ref="importRef" />
  </div>
</template>

<script lang="ts">
import { onMounted, reactive, toRefs } from "vue";
import TableWapper from "@/components/Table/index.vue";
import rulesManApi from "@/api/rulesMan";
import ImportDia from "./ImportRule.vue";

export default {
  name: "NodeRules",
  components: { TableWapper,ImportDia },
  setup() {
    const state = reactive({
      form: {
        name: "",
      },
      importRef:null,
      page: 1,
      total: 0,
      size: 10,
      pageSizes: [10, 20, 50, 100],
      colConfigs: [
        // { slot: "selection" },
        { label: "严重程度", prop: "level" },
        { label: "规则名称", prop: "name" },
        { label: "风险分数", prop: "risk_score" },
        { label: "下发个数", prop: "version" },
        { label: "启用个数", prop: "tags" },
        { label: "停用个数", prop: "updatedAt" },
        { label: "版本号", prop: "status" },
        { label: "标签", prop: "status" },
        { label: "更新时间", prop: "status" },
        // { label: "操作", prop: "" },
      ],
      tableData: [],
    });
    const funMethods = {
      resetFun() {},
      currentFun() {},
      sizeChangeFun() {},
      importFun() {
        state.importRef.show();
      },
    };
    const requestMethods = {
      async getListFun() {
        const payload = {
          order: 2,
          page: 1,
          size: 20,
          sortname: "updatedAt",
        };
        const res = await rulesManApi.nodeRulesList(payload);
        console.log(res);
        state.tableData = res.list;
        state.total = res.total;
      },
    };

    onMounted(() => {
      requestMethods.getListFun();
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
.center-rules {
  .title {
    // margin-top: 10px;
    background-color: #05162f;
    height: 74px;
    display: flex;
    align-items: center;
    padding-left: 20px;
  }
  .content {
    min-height: 800px;
    background-color: #05162f;
    margin-top: 20px;
    .content-title {
      padding-top: 20px;
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
    .btns {
      margin-left: 20px;
      margin-top: 10px;
    }
    .table-style {
      margin-top: 20px;
      margin-left: 20px;
      margin-right: 20px;
    }
  }
  .pagination {
    float: right;
  }
}
</style>
