<template>
  <div class="import-rules">
    <el-dialog
      v-model="dialogVisible"
      title="确认"
      width="610px"
      :before-close="close"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      v-loading="loading"
    >
      <div class="content" v-loading="loading">
        <div class="conX">X</div>
        <div style="font-size: 18px">删除后无法恢复, 请确认</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button :disabled="loading" @click="close">取消</el-button>
          <el-button :disabled="loading" type="danger" @click="submitFun">
            确认并删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { reactive, toRefs } from "vue";
import ruleMan from "@/api/rulesMan/index";
import { ElMessage } from "element-plus";
import "../index.scss";

export default {
  name: "DelRule",
  emits: ["onCompleted"],
  setup(props, { emit }) {
    const state = reactive({
      dialogVisible: false,
      rowId: "",
      loading: false,
    });
    const funMethods = {
      close() {
        state.dialogVisible = false;
      },
      show(rowId) {
        state.dialogVisible = true;
        state.rowId = rowId;
      },
    };
    const requestMethods = {
      async submitFun() {
        state.loading = true;
        const res = await ruleMan.delRule([{ id: state.rowId }], () => {
          state.loading = false;
        });
        if (res == 200) {
          ElMessage({
            message: "删除成功",
            type: "success",
          });
          state.dialogVisible = false;
          emit("onCompleted");
          return;
        }
      },
    };

    return {
      ...toRefs(state),
      ...funMethods,
      ...requestMethods,
    };
  },
};
</script>

<style scoped>
.import-rules {
  .content {
    text-align: center;
    color: #fff;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    .conX {
      background-color: #f56c6c;
      height: 25px;
      width: 25px;
      text-align: center;
      line-height: 25px;
      border-radius: 50%;
      margin-right: 20px;
    }
    .bottom-tip {
      color: #fff;
      margin-top: 40px;
    }
  }
}

:deep(.el-button--danger) {
  background-color: #f56c6c;
  &:hover {
    background-color: #f56c6c;
  }
}
</style>
