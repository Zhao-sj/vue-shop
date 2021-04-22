<template>
  <el-container class="home-container">
    <el-header height="auto">
      <!-- 头部组件 -->
      <home-header></home-header>
    </el-header>
    <el-container>
      <el-aside width="auto">
        <!-- 侧边栏组件 -->
        <home-aside></home-aside>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
// 引入头部子组件
import Header from "../components/Header.vue";
// 引入侧边栏子组件
import Aside from "../components/Aside.vue";

export default {
  components: {
    "home-aside": Aside,
    "home-header": Header,
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;

  .el-header {
    background-color: #373d4e;
  }

  .el-container {
    height: 90%;
  }

  .el-aside {
    background-color: #333744;
  }

  .el-main {
    background-color: #eaedf1;
  }
}
</style>