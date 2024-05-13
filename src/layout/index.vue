<template>
  <div>
    <div class="title">
      <div class="item left">
        <img
          height="60"
          :src="require('@/assets/login/logo2.png')"
          @click="toHomeFun"
          class="to-home"
        />
        <div class="time-style">
          <div class="now-time">{{ nowTime }}</div>
          <div class="now-date">{{ nowDateTime }}</div>
        </div>
      </div>
      <div class="item center">
        <div class="font-center">智能数字免疫平台</div>
        <el-menu
          :default-active="currentPath()"
          mode="horizontal"
          class="menu-style"
        >
          <el-menu-item
            v-for="(item, index) in getMenus()"
            :key="item.path"
            :index="item.path"
            :disabled="item.disabled"
            @click="toMenu(item.path)"
          >
            <div v-if="index <= 2">{{ item.name }}</div>
            <div v-if="index > 2">{{ item.name }}</div>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="item right">
        <img
          class="loginame1"
          style="height: 20px; margin-top: 10px"
          src="@/assets/bigScreen/menu/user.png"
          alt="user"
        />
        <span class="loginame1">{{ username}}</span>
        <img
          class="loginame1"
          style="height: 20px"
          src="@/assets/bigScreen/menu/line.png"
          alt="line"
        />
        <div class="hexit" @click="logoutFun"></div>
      </div>
    </div>
    <RouterView />
  </div>
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted, reactive, toRefs } from "vue";
import { currentUserMenu } from "../utils/security";
import { useRouter } from "vue-router";
import { reidrect } from "../router";
import moment from "moment";
import "./index.scss";

export default {
  name: "baseLayout",
  setup() {
    const router = useRouter();
    const state = reactive({
      timer: null,
      nowDateTime: null,
      nowTime: null,
      username: "",
    });
    const funMethods = {
      currentPath: () => {
        return router.currentRoute.value.fullPath;
      },
      getMenus: () => {
        return currentUserMenu();
      },
      toMenu: (path: string) => {
        router.push(path).catch(() => {
          reidrect(path);
        });
      },
      // 获取当前时间 日期
      getNowDate: () => {
        const nowDate = moment().format("YYYY/MM/DD");
        const nowTime = moment().format("HH:mm:ss");
        state.nowDateTime = nowDate;
        state.nowTime = nowTime;
      },
      // 返回bigScreen页
      toHomeFun: () => {
        router.push("/home");
      },
      //返回登录页
      logoutFun: () => {
        router.push("/login");
      },
    };
    const requestMethods = {};

    onMounted(() => {
      state.username = sessionStorage.getItem("uname");
      state.timer = setInterval(() => {
        funMethods.getNowDate();
      }, 1000);
    });
    onBeforeUnmount(() => {
      clearInterval(state.timer);
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
.title {
  height: 100px;
  max-width: 100%;
  display: flex;
  flex-direction: row;
  padding: 0 20px;
  background-color: #060c24;

  .to-home {
    margin-top: 10px;
    margin-left: 30px;
    margin-right: -30px;
    &:hover {
      cursor: pointer;
    }
  }
  .item {
    flex: 0.6;
  }
  .left {
    background-image: url("@/assets/bigScreen/menu/top_01.png");
    background-repeat: no-repeat;
    color: #fff;
    display: flex;
    flex-direction: row;
    .time-style {
      margin-left: 50px;
      margin-top: 15px;
      .now-time {
        font-size: 24px;
        margin-bottom: 5px;
      }
    }
  }
  .center {
    flex: 2;
    background-image: url("@/assets/bigScreen/menu/top_02.png");
    background-repeat: no-repeat;
    background-position: center;
    text-align: center;
    .font-center {
      color: #fff;
      font-size: 33px;
      font-weight: bold;
      margin-top: 20px;
      margin-left: 28px;
      letter-spacing: 15px;
    }
    .menu-style {
      position: relative;
      top: -22px;
      background-color: transparent;
      color: #fff;
      .el-menu--horizontal > .el-menu-item {
        color: #fff;
      }
    }
  }
  .right {
    background-image: url("@/assets/bigScreen/menu/top_03.png");
    background-repeat: no-repeat;
    background-position: right center;
    text-align: right;
    .loginame1 {
      color: #fff;
      margin: -5px 5px;
    }

    .hexit {
      float: right;
      margin-right: 22px;
      height: 17px;
      line-height: 17px;
      margin-top: 0px;
      width: 17px;
      height: 17px;
      background: url("@/assets/bigScreen/menu/exit1.png") no-repeat center center;
      cursor: pointer;
      margin-top: 10px;
    }
  }
}
</style>
