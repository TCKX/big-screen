<template>
  <div class="asset-map"></div>
</template>

<script lang="ts">
import { onMounted, reactive, toRefs } from "vue";
import assetMapApi from "@/api/assetMap";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { getAssetUrl } from "@/config/index";

export default {
  name: "ManCenter",
  setup() {
    const state = reactive({});
    const router = useRouter();
    const funMethods = {};
    const requestMethods = {
      async authUser() {
        // 跳转资产测绘之前先验证用户是否有权限
        const params2 = sessionStorage.getItem("token");
        const params3 = sessionStorage.getItem("sid");
        const params4 = sessionStorage.getItem("uid");
        const res = await assetMapApi.authUserSafe({ id: params4 });
        if (res == 200) {
          return window.open(`${getAssetUrl}/ticket/login?username=${params3}&sso_ticket=${params2}`, "_self" );
        } else {
          return router.push("home");
        }
      },
    };
    onMounted(() => {
      requestMethods.authUser();
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
.asset-map {
  height: calc(100vh - 100px);
  width: calc(100% - 20px);
  background-image: url("../../assets/bigScreen/menu/backImg.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  color: #fff;
}
</style>
