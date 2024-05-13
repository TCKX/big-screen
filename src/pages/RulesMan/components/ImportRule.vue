<template>
  <div class="import-rules">
    <el-dialog
      v-model="dialogVisible"
      title="导入规则包"
      width="900px"
      :before-close="close"
      :destroy-on-close="true"
      :close-on-click-modal="false"
    >
      <div class="content" v-loading="loading">
        <FileUpload ref="fileRef" @onChange="getFileFun" name="上传规则包" accept=".ndjson" />
        <div class="bottom-tip">注：请选择*.ndjson格式文件</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button :disabled="loading" @click="close">取消</el-button>
          <el-button :disabled="loading" type="primary" @click="submitFun"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs } from "vue";
import FileUpload from "../../../components/FileUpload/index.vue";
import ruleMan from "@/api/rulesMan/index";
import { ElMessage } from "element-plus";

export default {
  name: "ImportRules",
  components: { FileUpload },
  emits:['onCompleted'],
  setup(props,{emit}) {
    const state = reactive({
      dialogVisible: false,
      fileRef: null,
      fileInfo: null,
      loading:false,
    });
    const funMethods = {
      close() {
        state.dialogVisible = false;
      },
      show() {
        state.dialogVisible = true;
      },
      getFileFun(val: any) {
        state.fileInfo = val;
      },
    };
    const requestMethods = {
      async submitFun() {
        state.loading = true
        const data = new FormData();
        data.append("file", state.fileInfo);
        const res = await ruleMan.impRule(data,()=>{state.loading = false});
        if (res == 200) {
          ElMessage({
            message: "导入成功",
            type: "success",
          });
          state.dialogVisible = false;
          emit("onCompleted")
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

<style lang="scss" scoped>
.import-rules {
  .content {
    text-align: center;
    .bottom-tip {
      color: #fff;
      margin-top: 40px;
    }
  }
}
</style>
